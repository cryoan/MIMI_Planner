import React from 'react';
import { doctorProfiles, rotationTemplates, docActivities } from './doctorSchedules.js';
import { activityColors } from './schedule.jsx';

const ETAWorkloadInfographic = () => {
  // Helper function to get activity duration in hours
  const getActivityHours = (activity) => {
    if (activity === 'Available') return 0;
    return docActivities[activity]?.duration || 4; // Default to 4 hours if not found
  };

  // Calculate total activity distribution: backbone + HTC templates
  const calculateWorkloadDistribution = () => {
    const activityCounts = {};
    const activityHours = {};
    const doctors = Object.keys(doctorProfiles);
    const totalDoctors = doctors.length;
    const totalHalfDays = totalDoctors * 10; // Each doctor has 10 half-days per week
    const totalHours = totalDoctors * 40; // Each doctor has 40 hours per week (10 * 4 hours)

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

    // Convert hours to array of activities for hour-based visualization
    const hourArray = [];
    
    // Add each activity based on its hour duration
    Object.entries(activityHours).forEach(([activity, totalHours]) => {
      for (let i = 0; i < totalHours; i++) {
        hourArray.push(activity);
      }
    });

    // Calculate total used hours
    const totalUsedHours = Object.values(activityHours).reduce((sum, hours) => sum + hours, 0);
    const remainingHours = totalHours - totalUsedHours;

    // Fill remaining hours with "Available" 
    for (let i = 0; i < remainingHours; i++) {
      hourArray.push('Available');
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

    return { 
      activityArray, 
      hourArray,
      totalDoctors, 
      totalHalfDays, 
      totalHours,
      activityCounts, 
      activityHours,
      totalUsedHours,
      remainingHours
    };
  };

  const { 
    activityArray, 
    hourArray,
    totalDoctors, 
    totalHalfDays, 
    totalHours,
    activityCounts, 
    activityHours,
    totalUsedHours,
    remainingHours
  } = calculateWorkloadDistribution();

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

  // Get color for activity
  const getActivityColor = (activity) => {
    if (activity === 'Available') {
      return '#f5f5f5'; // Light gray for available slots
    }
    return activityColors[activity] || '#ddd';
  };

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
        <h3>ETP Workload Distribution - Backbone + HTC Templates</h3>
        <div className="infographic-stats">
          <div className="stats-section">
            <strong>Doctors:</strong>
            <span>Total: {totalDoctors}</span>
          </div>
          <div className="stats-section">
            <strong>ETP (Slot-based):</strong>
            <span>Total: {(totalHalfDays / 10).toFixed(1)} ETP</span>
            <span>Used: {(activityArray.filter(a => a !== 'Available').length / 10).toFixed(1)} ETP</span>
            <span>Available: {(activityArray.filter(a => a === 'Available').length / 10).toFixed(1)} ETP</span>
          </div>
          <div className="stats-section">
            <strong>Hours (Precision):</strong>
            <span>Total: {totalHours}h</span>
            <span>Used: {totalUsedHours}h</span>
            <span>Available: {remainingHours}h</span>
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
                      title={`${activity} | Hour ${hourIndex + 1} | Slot ${slotNumber}, Hour ${hourInSlot}/4 | ${(1/40).toFixed(3)} ETP`}
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
          <h4>Activity Legend</h4>
          {Object.entries(activityCounts)
            .sort(([,a], [,b]) => b - a) // Sort by count descending
            .map(([activity, count]) => {
              const hours = activityHours[activity] || 0;
              const activityHoursPerSlot = getActivityHours(activity);
              return (
                <div key={activity} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: getActivityColor(activity) }}
                  ></div>
                  <span>
                    {activity}: {count} slots • {hours}h • {(count / 10).toFixed(1)} ETP
                    <br />
                    <small style={{ color: '#6c757d' }}>
                      {activityHoursPerSlot}h per slot ({activityHoursPerSlot}/4 precision)
                      {activity.startsWith('HTC') && ' • Template activity'}
                    </small>
                  </span>
                </div>
              );
            })}
          <div className="legend-separator">
            <hr style={{ margin: '10px 0', border: '1px solid #dee2e6' }} />
            <small style={{ color: '#6c757d' }}>
              Includes: Backbone activities + 1× HTC1 template + 1× HTC2 template<br />
              Hour-based precision: Each cell = 1 hour, grouped in 4-hour slots with boundaries<br />
              ETP = Equivalent Time Position (1 ETP = 10 slots = 40h per week)
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETAWorkloadInfographic;