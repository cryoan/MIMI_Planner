// import React, { useState } from 'react';
// import './DoctorSchedule.css'; // Import the CSS file
// import { doc, docChunks } from './doctorSchedules.js'; // Importing both doc and docChunks
// import { activityColors } from './schedule';

// const DaySchedule = ({ day, schedule }) => {
//   if (!schedule) return <div className="no-schedule">No schedule</div>;

//   const amSchedule = schedule['9am-1pm'] || [];
//   const pmSchedule = schedule['2pm-6pm'] || [];

//   return (
//     <div className="day-schedule">
//       <div className="am-pm-container-horizontal">
//         <div className="am-schedule">
//           {amSchedule.length > 0 ? (
//             amSchedule.map((activity, index) => (
//               <div
//                 key={index}
//                 className="activity-block"
//                 style={{
//                   backgroundColor: activityColors[activity] || '#ccc',
//                   backgroundImage: ['Cs_Prison', 'AMI_Cs_U'].includes(activity)
//                     ? `repeating-linear-gradient(
//                         45deg,
//                         rgba(0, 0, 0, 0.2),
//                         rgba(0, 0, 0, 0.2) 10px,
//                         transparent 10px,
//                         transparent 20px
//                       )`
//                     : 'none',
//                 }}
//               >
//                 {activity}
//               </div>
//             ))
//           ) : (
//             <div className="no-schedule">No schedule</div>
//           )}
//         </div>
//         <div className="pm-schedule">
//           {pmSchedule.length > 0 ? (
//             pmSchedule.map((activity, index) => (
//               <div
//                 key={index}
//                 className="activity-block"
//                 style={{
//                   backgroundColor: activityColors[activity] || '#ccc',
//                   backgroundImage: ['Cs_Prison', 'AMI_Cs_U'].includes(activity)
//                     ? `repeating-linear-gradient(
//                         45deg,
//                         rgba(0, 0, 0, 0.2),
//                         rgba(0, 0, 0, 0.2) 10px,
//                         transparent 10px,
//                         transparent 20px
//                       )`
//                     : 'none',
//                 }}
//               >
//                 {activity}
//               </div>
//             ))
//           ) : (
//             <div className="no-schedule">No schedule</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const DoctorSchedule = ({ scheduleName, schedule, scheduleCount }) => {
//   return (
//     <div className="doctor-schedule-row">
//       <div className="doctor-name">
//         <h2>
//           {scheduleName} ({scheduleCount})
//         </h2>
//       </div>

