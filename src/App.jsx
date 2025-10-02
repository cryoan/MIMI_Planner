import React, { useState, useContext } from 'react';
import Calendar from './Calendar';
import Workload from './Workload';
import './Calendar.css';
import { ScheduleProvider, ScheduleContext } from './ScheduleContext';
import { DocAgendaSetting } from './DocAgendaSetting';
import DoctorSettings from './DoctorSettings';
import ETAWorkloadInfographic from './ETAWorkloadInfographic';
import PlanningOverview from './PlanningOverview';
import ExcelExport from './ExcelExport';
import { rotation_cycles } from './customPlanningLogic.js';

// Inner App component that has access to ScheduleContext
function AppInner({ selectedRotationCycle, setSelectedRotationCycle }) {
  const { customScheduleData, recalculateSchedules } = useContext(ScheduleContext);
  const [showPlanningOverview, setShowPlanningOverview] = useState(true);

  const handlePeriodClick = (periodOrName) => {
    console.log('Period clicked:', periodOrName);

    // Handle period name string (from PlanningOverview)
    if (typeof periodOrName === 'string') {
      // Additional period click handling for planning overview can be added here
      return;
    }

    // Handle period object (from calendar scrolling)
    if (periodOrName && periodOrName.startWeek) {
      const weekElement = document.getElementById(`week-${periodOrName.startWeek}`);
      if (weekElement) {
        weekElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleTestHTCResolution = () => {
    console.log('🔧 Testing HTC Conflict Resolution...');
    console.log('Current schedule data:', customScheduleData);

    if (customScheduleData && customScheduleData.periodicSchedule) {
      console.log('📊 HTC Resolution Results:');
      Object.entries(customScheduleData.periodicSchedule).forEach(([periodName, periodData]) => {
        if (periodData.htcResolution) {
          console.log(`\n${periodName}:`, {
            conflictsDetected: periodData.htcResolution.conflictsDetected,
            conflictsResolved: periodData.htcResolution.conflictsResolved,
            resolutionLog: periodData.htcResolution.resolutionLog
          });
        }
      });
    }

    // Trigger a recalculation to see the resolution in action
    if (recalculateSchedules) {
      recalculateSchedules();
    }
  };

  return (
    <div className="App">
      <h1>MIMI planning</h1>

      {/* Test HTC Resolution Button */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <button
          onClick={handleTestHTCResolution}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔧 Test HTC Conflict Resolution
        </button>
        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
          Check browser console for detailed resolution logs
        </span>
      </div>

      {/* 1. Schedule Settings - Doctors, Templates, and Rotation Cycles */}
      <DoctorSettings
        selectedRotationCycle={selectedRotationCycle}
        setSelectedRotationCycle={setSelectedRotationCycle}
      />

      {/* 2. ETA Workload Infographic (includes Activity Duration & Shared Activities charts) */}
      <ETAWorkloadInfographic />

      {/* 3. Workload Analysis Charts */}
      <Workload />

      {/* 4. Planning Overview with Toggle */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={showPlanningOverview}
            onChange={(e) => setShowPlanningOverview(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Show Planning Overview</span>
        </label>

        {showPlanningOverview && (
          <PlanningOverview
            customScheduleData={customScheduleData}
            onPeriodClick={handlePeriodClick}
          />
        )}
      </div>

      {/* 5. Detailed Calendar Views */}
      <Calendar
        year="2024"
        selectedRotationCycle={selectedRotationCycle}
        setSelectedRotationCycle={setSelectedRotationCycle}
      />
      <Calendar
        year="2025"
        selectedRotationCycle={selectedRotationCycle}
        setSelectedRotationCycle={setSelectedRotationCycle}
      />

      {/* Legacy Components - Keep for now but may reorganize later */}
      <DocAgendaSetting />
      <ExcelExport />
    </div>
  );
}

// Main App component with ScheduleProvider wrapper
function App() {
  const [selectedRotationCycle, setSelectedRotationCycle] = useState(Object.keys(rotation_cycles)[0]);

  return (
    <ScheduleProvider selectedRotationCycle={selectedRotationCycle}>
      <AppInner
        selectedRotationCycle={selectedRotationCycle}
        setSelectedRotationCycle={setSelectedRotationCycle}
      />
    </ScheduleProvider>
  );
}

export default App;