import React from 'react';
import { doctorProfiles, wantedActivities, docActivities } from './doctorSchedules.js';
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

    // Add wanted activities templates dynamically
    // Process all templates from wantedActivities (includes Chefferie, excludes MPO)
    Object.entries(wantedActivities).forEach(([templateName, template]) => {
      Object.values(template).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 1 instance of each template
            activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + hours;
          });
        });
      });
    });

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

  // Helper function to generate different sorting orders
  // Available options: 'hours-desc', 'hours-asc', 'count-desc', 'count-asc', 'alphabetical', 'color-groups', 'custom'
  const getDefaultActivityOrder = (sortBy = 'hours-desc') => {
    const activities = Object.keys(activityCounts).filter(activity => activity !== 'Available');
    
    switch (sortBy) {
      case 'hours-desc':
        return activities.sort((a, b) => (activityHours[b] || 0) - (activityHours[a] || 0));
      
      case 'hours-asc':
        return activities.sort((a, b) => (activityHours[a] || 0) - (activityHours[b] || 0));
      
      case 'count-desc':
        return activities.sort((a, b) => (activityCounts[b] || 0) - (activityCounts[a] || 0));
      
      case 'count-asc':
        return activities.sort((a, b) => (activityCounts[a] || 0) - (activityCounts[b] || 0));
      
      case 'alphabetical':
        return activities.sort();
      
      case 'color-groups':
        return activities.sort((a, b) => {
          const colorA = getActivityColor(a);
          const colorB = getActivityColor(b);
          if (colorA === colorB) {
            // If same color, sort by hours desc
            return (activityHours[b] || 0) - (activityHours[a] || 0);
          }
          return colorA.localeCompare(colorB);
        });
      
      case 'custom':
        // Define your custom priority order here
        const customOrder = ['TP', 'HTC1', 'HTC1_visite', 'HTC2_visite', 'HTC2', 'Cs', 'TeleCs', 'EMIT', 'EMATIT', 'Staff', 'HDJ', 'AMI'];
        return activities.sort((a, b) => {
          const indexA = customOrder.indexOf(a);
          const indexB = customOrder.indexOf(b);
          if (indexA === -1 && indexB === -1) return a.localeCompare(b);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      
      default:
        return activities.sort((a, b) => (activityHours[b] || 0) - (activityHours[a] || 0));
    }
  };

  // State for sortable legend and drag operations
  const [activityOrder, setActivityOrder] = React.useState(() => {
    // Initialize with custom order
    return getDefaultActivityOrder('custom');
  });
  
  const [dragState, setDragState] = React.useState({
    draggedItem: null,
    draggedOverItem: null
  });

  // Create hourArray based on custom activity order
  const createCustomHourArray = () => {
    const hourArray = [];
    const overflowActivities = {};
    let totalRequiredHours = 0;

    // Calculate total required hours for all activities
    activityOrder.forEach(activity => {
      const totalHours = activityHours[activity] || 0;
      totalRequiredHours += totalHours;
    });

    // Add each activity based on custom order and hour duration
    activityOrder.forEach(activity => {
      const totalHours = activityHours[activity] || 0;
      for (let i = 0; i < totalHours; i++) {
        if (hourArray.length < totalHours) {
          hourArray.push(activity);
        } else {
          // Track overflow activities
          if (!overflowActivities[activity]) {
            overflowActivities[activity] = 0;
          }
          overflowActivities[activity]++;
        }
      }
    });

    // Calculate overflow statistics
    const totalOverflowHours = Math.max(0, totalRequiredHours - totalHours);
    const hasOverflow = totalOverflowHours > 0;

    // If we have overflow, extend the array to show all activities
    if (hasOverflow) {
      // Clear and rebuild array to show all activities
      hourArray.length = 0;
      activityOrder.forEach(activity => {
        const totalHours = activityHours[activity] || 0;
        for (let i = 0; i < totalHours; i++) {
          hourArray.push(activity);
        }
      });
    } else {
      // Fill remaining hours with "Available" only if no overflow
      for (let i = 0; i < remainingHours; i++) {
        hourArray.push('Available');
      }
    }

    return {
      hourArray,
      overflowActivities,
      totalOverflowHours,
      hasOverflow,
      totalRequiredHours
    };
  };

  const {
    hourArray,
    overflowActivities,
    totalOverflowHours,
    hasOverflow,
    totalRequiredHours
  } = createCustomHourArray();

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
    setActivityOrder(getDefaultActivityOrder('custom'));
  };

  // Create hour-based grid data - fill from bottom to top, left to right
  const createGridData = () => {
    const grid = [];
    const hoursPerRow = 40; // 40 hours = 10 slots of 4 hours each
    const totalArrayHours = hourArray.length;

    // Calculate how many rows we need (standard doctors + overflow rows)
    const standardHours = totalDoctors * hoursPerRow;
    const needsExtraRows = totalArrayHours > standardHours;
    const extraHours = Math.max(0, totalArrayHours - standardHours);
    const extraRows = Math.ceil(extraHours / hoursPerRow);
    const totalRows = totalDoctors + extraRows;

    // Initialize grid with calculated rows
    for (let row = 0; row < totalRows; row++) {
      grid.push(new Array(hoursPerRow).fill('Available'));
    }

    // Fill from bottom to top, left to right using hour array
    let hourIndex = 0;
    for (let row = totalRows - 1; row >= 0; row--) {
      for (let col = 0; col < hoursPerRow; col++) {
        if (hourIndex < hourArray.length) {
          grid[row][col] = hourArray[hourIndex];
          hourIndex++;
        }
      }
    }

    return {
      grid,
      totalRows,
      extraRows,
      needsExtraRows,
      standardRows: totalDoctors
    };
  };

  const {
    grid: gridData,
    totalRows,
    extraRows,
    needsExtraRows,
    standardRows
  } = createGridData();

  // Get color for activity (moved up to fix initialization order)

  // Render simple hour-based cell
  const renderHourCell = (activity, isOverflowRow = false) => {
    const color = getActivityColor(activity);
    const isOverflowActivity = isOverflowRow && activity !== 'Available';

    return (
      <div
        className="eta-hour-cell"
        style={{
          backgroundColor: color,
          width: '100%',
          height: '100%',
          borderRadius: '1px',
          opacity: isOverflowActivity ? 0.8 : 1,
          border: isOverflowActivity ? '1px solid #dc3545' : 'none',
          boxSizing: 'border-box'
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
          {hasOverflow && (
            <div className="stats-section overflow-warning" style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: '4px', padding: '8px' }}>
              <strong style={{ color: '#842029' }}>⚠️ CAPACITY EXCEEDED:</strong>
              <span style={{ color: '#842029' }}>Required: {totalRequiredHours}h ({(totalRequiredHours / 40).toFixed(1)} ETP)</span>
              <span style={{ color: '#842029' }}>Excess: +{totalOverflowHours}h (+{(totalOverflowHours / 40).toFixed(1)} ETP)</span>
              <span style={{ color: '#842029' }}>Extra rows added: {extraRows}</span>
            </div>
          )}
        </div>
      </div>
      
      {hasOverflow && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          padding: '12px',
          margin: '10px 0',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '8px' }}>
            🔄 Grid Extended to Show All Activities
          </div>
          <div style={{ color: '#856404', fontSize: '13px' }}>
            Standard capacity exceeded. Additional {extraRows} row{extraRows > 1 ? 's' : ''} added to display all {totalRequiredHours} required hours.
            Overflow section marked by orange dashed line separator. Overflow activities have red borders and light red background.
          </div>
        </div>
      )}

      <div className="eta-grid-container">
        <div className="eta-grid">
          {gridData.map((row, rowIndex) => {
            const isOverflowRow = rowIndex < extraRows;
            const isFirstStandardRow = !isOverflowRow && rowIndex === extraRows;
            const displayRowIndex = isOverflowRow ? `Overflow ${extraRows - rowIndex}` : `Doctor ${rowIndex - extraRows + 1}`;

            return (
              <div key={rowIndex}>
                {/* Visual separator before first standard row (between overflow and standard sections) */}
                {isFirstStandardRow && (
                  <div style={{
                    height: '4px',
                    background: 'repeating-linear-gradient(to right, #ff9500 0, #ff9500 8px, transparent 8px, transparent 16px)',
                    margin: '8px 0',
                    borderRadius: '2px',
                    boxShadow: '0 1px 3px rgba(255, 149, 0, 0.3)'
                  }} />
                )}

                <div className="eta-row" style={{
                  backgroundColor: isOverflowRow ? '#fff5f5' : 'transparent',
                  border: isOverflowRow ? '1px solid #fecaca' : 'none',
                  borderRadius: isOverflowRow ? '4px' : '0',
                  padding: isOverflowRow ? '2px' : '0'
                }}>
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

                    const tooltipText = isOverflowRow
                      ? `${activity} | OVERFLOW | Hour ${hourIndex + 1} | ${(1/40).toFixed(3)} ETP | EXCEEDS CAPACITY`
                      : `${activity} | Hour ${hourIndex + 1} | ${(1/40).toFixed(3)} ETP`;

                    return (
                      <div
                        key={hourIndex}
                        className={cellClasses}
                        title={tooltipText}
                      >
                        {renderHourCell(activity, isOverflowRow)}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            );
          })}
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
          {hasOverflow && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', color: '#495057' }}>
                Overflow Indicators:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{
                  width: '16px',
                  height: '12px',
                  backgroundColor: '#fff5f5',
                  border: '1px solid #fecaca',
                  borderRadius: '2px'
                }}></div>
                <span style={{ fontSize: '11px', color: '#6c757d' }}>Light red background = Overflow row</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '12px',
                  backgroundColor: '#007bff',
                  border: '1px solid #dc3545',
                  borderRadius: '2px',
                  opacity: 0.8
                }}></div>
                <span style={{ fontSize: '11px', color: '#6c757d' }}>Red border + reduced opacity = Exceeding activity</span>
              </div>
            </div>
          )}
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