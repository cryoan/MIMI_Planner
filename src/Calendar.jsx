// import React, { useState, useEffect } from 'react';
// import './Calendar.css';
// import { format } from 'date-fns';
// import { getISOWeek } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { ref, update, get } from 'firebase/database';
// import {
//   useDocSchedule,
//   doctorsSchedule,
//   expectedActivities,
//   activityColors,
// } from './schedule';
// import { realTimeDb } from './firebase';
// import { publicHolidays } from './publicHolidays.js'; // Import the holidays JSON file

// console.log('Public Holidays Structure:', publicHolidays);

// const days = [
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
//   'Sunday',
// ];
// const timeSlots = ['9am-1pm', '2pm-6pm'];

// const getHolidayDescription = (date) => {
//   const year = date.getFullYear();
//   const weekNumber = getISOWeek(date); // ISO week number
//   const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }); // English day name

//   const weekData = publicHolidays[year]?.[`Week${weekNumber}`];

//   const noHoliday = '';

//   if (!weekData) {
//     return noHoliday;
//   }

//   const holidayData = weekData[dayOfWeek];

//   if (!holidayData) {
//     return noHoliday;
//   }

//   const holiday = holidayData.event;

//   return holiday ? holiday.description : noHoliday;
// };

// const getDateOfISOWeek = (week, year) => {
//   const simple = new Date(year, 0, 4 + (week - 1) * 7);
//   const dayOfWeek = simple.getDay();
//   const ISOWeekStart = new Date(
//     simple.setDate(
//       simple.getDate() - simple.getDay() + (dayOfWeek <= 4 ? 1 : 8)
//     )
//   );
//   return Array.from(
//     new Array(7), // Includes Saturday and Sunday
//     (_, i) =>
//       new Date(
//         ISOWeekStart.getFullYear(),
//         ISOWeekStart.getMonth(),
//         ISOWeekStart.getDate() + i
//       )
//   );
// };

// const sortWeeks = (weeks) => {
//   return weeks.sort((a, b) => {
//     const weekNumberA = parseInt(a.replace('Week', ''));
//     const weekNumberB = parseInt(b.replace('Week', ''));
//     return weekNumberA - weekNumberB;
//   });
// };

// const checkAssignments = (schedule, expectedActivities) => {
//   const assignmentStatus = {};
//   const duplicateActivities = ['EMIT', 'HDJ', 'AMI', 'HTC1', 'HTC2', 'EMATIT'];
//   const daysOfWeek = [
//     'Monday',
//     'Tuesday',
//     'Wednesday',
//     'Thursday',
//     'Friday',
//     'Saturday',
//     'Sunday',
//   ];

//   Object.keys(schedule).forEach((year) => {
//     assignmentStatus[year] = {};
//     Object.keys(schedule[year]).forEach((month) => {
//       assignmentStatus[year][month] = {};
//       Object.keys(schedule[year][month]).forEach((week) => {
//         assignmentStatus[year][month][week] = {};
//         daysOfWeek.forEach((day) => {
//           assignmentStatus[year][month][week][day] = {};
//           timeSlots.forEach((slot) => {
//             assignmentStatus[year][month][week][day][slot] = {
//               assigned: [],
//               missing: [],
//               duplicateNotification: false,
//               duplicates: [],
//             };
//             Object.keys(schedule[year][month][week]).forEach((doctor) => {
//               if (
//                 schedule[year][month][week][doctor][day] &&
//                 schedule[year][month][week][doctor][day][slot]
//               ) {
//                 assignmentStatus[year][month][week][day][slot].assigned.push(
//                   ...schedule[year][month][week][doctor][day][slot]
//                 );
//               }
//             });

//             const assigned =
//               assignmentStatus[year][month][week][day][slot].assigned;
//             const expected = expectedActivities[day]?.[slot] || [];
//             expected.forEach((activity) => {
//               if (!assigned.includes(activity)) {
//                 assignmentStatus[year][month][week][day][slot].missing.push(
//                   activity
//                 );
//               }
//             });

