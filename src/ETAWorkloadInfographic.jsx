import React from 'react';
import { doctorProfiles, rotationTemplates, docActivities } from './doctorSchedules.js';
import { activityColors } from './schedule.jsx';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ETAWorkloadInfographic = () => {
  // Helper function to get activity duration in hours
  const getActivityHours = (activity) => {
    if (activity === 'Available') return 0;
    return docActivities[activity]?.duration || 4; // Default to 4 hours if not found
  };

  // Calculate TeleCs weekly needs from doctorProfiles
  const calculateTeleCsNeeds = () => {
    let totalTeleCsHours = 0;
    const teleCsPerDoctor = {};
    
    Object.entries(doctorProfiles).forEach(([doctorCode, doctor]) => {
      if (doctor.weeklyNeeds?.TeleCs) {
        const weeklyHours = doctor.weeklyNeeds.TeleCs.count * docActivities.TeleCs.duration;
        teleCsPerDoctor[doctorCode] = weeklyHours;
        totalTeleCsHours += weeklyHours;
      }
    });
    
    return { totalTeleCsHours, teleCsPerDoctor };
  };

  // Calculate total activity distribution: backbone + HTC templates + TeleCs needs
  const calculateWorkloadDistribution = () => {
    const activityCounts = {};
    const activityHours = {};
    const doctors = Object.keys(doctorProfiles);
    const totalDoctors = doctors.length;
    const totalHalfDays = totalDoctors * 10; // Each doctor has 10 half-days per week
    const totalHours = totalDoctors * 40; // Each doctor has 40 hours per week (10 * 4 hours)

    // Calculate TeleCs needs
    const { totalTeleCsHours, teleCsPerDoctor } = calculateTeleCsNeeds();

    // Count all backbone activities across all doctors
    doctors.forEach(doctorCode => {
      const doctor = doctorProfiles[doctorCode];
      if (doctor.backbone) {
        Object.values(doctor.backbone).forEach(daySchedule => {
          Object.values(daySchedule).forEach(timeSlotActivities => {
            timeSlotActivities.forEach(activity => {
              activityCounts[activity] = (activityCounts[activity] || 0) + 1;
              const hours = getActivityHours(activity);
              activityHours[activity] = (activityHours[activity] || 0) + hours;
            });
          });
        });
      }
    });

    // Add HTC1 and HTC2 template activities
    // HTC1 Template: 1 instance (10 total slots)
    if (rotationTemplates.HTC1) {
      Object.values(rotationTemplates.HTC1).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 1 instance of HTC1 template
            activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + hours;
          });
        });
      });
    }

    // HTC2 Template: 1 instance (10 total slots)  
    if (rotationTemplates.HTC2) {
      Object.values(rotationTemplates.HTC2).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 1 instance of HTC2 template
            activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + hours;
          });
        });
      });
    }

    // HDJ Template: 1 instance (6 active slots - Tue/Thu/Fri)
    if (rotationTemplates.HDJ) {
      Object.values(rotationTemplates.HDJ).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 1 instance of HDJ template
            activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + hours;
          });
        });
      });
    }

    // EMIT Template: 1 instance (10 total slots)
    if (rotationTemplates.EMIT) {
      Object.values(rotationTemplates.EMIT).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 1 instance of EMIT template
            activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + hours;
          });
        });
      });
    }

    // EMATIT Template: 1 instance (10 total slots)
    if (rotationTemplates.EMATIT) {
      Object.values(rotationTemplates.EMATIT).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 1 instance of EMATIT template
            activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + hours;
          });
        });
      });
    }

    // AMI Template: 1 instance (10 total slots)
    if (rotationTemplates.AMI) {
      Object.values(rotationTemplates.AMI).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 1 instance of AMI template
            activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + hours;
          });
        });
      });
    }

    // Add TeleCs from weekly needs
    if (totalTeleCsHours > 0) {
      const teleCsSessions = totalTeleCsHours / docActivities.TeleCs.duration;
      activityCounts['TeleCs'] = (activityCounts['TeleCs'] || 0) + teleCsSessions;
      activityHours['TeleCs'] = (activityHours['TeleCs'] || 0) + totalTeleCsHours;
    }

    // Create slot-based array for backwards compatibility with existing statistics
    const activityArray = [];
    Object.entries(activityCounts).forEach(([activity, count]) => {
      for (let i = 0; i < count; i++) {
        activityArray.push(activity);
      }
    });

    // Fill remaining slots with "Available" for slot-based statistics
    const remainingSlots = totalHalfDays - activityArray.length;
    for (let i = 0; i < remainingSlots; i++) {
      activityArray.push('Available');
    }

    // Calculate total used hours
    const totalUsedHours = Object.values(activityHours).reduce((sum, hours) => sum + hours, 0);
    const remainingHours = totalHours - totalUsedHours;

    return { 
      activityArray, 
      totalDoctors, 
      totalHalfDays, 
      totalHours,
      activityCounts, 
      activityHours,
      totalUsedHours,
      remainingHours,
      totalTeleCsHours,
      teleCsPerDoctor
    };
  };

  const { 
    activityArray, 
    totalDoctors, 
    totalHalfDays, 
    totalHours,
    activityCounts, 
    activityHours,
    totalUsedHours,
    remainingHours,
    totalTeleCsHours,
    teleCsPerDoctor
  } = calculateWorkloadDistribution();

  // State for sortable legend and drag operations
  const [activityOrder, setActivityOrder] = React.useState(() => {
    // Initialize with default order (by activity count descending, excluding Available)
    return Object.entries(activityCounts)
      .filter(([activity]) => activity !== 'Available')
      .sort(([,a], [,b]) => b - a)
      .map(([activity]) => activity);
  });
  
  const [dragState, setDragState] = React.useState({
    draggedItem: null,
    draggedOverItem: null
  });

  // Create hourArray based on custom activity order
  const createCustomHourArray = () => {
    const hourArray = [];
    
    // Add each activity based on custom order and hour duration
    activityOrder.forEach(activity => {
      const totalHours = activityHours[activity] || 0;
      for (let i = 0; i < totalHours; i++) {
        hourArray.push(activity);
      }
    });

    // Fill remaining hours with "Available" 
    for (let i = 0; i < remainingHours; i++) {
      hourArray.push('Available');
    }

    return hourArray;
  };

  const hourArray = createCustomHourArray();

  // Get color for activity
  const getActivityColor = (activity) => {
    if (activity === 'Available') {
      return '#f5f5f5'; // Light gray for available slots
    }
    return activityColors[activity] || '#ddd';
  };

  // Function to group activities by their color and calculate pie chart data
  const generatePieChartData = () => {
    const colorGroups = {};
    const colorLabels = {};
    
    // Group activities by their exact color
    Object.entries(activityHours).forEach(([activity, hours]) => {
      if (activity !== 'Available' && hours > 0) {
        const color = getActivityColor(activity);
        
        if (!colorGroups[color]) {
          colorGroups[color] = 0;
          colorLabels[color] = [];
        }
        
        colorGroups[color] += hours;
        colorLabels[color].push(activity);
      }
    });

    // Convert to arrays for Chart.js
    const colors = Object.keys(colorGroups);
    const data = colors.map(color => colorGroups[color]);
    const labels = colors.map(color => {
      const activities = colorLabels[color];
      if (activities.length === 1) {
        return activities[0];
      } else {
        // Group label with count
        return `${activities.join(', ')} (${activities.length})`;
      }
    });

    // Calculate percentages
    const totalHours = Object.values(colorGroups).reduce((sum, hours) => sum + hours, 0);
    const percentages = data.map(hours => ((hours / totalHours) * 100).toFixed(1));

    return {
      labels: labels.map((label, index) => `${label} (${percentages[index]}%)`),
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color),
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    };
  };

  const pieChartData = generatePieChartData();

  // Drag and drop handlers
  const handleDragStart = (e, activity) => {
    setDragState({ ...dragState, draggedItem: activity });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', activity);
  };

  const handleDragOver = (e, activity) => {
    e.preventDefault();
    if (dragState.draggedItem !== activity) {
      setDragState({ ...dragState, draggedOverItem: activity });
    }
  };

  const handleDragLeave = () => {
    setDragState({ ...dragState, draggedOverItem: null });
  };

  const handleDrop = (e, dropActivity) => {
    e.preventDefault();
    const draggedActivity = dragState.draggedItem;
    
    if (draggedActivity && draggedActivity !== dropActivity) {
      const newOrder = [...activityOrder];
      const draggedIndex = newOrder.indexOf(draggedActivity);
      const dropIndex = newOrder.indexOf(dropActivity);
      
      // Remove dragged item and insert at new position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(dropIndex, 0, draggedActivity);
      
      setActivityOrder(newOrder);
    }
    
    setDragState({ draggedItem: null, draggedOverItem: null });
  };

  const handleDragEnd = () => {
    setDragState({ draggedItem: null, draggedOverItem: null });
  };

  // Reset to default order
  const resetOrder = () => {
    const defaultOrder = Object.entries(activityCounts)
      .filter(([activity]) => activity !== 'Available')
      .sort(([,a], [,b]) => b - a)
      .map(([activity]) => activity);
    setActivityOrder(defaultOrder);
  };

  // Create hour-based grid data - fill from bottom to top, left to right
  const createGridData = () => {
    const grid = [];
    const hoursPerRow = 40; // 40 hours = 10 slots of 4 hours each
    
    // Initialize empty grid
    for (let row = 0; row < totalDoctors; row++) {
      grid.push(new Array(hoursPerRow).fill('Available'));
    }
    
    // Fill from bottom to top, left to right using hour array
    let hourIndex = 0;
    for (let row = totalDoctors - 1; row >= 0; row--) {
      for (let col = 0; col < hoursPerRow; col++) {
        if (hourIndex < hourArray.length) {
          grid[row][col] = hourArray[hourIndex];
          hourIndex++;
        }
      }
    }
    
    return grid;
  };

  const gridData = createGridData();

  // Get color for activity (moved up to fix initialization order)

  // Render simple hour-based cell
  const renderHourCell = (activity) => {
    const color = getActivityColor(activity);
    return (
      <div 
        className="eta-hour-cell" 
        style={{ 
          backgroundColor: color,
          width: '100%',
          height: '100%',
          borderRadius: '1px'
        }}
      />
    );
  };

  return (
    <div className="eta-workload-infographic">
      <div className="infographic-header">
        <h3>ETP Workload Distribution - Backbone + Templates + TeleCs Needs</h3>
        <div className="infographic-stats">
          <div className="stats-section">
            <strong>Doctors:</strong>
            <span>Total: {totalDoctors}</span>
          </div>
          <div className="stats-section">
            <strong>ETP (Hour-based):</strong>
            <span>Total: {(totalHours / 40).toFixed(1)} ETP</span>
            <span>Used: {(totalUsedHours / 40).toFixed(1)} ETP</span>
            <span>Available: {(remainingHours / 40).toFixed(1)} ETP</span>
          </div>
          <div className="stats-section">
            <strong>Hours (Precision):</strong>
            <span>Total: {totalHours}h</span>
            <span>Used: {totalUsedHours}h</span>
            <span>Available: {remainingHours}h</span>
          </div>
          <div className="stats-section">
            <strong>TeleCs Needs:</strong>
            <span>{totalTeleCsHours}h • {(totalTeleCsHours / 40).toFixed(1)} ETP</span>
            <span>{totalTeleCsHours / docActivities.TeleCs.duration} sessions/week</span>
          </div>
          <div className="stats-section">
            <strong>Utilization:</strong>
            <span>Slots: {((activityArray.filter(a => a !== 'Available').length / totalHalfDays) * 100).toFixed(1)}%</span>
            <span>Hours: {((totalUsedHours / totalHours) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      <div className="eta-grid-container">
        <div className="eta-grid">
          {gridData.map((row, rowIndex) => (
            <div key={rowIndex} className="eta-row">
              <div className="eta-row-cells">
                {row.map((activity, hourIndex) => {
                  // Calculate slot position and hour within slot
                  const slotNumber = Math.floor(hourIndex / 4) + 1;
                  const hourInSlot = (hourIndex % 4) + 1;
                  const isSlotBoundary = (hourIndex + 1) % 4 === 0;
                  const isSlotStart = hourIndex % 4 === 0;
                  
                  // Build CSS classes
                  let cellClasses = "eta-cell";
                  if (isSlotBoundary && hourIndex < 39) cellClasses += " slot-boundary";
                  if (isSlotStart && hourIndex > 0) cellClasses += " slot-start";
                  
                  return (
                    <div
                      key={hourIndex}
                      className={cellClasses}
                      title={`${activity} | Hour ${hourIndex + 1} | ${(1/40).toFixed(3)} ETP`}
                    >
                      {renderHourCell(activity)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="eta-legend">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>Activity Legend</h4>
            <button 
              onClick={resetOrder}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: '#f8f9fa',
                cursor: 'pointer'
              }}
              title="Reset to default order"
            >
              ↺ Reset
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '10px' }}>
            💡 Drag activities to reorder the grid visualization
          </div>
          {activityOrder.map((activity) => {
            const count = activityCounts[activity] || 0;
            const hours = activityHours[activity] || 0;
            const activityHoursPerSlot = getActivityHours(activity);
            const isDragging = dragState.draggedItem === activity;
            const isDraggedOver = dragState.draggedOverItem === activity;
            
            return (
              <div 
                key={activity} 
                className="legend-item"
                draggable
                onDragStart={(e) => handleDragStart(e, activity)}
                onDragOver={(e) => handleDragOver(e, activity)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, activity)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: isDragging ? 0.5 : 1,
                  borderTop: isDraggedOver ? '2px solid #007bff' : 'none',
                  paddingTop: isDraggedOver ? '8px' : '10px',
                  cursor: 'grab',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ color: '#6c757d', fontSize: '12px' }}>⋮⋮</div>
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: getActivityColor(activity) }}
                ></div>
                <span>
                  {activity}: {(hours / 40).toFixed(1)} ETP ({hours}h)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="pie-chart-section" style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          Activity Time Distribution by Color Groups
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ width: '400px', height: '400px' }}>
            <Pie 
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      font: {
                        size: 11
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label;
                        const value = context.parsed;
                        const etpValue = (value / 40).toFixed(1);
                        const percentage = ((value / totalUsedHours) * 100).toFixed(1);
                        return [`${label}`, `${value}h (${etpValue} ETP)`, `${percentage}% of total`];
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d', textAlign: 'center' }}>
          <p>
            <strong>Total Used Time:</strong> {totalUsedHours}h ({(totalUsedHours / 40).toFixed(1)} ETP) • 
            <strong> Available Time:</strong> {remainingHours}h ({(remainingHours / 40).toFixed(1)} ETP)
          </p>
          <p style={{ fontSize: '12px', fontStyle: 'italic' }}>
            Activities with the same color are grouped together. Hover over slices for detailed information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ETAWorkloadInfographic;