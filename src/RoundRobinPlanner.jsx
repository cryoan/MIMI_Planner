import React, { useState, useEffect } from 'react';
import './DoctorSchedule.css';
import { 
  findOptimalRoundRobinAssignment, 
  generateRoundRobinScenario, 
  analyzeScenarioAlarms,
  summarizeActivityAssignments,
  AVAILABLE_DOCTORS,
  DEFAULT_PERIODS
} from './roundRobinPlanning.js';
import { activityColors } from './schedule';
import { docActivities } from './doctorSchedules.js';
import { runAllTests } from './testRoundRobin.js';

const RoundRobinPlanner = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary', 'detailed', 'comparison'
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // Configuration state
  const [config, setConfig] = useState({
    doctors: AVAILABLE_DOCTORS,
    periodsCount: 24, // 6 months
    maxIterations: 20
  });

  const runOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationResults(null);
    
    try {
      const periods = DEFAULT_PERIODS.slice(0, config.periodsCount);
      const results = await findOptimalRoundRobinAssignment(
        config.doctors,
        periods,
        config.maxIterations
      );
      
      setOptimizationResults(results);
      setSelectedScenario(results.bestScenario);
      
    } catch (error) {
      console.error('Optimization error:', error);
      alert('Error during optimization: ' + error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const selectScenario = (resultIndex) => {
    if (optimizationResults && optimizationResults.allResults[resultIndex]) {
      setSelectedScenario(optimizationResults.allResults[resultIndex].scenario);
    }
  };

  return (
    <div className="round-robin-planner">
      <div className="planner-header">
        <h3>Round Robin Automated Planning</h3>
        <p>Automatically find optimal doctor rotation assignments with minimal scheduling conflicts.</p>
      </div>

      {/* Configuration Panel */}
      <div className="configuration-panel">
        <h4>Configuration</h4>
        <div className="config-row">
          <label>
            Planning Period:
            <select 
              value={config.periodsCount}
              onChange={(e) => setConfig({...config, periodsCount: parseInt(e.target.value)})}
            >
              <option value={12}>3 months (12 periods)</option>
              <option value={24}>6 months (24 periods)</option>
              <option value={48}>1 year (48 periods)</option>
            </select>
          </label>
          
          <label>
            Max Scenarios:
            <select
              value={config.maxIterations}
              onChange={(e) => setConfig({...config, maxIterations: parseInt(e.target.value)})}
            >
              <option value={10}>10 scenarios</option>
              <option value={20}>20 scenarios</option>
              <option value={50}>50 scenarios</option>
            </select>
          </label>
        </div>

        <div className="optimization-controls">
          <button 
            onClick={runOptimization}
            disabled={isOptimizing}
            className="optimize-button"
          >
            {isOptimizing ? 'Optimizing...' : '🚀 Run Optimization'}
          </button>
          
          <button 
            onClick={() => runAllTests()}
            className="test-button"
            title="Run tests in browser console"
          >
            🧪 Run Tests
          </button>
          
          {optimizationResults && (
            <div className="optimization-status">
              <span className="status-success">
                ✓ Best scenario: {optimizationResults.lowestAlarmCount} total alarms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {optimizationResults && (
        <div className="results-panel">
          <div className="results-tabs">
            <button 
              className={viewMode === 'summary' ? 'active' : ''}
              onClick={() => setViewMode('summary')}
            >
              Summary
            </button>
            <button 
              className={viewMode === 'detailed' ? 'active' : ''}
              onClick={() => setViewMode('detailed')}
            >
              Detailed View
            </button>
            <button 
              className={viewMode === 'comparison' ? 'active' : ''}
              onClick={() => setViewMode('comparison')}
            >
              Compare Scenarios
            </button>
          </div>

          <div className="results-content">
            {viewMode === 'summary' && (
              <SummaryView 
                results={optimizationResults}
                selectedScenario={selectedScenario}
              />
            )}
            
            {viewMode === 'detailed' && (
              <DetailedView 
                scenario={selectedScenario}
                alarmAnalysis={optimizationResults.bestAlarmAnalysis}
                onPeriodSelect={setSelectedPeriod}
                selectedPeriod={selectedPeriod}
              />
            )}
            
            {viewMode === 'comparison' && (
              <ComparisonView 
                results={optimizationResults}
                onScenarioSelect={selectScenario}
              />
            )}
          </div>
        </div>
      )}

      {isOptimizing && (
        <div className="optimization-progress">
          <div className="progress-spinner"></div>
          <p>Running optimization scenarios...</p>
        </div>
      )}
    </div>
  );
};

// Summary View Component
const SummaryView = ({ results, selectedScenario }) => {
  const activityAssignments = selectedScenario ? summarizeActivityAssignments(selectedScenario) : {};
  
  return (
    <div className="summary-view">
      <div className="optimization-summary">
        <h4>Optimization Results</h4>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Best Alarm Count:</span>
            <span className="stat-value alarm-count">{results.lowestAlarmCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Missing Activities:</span>
            <span className="stat-value">{results.bestAlarmAnalysis.missingActivities}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Duplicate Activities:</span>
            <span className="stat-value">{results.bestAlarmAnalysis.duplicateActivities}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Backbone Conflicts:</span>
            <span className="stat-value">{results.bestAlarmAnalysis.backboneConflicts || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Scenarios Tested:</span>
            <span className="stat-value">{results.allResults.length}</span>
          </div>
        </div>
      </div>

      <div className="assignment-overview">
        <h4>Activity Assignments (Best Scenario)</h4>
        <p>Shows which doctor is assigned to each medical activity</p>
        
        {Object.entries(activityAssignments).slice(0, 6).map(([period, periodAssignments]) => (
          <div key={period} className="period-summary">
            <h5>{period}</h5>
            <div className="activity-assignments-grid">
              {['Monday', 'Tuesday', 'Wednesday'].map(day => (
                <div key={day} className="day-assignments">
                  <h6>{day}</h6>
                  <div className="timeslot-assignments">
                    {['9am-1pm', '2pm-6pm'].map(timeSlot => (
                      <div key={timeSlot} className="timeslot-summary">
                        <div className="timeslot-label">{timeSlot === '9am-1pm' ? 'AM' : 'PM'}</div>
                        <div className="activity-doctor-pairs">
                          {Object.entries(periodAssignments[day]?.[timeSlot] || {}).map(([activity, doctor]) => (
                            <div key={activity} className="activity-assignment" title={`${activity} → ${doctor}`}>
                              <span 
                                className="activity-dot"
                                style={{ backgroundColor: activityColors[activity] || '#ccc' }}
                              ></span>
                              <span className="activity-label">{activity}</span>
                              <span className="doctor-label">{doctor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(activityAssignments).length > 6 && (
          <div className="more-periods-indicator">
            <p>+ {Object.keys(activityAssignments).length - 6} more periods...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Detailed View Component  
const DetailedView = ({ scenario, alarmAnalysis, onPeriodSelect, selectedPeriod }) => {
  const periods = Object.keys(scenario || {});
  const currentPeriod = selectedPeriod || periods[0];
  const currentAssignments = scenario?.[currentPeriod] || {};
  
  return (
    <div className="detailed-view">
      <div className="period-selector">
        <h4>Period Selection</h4>
        <select value={currentPeriod} onChange={(e) => onPeriodSelect(e.target.value)}>
          {periods.map(period => (
            <option key={period} value={period}>{period}</option>
          ))}
        </select>
      </div>

      <div className="period-schedule">
        <h4>Schedule for {currentPeriod}</h4>
        <div className="schedule-grid">
          <div className="schedule-header">
            <div className="doctor-header">Doctor</div>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
              <div key={day} className="day-header">
                <div>{day}</div>
                <div className="am-pm-header">
                  <div>AM</div>
                  <div>PM</div>
                </div>
              </div>
            ))}
          </div>

          {Object.entries(currentAssignments).map(([doctorCode, schedule]) => (
            <div key={doctorCode} className="doctor-schedule-row">
              <div className="doctor-label">{doctorCode}</div>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                <div key={day} className="day-schedule">
                  <div className="time-slot">
                    {(schedule[day]?.['9am-1pm'] || []).map((activity, index) => (
                      <div
                        key={index}
                        className="activity-block"
                        style={{
                          backgroundColor: activityColors[activity] || '#ccc',
                          height: `${((docActivities[activity]?.duration || 1) / 4) * 30}px`
                        }}
                        title={activity}
                      >
                        {activity}
                      </div>
                    ))}
                  </div>
                  <div className="time-slot">
                    {(schedule[day]?.['2pm-6pm'] || []).map((activity, index) => (
                      <div
                        key={index}
                        className="activity-block"
                        style={{
                          backgroundColor: activityColors[activity] || '#ccc',
                          height: `${((docActivities[activity]?.duration || 1) / 4) * 30}px`
                        }}
                        title={activity}
                      >
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Alarm Details */}
      <div className="alarm-details">
        <h4>Alarm Analysis</h4>
        <div className="alarm-sections">
          {Object.keys(alarmAnalysis.details.missing).length > 0 && (
            <div className="alarm-section missing-section">
              <h5>Missing Activities</h5>
              {Object.entries(alarmAnalysis.details.missing).map(([key, activities]) => (
                <div key={key} className="alarm-item">
                  <span className="alarm-location">{key.replace(/_/g, ' ')}</span>
                  <span className="alarm-activities">{activities.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
          
          {Object.keys(alarmAnalysis.details.duplicates).length > 0 && (
            <div className="alarm-section duplicates-section">
              <h5>Duplicate Activities</h5>
              {Object.entries(alarmAnalysis.details.duplicates).map(([key, activities]) => (
                <div key={key} className="alarm-item">
                  <span className="alarm-location">{key.replace(/_/g, ' ')}</span>
                  <span className="alarm-activities">{activities.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Comparison View Component
const ComparisonView = ({ results, onScenarioSelect }) => {
  return (
    <div className="comparison-view">
      <h4>Scenario Comparison</h4>
      <div className="scenarios-table">
        <div className="table-header">
          <div>Rank</div>
          <div>Offset</div>
          <div>Total Alarms</div>
          <div>Missing</div>
          <div>Duplicates</div>
          <div>Backbone Conflicts</div>
          <div>Action</div>
        </div>
        
        {results.allResults.slice(0, 10).map((result, index) => (
          <div 
            key={result.offset} 
            className={`table-row ${index === 0 ? 'best-scenario' : ''}`}
          >
            <div>{index + 1}</div>
            <div>{result.offset}</div>
            <div className="alarm-count">{result.alarmCount}</div>
            <div>{result.alarmAnalysis.missingActivities}</div>
            <div>{result.alarmAnalysis.duplicateActivities}</div>
            <div>{result.alarmAnalysis.backboneConflicts || 0}</div>
            <div>
              <button 
                onClick={() => onScenarioSelect(index)}
                className="select-scenario-btn"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="comparison-insights">
        <h5>Insights - Activity-Based Assignment</h5>
        <ul>
          <li>Best scenario has {results.lowestAlarmCount} total alarms</li>
          <li>Tested {results.allResults.length} different round robin starting positions</li>
          <li>
            Duplicate activities should be {results.allResults[0]?.alarmAnalysis.duplicateActivities === 0 ? 'zero ✅' : 'minimal ⚠️'} 
            (one doctor per activity by design)
          </li>
          <li>
            Main alarm sources: Missing activities ({results.bestAlarmAnalysis.missingActivities}) 
            and backbone conflicts ({results.bestAlarmAnalysis.backboneConflicts || 0})
          </li>
          <li>
            {results.allResults.filter(r => r.alarmCount === results.lowestAlarmCount).length} 
            scenario(s) achieved the minimum alarm count
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RoundRobinPlanner;