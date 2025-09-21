import { doctorProfiles, rotationTemplates } from './doctorSchedules.js';
import { expectedActivities } from './schedule.jsx';
import { calculateRotationBoundaries } from './strictRoundRobinPlanning.js';

// Simplified Round Robin Planning System
// Inverts the structure: rotation -> available doctors instead of doctor -> rotations
// Uses true round robin assignment with timeframe-based periods

console.log('Simplified Round Robin Planning System Loaded');

/**
 * Build rotation-to-doctors mapping from existing rotationSetting arrays
 * This inverts the current structure to make round robin assignment easier
 * @returns {Object} rotationAvailability - {rotation: [availableDoctors]}
 */
export function buildRotationAvailability() {
  console.log('Building rotation availability mapping...');

  const rotationAvailability = {};

  // Extract all unique rotations from doctor profiles
  Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
    if (profile.rotationSetting && Array.isArray(profile.rotationSetting)) {
      profile.rotationSetting.forEach(rotation => {
        if (!rotationAvailability[rotation]) {
          rotationAvailability[rotation] = [];
        }
        if (!rotationAvailability[rotation].includes(doctorCode)) {
          rotationAvailability[rotation].push(doctorCode);
        }
      });
    }
  });

  console.log('Rotation availability mapping:', rotationAvailability);
  return rotationAvailability;
}

/**
 * Get all rotations that need to be assigned
 * @returns {Array} List of all required rotations
 */
export function getAllRequiredRotations() {
  const rotationAvailability = buildRotationAvailability();
  return Object.keys(rotationAvailability);
}

/**
 * Round robin assignment for a specific timeframe
 * Assigns each rotation to exactly one doctor for the entire timeframe
 * Ensures one rotation per doctor per timeframe with proper conflict prevention
 * @param {Object} timeframePeriod - Timeframe period info from calculateRotationBoundaries()
 * @param {number} globalOffset - Global offset for fairness across timeframes
 * @returns {Object} rotationAssignments - {rotation: assignedDoctor}
 */
export function assignRotationsForTimeframe(timeframePeriod, globalOffset = 0) {
  console.log(`Assigning rotations for timeframe: ${timeframePeriod.name}`);

  const rotationAvailability = buildRotationAvailability();
  const rotationAssignments = {};
  const doctorWorkload = {}; // Track assignments per doctor
  const unassignedRotations = []; // Track rotations that couldn't be assigned

  // Initialize doctor workload tracking
  Object.keys(doctorProfiles).forEach(doctorCode => {
    doctorWorkload[doctorCode] = [];
  });

  // Get all rotations that need assignment
  const rotationsToAssign = Object.keys(rotationAvailability);

  // Sort rotations by number of available doctors (ascending) - assign constrained rotations first
  rotationsToAssign.sort((a, b) => {
    const aAvailable = rotationAvailability[a].length;
    const bAvailable = rotationAvailability[b].length;
    if (aAvailable !== bAvailable) {
      return aAvailable - bAvailable; // Fewer available doctors = higher priority
    }
    return a.localeCompare(b); // Alphabetical as secondary sort
  });

  console.log('Rotations to assign (by constraint priority):', rotationsToAssign);

  // Assign each rotation to one doctor using improved round robin
  rotationsToAssign.forEach((rotation, rotationIndex) => {
    const availableDoctors = rotationAvailability[rotation];

    if (availableDoctors.length === 0) {
      console.warn(`No doctors available for rotation: ${rotation}`);
      unassignedRotations.push({ rotation, reason: 'No qualified doctors' });
      return;
    }

    // Filter out doctors who already have assignments (enforce one rotation per doctor)
    const availableUnassignedDoctors = availableDoctors.filter(doctorCode =>
      doctorWorkload[doctorCode].length === 0
    );

    let assignedDoctor = null;

    if (availableUnassignedDoctors.length > 0) {
      // Use round robin among unassigned doctors
      const roundRobinIndex = (globalOffset + rotationIndex) % availableUnassignedDoctors.length;
      assignedDoctor = availableUnassignedDoctors[roundRobinIndex];

      console.log(`${rotation} → ${assignedDoctor} (unassigned doctors: ${availableUnassignedDoctors.length}, index: ${roundRobinIndex})`);
    } else {
      // All qualified doctors already have assignments - try to find best fit
      console.warn(`All qualified doctors for ${rotation} already have assignments: ${availableDoctors.map(d => `${d}(${doctorWorkload[d].join(',')})`).join(', ')}`);

      // Find doctor with minimum workload as fallback
      const doctorWorkloadCounts = availableDoctors.map(doctorCode => ({
        doctor: doctorCode,
        workload: doctorWorkload[doctorCode].length
      }));

      doctorWorkloadCounts.sort((a, b) => a.workload - b.workload);
      assignedDoctor = doctorWorkloadCounts[0].doctor;

      console.log(`Fallback assignment: ${rotation} → ${assignedDoctor} (workload: ${doctorWorkload[assignedDoctor].length})`);
    }

    if (assignedDoctor) {
      // Assign rotation to doctor
      rotationAssignments[rotation] = assignedDoctor;
      doctorWorkload[assignedDoctor].push(rotation);
    } else {
      unassignedRotations.push({ rotation, reason: 'Assignment algorithm failed' });
    }
  });

  // Log assignment results
  console.log('Final rotation assignments:', rotationAssignments);
  console.log('Doctor workloads:', doctorWorkload);

  if (unassignedRotations.length > 0) {
    console.warn('Unassigned rotations:', unassignedRotations);
  }

  // Calculate assignment statistics
  const assignedDoctorCount = Object.values(doctorWorkload).filter(workload => workload.length > 0).length;
  const totalDoctors = Object.keys(doctorProfiles).length;
  const multipleAssignmentDoctors = Object.entries(doctorWorkload)
    .filter(([_, workload]) => workload.length > 1)
    .map(([doctor, workload]) => ({ doctor, rotations: workload }));

  console.log(`Assignment summary: ${assignedDoctorCount}/${totalDoctors} doctors have assignments`);
  if (multipleAssignmentDoctors.length > 0) {
    console.warn('Doctors with multiple rotations:', multipleAssignmentDoctors);
  }

  return {
    timeframePeriod,
    rotationAssignments,
    doctorWorkload,
    unassignedRotations,
    assignmentStats: {
      assignedDoctorCount,
      totalDoctors,
      multipleAssignmentDoctors
    }
  };
}

