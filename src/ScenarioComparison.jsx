import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
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
  }, [visibleScenarios, getScenarioMetrics]);

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

  return (
    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>📊 Scenario Comparison</h2>

      {/* Chart */}
      <div style={{ maxWidth: '900px', margin: '0 auto 30px' }}>
        <Radar data={chartData} options={chartOptions} />
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
