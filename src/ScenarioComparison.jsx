import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Radar, Bar } from 'react-chartjs-2';
import { ScheduleContext } from './ScheduleContext';
import scenarioConfigsData from './scenarioConfigs.json';
import { applyScenarioChanges, getDefaultScenarioColor } from './scenarioEngine';
import './Calendar.css';

const ScenarioComparison = () => {
  const {
    applyScenario,
    activeScenarioId,
    getScenarioMetrics
  } = useContext(ScheduleContext);

  // Scenario visibility state (only Base Configuration visible by default)
  const [visibleScenarios, setVisibleScenarios] = useState(() => {
    const initial = {};
    scenarioConfigsData.scenarios.forEach(scenario => {
      initial[scenario.id] = scenario.id === 'base';
    });
    return initial;
  });

  // Store computed metrics in local state
  const [scenarioMetrics, setScenarioMetrics] = useState({});

  // Bar chart view mode: 'by-indicator' or 'by-scenario'
  const [barChartViewMode, setBarChartViewMode] = useState('by-indicator');

  // Check if active scenario is a combination (not in scenarioConfigsData)
  const isActiveCombination = useMemo(() => {
    return !scenarioConfigsData.scenarios.find(s => s.id === activeScenarioId);
  }, [activeScenarioId]);

  // Get active scenario display name
  const activeScenarioName = useMemo(() => {
    const scenario = scenarioConfigsData.scenarios.find(s => s.id === activeScenarioId);
    if (scenario) {
      return scenario.name;
    }
    // It's a combination ID
    return activeScenarioId.split('_').join(' + ').replace(/-/g, ' ');
  }, [activeScenarioId]);

  // Compute metrics for visible scenarios asynchronously (avoid setState during render)
  useEffect(() => {
    const metrics = {};

    scenarioConfigsData.scenarios.forEach(scenario => {
      if (visibleScenarios[scenario.id]) {
        const result = getScenarioMetrics(scenario.id);
        if (result) {
          metrics[scenario.id] = result;
        }
      }
    });

    setScenarioMetrics(metrics);
  }, [visibleScenarios, getScenarioMetrics, activeScenarioId]);

  // Toggle scenario visibility in chart
  const toggleScenarioVisibility = (scenarioId) => {
    setVisibleScenarios(prev => ({
      ...prev,
      [scenarioId]: !prev[scenarioId]
    }));
  };

  // Apply scenario to entire app
  const handleApplyScenario = (scenarioId) => {
    applyScenario(scenarioId);
  };

  // Prepare chart data with multiple datasets
  const chartData = useMemo(() => {
    const datasets = [];

    scenarioConfigsData.scenarios.forEach((scenario, index) => {
      if (!visibleScenarios[scenario.id]) {
        return;
      }

      const metrics = scenarioMetrics[scenario.id];
      if (!metrics) {
        return;
      }

      const color = scenario.color || getDefaultScenarioColor(index);
      const isActive = activeScenarioId === scenario.id;

      datasets.push({
        label: scenario.name,
        data: [
          metrics.workloadScore,
          metrics.nonOverloadCoverage,
          metrics.emitCoverage,
          metrics.ematitCoverage,
          metrics.amiCoverage,
          metrics.telecsCoverage,
        ],
        backgroundColor: color.replace('0.6', '0.2'),
        borderColor: color.replace('0.6', isActive ? '1' : '0.8'),
        pointBackgroundColor: color.replace('0.6', '1'),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color.replace('0.6', '1'),
        borderWidth: isActive ? 3 : 2,
        pointRadius: isActive ? 5 : 3,
      });
    });

    return {
      labels: [
        'Workload Equity',
        'Non-Overload Coverage',
        'EMIT Coverage',
        'EMATIT Coverage',
        'AMI Coverage',
        'TeleCs Coverage',
      ],
      datasets,
    };
  }, [visibleScenarios, scenarioMetrics, activeScenarioId]);

  // Prepare bar chart data clustered by indicator (X-axis = indicators, datasets = scenarios)
  // Split into two dataset groups: count-based metrics and hours-based metric
  const barChartDataByIndicator = useMemo(() => {
    const datasets = [];

    scenarioConfigsData.scenarios.forEach((scenario, index) => {
      if (!visibleScenarios[scenario.id]) {
        return;
      }

      const metrics = scenarioMetrics[scenario.id];
      if (!metrics) {
        return;
      }

      const color = scenario.color || getDefaultScenarioColor(index);
      const isActive = activeScenarioId === scenario.id;

      // Count-based metrics (first 3 bars)
      datasets.push({
        label: scenario.name,
        data: [
          metrics.totalMissingActivities || 0,
          metrics.totalOverloadedSlots || 0,
          metrics.totalTeleCsMissing || 0,
          null, // null for MAD position
        ],
        backgroundColor: color.replace('0.6', '0.6'),
        borderColor: color.replace('0.6', isActive ? '1' : '0.8'),
        borderWidth: isActive ? 2 : 1,
        yAxisID: 'y-count',
      });

      // Hours-based metric (MAD - 4th bar) - use same scenario color
      datasets.push({
        label: `${scenario.name} (MAD)`,
        data: [
          null, // null for first 3 positions
          null,
          null,
          metrics.workloadMAD || 0,
        ],
        backgroundColor: color.replace('0.6', '0.6'),
        borderColor: color.replace('0.6', isActive ? '1' : '0.8'),
        borderWidth: isActive ? 2 : 1,
        yAxisID: 'y-hours',
      });
    });

    return {
      labels: ['Activités manquantes', 'Créneaux surchargés', 'TeleCs manquantes', 'MAD (heures)'],
      datasets,
    };
  }, [visibleScenarios, scenarioMetrics, activeScenarioId]);

  // Prepare bar chart data clustered by scenario (X-axis = scenarios, datasets = indicators)
  const barChartDataByScenario = useMemo(() => {
    const datasets = [];
    const scenarioLabels = [];

    scenarioConfigsData.scenarios.forEach((scenario, index) => {
      if (!visibleScenarios[scenario.id]) {
        return;
      }

      const metrics = scenarioMetrics[scenario.id];
      if (!metrics) {
        return;
      }

      scenarioLabels.push(scenario.name);

      // Initialize datasets on first iteration
      if (datasets.length === 0) {
        datasets.push({
          label: 'Activités manquantes',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y-count',
        });
        datasets.push({
          label: 'Créneaux surchargés',
          data: [],
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          yAxisID: 'y-count',
        });
        datasets.push({
          label: 'TeleCs manquantes',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y-count',
        });
        datasets.push({
          label: 'MAD (heures)',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y-hours',
        });
      }

      datasets[0].data.push(metrics.totalMissingActivities || 0);
      datasets[1].data.push(metrics.totalOverloadedSlots || 0);
      datasets[2].data.push(metrics.totalTeleCsMissing || 0);
      datasets[3].data.push(metrics.workloadMAD || 0);
    });

    return {
      labels: scenarioLabels,
      datasets,
    };
  }, [visibleScenarios, scenarioMetrics]);

  const chartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          callback: function (value) {
            return value;
          },
        },
        pointLabels: {
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        onClick: (e, legendItem, legend) => {
          // Custom legend click to toggle scenario visibility
          const index = legendItem.datasetIndex;
          const scenarioId = scenarioConfigsData.scenarios[index]?.id;
          if (scenarioId) {
            toggleScenarioVisibility(scenarioId);
          }
        },
      },
      title: {
        display: true,
        text: 'Scenario Comparison - Schedule Evaluation Metrics',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  const barChartOptions = useMemo(() => ({
    scales: {
      'y-count': {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Nombre de problèmes',
          color: '#666',
        },
        grid: {
          drawOnChartArea: true,
        },
      },
      'y-hours': {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'MAD (heures)',
          color: '#666',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          // Filter out duplicate MAD entries in legend for by-indicator view
          filter: function(legendItem, chartData) {
            if (barChartViewMode === 'by-indicator') {
              // Only show non-MAD labels (hide "(MAD)" entries)
              return !legendItem.text.includes('(MAD)');
            }
            return true;
          },
        },
      },
      title: {
        display: true,
        text: barChartViewMode === 'by-indicator'
          ? 'Problèmes par indicateur'
          : 'Scénarios par problème',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            // Remove (MAD) suffix for cleaner tooltip
            label = label.replace(' (MAD)', '');
            const value = context.parsed.y;
            const yAxisId = context.dataset.yAxisID;
            const unit = yAxisId === 'y-hours' ? 'h' : '';
            return `${label}: ${value.toFixed(1)}${unit}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: true,
  }), [barChartViewMode]);

  return (
    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>📊 Scenario Comparison</h2>

      {/* Active Combination Info Banner */}
      {isActiveCombination && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '6px',
          maxWidth: '900px',
          margin: '0 auto 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎯</span>
            <div>
              <strong style={{ fontSize: '14px', color: '#333' }}>Active Combination:</strong>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                {activeScenarioName}
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px', fontStyle: 'italic' }}>
                This is a combined scenario from the 72-scenario analysis. The chart shows live metrics for this configuration.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Radar Chart */}
      <div style={{ maxWidth: '900px', margin: '0 auto 30px' }}>
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* Bar Chart for Issues */}
      <div style={{ maxWidth: '900px', margin: '0 auto 30px' }}>
        {/* Toggle buttons for bar chart view */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setBarChartViewMode('by-indicator')}
            style={{
              padding: '8px 16px',
              backgroundColor: barChartViewMode === 'by-indicator' ? '#4CAF50' : '#e0e0e0',
              color: barChartViewMode === 'by-indicator' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: barChartViewMode === 'by-indicator' ? 'bold' : 'normal',
              transition: 'all 0.3s ease',
            }}
          >
            📊 Problèmes par indicateur
          </button>
          <button
            onClick={() => setBarChartViewMode('by-scenario')}
            style={{
              padding: '8px 16px',
              backgroundColor: barChartViewMode === 'by-scenario' ? '#4CAF50' : '#e0e0e0',
              color: barChartViewMode === 'by-scenario' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: barChartViewMode === 'by-scenario' ? 'bold' : 'normal',
              transition: 'all 0.3s ease',
            }}
          >
            📈 Scénarios par problème
          </button>
        </div>

        <Bar
          data={barChartViewMode === 'by-indicator' ? barChartDataByIndicator : barChartDataByScenario}
          options={barChartOptions}
        />
      </div>

      {/* Scenario List */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h3>Scenarios</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Click checkboxes to toggle visibility in chart. Click "Apply" to update entire app with that scenario.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '15px' }}>
          {scenarioConfigsData.scenarios.map((scenario, index) => {
            const isActive = activeScenarioId === scenario.id;
            const isVisible = visibleScenarios[scenario.id];
            const metrics = scenarioMetrics[scenario.id];
            const color = scenario.color || getDefaultScenarioColor(index);

            return (
              <div
                key={scenario.id}
                style={{
                  padding: '15px',
                  backgroundColor: isActive ? '#e3f2fd' : 'white',
                  borderTop: isActive ? '2px solid #2196F3' : '1px solid #ddd',
                  borderRight: isActive ? '2px solid #2196F3' : '1px solid #ddd',
                  borderBottom: isActive ? '2px solid #2196F3' : '1px solid #ddd',
                  borderRadius: '5px',
                  borderLeft: `5px solid ${color.replace('0.6', '1')}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleScenarioVisibility(scenario.id)}
                      style={{ marginRight: '10px', cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <strong style={{ fontSize: '15px' }}>{scenario.name}</strong>
                  </div>

                  {isActive && (
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      marginLeft: '10px'
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: '#666', margin: '8px 0' }}>
                  {scenario.description}
                </p>

                {/* Show key metrics if visible */}
                {isVisible && metrics && (
                  <div style={{ fontSize: '12px', color: '#444', marginTop: '10px', marginBottom: '10px' }}>
                    <div>Workload Equity: {metrics.workloadScore.toFixed(1)}</div>
                    <div>TeleCs Coverage: {metrics.telecsCoverage.toFixed(1)}%</div>
                    <div>EMIT Coverage: {metrics.emitCoverage.toFixed(1)}%</div>
                  </div>
                )}

                <button
                  onClick={() => handleApplyScenario(scenario.id)}
                  disabled={isActive}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: isActive ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isActive ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                >
                  {isActive ? 'Applied' : 'Apply Scenario'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Helper */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '5px',
        maxWidth: '900px',
        margin: '20px auto 0'
      }}>
        <strong>💡 How to use:</strong>
        <ul style={{ fontSize: '13px', margin: '8px 0', paddingLeft: '20px' }}>
          <li>Uncheck scenarios to hide them from the chart</li>
          <li>Click "Apply Scenario" to recalculate the entire schedule with that configuration</li>
          <li>Active scenario is highlighted and affects Calendar, Workload, and all other views</li>
          <li>Click chart legend items to toggle visibility</li>
        </ul>
      </div>
    </div>
  );
};

export default ScenarioComparison;
