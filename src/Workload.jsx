// import React, { useEffect, useState, useContext } from 'react';
// import './Calendar.css';
// import { Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { ScheduleContext } from './ScheduleContext';
// import { docActivities as activities } from './doctorSchedules.js'; // Use the correct docActivities
// import { activityColors } from './schedule'; // Import the activityColors

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// // Predefined sorted activity order
// const activityOrder = [
//   'TP',
//   'HTC1',
//   'HTC1_visite',
//   'HTC2',
//   'HTC2_visite',
//   'MPO',
//   'Cs',
//   'Cs_Prison',
//   'TeleCs',
//   'HDJ',
//   'EMIT',
//   'EMATIT',
//   'AMI',
//   'AMI_Cs_U',
// ];

// const aggregateActivities = (combo) => {
//   const doctorActivities = {};

//   const processActivities = (activitiesList, doctor) => {
//     activitiesList.forEach((activity) => {
//       const activityData = activities[activity] || {};
//       // ✅ Use ?? to handle 0-duration activities correctly
//       const duration = activityData.duration ?? 1; // Default duration is 1 if not found
//
//       if (!doctorActivities[doctor]) {
//         doctorActivities[doctor] = {};
//       }
//       if (!doctorActivities[doctor][activity]) {
//         doctorActivities[doctor][activity] = 0;
//       }
//       doctorActivities[doctor][activity] += duration; // Accumulate duration for the activity
//     });
//   };

//   // Traverse the combo (schedule) and aggregate durations
//   Object.keys(combo).forEach((period) => {
//     const periodSchedule = combo[period];
//     Object.keys(periodSchedule).forEach((doctor) => {
//       const doctorSchedule = periodSchedule[doctor];
//       Object.keys(doctorSchedule).forEach((day) => {
//         const daySchedule = doctorSchedule[day];
//         Object.keys(daySchedule).forEach((slot) => {
//           const activitiesList = daySchedule[slot];
//           processActivities(activitiesList, doctor);
//         });
//       });
//     });
//   });

//   console.log('Aggregated Doctor Activities with Durations:', doctorActivities);
//   return doctorActivities;
// };

// const Workload = () => {
//   const { loading, currentCombo } = useContext(ScheduleContext);
//   const [doctorActivities, setDoctorActivities] = useState({});

//   useEffect(() => {
//     if (!loading && currentCombo) {
//       const activities = aggregateActivities(currentCombo);
//       setDoctorActivities(activities);
//     }
//   }, [loading, currentCombo]);

//   useEffect(() => {
//     console.log('Doctor Activities State:', doctorActivities);
//   }, [doctorActivities]);

//   // Generate chart data using the actual docActivities and sorting them
//   const chartData = () => {
//     if (Object.keys(doctorActivities).length === 0) return {};

//     const doctors = Object.keys(doctorActivities);

//     // Ensure the activities are ordered according to the predefined list
//     const activityLabels = activityOrder.filter((activity) =>
//       Object.keys(activities).includes(activity)
//     );

//     console.log('Doctors:', doctors);
//     console.log('Activity Labels:', activityLabels);

//     const datasets = activityLabels.map((activity) => ({
//       label: activity, // Label will be the activity name
//       data: doctors.map((doctor) => doctorActivities[doctor][activity] || 0),
//       backgroundColor: activityColors[activity] || 'rgba(75, 192, 192, 0.6)', // Use the color from activityColors
//     }));

//     console.log('Chart Datasets with Durations:', datasets);

//     return {
//       labels: doctors,
//       datasets: datasets,
//     };
//   };

//   const chartOptions = {
//     responsive: true,
//     scales: {
//       x: {
//         beginAtZero: true,
//         stacked: true,
//       },
//       y: {
//         stacked: true,
//       },
//     },
//     plugins: {
//       legend: {
//         display: true,
//       },
//       title: {
//         display: true,
//         text: 'Volume de travail médical (durée des tâches par poste et docteur)',
//       },
//     },
//   };

//   return (
//     <div className="chart-container">
//       <div className="chart-wrapper">
//         <h3>Volume de travail médical</h3>
//         {Object.keys(doctorActivities).length > 0 ? (
//           <Bar data={chartData()} options={chartOptions} />
//         ) : (
//           <p>Loading chart...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Workload;

import React, { useEffect, useState, useContext } from "react";
import "./Calendar.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { ScheduleContext } from "./ScheduleContext";
import { docActivities as activities } from "./doctorSchedules.js"; // Use the correct docActivities
import { activityColors } from "./schedule"; // Import the activityColors

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

// Predefined sorted activity order
const activityOrder = [
  "TP",
  "HTC1",
  "HTC1_visite",
  "HTC2",
  "HTC2_visite",
  "MPO",
  "Cs",
  "Cs_Prison",
  "TeleCs",
  "HDJ",
  "EMIT",
  "EMATIT",
  "AMI",
  "AMI_Cs_U",
  "Chefferie",
];