//             const activityCounts = {};
//             assigned.forEach((activity) => {
//               if (duplicateActivities.includes(activity)) {
//                 if (!activityCounts[activity]) {
//                   activityCounts[activity] = 0;
//                 }
//                 activityCounts[activity]++;
//               }
//             });

//             const duplicates = Object.keys(activityCounts).filter(
//               (activity) => activityCounts[activity] > 1
//             );

//             if (duplicates.length > 0) {
//               assignmentStatus[year][month][week][day][
//                 slot
//               ].duplicateNotification = true;
//               assignmentStatus[year][month][week][day][slot].duplicates =
//                 duplicates;
//             }
//           });
//         });
//       });
//     });
//   });

//   return assignmentStatus;
// };

// const Calendar = ({ year = 2024, month = 'Month1' }) => {
//   const { doc, loading } = useDocSchedule();
//   const [schedule, setSchedule] = useState(null);
//   const [editing, setEditing] = useState(null);
//   const [newActivity, setNewActivity] = useState('');
//   const [astreinte, setAstreinte] = useState({});
//   const [editingAstreinte, setEditingAstreinte] = useState(null);

//   const deepMerge = (target, source) => {
//     for (const key in source) {
//       if (source[key] instanceof Object && key in target) {
//         Object.assign(source[key], deepMerge(target[key], source[key]));
//       }
//     }
//     return { ...target, ...source };
//   };

//   useEffect(() => {
//     if (!loading && doc) {
//       const originalSchedule = doctorsSchedule(doc);
//       console.log('originalSchedule', originalSchedule);
//       const updatesRef = ref(realTimeDb, `schedules/`);
//       get(updatesRef)
//         .then((snapshot) => {
//           if (snapshot.exists()) {
//             const updates = snapshot.val();

//             const mergedSchedule = deepMerge(originalSchedule, updates);

//             setSchedule(mergedSchedule);
//           } else {
//             setSchedule(originalSchedule);
//           }
//         })
//         .catch((error) => {
//           console.error('Error fetching updates:', error);
//         });
//     }
//   }, [doc, loading, year, month]);

//   const handleAstreinteChange = (week, day, e) => {
//     const updatedAstreinte = { ...astreinte };
//     if (!updatedAstreinte[week]) updatedAstreinte[week] = {};
//     updatedAstreinte[week][day] = e.target.value;
//     setAstreinte(updatedAstreinte);

//     const updatePath = `astreinte/${year}/${month}/${week}/${day}`;
//     const updateData = { [updatePath]: e.target.value };
//     update(ref(realTimeDb), updateData)
//       .then(() => {
//         setEditingAstreinte(null);
//       })
//       .catch((error) => {
//         console.error('Error updating astreinte:', error);
//       });
//   };

//   if (loading || !schedule) {
//     return <div>Loading...</div>;
//   }

//   const scheduleForYear = schedule[year.toString()];
//   if (!scheduleForYear) {
//     return <div>No schedule available for the year {year}</div>;
//   }

//   const scheduleForMonth = scheduleForYear[month.toString()];
//   if (!scheduleForMonth) {
//     return <div>No schedule available for the month {month}</div>;
//   }

//   // Sort the weeks correctly before rendering them
//   const weeks = sortWeeks(Object.keys(scheduleForMonth));

//   const assignmentStatus = checkAssignments(schedule, expectedActivities);

//   const formatDateInFrench = (date) => format(date, 'do MMMM', { locale: fr });

//   const handleActivityClick = (week, doctor, day, slot, activity) => {
//     setEditing({ week, doctor, day, slot, activity });
//     setNewActivity(activity);
//   };

//   const handleActivityChange = (e) => {
//     setNewActivity(e.target.value);
//   };

//   const handleActivitySave = async () => {
//     if (editing) {
//       const { week, doctor, day, slot } = editing;
//       const updatedSchedule = { ...schedule };
//       const activities = updatedSchedule[year][month][week][doctor][day][slot];
//       const index = activities.indexOf(editing.activity);

//       if (index > -1) {
//         activities[index] = newActivity;
//         setSchedule(updatedSchedule);
//         setEditing(null);

