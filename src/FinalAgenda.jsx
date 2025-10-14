import React from 'react';
import Calendar from './Calendar';
import ExcelExport from './ExcelExport';

const FinalAgenda = ({ selectedRotationCycle, setSelectedRotationCycle }) => {
  return (
    <div className="final-agenda-container">
      <h1>MIMI planning</h1>

      {/* Excel Export Button */}
      <ExcelExport />

      {/* 2024 Calendar */}
      <Calendar
        year="2024"
        selectedRotationCycle={selectedRotationCycle}
        setSelectedRotationCycle={setSelectedRotationCycle}
      />

      {/* 2025 Calendar */}
      <Calendar
        year="2025"
        selectedRotationCycle={selectedRotationCycle}
        setSelectedRotationCycle={setSelectedRotationCycle}
      />
    </div>
  );
};

export default FinalAgenda;
