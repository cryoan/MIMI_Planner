import { generateDoctorRotations, doctorProfiles, docActivities } from './doctorSchedules.js';
import { expectedActivities } from './schedule.jsx';

// Round Robin Planning System - Activity Assignment Based
// Assigns each required activity to exactly one qualified doctor using round robin principles

// Simple time periods for testing - can be expanded later for vacation integration
const DEFAULT_PERIODS = [
  'M1_S1', 'M1_S2', 'M1_S3', 'M1_S4',
  'M2_S1', 'M2_S2', 'M2_S3', 'M2_S4',
  'M3_S1', 'M3_S2', 'M3_S3', 'M3_S4',
  'M4_S1', 'M4_S2', 'M4_S3', 'M4_S4',
  'M5_S1', 'M5_S2', 'M5_S3', 'M5_S4',
  'M6_S1', 'M6_S2', 'M6_S3', 'M6_S4',
];

// Get all available doctors
const AVAILABLE_DOCTORS = Object.keys(doctorProfiles);

// All activities that need to be assigned (each to exactly one doctor)
const ALL_ACTIVITIES = ['HTC1', 'HTC1_visite', 'HTC2', 'HTC2_visite', 'EMIT', 'EMATIT', 'HDJ', 'AMI'];

/**
 * Time slot configuration
 */
const TIME_SLOT_DURATION = 4; // Each time slot is 4 hours

/**
 * Get activity duration in hours
 * @param {string} activity - Activity name
 * @returns {number} Duration in hours
 */
function getActivityDuration(activity) {
  return docActivities[activity]?.duration || 0;
}

/**
 * Calculate remaining capacity in a time slot
 * @param {Array} assignedActivities - Currently assigned activities
 * @returns {number} Remaining hours in the time slot
 */
function getRemainingCapacity(assignedActivities) {
  const usedDuration = assignedActivities.reduce((total, activity) => {
    return total + getActivityDuration(activity);
  }, 0);
  return Math.max(0, TIME_SLOT_DURATION - usedDuration);
}

/**
 * Check if an activity can fit in the remaining time slot capacity
 * @param {string} activity - Activity to check
 * @param {Array} currentActivities - Currently assigned activities in the slot
 * @returns {boolean} True if activity fits
 */
function canActivityFitInTimeSlot(activity, currentActivities) {
  const activityDuration = getActivityDuration(activity);
  const remainingCapacity = getRemainingCapacity(currentActivities);
  return activityDuration <= remainingCapacity;
}

/**
 * Get the root HTC activity for HTC-related activities
 * @param {string} activity - Activity to check
 * @returns {string} Root activity (HTC1 or HTC2) or the activity itself
 */
function getHtcRootActivity(activity) {
  if (activity.startsWith('HTC1')) return 'HTC1';
  if (activity.startsWith('HTC2')) return 'HTC2';
  return activity;
}

/**
 * Get HTC activity group for an activity
 * @param {string} activity - Activity to check
 * @returns {Array} Array of all related HTC activities or [activity] if not HTC
 */
function getHtcActivityGroup(activity) {
  if (activity.startsWith('HTC1')) return ['HTC1', 'HTC1_visite'];
  if (activity.startsWith('HTC2')) return ['HTC2', 'HTC2_visite'];
  return [activity];
}

/**
 * Get doctors who can perform a specific activity based on their rotationSetting (strict mode)
 * Includes HTC activity grouping: doctors with HTC1 can also handle HTC1_visite
 * @param {string} activity - Activity to check
 * @returns {Array} Array of doctor codes who have this activity in their rotationSetting
 */
function getQualifiedDoctorsStrict(activity) {
  return AVAILABLE_DOCTORS.filter(doctorCode => {
    const doctorProfile = doctorProfiles[doctorCode];
    if (!doctorProfile || !doctorProfile.rotationSetting) {
      return false;
    }
    
    // For HTC activities, check if doctor has the root HTC activity
    const rootActivity = getHtcRootActivity(activity);
    return doctorProfile.rotationSetting.includes(rootActivity);
  });
}

