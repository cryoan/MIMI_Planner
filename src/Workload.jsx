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
//       const duration = activityData.duration || 1; // Default duration is 1 if not found

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

import React, { useEffect, useState, useContext } from 'react';
import './Calendar.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ScheduleContext } from './ScheduleContext';
import { docActivities as activities } from './doctorSchedules.js'; // Use the correct docActivities
import { activityColors } from './schedule'; // Import the activityColors

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Predefined sorted activity order
const activityOrder = [
  'TP',
  'HTC1',
  'HTC1_visite',
  'HTC2',
  'HTC2_visite',
  'MPO',
  'Cs',
  'Cs_Prison',
  'TeleCs',
  'HDJ',
  'EMIT',
  'EMATIT',
  'AMI',
  'AMI_Cs_U',
  'Chefferie'
];

const aggregateActivities = (combo) => {
  const doctorActivities = {};

  const processActivities = (activitiesList, doctor) => {
    activitiesList.forEach((activity) => {
      const activityData = activities[activity] || {};
      const duration = activityData.duration || 1; // Default duration is 1 if not found

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

  console.log('Aggregated Doctor Activities with Durations:', doctorActivities);
  return doctorActivities;
};

const Workload = () => {
  const { loading, currentCombo } = useContext(ScheduleContext);
  const [doctorActivities, setDoctorActivities] = useState({});

  useEffect(() => {
    if (!loading && currentCombo) {
      const activities = aggregateActivities(currentCombo);
      setDoctorActivities(activities);
    }
  }, [loading, currentCombo]);

  useEffect(() => {
    console.log('Doctor Activities State:', doctorActivities);
  }, [doctorActivities]);

  // Generate chart data using the actual docActivities and sorting them
  const chartData = () => {
    if (Object.keys(doctorActivities).length === 0) return {};

    const doctors = Object.keys(doctorActivities);

    // Ensure the activities are ordered according to the predefined list
    const activityLabels = activityOrder.filter((activity) =>
      Object.keys(activities).includes(activity)
    );

    console.log('Doctors:', doctors);
    console.log('Activity Labels:', activityLabels);

    const datasets = activityLabels.map((activity) => ({
      // Label will show the activity name and its duration
      label: `${activities[activity].name} (${activities[activity].duration}h)`,
      data: doctors.map((doctor) => doctorActivities[doctor][activity] || 0),
      backgroundColor: activityColors[activity] || 'rgba(75, 192, 192, 0.6)', // Use the color from activityColors
    }));

    console.log('Chart Datasets with Durations:', datasets);

    return {
      labels: doctors,
      datasets: datasets,
    };
  };

  const chartOptions = {
    responsive: true,
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
        text: 'Volume de travail médical (durée des tâches par poste et docteur)',
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <h3>Volume de travail médical</h3>
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