const aggregateActivities = (combo) => {
  const doctorActivities = {};

  const processActivities = (activitiesList, doctor) => {
    activitiesList.forEach((activity) => {
      const activityData = activities[activity] || {};
      // ✅ Use ?? to handle 0-duration activities correctly
      const duration = activityData.duration ?? 1; // Default duration is 1 if not found

      if (!doctorActivities[doctor]) {
        doctorActivities[doctor] = {};
      }
      if (!doctorActivities[doctor][activity]) {
        doctorActivities[doctor][activity] = 0;
      }
      doctorActivities[doctor][activity] += duration; // Accumulate duration for the activity
    });
  };

  // Traverse the combo (schedule) and aggregate durations
  Object.keys(combo).forEach((period) => {
    const periodSchedule = combo[period];
    Object.keys(periodSchedule).forEach((doctor) => {
      const doctorSchedule = periodSchedule[doctor];
      Object.keys(doctorSchedule).forEach((day) => {
        const daySchedule = doctorSchedule[day];
        Object.keys(daySchedule).forEach((slot) => {
          const activitiesList = daySchedule[slot];
          processActivities(activitiesList, doctor);
        });
      });
    });
  });

  console.log("Aggregated Doctor Activities with Durations:", doctorActivities);
  return doctorActivities;
};

// New function to aggregate activities from all periodic schedules
const aggregateActivitiesFromPeriodicData = (customScheduleData) => {
  const doctorActivities = {};

  const processActivities = (activitiesList, doctor, periodName, day, slot) => {
    activitiesList.forEach((activity) => {
      const activityData = activities[activity] || {};
      // ✅ Use ?? to handle 0-duration activities correctly
      const duration = activityData.duration ?? 1; // Default duration is 1 if not found

      if (!doctorActivities[doctor]) {
        doctorActivities[doctor] = {};
      }
      if (!doctorActivities[doctor][activity]) {
        doctorActivities[doctor][activity] = 0;
      }
      doctorActivities[doctor][activity] += duration; // Accumulate duration for the activity

      // Enhanced logging for HTC activities
      if (activity.includes("HTC")) {
        console.log(
          `    🎯 HTC Activity: ${doctor} gets ${duration}h of ${activity} in ${periodName} (${day} ${slot})`
        );
      }
    });
  };

  // Process all periodic schedules to get annual workload
  if (customScheduleData.periodicSchedule) {
    console.log("🔍 Processing periodic schedules for workload calculation...");
    const periodNames = Object.keys(customScheduleData.periodicSchedule);
    console.log(`📅 Found ${periodNames.length} periods:`, periodNames);

    periodNames.forEach((periodName) => {
      const periodData = customScheduleData.periodicSchedule[periodName];
      if (periodData.schedule) {
        const periodSchedule = periodData.schedule;
        const doctorsInPeriod = Object.keys(periodSchedule);
        console.log(
          `📋 ${periodName}: Processing ${doctorsInPeriod.length} doctors:`,
          doctorsInPeriod
        );

        // Traverse each doctor's schedule for this period
        doctorsInPeriod.forEach((doctor) => {
          const doctorSchedule = periodSchedule[doctor];
          Object.keys(doctorSchedule).forEach((day) => {
            const daySchedule = doctorSchedule[day];
            Object.keys(daySchedule).forEach((slot) => {
              const activitiesList = daySchedule[slot];
              if (Array.isArray(activitiesList)) {
                if (activitiesList.length > 0) {
                  console.log(
                    `  🩺 ${doctor} - ${day} ${slot}: [${activitiesList.join(
                      ", "
                    )}]`
                  );
                }
                processActivities(
                  activitiesList,
                  doctor,
                  periodName,
                  day,
                  slot
                );
              }
            });
          });
        });
      }
    });
  }

  // Note: Removed finalSchedule processing to avoid double counting
  // periodicSchedule already contains all the data we need for workload calculation

  console.log(
    "📊 Final Aggregated Doctor Activities from Periodic Data:",
    doctorActivities
  );

  // Enhanced logging and validation for HTC distribution
  console.log("\n🔍 HTC DISTRIBUTION ANALYSIS:");

  const htc1Doctors = ["FL", "CL", "NS"];
  const htc2Doctors = ["MG", "MDLC", "RNV"];

  console.log("\n📋 HTC1 Distribution:");
  let htc1TotalHours = 0;
  htc1Doctors.forEach((doctor) => {
    if (doctorActivities[doctor]) {
      const htc1Activities = Object.keys(doctorActivities[doctor]).filter(
        (activity) => activity === "HTC1" || activity === "HTC1_visite"
      );
      const htc1Hours = htc1Activities.reduce(
        (total, activity) => total + (doctorActivities[doctor][activity] || 0),
        0
      );
      htc1TotalHours += htc1Hours;
      console.log(
        `  🏥 ${doctor}: ${htc1Hours}h HTC1 total (${
          htc1Activities
            .map(
              (activity) => `${activity}:${doctorActivities[doctor][activity]}h`
            )
            .join(", ") || "None"
        })`
      );
    } else {
      console.log(`  ⚠️ ${doctor}: No activities found`);
    }
  });

  console.log("\n📋 HTC2 Distribution:");
  let htc2TotalHours = 0;
  htc2Doctors.forEach((doctor) => {
    if (doctorActivities[doctor]) {
      const htc2Activities = Object.keys(doctorActivities[doctor]).filter(
        (activity) => activity === "HTC2" || activity === "HTC2_visite"
      );
      const htc2Hours = htc2Activities.reduce(
        (total, activity) => total + (doctorActivities[doctor][activity] || 0),
        0
      );
      htc2TotalHours += htc2Hours;
      console.log(
        `  🏥 ${doctor}: ${htc2Hours}h HTC2 total (${
          htc2Activities
            .map(
              (activity) => `${activity}:${doctorActivities[doctor][activity]}h`
            )
            .join(", ") || "None"
        })`
      );
    } else {
      console.log(`  ⚠️ ${doctor}: No activities found`);
    }
  });

  // Distribution balance validation
  console.log("\n⚖️ BALANCE VALIDATION:");
  const htc1Average = htc1TotalHours / htc1Doctors.length;
  const htc2Average = htc2TotalHours / htc2Doctors.length;
  console.log(
    `  📊 HTC1 Average: ${htc1Average.toFixed(
      1
    )}h per doctor (Total: ${htc1TotalHours}h)`
  );
  console.log(
    `  📊 HTC2 Average: ${htc2Average.toFixed(
      1
    )}h per doctor (Total: ${htc2TotalHours}h)`
  );

  // Check for balance within each HTC group
  htc1Doctors.forEach((doctor) => {
    if (doctorActivities[doctor]) {
      const htc1Hours = ["HTC1", "HTC1_visite"].reduce(
        (total, activity) => total + (doctorActivities[doctor][activity] || 0),
        0
      );
      const deviation = Math.abs(htc1Hours - htc1Average);
      if (deviation > 2) {
        // More than 2 hours difference
        console.log(
          `  ⚠️ HTC1 IMBALANCE: ${doctor} has ${htc1Hours}h (${deviation.toFixed(
            1
          )}h from average)`
        );
      }
    }
  });

  htc2Doctors.forEach((doctor) => {
    if (doctorActivities[doctor]) {
      const htc2Hours = ["HTC2", "HTC2_visite"].reduce(
        (total, activity) => total + (doctorActivities[doctor][activity] || 0),
        0
      );
      const deviation = Math.abs(htc2Hours - htc2Average);
      if (deviation > 2) {
        // More than 2 hours difference
        console.log(
          `  ⚠️ HTC2 IMBALANCE: ${doctor} has ${htc2Hours}h (${deviation.toFixed(
            1
          )}h from average)`
        );
      }
    }
  });

  return doctorActivities;
};