/**
 * Find next available doctor for activity assignment using round robin
 * @param {Array} candidates - Doctors who can perform the activity
 * @param {Object} assignments - Current assignments for this time slot
 * @param {number} startIndex - Round robin starting index
 * @param {string} activity - Activity to be assigned
 * @param {Object} currentSchedule - Current schedule state for duration checking
 * @param {string} day - Day of week
 * @param {string} timeSlot - Time slot
 * @returns {string|null} Selected doctor code or null if none available
 */
function findNextAvailableDoctor(candidates, assignments, startIndex, activity, currentSchedule, day, timeSlot) {
  if (candidates.length === 0) return null;
  
  const assignedDoctors = new Set(Object.values(assignments));
  
  // Try to find an available doctor starting from round robin index
  for (let i = 0; i < candidates.length; i++) {
    const candidateIndex = (startIndex + i) % candidates.length;
    const candidate = candidates[candidateIndex];
    
    if (!assignedDoctors.has(candidate)) {
      // Check if this doctor can fit the activity in their time slot
      if (currentSchedule && currentSchedule[candidate]) {
        const doctorCurrentSlot = currentSchedule[candidate][day]?.[timeSlot] || [];
        if (!canActivityFitInTimeSlot(activity, doctorCurrentSlot)) {
          continue; // Skip this doctor, they don't have capacity
        }
      }
      
      return candidate;
    }
  }
  
  return null; // No available doctor found
}

/**
 * Check for existing HTC assignments in the schedule to maintain HTC consistency
 * @param {Object} currentSchedule - Current schedule
 * @param {string} activity - Activity to assign (e.g., HTC1_visite)
 * @returns {string|null} Doctor already assigned to this HTC group, or null
 */
