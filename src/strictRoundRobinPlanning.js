import { doctorProfiles, docActivities } from './doctorSchedules.js';
import { getISOWeek } from 'date-fns';

// Fallback expectedActivities for testing - will be overridden by global mock or parameter
const defaultExpectedActivities = {
  Monday: { "9am-1pm": ['HTC1', 'EMIT'], "2pm-6pm": ['HTC2', 'HDJ'] },
  Tuesday: { "9am-1pm": ['HTC1_visite'], "2pm-6pm": ['EMATIT', 'AMI'] },
  Wednesday: { "9am-1pm": ['HTC2_visite'], "2pm-6pm": ['EMIT'] },
  Thursday: { "9am-1pm": ['HDJ'], "2pm-6pm": ['HTC1', 'EMATIT'] },
  Friday: { "9am-1pm": ['AMI'], "2pm-6pm": ['HTC2', 'EMIT'] }
};

// Use global mock if available (for testing), or default
const expectedActivities = global.expectedActivities || defaultExpectedActivities;

// Strict Round Robin Planning System - Rotation Setting Based
// Only assigns activities to doctors who have them in their rotationSetting
// Maintains consistent "hat" for rotation periods (3-4 weeks between vacations)

console.log('Strict Round Robin Planning System Loaded');

// Helper function to parse French date strings into JavaScript Date objects
const parseFrenchDate = (dateString) => {
  const frenchToEnglishDays = {
    lundi: 'Monday',
    mardi: 'Tuesday',
    mercredi: 'Wednesday',
    jeudi: 'Thursday',
    vendredi: 'Friday',
    samedi: 'Saturday',
    dimanche: 'Sunday',
  };

  const frenchToEnglishMonths = {
    janvier: 'January',
    février: 'February',
    mars: 'March',
    avril: 'April',
    mai: 'May',
    juin: 'June',
    juillet: 'July',
    août: 'August',
    septembre: 'September',
    octobre: 'October',
    novembre: 'November',
    décembre: 'December',
  };

  let dateComponents = dateString.toLowerCase().split(' ');
  if (dateComponents.length >= 3) {
    dateComponents[0] = frenchToEnglishDays[dateComponents[0]] || dateComponents[0];
    dateComponents[2] = frenchToEnglishMonths[dateComponents[2]] || dateComponents[2];
  }

  return new Date(dateComponents.join(' '));
};

/**
 * Calculate rotation boundaries based on vacation periods
 * @returns {Array} Array of rotation periods with start/end dates and weeks
 */