//         const updatePath = `schedules/${year}/${month}/${week}/${doctor}/${day}/${slot}`;
//         const updateData = { [updatePath]: activities };

//         try {
//           await update(ref(realTimeDb), updateData);
//         } catch (error) {
//           console.error('Error updating activity:', error);
//         }
//       }
//     }
//   };
//   return (
//     <div className="calendar-container">
//       <h2>{year}</h2>
//       {weeks.map((week) => {
//         const weekNumber = parseInt(week.replace('Week', ''));
//         const dates = getDateOfISOWeek(weekNumber, year);

//         return (
//           <div key={week}>
//             <h3>
//               {week}: du {formatDateInFrench(dates[0])} au{' '}
//               {formatDateInFrench(dates[6])}
//             </h3>
//             <table className="calendar">
//               <thead>
//                 <tr>
//                   <th></th>
//                   {days.map((day, index) => (
//                     <th key={day} colSpan="2">
//                       {day} ({dates[index].toLocaleDateString()})
//                     </th>
//                   ))}
//                 </tr>
//                 <tr>
//                   <th></th>
//                   {days.map((day) => (
//                     <React.Fragment key={day}>
//                       <th className="AM_PM">AM</th>
//                       <th className="AM_PM">PM</th>
//                     </React.Fragment>
//                   ))}
//                 </tr>
//                 <tr>
//                   <td>Vacances</td>
//                   {days.map((day, index) => {
//                     const holidayDescription = getHolidayDescription(
//                       dates[index]
//                     ); // Get holiday description for each day
//                     return (
//                       <td key={'vacances-' + day} colSpan="2">
//                         <div
//                           className="vacances-description"
//                           style={{
//                             backgroundColor:
//                               holidayDescription === ''
//                                 ? 'white'
//                                 : 'rgb(237, 157, 224)', // White if no holiday, purple otherwise
//                             color:
//                               holidayDescription === '' ? 'black' : 'white', // Black text on white, white text on purple
//                             padding: '5px',
//                             borderRadius: '5px',
//                             textAlign: 'center',
//                           }}
//                         >
//                           {holidayDescription || ''}
//                         </div>
//                       </td>
//                     );
//                   })}
//                 </tr>
//                 <tr>
//                   <td>Astreinte</td>
//                   {days.map((day) => (
//                     <td key={'astreinte-' + day} colSpan="2">
//                       <div
//                         className="astreinte-doctor"
//                         onClick={() => setEditingAstreinte({ week, day })}
//                         style={{
//                           cursor: 'pointer',
//                           backgroundColor: astreinte[week]?.[day]
//                             ? '#e0f7fa'
//                             : 'transparent',
//                           padding: '5px',
//                           borderRadius: '5px',
//                           textAlign: 'center',
//                         }}
//                       >
//                         {editingAstreinte &&
//                         editingAstreinte.week === week &&
//                         editingAstreinte.day === day ? (
//                           <select
//                             className="astreinte-dropdown"
//                             value={astreinte[week]?.[day] || ''}
//                             onChange={(e) =>
//                               handleAstreinteChange(week, day, e)
//                             }
//                             onBlur={() => setEditingAstreinte(null)}
//                           >
//                             <option value="">Select a doctor</option>
//                             {Object.keys(scheduleForMonth[week]).map(
//                               (doctor) => (
//                                 <option key={doctor} value={doctor}>
//                                   {doctor}
//                                 </option>
//                               )
//                             )}
//                           </select>
//                         ) : (
//                           astreinte[week]?.[day] || 'No doctor selected'
//                         )}
//                       </div>
//                     </td>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.keys(scheduleForMonth[week]).map((doctor) => (
//                   <tr key={doctor}>
//                     <td>{doctor}</td>
//                     {days.map((day) => (
//                       <React.Fragment key={doctor + day}>
//                         {timeSlots.map((slot) => {
//                           const activities = scheduleForMonth[week]?.[doctor]?.[
//                             day
//                           ]?.[slot] || ['free'];
//                           return (
//                             <td
//                               key={doctor + day + slot}
//                               className="activities"
//                             >
//                               {activities.map((activity, idx) => (
//                                 <div
//                                   key={activity + idx}
//                                   className="activity"
//                                   style={{
//                                     backgroundColor:
//                                       activityColors[activity] || 'white',
//                                     backgroundImage: [
//                                       'Cs_Prison',