function getExistingHtcAssignment(currentSchedule, activity) {
  const htcGroup = getHtcActivityGroup(activity);
  if (htcGroup.length === 1) return null; // Not an HTC activity
  
  // Look for any doctor already assigned to activities in this HTC group
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  
  for (const [doctorCode, schedule] of Object.entries(currentSchedule)) {
    for (const checkDay of days) {
      for (const checkTimeSlot of timeSlots) {
        const activities = schedule[checkDay]?.[checkTimeSlot] || [];
        // Check if this doctor has any activity from the same HTC group
        for (const assignedActivity of activities) {
          if (htcGroup.includes(assignedActivity)) {
            return doctorCode;
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * Assign activities to doctors for a specific time slot using round robin
 * @param {Array} doctors - Available doctors
 * @param {string} day - Day of week
 * @param {string} timeSlot - Time slot (9am-1pm or 2pm-6pm)
 * @param {number} roundRobinOffset - Round robin offset for fairness
 * @param {Object} currentSchedule - Current schedule state for duration checking
 * @returns {Object} Activity to doctor assignments
 */
function assignActivitiesForTimeSlot(doctors, day, timeSlot, roundRobinOffset, currentSchedule = {}) {
  // Get required activities for this time slot
  const requiredActivities = expectedActivities[day]?.[timeSlot] || [];
  
  // Sort activities by duration (largest first) for better fitting
  const sortedActivities = requiredActivities.sort((a, b) => 
    getActivityDuration(b) - getActivityDuration(a)
  );
  
  // Get doctors available for assignment (not blocked by backbone)
  const availableDoctors = doctors.filter(doctorCode => {
    const doctorProfile = doctorProfiles[doctorCode];
    if (!doctorProfile) return false;
    
    const backboneActivities = doctorProfile.backbone?.[day]?.[timeSlot] || [];
    // Doctor is available if backbone slot is empty or only has non-conflicting activities
    return backboneActivities.length === 0 || 
           backboneActivities.every(activity => !ALL_ACTIVITIES.includes(activity));
  });
  
  // Create activity-doctor matching matrix based on rotationSetting (not skills)
  const activityCandidates = {};
  sortedActivities.forEach(activity => {
    // Use strict qualification based on rotationSetting
    activityCandidates[activity] = getQualifiedDoctorsStrict(activity).filter(doctorCode => 
      availableDoctors.includes(doctorCode)
    );
  });
  
  // Assign activities using round robin
  const assignments = {};
  let currentOffset = roundRobinOffset;
  
  sortedActivities.forEach((activity, activityIndex) => {
    const candidates = activityCandidates[activity] || [];
    
    if (candidates.length > 0) {
      // Check if this is an HTC activity and if there's already a doctor assigned to this HTC group
      const existingHtcDoctor = getExistingHtcAssignment(currentSchedule, activity);
      
      let assignedDoctor = null;
      
      if (existingHtcDoctor && candidates.includes(existingHtcDoctor)) {
        // HTC consistency: assign to the same doctor already handling this HTC group
        // But only if they have capacity and are not already assigned in this time slot
        const assignedDoctors = new Set(Object.values(assignments));
        if (!assignedDoctors.has(existingHtcDoctor)) {
          const doctorCurrentSlot = currentSchedule[existingHtcDoctor][day]?.[timeSlot] || [];
          if (canActivityFitInTimeSlot(activity, doctorCurrentSlot)) {
            assignedDoctor = existingHtcDoctor;
          }
        }
      }
      
      // If no HTC consistency match, use round robin selection
      if (!assignedDoctor) {
        assignedDoctor = findNextAvailableDoctor(
          candidates, 
          assignments, 
          (currentOffset + activityIndex) % Math.max(candidates.length, 1),
          activity,
          currentSchedule,
          day,
          timeSlot
        );
      }
      
      if (assignedDoctor) {
        assignments[activity] = assignedDoctor;
        
        // Update current schedule to track duration usage
        if (!currentSchedule[assignedDoctor]) {
          currentSchedule[assignedDoctor] = getEmptySchedule();
        }
        if (!currentSchedule[assignedDoctor][day][timeSlot].includes(activity)) {
          currentSchedule[assignedDoctor][day][timeSlot].push(activity);
        }
      }
    }
  });
  
  return assignments;
}

/**
 * Build complete doctor schedules from activity assignments
 * @param {Object} activityAssignments - Activity to doctor assignments per time slot
 * @param {Array} doctors - List of all doctors
 * @returns {Object} Complete doctor schedules
 */
function buildScheduleFromAssignments(activityAssignments, doctors) {
  const schedule = {};
  
  // Initialize with backbone schedules
  doctors.forEach(doctorCode => {
    const doctorProfile = doctorProfiles[doctorCode];
    if (doctorProfile?.backbone) {
      schedule[doctorCode] = JSON.parse(JSON.stringify(doctorProfile.backbone));
    } else {
      schedule[doctorCode] = getEmptySchedule();
    }
  });
  
  // Apply activity assignments
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      const slotAssignments = activityAssignments[day]?.[timeSlot] || {};
      
      Object.entries(slotAssignments).forEach(([activity, doctorCode]) => {
        if (doctorCode && schedule[doctorCode]) {
          const doctorSlot = schedule[doctorCode][day][timeSlot];
          
          // Only add if not already present and not conflicting with backbone and fits duration
          if (!doctorSlot.includes(activity)) {
            // Check if backbone allows this assignment
            const backboneActivities = doctorProfiles[doctorCode]?.backbone?.[day]?.[timeSlot] || [];
            const hasBackboneConflict = backboneActivities.some(bActivity => 
              ALL_ACTIVITIES.includes(bActivity) && bActivity !== activity
            );
            
            // Check if activity can fit in the time slot
            const canFit = canActivityFitInTimeSlot(activity, doctorSlot);
            
            if (!hasBackboneConflict && canFit) {
              doctorSlot.push(activity);
            }
          }
        }
      });
    });
  });
  
  return schedule;
}

/**
 * Generate a single round robin scenario using activity-based assignment
 * @param {Array} doctors - List of doctor codes
 * @param {Array} periods - List of time periods
 * @param {number} startOffset - Starting offset for round robin fairness
 * @returns {Object} Complete assignment scenario
 */
export function generateRoundRobinScenario(doctors, periods, startOffset = 0) {
  const scenario = {};
  let globalOffset = startOffset;
  
  periods.forEach((period, periodIndex) => {
    // Generate activity assignments for this period
    const periodAssignments = {};
    
    // Initialize current schedule for duration tracking across this period
    const currentSchedule = {};
    doctors.forEach(doctorCode => {
      const doctorProfile = doctorProfiles[doctorCode];
      if (doctorProfile?.backbone) {
        currentSchedule[doctorCode] = JSON.parse(JSON.stringify(doctorProfile.backbone));
      } else {
        currentSchedule[doctorCode] = getEmptySchedule();
      }
    });
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = ['9am-1pm', '2pm-6pm'];
    
    days.forEach(day => {
      periodAssignments[day] = {};
      
      timeSlots.forEach(timeSlot => {
        // Assign activities for this specific time slot
        const slotAssignments = assignActivitiesForTimeSlot(
          doctors, 
          day, 
          timeSlot, 
          globalOffset,
          currentSchedule  // Pass current schedule for duration checking
        );
        
        periodAssignments[day][timeSlot] = slotAssignments;
        
        // Rotate offset for fairness across time slots
        globalOffset = (globalOffset + 1) % Math.max(doctors.length, 1);
      });
    });
    
    // Build complete doctor schedules from assignments
    const periodSchedule = buildScheduleFromAssignments(periodAssignments, doctors);
    scenario[period] = periodSchedule;
    
    // Additional offset rotation per period for fairness
    globalOffset = (globalOffset + 3) % Math.max(doctors.length, 1);
  });
  
  return scenario;
}

/**
 * Generate empty weekly schedule structure
 */
function getEmptySchedule() {
  return {
    Monday: { "9am-1pm": [], "2pm-6pm": [] },
    Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
    Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
    Thursday: { "9am-1pm": [], "2pm-6pm": [] },
    Friday: { "9am-1pm": [], "2pm-6pm": [] },
  };
}

/**
 * Run alarm detection on a scenario to count scheduling conflicts
 * Updated for activity-based assignment model - duplicates should be near zero
 * @param {Object} scenario - Complete assignment scenario
 * @returns {Object} Alarm analysis results
 */
export function analyzeScenarioAlarms(scenario) {
  const alarmResults = {
    totalAlarms: 0,
    missingActivities: 0,
    duplicateActivities: 0,
    backboneConflicts: 0,
    details: {
      missing: {},
      duplicates: {},
      backboneConflicts: {}
    }
  };
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  
  // Analyze each period
  Object.entries(scenario).forEach(([period, doctorAssignments]) => {
    days.forEach(day => {
      timeSlots.forEach(timeSlot => {
        // Collect all activities for this day/time across all doctors
        const assignedActivities = [];
        const activityCounts = {};
        const activityToDoctorMap = {};
        
        Object.entries(doctorAssignments).forEach(([doctorCode, schedule]) => {
          if (schedule && schedule[day] && schedule[day][timeSlot]) {
            schedule[day][timeSlot].forEach(activity => {
              // Skip non-medical activities for conflict detection
              if (ALL_ACTIVITIES.includes(activity)) {
                assignedActivities.push(activity);
                activityCounts[activity] = (activityCounts[activity] || 0) + 1;
                
                // Track which doctor is assigned to each activity
                if (!activityToDoctorMap[activity]) {
                  activityToDoctorMap[activity] = [];
                }
                activityToDoctorMap[activity].push(doctorCode);
              }
            });
          }
        });
        
        // Check for missing expected activities
        const expectedForSlot = expectedActivities[day]?.[timeSlot] || [];
        const missing = expectedForSlot.filter(activity => !assignedActivities.includes(activity));
        
        if (missing.length > 0) {
          const key = `${period}_${day}_${timeSlot}`;
          alarmResults.details.missing[key] = missing;
          alarmResults.missingActivities += missing.length;
          alarmResults.totalAlarms += missing.length;
        }
        
        // Check for duplicate activities (should be rare with new algorithm)
        const duplicates = Object.entries(activityCounts)
          .filter(([activity, count]) => count > 1)
          .map(([activity, count]) => ({
            activity,
            count,
            doctors: activityToDoctorMap[activity] || []
          }));
        
        if (duplicates.length > 0) {
          const key = `${period}_${day}_${timeSlot}`;
          alarmResults.details.duplicates[key] = duplicates;
          alarmResults.duplicateActivities += duplicates.length;
          alarmResults.totalAlarms += duplicates.length;
        }
        
        // Check for backbone conflicts (assigned activities conflicting with backbone)
        Object.entries(doctorAssignments).forEach(([doctorCode, schedule]) => {
          const doctorProfile = doctorProfiles[doctorCode];
          if (doctorProfile && schedule && schedule[day] && schedule[day][timeSlot]) {
            const backboneActivities = doctorProfile.backbone?.[day]?.[timeSlot] || [];
            const assignedMedicalActivities = schedule[day][timeSlot].filter(activity => 
              ALL_ACTIVITIES.includes(activity)
            );
            
            // Check if assigned medical activities conflict with backbone
            const hasBackboneConflict = backboneActivities.some(bActivity => 
              ALL_ACTIVITIES.includes(bActivity) && 
              assignedMedicalActivities.some(aActivity => aActivity !== bActivity)
            );
            
            if (hasBackboneConflict) {
              const key = `${period}_${day}_${timeSlot}_${doctorCode}`;
              alarmResults.details.backboneConflicts[key] = {
                doctor: doctorCode,
                backbone: backboneActivities,
                assigned: assignedMedicalActivities
              };
              alarmResults.backboneConflicts++;
              alarmResults.totalAlarms++;
            }
          }
        });
      });
    });
  });
  
  return alarmResults;
}

/**
 * Find optimal round robin assignment with lowest alarm count
 * @param {Array} doctors - List of doctor codes (default: all available)
 * @param {Array} periods - List of time periods (default: 6 months)
 * @param {number} maxIterations - Maximum scenarios to test
 * @returns {Object} Best scenario with alarm analysis
 */
export function findOptimalRoundRobinAssignment(
  doctors = AVAILABLE_DOCTORS, 
  periods = DEFAULT_PERIODS.slice(0, 24), // 6 months
  maxIterations = 50
) {
  let bestScenario = null;
  let bestAlarmAnalysis = null;
  let lowestAlarmCount = Infinity;
  const allResults = [];
  
  console.log(`Testing ${Math.min(maxIterations, periods.length)} round robin scenarios...`);
  
  // Test different starting offsets for round robin
  for (let offset = 0; offset < Math.min(maxIterations, periods.length); offset++) {
    try {
      const scenario = generateRoundRobinScenario(doctors, periods, offset);
      const alarmAnalysis = analyzeScenarioAlarms(scenario);
      
      const result = {
        offset,
        scenario,
        alarmAnalysis,
        alarmCount: alarmAnalysis.totalAlarms
      };
      
      allResults.push(result);
      
      if (alarmAnalysis.totalAlarms < lowestAlarmCount) {
        lowestAlarmCount = alarmAnalysis.totalAlarms;
        bestScenario = scenario;
        bestAlarmAnalysis = alarmAnalysis;
      }
      
      console.log(`Offset ${offset}: ${alarmAnalysis.totalAlarms} total alarms 
        (${alarmAnalysis.missingActivities} missing, ${alarmAnalysis.duplicateActivities} duplicates)`);
        
    } catch (error) {
      console.error(`Error testing offset ${offset}:`, error);
    }
  }
  
  return {
    bestScenario,
    bestAlarmAnalysis,
    bestOffset: allResults.find(r => r.alarmCount === lowestAlarmCount)?.offset || 0,
    lowestAlarmCount,
    allResults: allResults.sort((a, b) => a.alarmCount - b.alarmCount)
  };
}

/**
 * Generate a compact summary of doctor rotation assignments for a scenario
 * @param {Object} scenario - Assignment scenario
 * @returns {Object} Summary of assignments per doctor
 */
export function summarizeScenarioAssignments(scenario) {
  const summary = {};
  
  // Get all doctors from first period
  const firstPeriod = Object.values(scenario)[0] || {};
  const doctors = Object.keys(firstPeriod);
  
  doctors.forEach(doctorCode => {
    summary[doctorCode] = {};
    
    Object.entries(scenario).forEach(([period, assignments]) => {
      const doctorSchedule = assignments[doctorCode];
      
      // Try to identify which rotation this resembles
      const rotationName = identifyRotationFromSchedule(doctorCode, doctorSchedule);
      summary[doctorCode][period] = rotationName || 'unknown';
    });
  });
  
  return summary;
}

/**
 * Try to identify which rotation a schedule resembles
 * @param {string} doctorCode - Doctor identifier
 * @param {Object} schedule - Weekly schedule
 * @returns {string} Rotation name or 'backbone'
 */
function identifyRotationFromSchedule(doctorCode, schedule) {
  if (!schedule) return 'empty';
  
  try {
    const computedRotations = generateDoctorRotations(doctorCode);
    const existingRotations = doctorProfiles[doctorCode]?.rotations || {};
    const allRotations = { ...computedRotations, ...existingRotations };
    
    // Compare schedule with known rotations
    for (const [rotationName, rotationSchedule] of Object.entries(allRotations)) {
      if (schedulesMatch(schedule, rotationSchedule)) {
        return rotationName;
      }
    }
    
    // Check if it matches backbone
    const backbone = doctorProfiles[doctorCode]?.backbone;
    if (backbone && schedulesMatch(schedule, backbone)) {
      return 'backbone';
    }
    
    return 'custom';
  } catch (error) {
    return 'error';
  }
}

/**
 * Compare two schedules for similarity
 */
function schedulesMatch(schedule1, schedule2) {
  if (!schedule1 || !schedule2) return false;
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  
  return days.every(day => 
    timeSlots.every(timeSlot => {
      const activities1 = schedule1[day]?.[timeSlot] || [];
      const activities2 = schedule2[day]?.[timeSlot] || [];
      
      return activities1.length === activities2.length &&
             activities1.every(activity => activities2.includes(activity));
    })
  );
}

/**
 * Generate activity assignment summary for easier analysis
 * @param {Object} scenario - Complete assignment scenario
 * @returns {Object} Activity assignment summary
 */
export function summarizeActivityAssignments(scenario) {
  const summary = {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  
  Object.entries(scenario).forEach(([period, doctorAssignments]) => {
    summary[period] = {};
    
    days.forEach(day => {
      summary[period][day] = {};
      
      timeSlots.forEach(timeSlot => {
        const slotSummary = {};
        
        // Map activities to doctors for this time slot
        Object.entries(doctorAssignments).forEach(([doctorCode, schedule]) => {
          if (schedule && schedule[day] && schedule[day][timeSlot]) {
            schedule[day][timeSlot].forEach(activity => {
              if (ALL_ACTIVITIES.includes(activity)) {
                slotSummary[activity] = doctorCode;
              }
            });
          }
        });
        
        summary[period][day][timeSlot] = slotSummary;
      });
    });
  });
  
  return summary;
}

// Export for testing and debugging
export {
  DEFAULT_PERIODS,
  AVAILABLE_DOCTORS,
  ALL_ACTIVITIES,
  TIME_SLOT_DURATION,
  expectedActivities,
  assignActivitiesForTimeSlot,
  buildScheduleFromAssignments,
  getActivityDuration,
  getRemainingCapacity,
  canActivityFitInTimeSlot,
  getQualifiedDoctorsStrict,
  getHtcRootActivity,
  getHtcActivityGroup,
  getExistingHtcAssignment
};