/**
 * Generate complete round robin schedule for all timeframes
 * @param {number} maxTimeframes - Maximum number of timeframes to process (null for all)
 * @returns {Object} Complete schedule across all timeframes
 */
export function generateCompleteSimplifiedSchedule(maxTimeframes = null) {
  console.log('Generating complete simplified round robin schedule...');

  const rotationBoundaries = calculateRotationBoundaries();
  const timeframesToProcess = maxTimeframes ?
    rotationBoundaries.slice(0, maxTimeframes) :
    rotationBoundaries;

  const completeSchedule = {};
  let globalOffset = 0;

  timeframesToProcess.forEach((timeframePeriod, timeframeIndex) => {
    const timeframeAssignments = assignRotationsForTimeframe(timeframePeriod, globalOffset);

    completeSchedule[timeframePeriod.name] = timeframeAssignments;

    // Rotate global offset for fairness across timeframes
    const totalDoctors = Object.keys(doctorProfiles).length;
    globalOffset = (globalOffset + 1) % Math.max(totalDoctors, 1);
  });

  console.log('Complete simplified schedule generated');
  return completeSchedule;
}

/**
 * Build detailed doctor schedules from rotation assignments
 * Uses existing rotation templates and doctor backbone constraints
 * @param {Object} rotationAssignments - {rotation: assignedDoctor}
 * @param {Object} timeframePeriod - Timeframe period info
 * @returns {Object} Detailed doctor schedules
 */
export function buildDetailedScheduleFromAssignments(rotationAssignments, timeframePeriod) {
  console.log(`Building detailed schedule for timeframe: ${timeframePeriod.name}`);

  const detailedSchedule = {};

  // Initialize all doctors with their backbone schedules
  Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
    if (profile.backbone) {
      detailedSchedule[doctorCode] = JSON.parse(JSON.stringify(profile.backbone));
    } else {
      // Create empty schedule if no backbone
      detailedSchedule[doctorCode] = {
        Monday: { "9am-1pm": [], "2pm-6pm": [] },
        Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
        Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
        Thursday: { "9am-1pm": [], "2pm-6pm": [] },
        Friday: { "9am-1pm": [], "2pm-6pm": [] },
      };
    }
  });

  // Apply rotation assignments to doctor schedules
  Object.entries(rotationAssignments).forEach(([rotation, assignedDoctor]) => {
    const rotationTemplate = rotationTemplates[rotation];

    if (!rotationTemplate) {
      console.warn(`No template found for rotation: ${rotation}`);
      return;
    }

    if (!detailedSchedule[assignedDoctor]) {
      console.warn(`Assigned doctor ${assignedDoctor} not found in detailed schedule`);
      return;
    }

    // Merge rotation template with doctor's schedule
    Object.entries(rotationTemplate).forEach(([day, daySlots]) => {
      Object.entries(daySlots).forEach(([timeSlot, activities]) => {
        const doctorSlot = detailedSchedule[assignedDoctor][day][timeSlot];

        // Only add activities if the slot is empty (backbone takes precedence)
        if (doctorSlot.length === 0) {
          detailedSchedule[assignedDoctor][day][timeSlot] = [...activities];
          console.log(`Added ${activities.join(', ')} to ${assignedDoctor} on ${day} ${timeSlot} (from ${rotation})`);
        } else {
          console.log(`Skipped ${activities.join(', ')} for ${assignedDoctor} on ${day} ${timeSlot} - backbone constraint: ${doctorSlot.join(', ')}`);
        }
      });
    });
  });

  return detailedSchedule;
}