//                                       'AMI_Cs_U',
//                                     ].includes(activity)
//                                       ? `repeating-linear-gradient(
//               45deg,
//               rgba(0, 0, 0, 0.2),
//               rgba(0, 0, 0, 0.2) 10px,
//               transparent 10px,
//               transparent 20px
//             )`
//                                       : 'none',
//                                   }}
//                                   onClick={() =>
//                                     handleActivityClick(
//                                       week,
//                                       doctor,
//                                       day,
//                                       slot,
//                                       activity
//                                     )
//                                   }
//                                 >
//                                   {editing &&
//                                   editing.week === week &&
//                                   editing.doctor === doctor &&
//                                   editing.day === day &&
//                                   editing.slot === slot &&
//                                   editing.activity === activity ? (
//                                     <select
//                                       className="activity-dropdown"
//                                       value={newActivity}
//                                       onChange={handleActivityChange}
//                                       onBlur={handleActivitySave}
//                                       onClick={(e) => e.stopPropagation()}
//                                     >
//                                       <option value="Vacances">Vacances</option>
//                                       <option value="RTT">RTT</option>
//                                       <option value="FMC">FMC</option>
//                                       <option value="TP">TP</option>
//                                       <option value="HTC1">HTC1</option>
//                                       <option value="HTC2">HTC2</option>
//                                       <option value="Cs">Cs</option>
//                                       <option value="TeleCs">TeleCs</option>
//                                       <option value="EMIT">EMIT</option>
//                                       <option value="EMATIT">EMATIT</option>
//                                       <option value="HDJ">HDJ</option>
//                                       <option value="AMI">AMI</option>
//                                       <option value="MPO">MPO</option>
//                                       <option value="WE">WE</option>
//                                       <option value="free">Free</option>
//                                     </select>
//                                   ) : (
//                                     activity
//                                   )}
//                                 </div>
//                               ))}
//                             </td>
//                           );
//                         })}
//                       </React.Fragment>
//                     ))}
//                   </tr>
//                 ))}

//                 <tr>
//                   <td>Status</td>
//                   {days.map((day) => (
//                     <React.Fragment key={day}>
//                       {timeSlots.map((slot) => {
//                         const { missing, duplicateNotification, duplicates } =
//                           assignmentStatus[year][month][week][day][slot];
//                         return (
//                           <td key={day + slot} colSpan="1">
//                             {missing.length === 0 && !duplicateNotification ? (
//                               <span style={{ color: 'green' }}>✔</span>
//                             ) : (
//                               <span style={{ color: 'red' }}>
//                                 ✘{' '}
//                                 {missing.length > 0
//                                   ? `${missing.join(
//                                       ', '
//                                     )} doesn't have any assignee`
//                                   : ''}
//                                 {duplicateNotification
//                                   ? ` Duplicate activity: ${duplicates.join(
//                                       ', '
//                                     )}`
//                                   : ''}
//                               </span>
//                             )}
//                           </td>
//                         );
//                       })}
//                     </React.Fragment>
//                   ))}
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Calendar;

import React, { useState, useEffect, useContext } from 'react';
import './Calendar.css';
import { format } from 'date-fns';
import { getISOWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ref, update, get } from 'firebase/database';
import {
  useDocSchedule,
  activityColors,
} from './schedule';
import {
  executeCustomPlanningAlgorithm,
  generateCustomPlanningReport,
  rotation_cycles
} from './customPlanningLogic.js';
import { testCustomPlanningLogic, quickValidation } from './testCustomLogic.js';
import { realTimeDb } from './firebase';
import { publicHolidays } from './publicHolidays.js'; // Import the holidays JSON file
import { ScheduleContext } from './ScheduleContext';

console.log('Public Holidays Structure:', publicHolidays);

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const timeSlots = ['9am-1pm', '2pm-6pm'];

