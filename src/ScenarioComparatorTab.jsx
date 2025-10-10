import React from 'react';
import ScenarioCombinationComparison from './ScenarioCombinationComparison';
import ScenarioComparison from './ScenarioComparison';
import Workload from './Workload';
import ETAWorkloadInfographic from './ETAWorkloadInfographic';
import PlanningOverview from './PlanningOverview';
import { useContext } from 'react';
import { ScheduleContext } from './ScheduleContext';
import './ScenarioComparatorTab.css';

const ScenarioComparatorTab = ({ onPeriodClick }) => {
  const { customScheduleData } = useContext(ScheduleContext);

  return (
    <div className="scenario-comparator-tab">
      <h2 className="tab-title">📊 Analyse Exhaustive des Combinaisons de Scénarios</h2>

      {/* 1. Multi-scenario Bar Chart */}
      <div className="section-container">
        <ScenarioCombinationComparison />
      </div>

      {/* 2. Spider Chart & Problems Chart (full width) */}
      <div className="section-container">
        <ScenarioComparison />
      </div>

      {/* 3. Workload & ETA Grid - Side by Side */}
      <div className="section-container">
        <div className="two-column-layout">
          <div className="chart-column">
            <Workload />
          </div>
          <div className="chart-column">
            <ETAWorkloadInfographic />
          </div>
        </div>
      </div>

      {/* 4. Planning Overview - Period Calendars (full width) */}
      <div className="section-container">
        <PlanningOverview
          customScheduleData={customScheduleData}
          onPeriodClick={onPeriodClick}
        />
      </div>
    </div>
  );
};

export default ScenarioComparatorTab;
