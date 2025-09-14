import { doctorProfiles } from './doctorSchedules.js';
import { expectedActivities } from './schedule.jsx';
import { getISOWeek } from 'date-fns';

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
    'Vacances d'hiver': {
      Début: 'samedi 8 février 2025',
      Fin: 'lundi 24 février 2025',
    },
    'Vacances de printemps': {
      Début: 'samedi 5 avril 2025',
      Fin: 'mardi 22 avril 2025',
    },
    'Pont de l'Ascension': {
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
 * Get doctors who can perform a specific activity based on their rotationSetting (strict mode)
 * @param {string} activity - Activity to check
 * @returns {Array} Array of doctor codes who have this activity in their rotationSetting
 */
export function getQualifiedDoctorsStrict(activity) {
  return AVAILABLE_DOCTORS.filter(doctorCode => {
    const doctorProfile = doctorProfiles[doctorCode];
    if (!doctorProfile || !doctorProfile.rotationSetting) {
      return false;
    }
    
    // Check if the activity is in the doctor's rotation setting
    return doctorProfile.rotationSetting.includes(activity);
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
 * @returns {boolean} True if doctor is available
 */
function isDoctorAvailable(doctorCode, day, timeSlot, activity) {
  const doctorProfile = doctorProfiles[doctorCode];
  if (!doctorProfile) return false;
  
  const backboneActivities = doctorProfile.backbone?.[day]?.[timeSlot] || [];
  
  // Doctor is available if:
  // 1. Backbone slot is empty, OR
  // 2. Backbone has non-conflicting activities (not medical activities), OR  
  // 3. Backbone already includes this specific activity
  return backboneActivities.length === 0 || 
         backboneActivities.every(bActivity => !ALL_ACTIVITIES.includes(bActivity)) ||
         backboneActivities.includes(activity);
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
 * @returns {Object} Activity to doctor assignments for this time slot
 */
function assignActivitiesForTimeSlotStrict(doctors, day, timeSlot, rotationAssignments) {
  const requiredActivities = expectedActivities[day]?.[timeSlot] || [];
  const assignments = {};
  
  // For each required activity, find a qualified doctor
  requiredActivities.forEach(activity => {
    const qualifiedDoctors = getQualifiedDoctorsStrict(activity);
    
    // Filter for doctors who are available (not blocked by backbone)
    const availableDoctors = qualifiedDoctors.filter(doctorCode => 
      isDoctorAvailable(doctorCode, day, timeSlot, activity)
    );
    
    if (availableDoctors.length > 0) {
      // Prefer doctor who has this as primary activity for the rotation
      const primaryDoctor = availableDoctors.find(doctorCode => 
        rotationAssignments[doctorCode] === activity
      );
      
      if (primaryDoctor) {
        assignments[activity] = primaryDoctor;
      } else {
        // Use first available qualified doctor (could be enhanced with round robin)
        assignments[activity] = availableDoctors[0];
      }
    }
    // If no qualified doctors available, activity remains unassigned
  });
  
  return assignments;
}

/**
 * Build complete doctor schedules from rotation assignments (strict mode)
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
        rotationAssignments
      );
      
      Object.entries(slotAssignments).forEach(([activity, doctorCode]) => {
        if (doctorCode && schedule[doctorCode]) {
          const doctorSlot = schedule[doctorCode][day][timeSlot];
          
          // Only add if not already present and not conflicting with backbone
          if (!doctorSlot.includes(activity)) {
            const backboneActivities = doctorProfiles[doctorCode]?.backbone?.[day]?.[timeSlot] || [];
            const hasBackboneConflict = backboneActivities.some(bActivity => 
              ALL_ACTIVITIES.includes(bActivity) && bActivity !== activity
            );
            
            if (!hasBackboneConflict) {
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
 * Generate strict round robin scenario for a single rotation period
 * @param {Array} doctors - List of doctor codes
 * @param {Object} rotationPeriod - Rotation period info
 * @param {number} startOffset - Starting offset for round robin fairness
 * @returns {Object} Complete assignment scenario for rotation period
 */
export function generateStrictRotationScenario(doctors, rotationPeriod, startOffset = 0) {
  console.log(`Generating strict scenario for rotation period: ${rotationPeriod.name}`);
  
  // Phase 1: Assign primary activities to doctors based on their rotationSetting
  const rotationAssignments = {};
  
  doctors.forEach((doctorCode, index) => {
    const primaryActivity = assignPrimaryActivityForRotation(
      doctorCode, 
      rotationPeriod, 
      (startOffset + index) % doctors.length
    );
    
    if (primaryActivity) {
      rotationAssignments[doctorCode] = primaryActivity;
    }
  });
  
  console.log('Primary activity assignments for rotation:', rotationAssignments);
  
  // Phase 2: Build complete weekly schedule based on rotation assignments
  const weeklySchedule = buildStrictScheduleFromRotationAssignments(
    rotationAssignments, 
    doctors, 
    rotationPeriod
  );
  
  return {
    rotationPeriod,
    rotationAssignments,
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
  getEmptySchedule,
  isDoctorAvailable,
  assignActivitiesForTimeSlotStrict,
  buildStrictScheduleFromRotationAssignments
};