export function calculateRotationBoundaries() {
  console.log('Calculating rotation boundaries based on vacation periods...');
  
  // Use the vacation data from publicHolidays.js
  const vacationPeriods2024 = {
    'Vacances de la Toussaint': {
      Début: 'samedi 19 octobre 2024',
      Fin: 'lundi 4 novembre 2024',
    },
    'Vacances de Noël': {
      Début: 'samedi 21 décembre 2024',
      Fin: 'lundi 6 janvier 2025',
    },
  };

  const vacationPeriods2025 = {
    "Vacances d'hiver": {
      Début: 'samedi 8 février 2025',
      Fin: 'lundi 24 février 2025',
    },
    'Vacances de printemps': {
      Début: 'samedi 5 avril 2025',
      Fin: 'mardi 22 avril 2025',
    },
    "Pont de l'Ascension": {
      Début: 'mercredi 28 mai 2025',
      Fin: 'lundi 2 juin 2025',
    },
    'Grandes vacances': {
      Début: 'samedi 5 juillet 2025',
      Fin: 'samedi 5 septembre 2025',
    },
  };

  const rotationBoundaries = [];
  
  // Start from beginning of school year (September 2024)
  let currentStart = new Date('2024-09-01');
  
  // Process 2024 vacations
  Object.entries(vacationPeriods2024).forEach(([name, period]) => {
    const vacationStart = parseFrenchDate(period.Début);
    const vacationEnd = parseFrenchDate(period.Fin);
    
    // Create rotation period ending before vacation
    const rotationEnd = new Date(vacationStart);
    rotationEnd.setDate(rotationEnd.getDate() - 1); // End day before vacation
    
    const rotationPeriod = {
      name: `Before ${name}`,
      startDate: new Date(currentStart),
      endDate: rotationEnd,
      startWeek: getISOWeek(currentStart),
      endWeek: getISOWeek(rotationEnd),
      year: currentStart.getFullYear(),
      vacationPeriod: name,
      durationWeeks: Math.ceil((rotationEnd - currentStart) / (7 * 24 * 60 * 60 * 1000))
    };
    
    rotationBoundaries.push(rotationPeriod);
    
    // Next rotation starts after vacation
    currentStart = new Date(vacationEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  });
  
  // Process 2025 vacations
  Object.entries(vacationPeriods2025).forEach(([name, period]) => {
    const vacationStart = parseFrenchDate(period.Début);
    const vacationEnd = parseFrenchDate(period.Fin);
    
    const rotationEnd = new Date(vacationStart);
    rotationEnd.setDate(rotationEnd.getDate() - 1);
    
    const rotationPeriod = {
      name: `Before ${name}`,
      startDate: new Date(currentStart),
      endDate: rotationEnd,
      startWeek: getISOWeek(currentStart),
      endWeek: getISOWeek(rotationEnd),
      year: currentStart.getFullYear(),
      vacationPeriod: name,
      durationWeeks: Math.ceil((rotationEnd - currentStart) / (7 * 24 * 60 * 60 * 1000))
    };
    
    rotationBoundaries.push(rotationPeriod);
    
    currentStart = new Date(vacationEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  });
  
  // Add final rotation until end of school year
  const finalRotation = {
    name: 'End of Year',
    startDate: new Date(currentStart),
    endDate: new Date('2025-08-31'),
    startWeek: getISOWeek(currentStart),
    endWeek: getISOWeek(new Date('2025-08-31')),
    year: 2025,
    vacationPeriod: 'End of School Year',
    durationWeeks: Math.ceil((new Date('2025-08-31') - currentStart) / (7 * 24 * 60 * 60 * 1000))
  };
  
  rotationBoundaries.push(finalRotation);
  
  console.log('Calculated rotation boundaries:', rotationBoundaries);
  return rotationBoundaries;
}

/**
 * Get which rotation period a specific week belongs to
 * @param {number} weekNumber - ISO week number
 * @param {number} year - Year
 * @returns {Object|null} Rotation period info or null if not found
 */
export function getRotationPeriodForWeek(weekNumber, year) {
  const rotationBoundaries = calculateRotationBoundaries();
  
  return rotationBoundaries.find(period => {
    if (period.year === year) {
      return weekNumber >= period.startWeek && weekNumber <= period.endWeek;
    }
    // Handle year transitions
    if (period.year === year - 1 && period.endWeek > 50 && weekNumber <= 10) {
      return true; // Week spans year boundary
    }
    if (period.year === year + 1 && period.startWeek <= 10 && weekNumber > 50) {
      return true; // Week spans year boundary
    }
    return false;
  }) || null;
}

/**
 * Get all available doctors
 */
const AVAILABLE_DOCTORS = Object.keys(doctorProfiles);

/**
 * All activities that need to be assigned
 */
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
 * Get doctors who can perform a specific activity based on their rotationSetting (strict mode)
 * Includes HTC activity grouping: doctors with HTC1 can also handle HTC1_visite
 * @param {string} activity - Activity to check
 * @returns {Array} Array of doctor codes who have this activity in their rotationSetting
 */
export function getQualifiedDoctorsStrict(activity) {
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
 * Analyze coverage gaps - activities that cannot be assigned due to rotation setting constraints
 * @returns {Object} Analysis of coverage gaps
 */
export function analyzeCoverageGaps() {
  console.log('Analyzing coverage gaps with strict rotation settings...');
  
  const gapAnalysis = {
    totalActivities: ALL_ACTIVITIES.length,
    coveredActivities: 0,
    uncoveredActivities: [],
    activityCoverage: {},
    recommendedChanges: []
  };
  
  ALL_ACTIVITIES.forEach(activity => {
    const qualifiedDoctors = getQualifiedDoctorsStrict(activity);
    
    gapAnalysis.activityCoverage[activity] = {
      qualifiedDoctors,
      doctorCount: qualifiedDoctors.length,
      isCovered: qualifiedDoctors.length > 0
    };
    
    if (qualifiedDoctors.length === 0) {
      gapAnalysis.uncoveredActivities.push(activity);
      gapAnalysis.recommendedChanges.push(
        `Add ${activity} to at least one doctor's rotationSetting`
      );
    } else {
      gapAnalysis.coveredActivities++;
    }
  });
  
  console.log('Coverage Gap Analysis:', gapAnalysis);
  return gapAnalysis;
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
 * Check if a doctor is available for assignment (not blocked by backbone)
 * @param {string} doctorCode - Doctor code
 * @param {string} day - Day of week
 * @param {string} timeSlot - Time slot
 * @param {string} activity - Activity to assign
 * @param {Object} currentSchedule - Current schedule to check duration constraints (optional)
 * @returns {boolean} True if doctor is available
 */
function isDoctorAvailable(doctorCode, day, timeSlot, activity, currentSchedule = null) {
  const doctorProfile = doctorProfiles[doctorCode];
  if (!doctorProfile) return false;
  
  const backboneActivities = doctorProfile.backbone?.[day]?.[timeSlot] || [];
  
  // Check backbone availability first
  const backboneAvailable = backboneActivities.length === 0 || 
         backboneActivities.every(bActivity => !ALL_ACTIVITIES.includes(bActivity)) ||
         backboneActivities.includes(activity);
  
  if (!backboneAvailable) return false;
  
  // Check duration constraints if current schedule is provided
  if (currentSchedule && currentSchedule[doctorCode]) {
    const doctorCurrentSlot = currentSchedule[doctorCode][day]?.[timeSlot] || [];
    
    // Check if this activity can fit in the remaining time slot
    if (!canActivityFitInTimeSlot(activity, doctorCurrentSlot)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Assign primary activity to doctor for entire rotation period (strict mode)
 * @param {string} doctorCode - Doctor code
 * @param {Object} rotationPeriod - Rotation period info
 * @param {number} roundRobinOffset - Round robin offset for fairness
 * @returns {string|null} Assigned primary activity or null
 */
export function assignPrimaryActivityForRotation(doctorCode, rotationPeriod, roundRobinOffset = 0) {
  const doctorProfile = doctorProfiles[doctorCode];
  if (!doctorProfile || !doctorProfile.rotationSetting) {
    return null;
  }
  
  const availableActivities = doctorProfile.rotationSetting;
  if (availableActivities.length === 0) {
    return null;
  }
  
  // Use round robin to select from available activities
  const selectedIndex = roundRobinOffset % availableActivities.length;
  return availableActivities[selectedIndex];
}

/**
 * Assign activities for a specific time slot using strict rotation settings
 * @param {Array} doctors - Available doctors  
 * @param {string} day - Day of week
 * @param {string} timeSlot - Time slot (9am-1pm or 2pm-6pm)
 * @param {Object} rotationAssignments - Primary activity assignments for rotation
 * @param {Object} currentSchedule - Current schedule state for duration checking
 * @returns {Object} Activity to doctor assignments for this time slot
 */
function assignActivitiesForTimeSlotStrict(doctors, day, timeSlot, rotationAssignments, currentSchedule = {}) {
  const requiredActivities = expectedActivities[day]?.[timeSlot] || [];
  const assignments = {};
  
  // Sort activities by duration (largest first) for better fitting
  const sortedActivities = requiredActivities.sort((a, b) => 
    getActivityDuration(b) - getActivityDuration(a)
  );
  
  // For each required activity, find a qualified doctor
  sortedActivities.forEach(activity => {
    const qualifiedDoctors = getQualifiedDoctorsStrict(activity);
    
    // Filter for doctors who are available (not blocked by backbone and have capacity)
    const availableDoctors = qualifiedDoctors.filter(doctorCode => 
      isDoctorAvailable(doctorCode, day, timeSlot, activity, currentSchedule)
    );
    
    if (availableDoctors.length > 0) {
      let selectedDoctor = null;
      
      // Check for HTC consistency first
      const existingHtcDoctor = getExistingHtcAssignment(currentSchedule, activity);
      if (existingHtcDoctor && availableDoctors.includes(existingHtcDoctor)) {
        // HTC consistency: prefer the doctor already handling this HTC group
        selectedDoctor = existingHtcDoctor;
      } else {
        // Prefer doctor who has this as primary activity for the rotation
        const primaryDoctor = availableDoctors.find(doctorCode => {
          const rootActivity = getHtcRootActivity(activity);
          return rotationAssignments[doctorCode] === rootActivity || rotationAssignments[doctorCode] === activity;
        });
        
        if (primaryDoctor) {
          selectedDoctor = primaryDoctor;
        } else {
          // Use first available qualified doctor (could be enhanced with round robin)
          selectedDoctor = availableDoctors[0];
        }
      }
      
      if (selectedDoctor) {
        assignments[activity] = selectedDoctor;
        
        // Update current schedule to track duration usage
        if (!currentSchedule[selectedDoctor]) {
          currentSchedule[selectedDoctor] = getEmptySchedule();
        }
        if (!currentSchedule[selectedDoctor][day][timeSlot].includes(activity)) {
          currentSchedule[selectedDoctor][day][timeSlot].push(activity);
        }
      }
    }
    // If no qualified doctors available, activity remains unassigned
  });
  
  return assignments;
}

/**
 * Build complete doctor schedules from exclusive activity ownership
 * Each activity is owned by exactly one doctor who handles ALL instances of that activity
 * @param {Object} activityOwnership - Activity to doctor exclusive ownership mapping
 * @param {Array} doctors - List of all doctors
 * @param {Object} rotationPeriod - Rotation period info
 * @returns {Object} Complete doctor schedules
 */
function buildStrictScheduleFromExclusiveAssignments(activityOwnership, doctors, rotationPeriod) {
  console.log('Building schedule from exclusive assignments...');
  
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
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  
  // Apply exclusive activity assignments
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      const requiredActivities = expectedActivities[day]?.[timeSlot] || [];
      
      requiredActivities.forEach(activity => {
        const ownerDoctor = activityOwnership[activity];
        
        if (ownerDoctor && schedule[ownerDoctor]) {
          const doctorSlot = schedule[ownerDoctor][day][timeSlot];
          
          // Only add if not already present and fits duration constraints
          if (!doctorSlot.includes(activity)) {
            // Check if activity can fit in the time slot
            const canFit = canActivityFitInTimeSlot(activity, doctorSlot);
            
            // Check backbone conflicts
            const backboneActivities = doctorProfiles[ownerDoctor]?.backbone?.[day]?.[timeSlot] || [];
            const hasBackboneConflict = backboneActivities.some(bActivity => 
              ALL_ACTIVITIES.includes(bActivity) && bActivity !== activity
            );
            
            if (canFit && !hasBackboneConflict) {
              doctorSlot.push(activity);
              console.log(`Assigned ${activity} to ${ownerDoctor} on ${day} ${timeSlot} (exclusive owner)`);
            } else {
              console.log(`⚠️  Could not assign ${activity} to owner ${ownerDoctor} on ${day} ${timeSlot} - ${!canFit ? 'duration conflict' : 'backbone conflict'}`);
            }
          }
        } else {
          console.log(`⚠️  No owner found for activity: ${activity} on ${day} ${timeSlot}`);
        }
      });
    });
  });
  
  return schedule;
}

/**
 * Build complete doctor schedules from rotation assignments (strict mode) - DEPRECATED
 * @param {Object} rotationAssignments - Primary activity assignments per doctor
 * @param {Array} doctors - List of all doctors
 * @param {Object} rotationPeriod - Rotation period info
 * @returns {Object} Complete doctor schedules
 */
function buildStrictScheduleFromRotationAssignments(rotationAssignments, doctors, rotationPeriod) {
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
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  
  // Apply activity assignments for each day/time slot
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      const slotAssignments = assignActivitiesForTimeSlotStrict(
        doctors, 
        day, 
        timeSlot, 
        rotationAssignments,
        schedule  // Pass current schedule for duration checking
      );
      
      Object.entries(slotAssignments).forEach(([activity, doctorCode]) => {
        if (doctorCode && schedule[doctorCode]) {
          const doctorSlot = schedule[doctorCode][day][timeSlot];
          
          // Only add if not already present and not conflicting with backbone and fits duration
          if (!doctorSlot.includes(activity)) {
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
 * Assign activities exclusively to doctors for entire rotation period
 * Each activity is owned by exactly one doctor for the full period
 * @param {Array} doctors - List of doctor codes
 * @param {Object} rotationPeriod - Rotation period info
 * @param {number} startOffset - Starting offset for round robin fairness
 * @returns {Object} Exclusive activity ownership assignments
 */
function assignActivitiesForRotationPeriod(doctors, rotationPeriod, startOffset = 0) {
  console.log(`Assigning exclusive activities for rotation period: ${rotationPeriod.name}`);
  
  const activityOwnership = {}; // activity -> doctorCode mapping
  const doctorWorkload = {}; // doctorCode -> array of owned activities
  
  // Initialize doctor workload tracking
  doctors.forEach(doctorCode => {
    doctorWorkload[doctorCode] = [];
  });
  
  // Get all activities that need to be assigned during this period
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  const requiredActivities = new Set();
  
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      const activitiesForSlot = expectedActivities[day]?.[timeSlot] || [];
      activitiesForSlot.forEach(activity => requiredActivities.add(activity));
    });
  });
  
  const allRequiredActivities = Array.from(requiredActivities);
  console.log('Required activities for period:', allRequiredActivities);
  
  // Sort activities by priority (HTC groups first, then by duration)
  const sortedActivities = allRequiredActivities.sort((a, b) => {
    // HTC activities get priority
    const aIsHTC = a.startsWith('HTC');
    const bIsHTC = b.startsWith('HTC');
    if (aIsHTC && !bIsHTC) return -1;
    if (!aIsHTC && bIsHTC) return 1;
    
    // Within same category, sort by duration (larger first)
    return getActivityDuration(b) - getActivityDuration(a);
  });
  
  // Assign each activity exclusively to one doctor
  let currentOffset = startOffset;
  
  sortedActivities.forEach((activity, activityIndex) => {
    // Check if this activity is already covered by HTC grouping
    if (activityOwnership[activity]) {
      return; // Skip, already assigned via HTC grouping
    }
    
    const qualifiedDoctors = getQualifiedDoctorsStrict(activity);
    
    if (qualifiedDoctors.length === 0) {
      console.log(`⚠️  No qualified doctors found for activity: ${activity}`);
      return;
    }
    
    // Use round robin to select doctor, considering current workload
    let selectedDoctor = null;
    let attemptCount = 0;
    
    while (!selectedDoctor && attemptCount < qualifiedDoctors.length) {
      const candidateIndex = (currentOffset + activityIndex + attemptCount) % qualifiedDoctors.length;
      const candidateDoctor = qualifiedDoctors[candidateIndex];
      
      // Check if this doctor can take on this activity (capacity-based selection)
      const currentWorkloadHours = doctorWorkload[candidateDoctor].reduce((total, act) => 
        total + getActivityDuration(act), 0
      );
      
      // Simple capacity check - don't overload doctors
      const maxWorkloadPerPeriod = 20; // hours per rotation period
      if (currentWorkloadHours + getActivityDuration(activity) <= maxWorkloadPerPeriod) {
        selectedDoctor = candidateDoctor;
      }
      
      attemptCount++;
    }
    
    // If no doctor found with capacity, use first qualified doctor
    if (!selectedDoctor) {
      selectedDoctor = qualifiedDoctors[0];
    }
    
    // Assign activity exclusively to this doctor
    activityOwnership[activity] = selectedDoctor;
    doctorWorkload[selectedDoctor].push(activity);
    
    console.log(`${activity} → ${selectedDoctor} (exclusive ownership)`);
    
    // Handle HTC grouping - if assigning HTC1, also assign HTC1_visite exclusively
    const htcGroup = getHtcActivityGroup(activity);
    if (htcGroup.length > 1) {
      htcGroup.forEach(groupActivity => {
        if (groupActivity !== activity && allRequiredActivities.includes(groupActivity)) {
          activityOwnership[groupActivity] = selectedDoctor;
          if (!doctorWorkload[selectedDoctor].includes(groupActivity)) {
            doctorWorkload[selectedDoctor].push(groupActivity);
            console.log(`${groupActivity} → ${selectedDoctor} (HTC grouping)`);
          }
        }
      });
    }
    
    currentOffset = (currentOffset + 1) % Math.max(qualifiedDoctors.length, 1);
  });
  
  console.log('Final activity ownership:', activityOwnership);
  console.log('Doctor workloads:', doctorWorkload);
  
  return {
    activityOwnership,
    doctorWorkload
  };
}

/**
 * Generate strict round robin scenario for a single rotation period with exclusive assignment
 * @param {Array} doctors - List of doctor codes
 * @param {Object} rotationPeriod - Rotation period info
 * @param {number} startOffset - Starting offset for round robin fairness
 * @returns {Object} Complete assignment scenario for rotation period
 */
export function generateStrictRotationScenario(doctors, rotationPeriod, startOffset = 0) {
  console.log(`Generating strict scenario for rotation period: ${rotationPeriod.name}`);
  
  // Phase 1: Assign activities exclusively to doctors for entire period
  const periodAssignments = assignActivitiesForRotationPeriod(doctors, rotationPeriod, startOffset);
  
  // Phase 2: Build complete weekly schedule based on exclusive assignments
  const weeklySchedule = buildStrictScheduleFromExclusiveAssignments(
    periodAssignments.activityOwnership,
    doctors, 
    rotationPeriod
  );
  
  return {
    rotationPeriod,
    activityOwnership: periodAssignments.activityOwnership,
    doctorWorkload: periodAssignments.doctorWorkload,
    weeklySchedule
  };
}

/**
 * Generate complete strict round robin schedule for all rotation periods
 * @param {Array} doctors - List of doctor codes (default: all available)
 * @param {number} maxRotations - Maximum number of rotations to generate (default: all)
 * @returns {Object} Complete schedule across all rotation periods
 */
export function generateCompleteStrictSchedule(
  doctors = AVAILABLE_DOCTORS,
  maxRotations = null
) {
  console.log('Generating complete strict round robin schedule...');
  
  const rotationBoundaries = calculateRotationBoundaries();
  const rotationsToGenerate = maxRotations ? 
    rotationBoundaries.slice(0, maxRotations) : 
    rotationBoundaries;
  
  const completeSchedule = {};
  let globalOffset = 0;
  
  rotationsToGenerate.forEach((rotationPeriod, periodIndex) => {
    const rotationScenario = generateStrictRotationScenario(
      doctors, 
      rotationPeriod, 
      globalOffset
    );
    
    completeSchedule[rotationPeriod.name] = rotationScenario;
    
    // Rotate offset for fairness across rotation periods
    globalOffset = (globalOffset + 1) % Math.max(doctors.length, 1);
  });
  
  return completeSchedule;
}

/**
 * Validate exclusive activity assignment (no sharing between doctors within periods)
 * @param {Object} schedule - Complete schedule to analyze
 * @returns {Object} Exclusivity validation results
 */
function validateActivityExclusivity(schedule) {
  const validation = {
    exclusivityViolations: [],
    totalViolations: 0,
    compliancePercentage: 100,
    activityOwnership: {}, // activity -> set of doctors who handle it
    summary: {
      activitiesChecked: 0,
      exclusiveActivities: 0,
      sharedActivities: 0
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];

  // Track activity ownership across all rotation periods
  Object.entries(schedule).forEach(([rotationName, rotationData]) => {
    if (rotationData.weeklySchedule) {
      Object.entries(rotationData.weeklySchedule).forEach(([doctorCode, doctorSchedule]) => {
        days.forEach(day => {
          timeSlots.forEach(timeSlot => {
            const activities = doctorSchedule[day]?.[timeSlot] || [];
            const medicalActivities = activities.filter(activity => ALL_ACTIVITIES.includes(activity));

            medicalActivities.forEach(activity => {
              if (!validation.activityOwnership[activity]) {
                validation.activityOwnership[activity] = new Set();
              }
              validation.activityOwnership[activity].add(`${rotationName}:${doctorCode}`);
            });
          });
        });
      });
    }
  });

  // Check for violations (same activity handled by multiple doctors in same period)
  Object.entries(validation.activityOwnership).forEach(([activity, ownerSet]) => {
    validation.summary.activitiesChecked++;
    
    // Group by rotation period to check exclusivity within periods
    const ownersByPeriod = {};
    ownerSet.forEach(owner => {
      const [rotationName, doctorCode] = owner.split(':');
      if (!ownersByPeriod[rotationName]) {
        ownersByPeriod[rotationName] = new Set();
      }
      ownersByPeriod[rotationName].add(doctorCode);
    });

    // Check if any period has multiple doctors for same activity
    let hasViolation = false;
    Object.entries(ownersByPeriod).forEach(([rotationName, doctorsInPeriod]) => {
      if (doctorsInPeriod.size > 1) {
        validation.exclusivityViolations.push({
          activity,
          rotationPeriod: rotationName,
          violatingDoctors: Array.from(doctorsInPeriod),
          violation: `Activity ${activity} is shared between ${doctorsInPeriod.size} doctors in period ${rotationName}`
        });
        hasViolation = true;
      }
    });

    if (hasViolation) {
      validation.summary.sharedActivities++;
    } else {
      validation.summary.exclusiveActivities++;
    }
  });

  validation.totalViolations = validation.exclusivityViolations.length;
  
  if (validation.summary.activitiesChecked > 0) {
    validation.compliancePercentage = 
      (validation.summary.exclusiveActivities / validation.summary.activitiesChecked) * 100;
  }

  return validation;
}

/**
 * Analyze schedule for rule compliance (duration and rotation settings)
 * @param {Object} schedule - Complete schedule to analyze
 * @returns {Object} Rule compliance analysis
 */
function analyzeRuleCompliance(schedule) {
  const compliance = {
    durationViolations: [],
    rotationSettingViolations: [],
    totalViolations: 0,
    compliancePercentage: 100,
    summary: {
      durationViolationCount: 0,
      rotationSettingViolationCount: 0,
      totalSlotsChecked: 0
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];

  Object.entries(schedule).forEach(([rotationName, rotationData]) => {
    if (rotationData.weeklySchedule) {
      Object.entries(rotationData.weeklySchedule).forEach(([doctorCode, doctorSchedule]) => {
        const doctorProfile = doctorProfiles[doctorCode];
        if (!doctorProfile) return;

        days.forEach(day => {
          timeSlots.forEach(timeSlot => {
            compliance.summary.totalSlotsChecked++;
            const activities = doctorSchedule[day]?.[timeSlot] || [];
            const medicalActivities = activities.filter(activity => ALL_ACTIVITIES.includes(activity));

            // Check duration violations
            const totalDuration = medicalActivities.reduce((sum, activity) => 
              sum + getActivityDuration(activity), 0
            );

            if (totalDuration > TIME_SLOT_DURATION) {
              compliance.durationViolations.push({
                rotation: rotationName,
                doctor: doctorCode,
                day,
                timeSlot,
                activities: medicalActivities,
                totalDuration,
                exceeds: totalDuration - TIME_SLOT_DURATION,
                violation: `Duration ${totalDuration}h exceeds slot capacity ${TIME_SLOT_DURATION}h`
              });
              compliance.summary.durationViolationCount++;
            }

            // Check rotation setting violations
            if (doctorProfile.rotationSetting) {
              medicalActivities.forEach(activity => {
                if (!doctorProfile.rotationSetting.includes(activity)) {
                  compliance.rotationSettingViolations.push({
                    rotation: rotationName,
                    doctor: doctorCode,
                    day,
                    timeSlot,
                    activity,
                    allowedActivities: doctorProfile.rotationSetting,
                    violation: `Activity ${activity} not in doctor's rotationSetting`
                  });
                  compliance.summary.rotationSettingViolationCount++;
                }
              });
            }
          });
        });
      });
    }
  });

  compliance.totalViolations = compliance.summary.durationViolationCount + compliance.summary.rotationSettingViolationCount;
  
  if (compliance.summary.totalSlotsChecked > 0) {
    compliance.compliancePercentage = Math.max(0, 
      ((compliance.summary.totalSlotsChecked - compliance.totalViolations) / compliance.summary.totalSlotsChecked) * 100
    );
  }

  return compliance;
}

/**
 * Analyze strict schedule for coverage and conflicts
 * @param {Object} strictSchedule - Complete strict schedule
 * @returns {Object} Analysis results
 */
export function analyzeStrictSchedule(strictSchedule) {
  const analysis = {
    totalRotations: Object.keys(strictSchedule).length,
    coverageGaps: {},
    rotationConsistency: {},
    overallCoverage: {
      totalSlots: 0,
      coveredSlots: 0,
      uncoveredSlots: 0,
      coveragePercentage: 0
    },
    activityDistribution: {},
    recommendations: []
  };
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];
  
  // Initialize activity distribution tracking
  ALL_ACTIVITIES.forEach(activity => {
    analysis.activityDistribution[activity] = {
      totalAssignments: 0,
      assignedDoctors: new Set(),
      rotationsWithActivity: 0
    };
  });
  
  // Analyze each rotation period
  Object.entries(strictSchedule).forEach(([rotationName, rotationData]) => {
    analysis.coverageGaps[rotationName] = {};
    analysis.rotationConsistency[rotationName] = {};
    
    // Track primary activities for consistency check
    const primaryActivities = rotationData.rotationAssignments || {};
    
    days.forEach(day => {
      analysis.coverageGaps[rotationName][day] = {};
      
      timeSlots.forEach(timeSlot => {
        const expectedForSlot = expectedActivities[day]?.[timeSlot] || [];
        const assignedActivities = [];
        
        // Collect assigned activities from all doctors
        Object.entries(rotationData.weeklySchedule || {}).forEach(([doctorCode, schedule]) => {
          if (schedule && schedule[day] && schedule[day][timeSlot]) {
            schedule[day][timeSlot].forEach(activity => {
              if (ALL_ACTIVITIES.includes(activity)) {
                assignedActivities.push(activity);
                
                // Update activity distribution
                analysis.activityDistribution[activity].totalAssignments++;
                analysis.activityDistribution[activity].assignedDoctors.add(doctorCode);
              }
            });
          }
        });
        
        // Find missing activities
        const missingActivities = expectedForSlot.filter(activity => 
          !assignedActivities.includes(activity)
        );
        
        analysis.coverageGaps[rotationName][day][timeSlot] = {
          expected: expectedForSlot,
          assigned: assignedActivities,
          missing: missingActivities,
          coveragePercentage: expectedForSlot.length > 0 ? 
            ((expectedForSlot.length - missingActivities.length) / expectedForSlot.length) * 100 : 100
        };
        
        // Update overall coverage stats
        analysis.overallCoverage.totalSlots++;
        if (missingActivities.length === 0) {
          analysis.overallCoverage.coveredSlots++;
        } else {
          analysis.overallCoverage.uncoveredSlots++;
        }
      });
    });
    
    // Check rotation consistency (same doctor should keep same primary activity)
    Object.entries(primaryActivities).forEach(([doctorCode, primaryActivity]) => {
      analysis.rotationConsistency[rotationName][doctorCode] = {
        primaryActivity,
        consistentAssignment: true // In this implementation, it's always consistent
      };
    });
  });
  
  // Calculate overall coverage percentage
  if (analysis.overallCoverage.totalSlots > 0) {
    analysis.overallCoverage.coveragePercentage = 
      (analysis.overallCoverage.coveredSlots / analysis.overallCoverage.totalSlots) * 100;
  }
  
  // Update activity distribution stats
  Object.keys(analysis.activityDistribution).forEach(activity => {
    const dist = analysis.activityDistribution[activity];
    dist.rotationsWithActivity = Object.keys(strictSchedule).filter(rotationName => {
      const rotationData = strictSchedule[rotationName];
      return Object.values(rotationData.rotationAssignments || {}).includes(activity);
    }).length;
    
    dist.assignedDoctors = Array.from(dist.assignedDoctors);
  });
  
  // Generate recommendations
  if (analysis.overallCoverage.coveragePercentage < 80) {
    analysis.recommendations.push(
      'Overall coverage is below 80%. Consider revising rotation settings.'
    );
  }
  
  Object.entries(analysis.activityDistribution).forEach(([activity, dist]) => {
    if (dist.assignedDoctors.length === 0) {
      analysis.recommendations.push(
        `Activity ${activity} has no qualified doctors. Add to rotation settings.`
      );
    } else if (dist.assignedDoctors.length === 1) {
      analysis.recommendations.push(
        `Activity ${activity} only has one qualified doctor (${dist.assignedDoctors[0]}). Consider cross-training.`
      );
    }
  });
  
  return analysis;
}

/**
 * Compare strict schedule with current system
 * @param {Object} strictSchedule - Strict schedule
 * @param {Object} currentSchedule - Current system schedule (optional)
 * @returns {Object} Comparison results
 */
export function compareWithCurrentSystem(strictSchedule, currentSchedule = null) {
  console.log('Comparing strict schedule with current system...');
  
  const comparison = {
    strictSchedule: analyzeStrictSchedule(strictSchedule),
    currentSchedule: currentSchedule ? analyzeStrictSchedule(currentSchedule) : null,
    improvements: [],
    regressions: [],
    summary: {}
  };
  
  if (currentSchedule) {
    const strictCoverage = comparison.strictSchedule.overallCoverage.coveragePercentage;
    const currentCoverage = comparison.currentSchedule.overallCoverage.coveragePercentage;
    
    comparison.summary.coverageDifference = strictCoverage - currentCoverage;
    
    if (strictCoverage > currentCoverage) {
      comparison.improvements.push(
        `Coverage improved by ${(strictCoverage - currentCoverage).toFixed(1)}%`
      );
    } else if (strictCoverage < currentCoverage) {
      comparison.regressions.push(
        `Coverage decreased by ${(currentCoverage - strictCoverage).toFixed(1)}%`
      );
    }
  }
  
  comparison.summary.rotationConsistency = 'Strict mode ensures rotation consistency';
  comparison.summary.qualifiedDoctorsOnly = 'Only assigns activities to doctors with rotation settings';
  
  return comparison;
}

/**
 * Generate detailed report of strict round robin implementation
 * @param {Object} strictSchedule - Complete strict schedule
 * @returns {Object} Detailed report
 */
export function generateStrictScheduleReport(strictSchedule) {
  console.log('Generating detailed strict schedule report...');
  
  const gapAnalysis = analyzeCoverageGaps();
  const scheduleAnalysis = analyzeStrictSchedule(strictSchedule);
  const rotationBoundaries = calculateRotationBoundaries();
  
  const report = {
    timestamp: new Date().toISOString(),
    systemType: 'Strict Round Robin (Rotation Setting Based)',
    rotationBoundaries,
    gapAnalysis,
    scheduleAnalysis,
    summary: {
      totalRotations: Object.keys(strictSchedule).length,
      averageRotationDuration: rotationBoundaries.reduce((sum, rotation) => 
        sum + rotation.durationWeeks, 0) / rotationBoundaries.length,
      overallCoveragePercentage: scheduleAnalysis.overallCoverage.coveragePercentage,
      activitiesWithGaps: gapAnalysis.uncoveredActivities,
      recommendationsCount: scheduleAnalysis.recommendations.length
    },
    detailedRecommendations: [
      ...gapAnalysis.recommendedChanges,
      ...scheduleAnalysis.recommendations
    ]
  };
  
  console.log('Strict Schedule Report Summary:', report.summary);
  
  return report;
}

export { 
  AVAILABLE_DOCTORS,
  ALL_ACTIVITIES,
  TIME_SLOT_DURATION,
  getEmptySchedule,
  isDoctorAvailable,
  assignActivitiesForTimeSlotStrict,
  buildStrictScheduleFromRotationAssignments,
  buildStrictScheduleFromExclusiveAssignments,
  getActivityDuration,
  getRemainingCapacity,
  canActivityFitInTimeSlot,
  analyzeRuleCompliance,
  validateActivityExclusivity,
  getHtcRootActivity,
  getHtcActivityGroup,
  getExistingHtcAssignment
};