/**
 * Validate schedule for missing activities and conflicts
 * @param {Object} detailedSchedule - Complete doctor schedules
 * @param {Object} timeframePeriod - Timeframe period info
 * @returns {Object} Validation results
 */
export function validateSchedule(detailedSchedule, timeframePeriod) {
  console.log(`Validating schedule for timeframe: ${timeframePeriod.name}`);

  const validation = {
    missingActivities: [],
    duplicateActivities: [],
    conflicts: [],
    coveragePercentage: 0,
    totalSlots: 0,
    coveredSlots: 0
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];

  // Check each day and time slot
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      const expectedForSlot = expectedActivities[day]?.[timeSlot] || [];
      const assignedActivities = [];
      const activityDoctorMap = {}; // Track which doctor is assigned to each activity

      validation.totalSlots++;

      // Collect all activities assigned by all doctors for this slot
      Object.entries(detailedSchedule).forEach(([doctorCode, schedule]) => {
        const doctorActivities = schedule[day]?.[timeSlot] || [];
        doctorActivities.forEach(activity => {
          assignedActivities.push(activity);

          if (!activityDoctorMap[activity]) {
            activityDoctorMap[activity] = [];
          }
          activityDoctorMap[activity].push(doctorCode);
        });
      });

      // Check for missing activities
      const missingActivities = expectedForSlot.filter(activity =>
        !assignedActivities.includes(activity)
      );

      if (missingActivities.length > 0) {
        validation.missingActivities.push({
          day,
          timeSlot,
          missingActivities,
          expectedActivities: expectedForSlot,
          assignedActivities
        });
      }

      // Check for duplicate assignments (same activity assigned to multiple doctors)
      Object.entries(activityDoctorMap).forEach(([activity, doctors]) => {
        if (doctors.length > 1) {
          validation.duplicateActivities.push({
            day,
            timeSlot,
            activity,
            assignedDoctors: doctors,
            conflict: `Activity ${activity} assigned to multiple doctors: ${doctors.join(', ')}`
          });
        }
      });

      // Check if slot is fully covered
      if (missingActivities.length === 0) {
        validation.coveredSlots++;
      }
    });
  });

  // Calculate coverage percentage
  if (validation.totalSlots > 0) {
    validation.coveragePercentage = (validation.coveredSlots / validation.totalSlots) * 100;
  }

  console.log('Validation results:', {
    coveragePercentage: validation.coveragePercentage,
    missingCount: validation.missingActivities.length,
    duplicateCount: validation.duplicateActivities.length
  });

  return validation;
}

/**
 * Generate complete simplified round robin schedule with detailed schedules and validation
 * @param {number} maxTimeframes - Maximum number of timeframes to process
 * @returns {Object} Complete schedule with validation
 */
export function generateCompleteValidatedSchedule(maxTimeframes = null) {
  console.log('Generating complete validated simplified schedule...');

  const rotationAssignments = generateCompleteSimplifiedSchedule(maxTimeframes);
  const completeSchedule = {};

  Object.entries(rotationAssignments).forEach(([timeframeName, timeframeData]) => {
    // Build detailed schedule for this timeframe
    const detailedSchedule = buildDetailedScheduleFromAssignments(
      timeframeData.rotationAssignments,
      timeframeData.timeframePeriod
    );

    // Validate the schedule
    const validation = validateSchedule(detailedSchedule, timeframeData.timeframePeriod);

    completeSchedule[timeframeName] = {
      ...timeframeData,
      detailedSchedule,
      validation
    };
  });

  return completeSchedule;
}

