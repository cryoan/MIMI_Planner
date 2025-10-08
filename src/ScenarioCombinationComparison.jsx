import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { ScheduleContext } from './ScheduleContext';
import {
  calculateAllCombinationMetrics,
  saveResultsToCache,
  loadResultsFromCache,
  clearResultsCache,
  getCacheInfo
} from './scenarioBatchProcessor';
import { mergeScenariosChanges, scenarioGroups } from './scenarioCombinationGenerator';
import { applyScenarioChanges } from './scenarioEngine';
import scenarioConfigsData from './scenarioConfigs.json';

// Register annotation plugin
ChartJS.register(annotationPlugin);
import {
  doctorProfiles as initialDoctorProfiles,
  docActivities as initialDocActivities,
  wantedActivities as initialWantedActivities,
  rotationTemplates as initialRotationTemplates,
} from './doctorSchedules.js';
import { expectedActivities as initialExpectedActivities } from './schedule.jsx';
import './Calendar.css';

const ScenarioCombinationComparison = () => {
  const {
    applyScenario,
    setActiveScenarioId,
    clearScenarioCache,
    updateDoctorProfiles,
    updateDocActivities,
    updateWantedActivities,
    updateRotationTemplates,
    updateExpectedActivities,
    setCurrentRotationCycle,
    recalculateSchedules
  } = useContext(ScheduleContext);

  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showChart, setShowChart] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);

  // Filter state: { BM: 'BM-EMIT-JV', FL: null, NS: 'NS-TP-J', ... }
  const [selectedFilters, setSelectedFilters] = useState(() => {
    const initial = {};
    Object.keys(scenarioGroups).forEach(groupKey => {
      initial[groupKey] = null;
    });
    return initial;
  });

  // Calculate metrics function (uses same logic as ScheduleContext)
  const calculateMetrics = useCallback((scheduleData, docActivitiesForMetrics, expectedActivitiesForMetrics = initialExpectedActivities) => {
    if (!scheduleData || !scheduleData.periodicSchedule) {
      return {
        workloadScore: 0,
        nonOverloadCoverage: 0,
        emitCoverage: 0,
        ematitCoverage: 0,
        amiCoverage: 0,
        telecsCoverage: 0,
        totalMissingActivities: 0,
        totalOverloadedSlots: 0,
        totalTeleCsMissing: 0,
        workloadMAD: 0
      };
    }

    const periodicSchedule = scheduleData.periodicSchedule;

    // Helper: Calculate MAD (Mean Absolute Deviation)
    const calculateMAD = (values) => {
      if (!values || values.length === 0) return 0;
      const validValues = values.filter((v) => v !== null && v !== undefined);
      if (validValues.length === 0) return 0;
      if (validValues.length === 1) return 0;
      const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
      const absoluteDeviations = validValues.map(val => Math.abs(val - mean));
      return absoluteDeviations.reduce((a, b) => a + b, 0) / validValues.length;
    };

    // 1. Workload MAD
    const doctorWorkload = {};
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        Object.entries(periodData.schedule).forEach(([doctor, schedule]) => {
          if (!doctorWorkload[doctor]) doctorWorkload[doctor] = 0;
          Object.values(schedule).forEach((daySchedule) => {
            Object.values(daySchedule).forEach((activities) => {
              if (Array.isArray(activities)) {
                activities.forEach((activity) => {
                  const activityData = docActivitiesForMetrics[activity];
                  if (activityData && activityData.duration !== undefined) {
                    doctorWorkload[doctor] += activityData.duration;
                  }
                });
              }
            });
          });
        });
      }
    });
    const workloadMAD = calculateMAD(Object.values(doctorWorkload));

    // 2. Total overloaded slots
    let totalSlots = 0;
    let nonOverloadedSlots = 0;
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        Object.values(periodData.schedule).forEach((schedule) => {
          Object.values(schedule).forEach((daySchedule) => {
            Object.values(daySchedule).forEach((activities) => {
              if (Array.isArray(activities) && !activities.includes("TP")) {
                totalSlots++;
                const totalDuration = activities.reduce((sum, activity) => {
                  const activityData = docActivitiesForMetrics[activity];
                  return sum + (activityData?.duration ?? 1);
                }, 0);
                if (totalDuration <= 4) nonOverloadedSlots++;
              }
            });
          });
        });
      }
    });
    const totalOverloadedSlots = totalSlots - nonOverloadedSlots;

    // 3. Total missing activities (complete count - compare expected vs assigned)
    let totalMissingActivities = 0;
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const slots = ["9am-1pm", "2pm-6pm"];

    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        days.forEach((day) => {
          slots.forEach((slot) => {
            const assigned = [];
            Object.values(periodData.schedule).forEach((doctorSchedule) => {
              if (doctorSchedule[day]?.[slot]) {
                assigned.push(...doctorSchedule[day][slot]);
              }
            });

            const expected = expectedActivitiesForMetrics?.[day]?.[slot] || [];
            const missing = expected.filter(act => !assigned.includes(act));
            totalMissingActivities += missing.length;
          });
        });
      }
    });

    // 4. Total TeleCs missing
    let totalTeleCsMissing = 0;
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.teleCsResolution?.teleCsAssignments) {
        Object.values(periodData.teleCsResolution.teleCsAssignments).forEach((assignment) => {
          totalTeleCsMissing += assignment.missing || 0;
        });
      }
    });

    return {
      workloadMAD,
      totalMissingActivities,
      totalOverloadedSlots,
      totalTeleCsMissing
    };
  }, []);

  // Load cache info on mount
  useEffect(() => {
    const info = getCacheInfo();
    setCacheInfo(info);

    if (info.exists && info.valid) {
      const cached = loadResultsFromCache();
      if (cached && cached.results) {
        setResults(cached.results);
        console.log('✅ Loaded cached results on mount');
      }
    }
  }, []);

  // Handle "Best Scenario" button click
  const handleCalculateBestScenario = async () => {
    setIsCalculating(true);
    setShowChart(false);
    setProgress({ current: 0, total: 72 });

    try {
      const calculatedResults = await calculateAllCombinationMetrics(
        (current, total) => setProgress({ current, total }),
        calculateMetrics
      );

      setResults(calculatedResults);
      saveResultsToCache(calculatedResults);

      // Update cache info
      const info = getCacheInfo();
      setCacheInfo(info);

      setShowChart(true);
      console.log('✅ Calculation complete!');
    } catch (error) {
      console.error('❌ Error calculating combinations:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle "Clear Cache" button click
  const handleClearCache = () => {
    clearResultsCache();
    setResults(null);
    setShowChart(false);

    // Update cache info
    const info = getCacheInfo();
    setCacheInfo(info);

    console.log('🗑️ Cache cleared');
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {};
    Object.keys(scenarioGroups).forEach(groupKey => {
      clearedFilters[groupKey] = null;
    });
    setSelectedFilters(clearedFilters);
  };

  // Find matched scenario index based on selected filters
  const findMatchedScenarioIndex = () => {
    if (!results) return -1;

    // Get non-null filter values
    const activeFilters = Object.values(selectedFilters).filter(v => v !== null);

    // If no filters selected, no match
    if (activeFilters.length === 0) return -1;

    // Find index where ALL active filters are present in atomicScenarios
    return results.findIndex(r => {
      const atomicScenarios = r.combination.atomicScenarios;
      return activeFilters.every(filter => atomicScenarios.includes(filter));
    });
  };

  const matchedIndex = findMatchedScenarioIndex();
  const matchCount = matchedIndex >= 0 ? 1 : 0;

  // Handle "Apply" button for a specific combination
  const handleApplyCombination = (combination) => {
    console.log('🎯 Applying combination:', combination.name);

    try {
      // Merge changes from atomic scenarios
      const mergedChanges = mergeScenariosChanges(combination.atomicScenarios);

      // Build base config with real initial data (not empty objects)
      const baseConfig = {
        doctorProfiles: initialDoctorProfiles,
        docActivities: initialDocActivities,
        wantedActivities: initialWantedActivities,
        rotationTemplates: initialRotationTemplates,
        expectedActivities: initialExpectedActivities,
        rotationCycle: 'honeymoon_NS_noHDJ'
      };

      // Apply merged changes
      const modifiedConfig = applyScenarioChanges(baseConfig, {
        ...combination,
        changes: mergedChanges
      });

      // Apply to context (this will trigger recalculation)
      if (modifiedConfig.doctorProfiles) updateDoctorProfiles(modifiedConfig.doctorProfiles);
      if (modifiedConfig.docActivities) updateDocActivities(modifiedConfig.docActivities);
      if (modifiedConfig.wantedActivities) updateWantedActivities(modifiedConfig.wantedActivities);
      if (modifiedConfig.rotationTemplates) updateRotationTemplates(modifiedConfig.rotationTemplates);
      if (modifiedConfig.expectedActivities) updateExpectedActivities(modifiedConfig.expectedActivities);
      if (modifiedConfig.rotationCycle) setCurrentRotationCycle(modifiedConfig.rotationCycle);

      // Trigger recalculation
      recalculateSchedules();

      // Clear scenario cache (like applyScenario does)
      clearScenarioCache();

      // Update active scenario ID to this combination
      setActiveScenarioId(combination.id);

      alert(`✅ Scénario appliqué: ${combination.name}`);
    } catch (error) {
      console.error('❌ Error applying combination:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Prepare chart data
  const chartData = results ? {
    labels: results.map((r, i) => `#${i + 1}`),
    datasets: [
      {
        label: 'Activités manquantes',
        data: results.map(r => r.metrics.totalMissingActivities),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        stack: 'stack1'
      },
      {
        label: 'Créneaux surchargés',
        data: results.map(r => r.metrics.totalOverloadedSlots),
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        stack: 'stack1'
      },
      {
        label: 'TeleCs manquantes',
        data: results.map(r => r.metrics.totalTeleCsMissing),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        stack: 'stack1'
      },
      {
        label: 'MAD (heures)',
        data: results.map(r => r.metrics.workloadMAD),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        yAxisID: 'y-mad'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        if (results && results[clickedIndex]) {
          handleApplyCombination(results[clickedIndex].combination);
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Scénarios (triés par score croissant)',
          font: { size: 14 }
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de problèmes',
          font: { size: 14 }
        }
      },
      'y-mad': {
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'MAD (heures)',
          font: { size: 14 }
        },
        grid: {
          drawOnChartArea: false
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: '72 Combinaisons de Scénarios - Triées par Score Total (croissant)',
        font: { size: 18, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return results[index]?.combination.name || `Scénario ${index + 1}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
          },
          footer: () => {
            return 'Cliquez sur la barre pour appliquer ce scénario';
          }
        }
      },
      legend: {
        position: 'bottom'
      },
      annotation: matchedIndex >= 0 ? {
        annotations: {
          matchedScenario: {
            type: 'label',
            xValue: matchedIndex,
            yValue: 0,
            content: '🎯 Trouvé',
            backgroundColor: 'rgba(255, 193, 7, 0.9)',
            color: 'black',
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: 8,
            borderRadius: 4,
            yAdjust: -30
          },
          matchedLine: {
            type: 'line',
            xMin: matchedIndex,
            xMax: matchedIndex,
            yMin: 0,
            yMax: 'max',
            borderColor: 'rgba(255, 193, 7, 0.8)',
            borderWidth: 3,
            borderDash: [5, 5]
          }
        }
      } : {}
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginTop: 0 }}>🧬 Analyse Exhaustive des Combinaisons de Scénarios</h2>

      {/* Dynamic Filter Section */}
      {results && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>🔍 Recherche de Scénario</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: matchCount > 0 ? '#4CAF50' : '#999'
              }}>
                {matchCount}/{results.length} correspondance{matchCount > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleClearFilters}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Effacer les filtres
              </button>
            </div>
          </div>

          {/* Dynamic filter groups */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {Object.entries(scenarioGroups).map(([groupKey, scenarioIds]) => {
              return (
                <div key={groupKey} style={{
                  flex: '1 1 180px',
                  minWidth: '180px',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  border: '2px solid #e0e0e0'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                    {groupKey}
                  </div>
                  {scenarioIds.map(scenarioId => {
                    const scenarioInfo = scenarioConfigsData.scenarios.find(s => s.id === scenarioId);
                    const displayName = scenarioInfo?.name || scenarioId;
                    const isSelected = selectedFilters[groupKey] === scenarioId;

                    return (
                      <label
                        key={scenarioId}
                        style={{
                          display: 'block',
                          padding: '6px 8px',
                          marginBottom: '4px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#2196F3' : 'white',
                          color: isSelected ? 'white' : '#333',
                          borderRadius: '4px',
                          fontSize: '12px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="radio"
                          name={groupKey}
                          value={scenarioId}
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              [groupKey]: e.target.checked ? scenarioId : null
                            }));
                          }}
                          style={{ marginRight: '6px' }}
                        />
                        {displayName}
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleCalculateBestScenario}
          disabled={isCalculating}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isCalculating ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isCalculating ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {isCalculating
            ? `⏳ Calcul en cours... ${progress.current}/${progress.total}`
            : '🏆 Best Scenario (calculer les 72 combinaisons)'}
        </button>

        {results && (
          <>
            <button
              onClick={() => setShowChart(!showChart)}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {showChart ? '📊 Masquer le graphique' : '📊 Afficher le graphique'}
            </button>

            <button
              onClick={handleClearCache}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              🗑️ Effacer le cache
            </button>
          </>
        )}
      </div>

      {/* Cache Info */}
      {cacheInfo && cacheInfo.exists && (
        <div style={{
          padding: '15px',
          backgroundColor: cacheInfo.valid ? '#e3f2fd' : '#fff3cd',
          borderRadius: '4px',
          marginBottom: '20px',
          border: `2px solid ${cacheInfo.valid ? '#2196F3' : '#ffc107'}`
        }}>
          <strong>ℹ️ Cache Info:</strong><br />
          {cacheInfo.resultCount} scénarios en cache (âge: {cacheInfo.age.toFixed(1)}h)
          {results && results.length > 0 && (
            <>
              <br />
              <strong>Meilleur score:</strong> {results[0]?.totalScore} - {results[0]?.combination.name}
            </>
          )}
        </div>
      )}

      {/* Stacked Bar Chart */}
      {showChart && chartData && (
        <div style={{
          marginTop: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: 'calc(100vw - 80px)',
          width: '100%'
        }}>
          <div style={{ height: '600px', width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ minWidth: '2000px', height: '100%' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Top 10 Table */}
      {results && results.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>🏆 Top 10 Meilleurs Scénarios</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <thead style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Rang</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Nom du Scénario</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Score Total</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Activités ✗</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Créneaux ⚠</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>TeleCs ✗</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>MAD (h)</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 10).map((r, i) => (
                  <tr key={r.combination.id} style={{
                    backgroundColor: i === 0 ? '#fff3cd' : i % 2 === 0 ? '#f9f9f9' : 'white'
                  }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '11px', maxWidth: '300px' }}>
                      {r.combination.name}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <strong style={{ fontSize: '16px', color: i === 0 ? '#4CAF50' : 'inherit' }}>
                        {r.totalScore}
                      </strong>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {r.metrics.totalMissingActivities}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {r.metrics.totalOverloadedSlots}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {r.metrics.totalTeleCsMissing}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {r.metrics.workloadMAD.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button
                        onClick={() => handleApplyCombination(r.combination)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Appliquer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '5px'
      }}>
        <strong>💡 Mode d'emploi:</strong>
        <ul style={{ fontSize: '13px', margin: '8px 0', paddingLeft: '20px' }}>
          <li>Cliquez sur "Best Scenario" pour calculer toutes les combinaisons (15-30 secondes)</li>
          <li>Les résultats sont automatiquement sauvegardés en cache</li>
          <li><strong>🔍 Recherche:</strong> Utilisez les filtres pour trouver un scénario spécifique (0 ou 1 résultat avec logique AND)</li>
          <li>Le graphique montre les 72 scénarios triés du meilleur (gauche) au pire (droite)</li>
          <li><strong>🎯 Scénario trouvé:</strong> Un marqueur jaune "🎯 Trouvé" apparaît au-dessus de la barre correspondante</li>
          <li><strong>Clic sur barre:</strong> Cliquez directement sur n'importe quelle barre du graphique pour appliquer ce scénario</li>
          <li>Cliquez sur "Appliquer" dans le tableau Top 10 pour utiliser un scénario</li>
          <li>Score total = Activités manquantes + Créneaux surchargés + TeleCs manquantes (MAD non inclus car en heures)</li>
        </ul>
      </div>
    </div>
  );
};

export default ScenarioCombinationComparison;
