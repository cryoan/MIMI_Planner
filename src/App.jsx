import React, { useState } from 'react';
import './Calendar.css';
import { ScheduleProvider } from './ScheduleContext';
import MainLayout from './MainLayout';
import { rotation_cycles } from './customPlanningLogic.js';

// Main App component with ScheduleProvider wrapper
function App() {
  const [selectedRotationCycle, setSelectedRotationCycle] = useState(Object.keys(rotation_cycles)[0]);

  return (
    <ScheduleProvider selectedRotationCycle={selectedRotationCycle}>
      <MainLayout
        selectedRotationCycle={selectedRotationCycle}
        setSelectedRotationCycle={setSelectedRotationCycle}
      />
    </ScheduleProvider>
  );
}

export default App;