/**
 * Generate summary report of the simplified round robin system
 * @param {Object} completeSchedule - Complete validated schedule
 * @returns {Object} Summary report
 */
export function generateSimplifiedScheduleReport(completeSchedule) {
  const report = {
    timestamp: new Date().toISOString(),
    systemType: 'Simplified Round Robin (Rotation-to-Doctors Mapping)',
    totalTimeframes: Object.keys(completeSchedule).length,
    rotationAvailability: buildRotationAvailability(),
    overallStats: {
      totalMissingActivities: 0,
      totalDuplicateActivities: 0,
      averageCoveragePercentage: 0,
      timeframesWithFullCoverage: 0,
      totalAssignedDoctors: 0,
      totalUnassignedRotations: 0,
      doctorsWithMultipleRotations: 0
    },
    timeframeResults: {},
    recommendations: []
  };

  let totalCoverage = 0;
  let totalAssignedDoctors = 0;
  let totalUnassignedRotations = 0;
  let totalMultipleAssignmentDoctors = 0;

  // Analyze each timeframe
  Object.entries(completeSchedule).forEach(([timeframeName, timeframeData]) => {
    const validation = timeframeData.validation;
    const assignmentStats = timeframeData.assignmentStats || {};

    report.timeframeResults[timeframeName] = {
      coveragePercentage: validation.coveragePercentage,
      missingActivitiesCount: validation.missingActivities.length,
      duplicateActivitiesCount: validation.duplicateActivities.length,
      rotationAssignments: timeframeData.rotationAssignments,
      doctorWorkload: timeframeData.doctorWorkload,
      assignmentStats: assignmentStats
    };

    // Update overall stats
    report.overallStats.totalMissingActivities += validation.missingActivities.length;
    report.overallStats.totalDuplicateActivities += validation.duplicateActivities.length;
    totalCoverage += validation.coveragePercentage;

    // Track assignment statistics
    if (assignmentStats.assignedDoctorCount) {
      totalAssignedDoctors += assignmentStats.assignedDoctorCount;
    }
    if (timeframeData.unassignedRotations) {
      totalUnassignedRotations += timeframeData.unassignedRotations.length;
    }
    if (assignmentStats.multipleAssignmentDoctors) {
      totalMultipleAssignmentDoctors += assignmentStats.multipleAssignmentDoctors.length;
    }

    if (validation.coveragePercentage === 100) {
      report.overallStats.timeframesWithFullCoverage++;
    }
  });

  // Calculate average coverage and update overall stats
  if (report.totalTimeframes > 0) {
    report.overallStats.averageCoveragePercentage = totalCoverage / report.totalTimeframes;
    report.overallStats.totalAssignedDoctors = Math.round(totalAssignedDoctors / report.totalTimeframes);
    report.overallStats.totalUnassignedRotations = totalUnassignedRotations;
    report.overallStats.doctorsWithMultipleRotations = totalMultipleAssignmentDoctors;
  }

  // Generate enhanced recommendations
  if (report.overallStats.averageCoveragePercentage < 90) {
    report.recommendations.push(
      `Coverage is ${report.overallStats.averageCoveragePercentage.toFixed(1)}%. Consider adding more doctors to rotationSetting arrays.`
    );
  }

  if (report.overallStats.totalDuplicateActivities > 0) {
    report.recommendations.push(
      `Found ${report.overallStats.totalDuplicateActivities} duplicate activity assignments. Check rotation templates for overlaps.`
    );
  }

  if (report.overallStats.totalUnassignedRotations > 0) {
    report.recommendations.push(
      `${report.overallStats.totalUnassignedRotations} rotations could not be assigned. Check doctor availability.`
    );
  }

  if (report.overallStats.doctorsWithMultipleRotations > 0) {
    report.recommendations.push(
      `${report.overallStats.doctorsWithMultipleRotations} doctors have multiple rotations. Consider redistributing workload.`
    );
  }

  // Check for rotations with only one doctor
  Object.entries(report.rotationAvailability).forEach(([rotation, doctors]) => {
    if (doctors.length === 1) {
      report.recommendations.push(
        `Rotation ${rotation} only has one available doctor (${doctors[0]}). Consider cross-training.`
      );
    } else if (doctors.length === 0) {
      report.recommendations.push(
        `Rotation ${rotation} has no available doctors. Add it to at least one doctor's rotationSetting.`
      );
    }
  });

  console.log('Simplified Schedule Report Summary:', report.overallStats);
  return report;
}

// All functions are exported individually above