const getHolidayDescription = (date) => {
  const year = date.getFullYear();
  const weekNumber = getISOWeek(date); // ISO week number
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }); // English day name

  const weekData = publicHolidays[year]?.[`Week${weekNumber}`];

  const noHoliday = '';

  if (!weekData) {
    return noHoliday;
  }

  const holidayData = weekData[dayOfWeek];

  if (!holidayData) {
    return noHoliday;
  }

  const holiday = holidayData.event;

  return holiday ? holiday.description : noHoliday;
};

const getDateOfISOWeek = (week, year) => {
  // Find January 4th of the given year (always in week 1)
  const jan4 = new Date(year, 0, 4);
  
  // Find the Monday of week 1 (the week containing January 4th)
  const jan4Day = jan4.getDay();
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setDate(jan4.getDate() - (jan4Day === 0 ? 6 : jan4Day - 1));
  
  // Calculate the Monday of the requested week
  const ISOWeekStart = new Date(mondayOfWeek1);
  ISOWeekStart.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
  
  return Array.from(
    new Array(7), // Includes Saturday and Sunday
    (_, i) =>
      new Date(
        ISOWeekStart.getFullYear(),
        ISOWeekStart.getMonth(),
        ISOWeekStart.getDate() + i
      )
  );
};

const sortWeeks = (weeks) => {
  return weeks.sort((a, b) => {
    const weekNumberA = parseInt(a.replace('Week', ''));
    const weekNumberB = parseInt(b.replace('Week', ''));
    return weekNumberA - weekNumberB;
  });
};

const checkAssignments = (schedule, expectedActivities) => {
  const assignmentStatus = {};
  const duplicateActivities = ['EMIT', 'HDJ', 'AMI', 'HTC1', 'HTC2', 'EMATIT'];
  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  Object.keys(schedule).forEach((year) => {
    assignmentStatus[year] = {};
    Object.keys(schedule[year]).forEach((month) => {
      assignmentStatus[year][month] = {};
      Object.keys(schedule[year][month]).forEach((week) => {
        assignmentStatus[year][month][week] = {};
        daysOfWeek.forEach((day) => {
          assignmentStatus[year][month][week][day] = {};
          timeSlots.forEach((slot) => {
            assignmentStatus[year][month][week][day][slot] = {
              assigned: [],
              missing: [],
              duplicateNotification: false,
              duplicates: [],
            };
            Object.keys(schedule[year][month][week]).forEach((doctor) => {
              if (
                schedule[year][month][week][doctor][day] &&
                schedule[year][month][week][doctor][day][slot]
              ) {
                assignmentStatus[year][month][week][day][slot].assigned.push(
                  ...schedule[year][month][week][doctor][day][slot]
                );
              }
            });

            const assigned =
              assignmentStatus[year][month][week][day][slot].assigned;
            const expected = expectedActivities[day]?.[slot] || [];
            expected.forEach((activity) => {
              if (!assigned.includes(activity)) {
                assignmentStatus[year][month][week][day][slot].missing.push(
                  activity
                );
              }
            });

            const activityCounts = {};
            assigned.forEach((activity) => {
              if (duplicateActivities.includes(activity)) {
                if (!activityCounts[activity]) {
                  activityCounts[activity] = 0;
                }
                activityCounts[activity]++;
              }
            });

            const duplicates = Object.keys(activityCounts).filter(
              (activity) => activityCounts[activity] > 1
            );

            if (duplicates.length > 0) {
              assignmentStatus[year][month][week][day][
                slot
              ].duplicateNotification = true;
              assignmentStatus[year][month][week][day][slot].duplicates =
                duplicates;
            }
          });
        });
      });
    });
  });

  return assignmentStatus;
};