//       {/* Header for the days of the week */}
//       <div className="header-row">
//         {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
//           <div key={day} className="day-header">
//             <div>{day}</div>
//             <div className="am-pm-header">
//               <div>AM</div>
//               <div>PM</div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="week-section">
//         <div className="schedule-columns">
//           {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(
//             (day) => (
//               <div key={day} className="day-column">
//                 <DaySchedule day={day} schedule={schedule[day]} />
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export const DocAgendaSetting = () => {
//   const [showAgenda, setShowAgenda] = useState(false);

//   // Assign unique IDs to docChunks using a WeakMap
//   const docChunkMap = new WeakMap();
//   Object.keys(docChunks).forEach((key) => {
//     docChunkMap.set(docChunks[key], key);
//   });

//   // Function to determine the number of weeks represented by a key
//   const getWeeksForKey = (key) => {
//     if (key.startsWith('M')) {
//       return 4; // Each month has 4 weeks
//     } else if (key.startsWith('S')) {
//       if (key.includes('_')) {
//         // e.g., 'S1_S2', 'S3_S4'
//         const weekParts = key.split('_');
//         let weeks = 0;
//         weekParts.forEach((part) => {
//           if (part.startsWith('S')) {
//             weeks += 1;
//           }
//         });
//         return weeks;
//       } else {
//         // e.g., 'S1'
//         return 1;
//       }
//     } else {
//       // Other keys, assume 1 week
//       return 1;
//     }
//   };

//   const calculateScheduleOccurrences = () => {
//     const docChunkStats = {};

//     Object.keys(doc).forEach((doctorName) => {
//       const doctorSchedule = doc[doctorName];

//       // Total weeks for the doctor
//       const months = Object.keys(doctorSchedule).filter((key) =>
//         key.startsWith('M')
//       ).length;
//       const totalWeeks = months * 4;

//       // Recursive function to traverse the schedule
//       const traverseSchedule = (subDoc, parentWeeks) => {
//         if (subDoc && typeof subDoc === 'object') {
//           // Check if subDoc is a docChunk
//           const scheduleName = docChunkMap.get(subDoc);
//           if (scheduleName) {
//             // It's a docChunk, add parentWeeks to its count
//             if (!docChunkStats[scheduleName]) {
//               docChunkStats[scheduleName] = {
//                 totalWeeks: 0,
//                 totalDoctorsWeeks: 0,
//                 doctors: new Set(),
//               };
//             }
//             docChunkStats[scheduleName].totalWeeks += parentWeeks;

//             // Only add totalWeeks for this doctor once per docChunk
//             if (!docChunkStats[scheduleName].doctors.has(doctorName)) {
//               docChunkStats[scheduleName].totalDoctorsWeeks += totalWeeks;
//               docChunkStats[scheduleName].doctors.add(doctorName);
//             }
//           } else {
//             // Not a docChunk, need to traverse its children
//             Object.keys(subDoc).forEach((key) => {
//               const value = subDoc[key];
//               const weeks = getWeeksForKey(key);
//               traverseSchedule(value, weeks);
//             });
//           }
//         }
//       };

//       // Traverse the doctor's schedule
//       Object.keys(doctorSchedule).forEach((key) => {
//         const value = doctorSchedule[key];
//         const weeks = getWeeksForKey(key);
//         traverseSchedule(value, weeks);
//       });
//     });

//     // Format the final output
//     const formattedDocChunkStats = {};
//     Object.keys(docChunkStats).forEach((scheduleName) => {
//       const { totalWeeks, totalDoctorsWeeks } = docChunkStats[scheduleName];
//       const percentage = ((totalWeeks / totalDoctorsWeeks) * 100).toFixed(2);
//       formattedDocChunkStats[
//         scheduleName
//       ] = `${totalWeeks}/${totalDoctorsWeeks} weeks = ${percentage}%`;
//     });

//     return formattedDocChunkStats;
//   };

//   const scheduleOccurrences = calculateScheduleOccurrences();

//   const toggleAgenda = () => {
//     setShowAgenda(!showAgenda);
//   };

//   return (
//     <div>
//       <button onClick={toggleAgenda}>
//         {showAgenda ? 'Hide Agenda' : 'Show Agenda'}
//       </button>

//       {showAgenda && (
//         <div className="agenda-container">
//           {Object.keys(docChunks).map((scheduleName) => {
//             const scheduleCount =
//               scheduleOccurrences[scheduleName] || '0/0 weeks = 0%';
//             const schedule = docChunks[scheduleName];

//             return (
//               <DoctorSchedule
//                 key={scheduleName}
//                 scheduleName={scheduleName}
//                 schedule={schedule}
//                 scheduleCount={scheduleCount}
//               />
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocAgendaSetting;

import React, { useState } from 'react';
import './DoctorSchedule.css'; // Import the CSS file
import { doc, docChunks } from './doctorSchedules.js'; // Importing both doc and docChunks
import { activityColors } from './schedule';
// import { activities } from './activities'; // Import the activities dictionary for durations
import { docActivities } from './doctorSchedules.js'; // Import activities for durations
import ETAWorkloadInfographic from './ETAWorkloadInfographic.jsx'; // Import the infographic component

const DaySchedule = ({ day, schedule }) => {
  if (!schedule) return <div className="no-schedule">No schedule</div>;

  const amSchedule = schedule['9am-1pm'] || [];
  const pmSchedule = schedule['2pm-6pm'] || [];

  return (
    <div className="day-schedule">
      <div className="am-pm-container-horizontal">
        <div className="am-schedule">
          {amSchedule.length > 0 ? (
            amSchedule.map((activity, index) => {
              const activityData = docActivities[activity] || {};
              const duration = activityData.duration || 1; // Default duration is 1 if not found

              return (
                <div
                  key={index}
                  className="activity-block"
                  style={{
                    backgroundColor: activityColors[activity] || '#ccc',
                    height: `${duration * 25}px`, // Example: 25px height per hour duration
                    backgroundImage: ['Cs_Prison', 'AMI_Cs_U'].includes(
                      activity
                    )
                      ? `repeating-linear-gradient(
                          45deg,
                          rgba(0, 0, 0, 0.2),
                          rgba(0, 0, 0, 0.2) 10px,
                          transparent 10px,
                          transparent 20px
                        )`
                      : 'none',
                  }}
                >
                  {activity}
                </div>
              );
            })
          ) : (
            <div className="no-schedule">No schedule</div>
          )}
        </div>
        <div className="pm-schedule">
          {pmSchedule.length > 0 ? (
            pmSchedule.map((activity, index) => {
              const activityData = docActivities[activity] || {};
              const duration = activityData.duration || 1; // Default duration is 1 if not found

              return (
                <div
                  key={index}
                  className="activity-block"
                  style={{
                    backgroundColor: activityColors[activity] || '#ccc',
                    height: `${duration * 25}px`, // Example: 25px height per hour duration
                    backgroundImage: ['Cs_Prison', 'AMI_Cs_U'].includes(
                      activity
                    )
                      ? `repeating-linear-gradient(
                          45deg,
                          rgba(0, 0, 0, 0.2),
                          rgba(0, 0, 0, 0.2) 10px,
                          transparent 10px,
                          transparent 20px
                        )`
                      : 'none',
                  }}
                >
                  {activity}
                </div>
              );
            })
          ) : (
            <div className="no-schedule">No schedule</div>
          )}
        </div>
      </div>
    </div>
  );
};

const DoctorSchedule = ({ scheduleName, schedule, scheduleCount }) => {
  return (
    <div className="doctor-schedule-row">
      <div className="doctor-name">
        <h2>
          {scheduleName} ({scheduleCount})
        </h2>
      </div>

      {/* Header for the days of the week */}
      <div className="header-row">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
          <div key={day} className="day-header">
            <div>{day}</div>
            <div className="am-pm-header">
              <div>AM</div>
              <div>PM</div>
            </div>
          </div>
        ))}
      </div>

      <div className="week-section">
        <div className="schedule-columns">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(
            (day) => (
              <div key={day} className="day-column">
                <DaySchedule day={day} schedule={schedule[day]} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export const DocAgendaSetting = () => {
  const [showAgenda, setShowAgenda] = useState(false);

  // Assign unique IDs to docChunks using a WeakMap
  const docChunkMap = new WeakMap();
  Object.keys(docChunks).forEach((key) => {
    docChunkMap.set(docChunks[key], key);
  });

  // Function to determine the number of weeks represented by a key
  const getWeeksForKey = (key) => {
    if (key.startsWith('M')) {
      return 4; // Each month has 4 weeks
    } else if (key.startsWith('S')) {
      if (key.includes('_')) {
        // e.g., 'S1_S2', 'S3_S4'
        const weekParts = key.split('_');
        let weeks = 0;
        weekParts.forEach((part) => {
          if (part.startsWith('S')) {
            weeks += 1;
          }
        });
        return weeks;
      } else {
        // e.g., 'S1'
        return 1;
      }
    } else {
      // Other keys, assume 1 week
      return 1;
    }
  };

  const calculateScheduleOccurrences = () => {
    const docChunkStats = {};

    Object.keys(doc).forEach((doctorName) => {
      const doctorSchedule = doc[doctorName];

      // Total weeks for the doctor
      const months = Object.keys(doctorSchedule).filter((key) =>
        key.startsWith('M')
      ).length;
      const totalWeeks = months * 4;

      // Recursive function to traverse the schedule
      const traverseSchedule = (subDoc, parentWeeks) => {
        if (subDoc && typeof subDoc === 'object') {
          // Check if subDoc is a docChunk
          const scheduleName = docChunkMap.get(subDoc);
          if (scheduleName) {
            // It's a docChunk, add parentWeeks to its count
            if (!docChunkStats[scheduleName]) {
              docChunkStats[scheduleName] = {
                totalWeeks: 0,
                totalDoctorsWeeks: 0,
                doctors: new Set(),
              };
            }
            docChunkStats[scheduleName].totalWeeks += parentWeeks;

            // Only add totalWeeks for this doctor once per docChunk
            if (!docChunkStats[scheduleName].doctors.has(doctorName)) {
              docChunkStats[scheduleName].totalDoctorsWeeks += totalWeeks;
              docChunkStats[scheduleName].doctors.add(doctorName);
            }
          } else {
            // Not a docChunk, need to traverse its children
            Object.keys(subDoc).forEach((key) => {
              const value = subDoc[key];
              const weeks = getWeeksForKey(key);
              traverseSchedule(value, weeks);
            });
          }
        }
      };

      // Traverse the doctor's schedule
      Object.keys(doctorSchedule).forEach((key) => {
        const value = doctorSchedule[key];
        const weeks = getWeeksForKey(key);
        traverseSchedule(value, weeks);
      });
    });

    // Format the final output
    const formattedDocChunkStats = {};
    Object.keys(docChunkStats).forEach((scheduleName) => {
      const { totalWeeks, totalDoctorsWeeks } = docChunkStats[scheduleName];
      const percentage = ((totalWeeks / totalDoctorsWeeks) * 100).toFixed(2);
      formattedDocChunkStats[
        scheduleName
      ] = `${totalWeeks}/${totalDoctorsWeeks} weeks = ${percentage}%`;
    });

    return formattedDocChunkStats;
  };

  const scheduleOccurrences = calculateScheduleOccurrences();

  const toggleAgenda = () => {
    setShowAgenda(!showAgenda);
  };

  return (
    <div>
      {/* ETA Workload Infographic - Always Visible */}
      <ETAWorkloadInfographic />

      <button onClick={toggleAgenda}>
        {showAgenda ? 'Hide Agenda' : 'Show Agenda'}
      </button>

      {showAgenda && (
        <div className="agenda-container">
          {Object.keys(docChunks).map((scheduleName) => {
            const scheduleCount =
              scheduleOccurrences[scheduleName] || '0/0 weeks = 0%';
            const schedule = docChunks[scheduleName];

            return (
              <DoctorSchedule
                key={scheduleName}
                scheduleName={scheduleName}
                schedule={schedule}
                scheduleCount={scheduleCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocAgendaSetting;