// Calculate workload for a single period (exported for PeriodWorkloadChart)
export const calculatePeriodWorkload = (periodSchedule) => {
  const doctorActivities = {};

  const processActivities = (activitiesList, doctor) => {
    activitiesList.forEach((activity) => {
      const activityData = activities[activity] || {};
      const duration = activityData.duration ?? 1;

      if (!doctorActivities[doctor]) {
        doctorActivities[doctor] = {};
      }
      if (!doctorActivities[doctor][activity]) {
        doctorActivities[doctor][activity] = 0;
      }
      doctorActivities[doctor][activity] += duration;
    });
  };

  // Process single period schedule
  if (periodSchedule && periodSchedule.schedule) {
    const schedule = periodSchedule.schedule;
    Object.keys(schedule).forEach((doctor) => {
      const doctorSchedule = schedule[doctor];
      Object.keys(doctorSchedule).forEach((day) => {
        const daySchedule = doctorSchedule[day];
        Object.keys(daySchedule).forEach((slot) => {
          const activitiesList = daySchedule[slot];
          if (Array.isArray(activitiesList)) {
            processActivities(activitiesList, doctor);
          }
        });
      });
    });
  }

  return doctorActivities;
};

// Calculate workload for a specific week range (exported for configuration periods)
export const calculateWorkloadForWeekRange = (weeklySchedules, startWeek, endWeek, year) => {
  const doctorActivities = {};

  const processActivities = (activitiesList, doctor) => {
    activitiesList.forEach((activity) => {
      const activityData = activities[activity] || {};
      const duration = activityData.duration ?? 1;

      if (!doctorActivities[doctor]) {
        doctorActivities[doctor] = {};
      }
      if (!doctorActivities[doctor][activity]) {
        doctorActivities[doctor][activity] = 0;
      }
      doctorActivities[doctor][activity] += duration;
    });
  };

  // Process all weeks in the range
  if (weeklySchedules) {
    for (let week = startWeek; week <= endWeek; week++) {
      const weekKey = `${year}-W${String(week).padStart(2, '0')}`;
      const weekData = weeklySchedules[weekKey];

      if (weekData && weekData.schedule) {
        const schedule = weekData.schedule;
        Object.keys(schedule).forEach((doctor) => {
          const doctorSchedule = schedule[doctor];
          Object.keys(doctorSchedule).forEach((day) => {
            const daySchedule = doctorSchedule[day];
            Object.keys(daySchedule).forEach((slot) => {
              const activitiesList = daySchedule[slot];
              if (Array.isArray(activitiesList)) {
                processActivities(activitiesList, doctor);
              }
            });
          });
        });
      }
    }
  }

  return doctorActivities;
};

