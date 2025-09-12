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
    // HTC1 Template: 2 instances (20 total slots)
    if (rotationTemplates.HTC1) {
      Object.values(rotationTemplates.HTC1).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 2 instances of HTC1 template
            activityCounts[activity] = (activityCounts[activity] || 0) + 2;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + (hours * 2);
          });
        });
      });
    }

    // HTC2 Template: 2 instances (20 total slots)  
    if (rotationTemplates.HTC2) {
      Object.values(rotationTemplates.HTC2).forEach(daySchedule => {
        Object.values(daySchedule).forEach(timeSlotActivities => {
          timeSlotActivities.forEach(activity => {
            // Count 2 instances of HTC2 template
            activityCounts[activity] = (activityCounts[activity] || 0) + 2;
            const hours = getActivityHours(activity);
            activityHours[activity] = (activityHours[activity] || 0) + (hours * 2);
          });
        });
      });
    }

    // Convert counts to array of activities for visualization
    const activityArray = [];
    Object.entries(activityCounts).forEach(([activity, count]) => {
      for (let i = 0; i < count; i++) {
        activityArray.push(activity);
      }
    });

    // Fill remaining slots with "Available" 
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
      remainingHours
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
    remainingHours
  } = calculateWorkloadDistribution();

  // Create grid data - fill from bottom to top, left to right
  const createGridData = () => {
    const grid = [];
    const cellsPerRow = 10;
    
    // Initialize empty grid
    for (let row = 0; row < totalDoctors; row++) {
      grid.push(new Array(cellsPerRow).fill('Available'));
    }
    
    // Fill from bottom to top, left to right
    let activityIndex = 0;
    for (let row = totalDoctors - 1; row >= 0; row--) {
      for (let col = 0; col < cellsPerRow; col++) {
        if (activityIndex < activityArray.length) {
          grid[row][col] = activityArray[activityIndex];
          activityIndex++;
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

  // Render quarter-square display based on activity hours
  const renderActivityCell = (activity) => {
    const hours = getActivityHours(activity);
    const color = getActivityColor(activity);
    
    if (hours === 4 || activity === 'Available') {
      // Full square for 4-hour activities or available slots
      return (
        <div 
          className="eta-cell-full" 
          style={{ backgroundColor: color }}
        />
      );
    } else {
      // Quarter-square display for partial hours
      return (
        <div className="eta-cell-quarters">
          {[1, 2, 3, 4].map(quarter => (
            <div
              key={quarter}
              className="eta-quarter"
              style={{ 
                backgroundColor: color,
                opacity: quarter <= hours ? 1 : 0.1
              }}
            />
          ))}
        </div>
      );
    }
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
                {row.map((activity, colIndex) => {
                  const hours = getActivityHours(activity);
                  return (
                    <div
                      key={colIndex}
                      className="eta-cell"
                      data-hours={hours}
                      title={`${activity}: ${hours}h (${(hours/4).toFixed(2)} slots, ${(hours/40).toFixed(3)} ETP)`}
                    >
                      {renderActivityCell(activity)}
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
              Includes: Backbone activities + 2× HTC1 template + 2× HTC2 template<br />
              Quarter-square precision: Each square = 4h slot, quarters show 1h increments<br />
              ETP = Equivalent Time Position (1 ETP = 10 slots = 40h per week)
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETAWorkloadInfographic;