// import React from 'react';
// import './App.css'; // Assuming you have some CSS for styling

// const doctorSchedules = {
//   // ... (Include your JSON data here)
// };

// const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// const TimeSlot = ({ time, activities }) => (
//   <div className="time-slot">
//     <strong>{time}</strong>: {activities.join(', ')}
//   </div>
// );

// const DaySchedule = ({ day, schedule }) => (
//   <div className="day-schedule">
//     <h4>{day}</h4>
//     {Object.entries(schedule).map(([time, activities]) => (
//       <TimeSlot key={time} time={time} activities={activities} />
//     ))}
//   </div>
// );

// const ScheduleSection = ({ sectionName, sectionData }) => (
//   <div className="schedule-section">
//     <h3>{sectionName}</h3>
//     {Object.entries(sectionData).map(([key, value]) =>
//       daysOfWeek.includes(key) ? (
//         <DaySchedule key={key} day={key} schedule={value} />
//       ) : (
//         <ScheduleSection key={key} sectionName={key} sectionData={value} />
//       )
//     )}
//   </div>
// );

// const MonthSchedule = ({ monthName, monthData }) => (
//   <div className="month-schedule">
//     <h2>{monthName}</h2>
//     {Object.entries(monthData).map(([key, value]) =>
//       daysOfWeek.includes(key) ? (
//         <DaySchedule key={key} day={key} schedule={value} />
//       ) : (
//         <ScheduleSection key={key} sectionName={key} sectionData={value} />
//       )
//     )}
//   </div>
// );

// const DoctorSchedule = ({ doctorName, doctorData }) => (
//   <div className="doctor-schedule">
//     <h1>{doctorName}</h1>
//     {Object.entries(doctorData).map(([monthName, monthData]) => (
//       <MonthSchedule
//         key={monthName}
//         monthName={monthName}
//         monthData={monthData}
//       />
//     ))}
//   </div>
// );

// const App = () => (
//   <div className="app">
//     {Object.entries(doctorSchedules).map(([doctorName, doctorData]) => (
//       <DoctorSchedule
//         key={doctorName}
//         doctorName={doctorName}
//         doctorData={doctorData}
//       />
//     ))}
//   </div>
// );

// export default App;
