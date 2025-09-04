import React from 'react';
import Calendar from './Calendar';
import Workload from './Workload';
import './Calendar.css';
import { ScheduleProvider } from './ScheduleContext';
import { DocAgendaSetting } from './DocAgendaSetting';
import ExcelExport from './ExcelExport';

function App() {
  return (
    <ScheduleProvider>
      <div className="App">
        <h1>MIMI planning</h1>
        <ExcelExport />
        <Workload />
        <DocAgendaSetting />
        <Calendar year="2024" />
        <Calendar year="2025" />
      </div>
    </ScheduleProvider>
  );
}

export default App;