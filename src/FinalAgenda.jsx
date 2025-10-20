import React from 'react';
import Calendar from './Calendar';
import ExcelExport from './ExcelExport';
import { PLANNING_CONFIG } from './customPlanningLogic.js';

const FinalAgenda = ({ selectedRotationCycle, setSelectedRotationCycle }) => {
  return (
    <div className="final-agenda-container">
      <h1>MIMI planning</h1>

      {/* Excel Export Button */}
      <ExcelExport />

      {/* Dynamic Calendar rendering based on PLANNING_CONFIG */}
      {PLANNING_CONFIG.yearsToPlan.map((year) => (
        <Calendar
          key={year}
          year={year}
          selectedRotationCycle={selectedRotationCycle}
          setSelectedRotationCycle={setSelectedRotationCycle}
        />
      ))}
    </div>
  );
};

export default FinalAgenda;