// Export activity order and colors for use in PeriodWorkloadChart
export { activityOrder };

// Legacy function for backward compatibility
const aggregateActivitiesFromCustomData = (customSchedule) => {
  const doctorActivities = {};

  const processActivities = (activitiesList, doctor) => {
    activitiesList.forEach((activity) => {
      const activityData = activities[activity] || {};
      // ✅ Use ?? to handle 0-duration activities correctly
      const duration = activityData.duration ?? 1; // Default duration is 1 if not found

      if (!doctorActivities[doctor]) {
        doctorActivities[doctor] = {};
      }
      if (!doctorActivities[doctor][activity]) {
        doctorActivities[doctor][activity] = 0;
      }
      doctorActivities[doctor][activity] += duration; // Accumulate duration for the activity
    });
  };

  // Traverse the custom schedule data structure
  // customSchedule format: { doctor: { day: { slot: [activities] } } }
  Object.keys(customSchedule).forEach((doctor) => {
    const doctorSchedule = customSchedule[doctor];
    Object.keys(doctorSchedule).forEach((day) => {
      const daySchedule = doctorSchedule[day];
      Object.keys(daySchedule).forEach((slot) => {
        const activitiesList = daySchedule[slot];
        if (Array.isArray(activitiesList)) {
          processActivities(activitiesList, doctor);
        }
      });
    });
  });

  console.log(
    "Aggregated Doctor Activities from Custom Data:",
    doctorActivities
  );
  return doctorActivities;
};

const Workload = () => {
  const { loading, customScheduleData, selectedRotationCycle } =
    useContext(ScheduleContext);
  const [doctorActivities, setDoctorActivities] = useState({});

  useEffect(() => {
    if (!loading && customScheduleData && customScheduleData.success) {
      console.log(
        `📊 Workload: Processing data for rotation cycle: ${selectedRotationCycle}`
      );
      // Use all periodic schedules for comprehensive annual workload calculation
      const activities =
        aggregateActivitiesFromPeriodicData(customScheduleData);
      setDoctorActivities(activities);
    }
  }, [loading, customScheduleData, selectedRotationCycle]);

  useEffect(() => {
    console.log("Doctor Activities State:", doctorActivities);
  }, [doctorActivities]);

  // Generate chart data using the actual docActivities and sorting them
  const chartData = () => {
    if (Object.keys(doctorActivities).length === 0) return {};

    const doctors = Object.keys(doctorActivities);

    // Ensure the activities are ordered according to the predefined list
    const activityLabels = activityOrder.filter((activity) =>
      Object.keys(activities).includes(activity)
    );

    console.log("Doctors:", doctors);
    console.log("Activity Labels:", activityLabels);

    const datasets = activityLabels.map((activity) => ({
      // Label will show the activity name and its duration
      label: `${activities[activity].name} (${activities[activity].duration}h)`,
      data: doctors.map((doctor) => doctorActivities[doctor][activity] || 0),
      backgroundColor: activityColors[activity] || "rgba(75, 192, 192, 0.6)", // Use the color from activityColors
    }));

    console.log("Chart Datasets with Durations:", datasets);

    return {
      labels: doctors,
      datasets: datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: `Volume de travail médical (${
          selectedRotationCycle || "honeymoon_NS_noHDJ"
        })`,
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: 'auto', padding: '20px' }}>
      <div className="chart-wrapper" style={{ height: '600px' }}>
        <h3>Volume de travail médical sur 1 cycle</h3>
        {Object.keys(doctorActivities).length > 0 ? (
          <Bar data={chartData()} options={chartOptions} />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default Workload;
