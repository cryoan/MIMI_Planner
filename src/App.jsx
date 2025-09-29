import React, { useState } from 'react';
import Calendar from './Calendar';
import Workload from './Workload';
import './Calendar.css';
import { ScheduleProvider } from './ScheduleContext';
import { DocAgendaSetting } from './DocAgendaSetting';
import DoctorSettings from './DoctorSettings';
import ExcelExport from './ExcelExport';
import { rotation_cycles } from './customPlanningLogic.js';

function App() {
  const [selectedRotationCycle, setSelectedRotationCycle] = useState(Object.keys(rotation_cycles)[0]);

  return (
    <ScheduleProvider selectedRotationCycle={selectedRotationCycle}>
      <div className="App">
        <h1>MIMI planning</h1>
        <ExcelExport />
        <Workload />
        <DocAgendaSetting />
        <DoctorSettings />
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
      </div>
    </ScheduleProvider>
  );
}

export default App;