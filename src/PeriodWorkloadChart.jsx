import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { activityOrder } from "./Workload";
import { docActivities as activities } from "./doctorSchedules.js";
import { activityColors } from "./schedule";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PeriodWorkloadChart = ({ doctorActivities, periodName }) => {
  // doctorActivities is now passed as a prop (pre-calculated)

  // Generate chart data
  const chartData = useMemo(() => {
    if (!doctorActivities || Object.keys(doctorActivities).length === 0) return {};

    const doctors = Object.keys(doctorActivities);

    // Filter activities that exist in the period
    const activityLabels = activityOrder.filter((activity) =>
      Object.keys(activities).includes(activity)
    );

    const datasets = activityLabels.map((activity) => ({
      label: `${activities[activity].name} (${activities[activity].duration}h)`,
      data: doctors.map((doctor) => doctorActivities[doctor][activity] || 0),
      backgroundColor: activityColors[activity] || "rgba(75, 192, 192, 0.6)",
    }));

    return {
      labels: doctors,
      datasets: datasets,
    };
  }, [doctorActivities]);

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
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: {
            size: 10,
          },
        },
      },
      title: {
        display: true,
        text: `Volume de travail médical - ${periodName}`,
        font: {
          size: 14,
        },
      },
    },
  };

  if (!doctorActivities || Object.keys(doctorActivities).length === 0) {
    return null; // Don't render if no data
  }

  return (
    <div className="period-workload-chart-container">
      <div className="period-workload-chart-wrapper">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PeriodWorkloadChart;