const Calendar = ({ year = 2024, month = 'Month1', selectedRotationCycle, setSelectedRotationCycle }) => {
  const { doc, loading } = useDocSchedule();
  const [schedule, setSchedule] = useState(null);
  const [editing, setEditing] = useState(null);
  const [newActivity, setNewActivity] = useState('');
  const [astreinte, setAstreinte] = useState({});
  const [editingAstreinte, setEditingAstreinte] = useState(null);

  // ✅ Use ScheduleContext for dynamic data instead of local execution
  const scheduleContext = useContext(ScheduleContext);
  const customScheduleData = scheduleContext?.customScheduleData || null;
  const recalculationTrigger = scheduleContext?.recalculationTrigger || 0;
  const expectedActivities = scheduleContext?.expectedActivities || {};
  const docActivities = scheduleContext?.docActivities || {};

  // Fallback to local state if props are not provided (for backward compatibility)
  const [localSelectedRotationCycle, setLocalSelectedRotationCycle] = useState(Object.keys(rotation_cycles)[0]);
  const currentSelectedRotationCycle = selectedRotationCycle || localSelectedRotationCycle;

  // Make test functions available in browser console for debugging
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.testCustomLogic = testCustomPlanningLogic;
      window.quickValidationCustomLogic = quickValidation;
      window.executeCustomPlanningAlgorithm = executeCustomPlanningAlgorithm;
      console.log('🔧 Debug functions available: testCustomLogic(), quickValidationCustomLogic(), executeCustomPlanningAlgorithm()');
    }
  }, []);

  const deepMerge = (target, source) => {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(source[key], deepMerge(target[key], source[key]));
      }
    }
    return { ...target, ...source };
  };

  // Adapter to convert custom planning logic format to calendar format
  const convertCustomToCalendarFormat = (customScheduleData) => {
    const calendarFormat = {
      2024: { Month1: {} },
      2025: { Month1: {} }
    };

    if (customScheduleData.success && customScheduleData.periodicSchedule) {
      console.log('Converting custom schedule data to calendar format...');

      // Map all 6 periods consecutively starting from Week44
      const periods = Object.keys(customScheduleData.periodicSchedule);
      console.log('Available periods:', periods);

      periods.slice(0, 6).forEach((periodName, index) => {
        const weekNumber = 44 + index; // Start from Week44 and assign consecutively
        const year = weekNumber > 52 ? 2025 : 2024;
        const adjustedWeekNumber = weekNumber > 52 ? weekNumber - 52 : weekNumber;
        const weekKey = `Week${adjustedWeekNumber}`;

        console.log(`Mapping ${periodName} → ${year} ${weekKey}`);

        if (customScheduleData.periodicSchedule[periodName].schedule) {
          if (year === 2024) {
            calendarFormat[2024].Month1[weekKey] = customScheduleData.periodicSchedule[periodName].schedule;
          } else {
            calendarFormat[2025].Month1[weekKey] = customScheduleData.periodicSchedule[periodName].schedule;
          }
        }
      });
    }

    return calendarFormat;
  };


  useEffect(() => {
    if (!loading && doc && customScheduleData) {
      console.log(`✅ Calendar: Using ScheduleContext data (trigger: ${recalculationTrigger})`);
      console.log(`🔄 Current cycle:`, currentSelectedRotationCycle);

      const originalSchedule = convertCustomToCalendarFormat(customScheduleData);
      console.log('📅 Calendar: Converted schedule from context', originalSchedule);

      const updatesRef = ref(realTimeDb, `schedules/`);
      get(updatesRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const updates = snapshot.val();
            const mergedSchedule = deepMerge(originalSchedule, updates);
            setSchedule(mergedSchedule);
          } else {
            setSchedule(originalSchedule);
          }
        })
        .catch((error) => {
          console.error('Error fetching updates:', error);
        });
    }
  }, [doc, loading, year, month, currentSelectedRotationCycle, customScheduleData, recalculationTrigger]);

  const handleAstreinteChange = (week, day, e) => {
    const updatedAstreinte = { ...astreinte };
    if (!updatedAstreinte[week]) updatedAstreinte[week] = {};
    updatedAstreinte[week][day] = e.target.value;
    setAstreinte(updatedAstreinte);

    const updatePath = `astreinte/${year}/${month}/${week}/${day}`;
    const updateData = { [updatePath]: e.target.value };
    update(ref(realTimeDb), updateData)
      .then(() => {
        setEditingAstreinte(null);
      })
      .catch((error) => {
        console.error('Error updating astreinte:', error);
      });
  };

  if (loading || !schedule) {
    return <div>Loading...</div>;
  }

  const scheduleForYear = schedule[year.toString()];
  if (!scheduleForYear) {
    return <div>No schedule available for the year {year}</div>;
  }

  const scheduleForMonth = scheduleForYear[month.toString()];
  if (!scheduleForMonth) {
    return <div>No schedule available for the month {month}</div>;
  }

  // Sort the weeks correctly before rendering them
  const weeks = sortWeeks(Object.keys(scheduleForMonth));

  const assignmentStatus = checkAssignments(schedule, expectedActivities);

  const formatDateInFrench = (date) => format(date, 'do MMMM', { locale: fr });

  const handleActivityClick = (week, doctor, day, slot, activity) => {
    setEditing({ week, doctor, day, slot, activity });
    setNewActivity(activity);
  };

  const handleActivityChange = (e) => {
    setNewActivity(e.target.value);
  };

  const handleActivitySave = async () => {
    if (editing) {
      const { week, doctor, day, slot } = editing;
      const updatedSchedule = { ...schedule };
      const activities = updatedSchedule[year][month][week][doctor][day][slot];
      const index = activities.indexOf(editing.activity);

      if (index > -1) {
        activities[index] = newActivity;
        setSchedule(updatedSchedule);
        setEditing(null);

        const updatePath = `schedules/${year}/${month}/${week}/${doctor}/${day}/${slot}`;
        const updateData = { [updatePath]: activities };

        try {
          await update(ref(realTimeDb), updateData);
        } catch (error) {
          console.error('Error updating activity:', error);
        }
      }
    }
  };

  return (
    <div className="calendar-container">
      {/* Custom Logic Controls */}
      <div className="system-controls" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>

        <button
          onClick={() => {
            console.log('🧪 Running Custom Logic Test...');
            quickValidation();
          }}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🧪 Test Custom Logic
        </button>

      </div>

      <h2>{year} - Custom Logic</h2>
      {weeks.map((week) => {
        const weekNumber = parseInt(week.replace('Week', ''));
        const dates = getDateOfISOWeek(weekNumber, year);

        return (
          <div key={week} id={`week-${weekNumber}`}>
            <h3>
              {week}: du {formatDateInFrench(dates[0])} au{' '}
              {formatDateInFrench(dates[6])}
            </h3>
            <table className="calendar">
              <thead>
                <tr>
                  <th></th>
                  {days.map((day, index) => (
                    <th key={day} colSpan="2">
                      {day} ({dates[index].toLocaleDateString()})
                    </th>
                  ))}
                </tr>
                <tr>
                  <th></th>
                  {days.map((day) => (
                    <React.Fragment key={day}>
                      <th className="AM_PM">AM</th>
                      <th className="AM_PM">PM</th>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <td>Vacances</td>
                  {days.map((day, index) => {
                    const holidayDescription = getHolidayDescription(
                      dates[index]
                    );
                    return (
                      <td key={'vacances-' + day} colSpan="2">
                        <div
                          className="vacances-description"
                          style={{
                            backgroundColor:
                              holidayDescription === ''
                                ? 'white'
                                : 'rgb(237, 157, 224)', // White if no holiday, purple otherwise
                            color:
                              holidayDescription === '' ? 'black' : 'white', // Black text on white, white text on purple
                            padding: '5px',
                            borderRadius: '5px',
                            textAlign: 'center',
                          }}
                        >
                          {holidayDescription || ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Astreinte</td>
                  {days.map((day) => (
                    <td key={'astreinte-' + day} colSpan="2">
                      <div
                        className="astreinte-doctor"
                        onClick={() => setEditingAstreinte({ week, day })}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: astreinte[week]?.[day]
                            ? '#e0f7fa'
                            : 'transparent',
                          padding: '5px',
                          borderRadius: '5px',
                          textAlign: 'center',
                        }}
                      >
                        {editingAstreinte &&
                        editingAstreinte.week === week &&
                        editingAstreinte.day === day ? (
                          <select
                            className="astreinte-dropdown"
                            value={astreinte[week]?.[day] || ''}
                            onChange={(e) =>
                              handleAstreinteChange(week, day, e)
                            }
                            onBlur={() => setEditingAstreinte(null)}
                          >
                            <option value="">Select a doctor</option>
                            {Object.keys(scheduleForMonth[week]).map(
                              (doctor) => (
                                <option key={doctor} value={doctor}>
                                  {doctor}
                                </option>
                              )
                            )}
                          </select>
                        ) : (
                          astreinte[week]?.[day] || 'No doctor selected'
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(scheduleForMonth[week]).map((doctor) => (
                  <tr key={doctor}>
                    <td>{doctor}</td>
                    {days.map((day) => (
                      <React.Fragment key={doctor + day}>
                        {timeSlots.map((slot) => {
                          const activities = scheduleForMonth[week]?.[doctor]?.[
                            day
                          ]?.[slot] || ['free'];

                          return (
                            <td
                              key={doctor + day + slot}
                              className="activities"
                            >
                              {activities.map((activity, idx) => {
                                const activityData =
                                  docActivities[activity] || {};
                                const duration = activityData.duration || 1; // Default duration is 1 if not found

                                return (
                                  <div
                                    key={activity + idx}
                                    className="activity"
                                    style={{
                                      backgroundColor:
                                        activityColors[activity] || 'white',
                                      height: `${duration * 25}px`, // Example: 25px height per hour duration
                                      backgroundImage: [
                                        'Cs_Prison',
                                        'AMI_Cs_U',
                                      ].includes(activity)
                                        ? `repeating-linear-gradient(
                                            45deg,
                                            rgba(0, 0, 0, 0.2),
                                            rgba(0, 0, 0, 0.2) 10px,
                                            transparent 10px,
                                            transparent 20px
                                          )`
                                        : 'none',
                                    }}
                                    onClick={() =>
                                      handleActivityClick(
                                        week,
                                        doctor,
                                        day,
                                        slot,
                                        activity
                                      )
                                    }
                                  >
                                    {editing &&
                                    editing.week === week &&
                                    editing.doctor === doctor &&
                                    editing.day === day &&
                                    editing.slot === slot &&
                                    editing.activity === activity ? (
                                      <select
                                        className="activity-dropdown"
                                        value={newActivity}
                                        onChange={handleActivityChange}
                                        onBlur={handleActivitySave}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <option value="Vacances">
                                          Vacances
                                        </option>
                                        <option value="RTT">RTT</option>
                                        <option value="FMC">FMC</option>
                                        <option value="TP">TP</option>
                                        <option value="HTC1">HTC1</option>
                                        <option value="HTC2">HTC2</option>
                                        <option value="Cs">Cs</option>
                                        <option value="TeleCs">TeleCs</option>
                                        <option value="EMIT">EMIT</option>
                                        <option value="EMATIT">EMATIT</option>
                                        <option value="HDJ">HDJ</option>
                                        <option value="AMI">AMI</option>
                                        <option value="MPO">MPO</option>
                                        <option value="WE">WE</option>
                                        <option value="free">Free</option>
                                        <option value="free">Chefferie</option>
                                      </select>
                                    ) : (
                                      activity
                                    )}
                                  </div>
                                );
                              })}
                            </td>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}

                <tr>
                  <td>Status</td>
                  {days.map((day) => (
                    <React.Fragment key={day}>
                      {timeSlots.map((slot) => {
                        const { missing, duplicateNotification, duplicates } =
                          assignmentStatus[year][month][week][day][slot];
                        return (
                          <td key={day + slot} colSpan="1">
                            {missing.length === 0 && !duplicateNotification ? (
                              <span style={{ color: 'green' }}>✔</span>
                            ) : (
                              <span style={{ color: 'red' }}>
                                ✘{' '}
                                {missing.length > 0
                                  ? `${missing.join(
                                      ', '
                                    )} doesn't have any assignee`
                                  : ''}
                                {duplicateNotification
                                  ? ` Duplicate activity: ${duplicates.join(
                                      ', '
                                    )}`
                                  : ''}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default Calendar;
