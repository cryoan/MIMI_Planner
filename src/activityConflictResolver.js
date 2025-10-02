// Activity Conflict Resolution Heuristics
// Separate module for clarity and explanation to medical team
// Handles automatic resolution of missing activities (HTC, EMIT, etc.)

import { doctorProfiles, docActivities } from "./doctorSchedules.js";
import { rotation_cycles } from "./customPlanningLogic.js";

/**
 * HEURISTIC 1: Resolve Missing HTC1/HTC2 Activities due to TP Days
 *
 * RULE:
 * When a doctor assigned to HTC1 or HTC2 has a TP (Temps Partiel) day,
 * it creates a missing HTC1 or HTC2 slot. The system will:
 *
 * 1. Identify the missing HTC1 or HTC2 activity on the TP day
 * 2. Find all other doctors assigned to that same HTC activity in that period
 * 3. Prioritize selection:
 *    - PRIORITY 1: Doctors with completely free slots on that day
 *    - PRIORITY 2: Doctors with the most remaining available time on that day
 * 4. Reassign both AM and PM slots to the selected doctor (same doctor for full day)
 */

/**
 * HEURISTIC 2: Resolve Missing EMIT Activities
 *
 * RULE:
 * When EMIT is missing on a time slot, the system will:
 *
 * 1. Find eligible doctors (no TP on that slot + EMIT in their skills)
 * 2. Calculate composite score for each eligible doctor:
 *    Score = (remainingTime × EMIT_WEIGHT_CAPACITY) - (cumulativeWorkload × EMIT_WEIGHT_BALANCE)
 *    - Higher score = better candidate
 *    - Balances immediate slot capacity with long-term workload fairness
 * 3. Select doctor with highest score
 * 4. Auto-assign EMIT to the selected doctor's slot
 *
 * Default weights (fairness-focused): CAPACITY=1.0, BALANCE=0.1
 */

/**
 * HEURISTIC 3: Resolve Missing EMATIT Activities
 *
 * RULE:
 * When EMATIT is missing on a time slot, the system will:
 *
 * 1. Find eligible doctors (no TP on that slot + EMATIT in their skills)
 * 2. Calculate composite score for each eligible doctor:
 *    Score = (remainingTime × EMATIT_WEIGHT_CAPACITY) - (cumulativeWorkload × EMATIT_WEIGHT_BALANCE)
 *    - Higher score = better candidate
 *    - Balances immediate slot capacity with long-term workload fairness
 * 3. Select doctor with highest score
 * 4. Auto-assign EMATIT to the selected doctor's slot
 *
 * Default weights (fairness-focused): CAPACITY=1.0, BALANCE=0.1
 */

const TIME_SLOTS = ["9am-1pm", "2pm-6pm"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HTC_ACTIVITIES = ["HTC1", "HTC2", "HTC1_visite", "HTC2_visite"];

// ============================================================================
// CONFIGURATION: EMIT Resolution Weights
// ============================================================================

/**
 * Weight for remaining slot capacity in EMIT assignment scoring
 * Higher value = prioritize doctors with more available time in the slot
 * Default: 1.0
 */
const EMIT_WEIGHT_CAPACITY = 1.0;

/**
 * Weight for cumulative workload balancing in EMIT assignment scoring
 * Higher value = prioritize doctors with lower total workload across the cycle
 * Default: 0.1 (fairness-focused)
 *
 * Recommended presets:
 * - Prioritize capacity (immediate need): CAPACITY=2.0, BALANCE=0.01
 * - Balanced approach: CAPACITY=1.0, BALANCE=0.05
 * - Prioritize fairness (long-term): CAPACITY=1.0, BALANCE=0.1
 */
const EMIT_WEIGHT_BALANCE = 0.1;

/**
 * Weight for remaining slot capacity in EMATIT assignment scoring
 * Higher value = prioritize doctors with more available time in the slot
 * Default: 1.0
 */
const EMATIT_WEIGHT_CAPACITY = 1.0;

/**
 * Weight for cumulative workload balancing in EMATIT assignment scoring
 * Higher value = prioritize doctors with lower total workload across the cycle
 * Default: 0.1 (fairness-focused)
 *
 * Recommended presets:
 * - Prioritize capacity (immediate need): CAPACITY=2.0, BALANCE=0.01
 * - Balanced approach: CAPACITY=1.0, BALANCE=0.05
 * - Prioritize fairness (long-term): CAPACITY=1.0, BALANCE=0.1
 */
const EMATIT_WEIGHT_BALANCE = 0.1;

/**
 * Maximum allowed slot overload for EMIT/EMATIT assignment in hours
 * If assigning an activity would cause slot overload > this threshold, reject the assignment
 * Default: 2 hours (allows up to 6h total in a 4h slot)
 *
 * Example:
 * - Doctor has HTC1 (1h) + Cs (3h) = 4h (0h overload) → Can add EMIT (3h) → 7h total (3h overload) ❌ Exceeds threshold
 * - Doctor has HTC1 (1h) = 1h → Can add EMIT (3h) → 4h total (0h overload) ✓ Within threshold
 */
const MAX_SLOT_OVERLOAD_THRESHOLD = 1;

/**
 * Check if a doctor has TP on a specific day
 * @param {Object} doctorSchedule - The doctor's schedule for the week
 * @param {string} day - Day of the week
 * @returns {boolean} True if doctor has TP on this day
 */
function hasTPOnDay(doctorSchedule, day) {
  if (!doctorSchedule || !doctorSchedule[day]) {
    return false;
  }

  // Check both time slots for TP
  const hasTPInMorning =
    doctorSchedule[day]["9am-1pm"] &&
    doctorSchedule[day]["9am-1pm"].includes("TP");
  const hasTPInAfternoon =
    doctorSchedule[day]["2pm-6pm"] &&
    doctorSchedule[day]["2pm-6pm"].includes("TP");

  return hasTPInMorning || hasTPInAfternoon;
}

/**
 * Calculate available time for a doctor on a specific day (capacity-aware)
 * @param {Object} doctorSchedule - The doctor's schedule for the week
 * @param {string} day - Day of the week
 * @returns {Object} Remaining capacity and total free hours
 */
function calculateDayAvailability(doctorSchedule, day) {
  if (!doctorSchedule || !doctorSchedule[day]) {
    return { totalFreeHours: 0, slotsDetail: {}, hasAnyCapacity: false };
  }

  let totalFreeHours = 0;
  const slotsDetail = {};

  TIME_SLOTS.forEach((timeSlot) => {
    const activities = doctorSchedule[day][timeSlot] || [];

    // Skip TP - doctor unavailable (0 remaining capacity)
    if (activities.includes("TP")) {
      slotsDetail[timeSlot] = 0;
      return;
    }

    // Calculate used capacity based on activity durations
    let usedCapacity = 0;
    activities.forEach((activity) => {
      const activityDuration = docActivities[activity]?.duration || 4;
      usedCapacity += activityDuration;
    });

    // Calculate remaining capacity (max 4h per slot)
    const remaining = Math.max(0, 4 - usedCapacity);
    slotsDetail[timeSlot] = remaining;
    totalFreeHours += remaining;
  });

  return {
    totalFreeHours,
    slotsDetail,
    hasAnyCapacity: totalFreeHours > 0,
  };
}

/**
 * Calculate available time for a doctor in a specific time slot (slot-level capacity)
 * @param {Object} doctorSchedule - The doctor's schedule for the week
 * @param {string} day - Day of the week
 * @param {string} timeSlot - Specific time slot (9am-1pm or 2pm-6pm)
 * @returns {number} Remaining capacity in hours for that slot
 */
function calculateSlotAvailability(doctorSchedule, day, timeSlot) {
  if (
    !doctorSchedule ||
    !doctorSchedule[day] ||
    !doctorSchedule[day][timeSlot]
  ) {
    return 0;
  }

  const activities = doctorSchedule[day][timeSlot] || [];

  // Skip TP - doctor unavailable (0 remaining capacity)
  if (activities.includes("TP")) {
    return 0;
  }

  // Calculate used capacity based on activity durations
  let usedCapacity = 0;
  activities.forEach((activity) => {
    const activityDuration = docActivities[activity]?.duration || 4;
    usedCapacity += activityDuration;
  });

  // Calculate remaining capacity (max 4h per slot)
  return Math.max(0, 4 - usedCapacity);
}

/**
 * Calculate total slot duration if a new activity is added
 * @param {Object} doctorSchedule - The doctor's schedule for the week
 * @param {string} day - Day of the week
 * @param {string} timeSlot - Specific time slot (9am-1pm or 2pm-6pm)
 * @param {string} newActivity - Activity to potentially add (EMIT or EMATIT)
 * @returns {number} Total duration in hours if the new activity is added
 */
function calculateSlotDurationIfAdded(
  doctorSchedule,
  day,
  timeSlot,
  newActivity
) {
  if (
    !doctorSchedule ||
    !doctorSchedule[day] ||
    !doctorSchedule[day][timeSlot]
  ) {
    return 0;
  }

  const activities = doctorSchedule[day][timeSlot] || [];

  // Skip TP - doctor unavailable
  if (activities.includes("TP")) {
    return 0;
  }

  // Calculate current used capacity
  let usedCapacity = 0;
  activities.forEach((activity) => {
    const activityDuration = docActivities[activity]?.duration || 4;
    usedCapacity += activityDuration;
  });

  // Add the new activity duration
  const newActivityDuration = docActivities[newActivity]?.duration || 4;

  return usedCapacity + newActivityDuration;
}

/**
 * Calculate cumulative workload per doctor across the full cycle
 * Based on the aggregation logic from Workload.jsx
 * @param {Object} fullCycleSchedules - All periodic schedules in the cycle
 * @returns {Object} Map of doctorCode -> total hours across cycle
 */
function calculateCumulativeWorkloadPerDoctor(fullCycleSchedules) {
  const doctorWorkload = {};

  // Process all periodic schedules to get annual workload
  if (!fullCycleSchedules) {
    console.warn("⚠️ No cycle schedules provided for workload calculation");
    return {};
  }

  const periodNames = Object.keys(fullCycleSchedules);
  console.log(
    `📊 Calculating cumulative workload across ${periodNames.length} periods`
  );

  periodNames.forEach((periodName) => {
    const periodData = fullCycleSchedules[periodName];
    if (periodData.schedule) {
      const periodSchedule = periodData.schedule;

      // Traverse each doctor's schedule for this period
      Object.keys(periodSchedule).forEach((doctor) => {
        const doctorSchedule = periodSchedule[doctor];

        // Initialize doctor workload if not exists
        if (!doctorWorkload[doctor]) {
          doctorWorkload[doctor] = 0;
        }

        // Sum up all activity durations for this doctor in this period
        Object.keys(doctorSchedule).forEach((day) => {
          const daySchedule = doctorSchedule[day];
          Object.keys(daySchedule).forEach((slot) => {
            const activitiesList = daySchedule[slot];
            if (Array.isArray(activitiesList)) {
              activitiesList.forEach((activity) => {
                const activityData = docActivities[activity] || {};
                const duration = activityData.duration || 1;
                doctorWorkload[doctor] += duration;
              });
            }
          });
        });
      });
    }
  });

  console.log("📊 Cumulative workload per doctor:", doctorWorkload);
  return doctorWorkload;
}

/**
 * Find all doctors capable of doing a specific HTC activity
 * based on their rotationSetting (capabilities), not period assignment
 * @param {string} htcActivity - The HTC activity (HTC1 or HTC2)
 * @returns {Array} List of doctor codes capable of this activity
 */
function findDoctorsOnActivity(htcActivity) {
  const doctors = [];

  // Look through all doctor profiles to find who has this activity in their rotationSetting
  // This finds ALL doctors capable of doing HTC1/HTC2, not just who's assigned this period
  Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
    if (
      profile.rotationSetting &&
      profile.rotationSetting.includes(htcActivity)
    ) {
      doctors.push(doctorCode);
    }
  });

  return doctors;
}

/**
 * Get the rotation cycle period data for a specific period index
 * @param {string} cycleType - Type of cycle (honeymoon, NoMG, etc.)
 * @param {number} periodIndex - Index of the period
 * @returns {Object} The period data with activity assignments
 */
function getRotationCyclePeriod(cycleType, periodIndex) {
  const cycleData = rotation_cycles[cycleType];
  if (!cycleData || !cycleData.periods) {
    console.warn(`⚠️ Cycle ${cycleType} not found`);
    return null;
  }

  const periodData = cycleData.periods[periodIndex % cycleData.periods.length];
  return periodData;
}

/**
 * Check if any HTC activity is missing on a specific day/slot
 * @param {Object} schedule - The complete schedule for all doctors
 * @param {string} day - Day of the week
 * @param {string} timeSlot - Time slot
 * @returns {Array} List of missing HTC activities
 */
function findMissingHTCActivities(schedule, day, timeSlot) {
  const assignedActivities = [];

  // Collect all activities assigned by all doctors for this day/slot
  Object.values(schedule).forEach((doctorSchedule) => {
    if (doctorSchedule[day] && doctorSchedule[day][timeSlot]) {
      assignedActivities.push(...doctorSchedule[day][timeSlot]);
    }
  });

  // Check which HTC activities are missing
  const missingActivities = [];

  // For each HTC activity variant, check if it should be present
  HTC_ACTIVITIES.forEach((htcActivity) => {
    // Determine which days this activity should be present
    let shouldBePresent = false;

    if (htcActivity === "HTC1" || htcActivity === "HTC2") {
      // HTC1 and HTC2 are present on all weekdays
      shouldBePresent = DAYS_OF_WEEK.includes(day);
    } else if (htcActivity === "HTC1_visite" || htcActivity === "HTC2_visite") {
      // HTC_visite variants are only on Tuesday and Friday mornings
      shouldBePresent =
        (day === "Tuesday" || day === "Friday") && timeSlot === "9am-1pm";
    }

    if (shouldBePresent) {
      // Check if this HTC activity or its _visite variant is assigned
      // HTC2_visite on Tuesday AM fulfills the HTC2 requirement
      const isAssigned =
        assignedActivities.includes(htcActivity) ||
        assignedActivities.includes(htcActivity + "_visite");

      if (!isAssigned) {
        missingActivities.push(htcActivity);
      }
    }
  });

  return missingActivities;
}

/**
 * Select best replacement doctor for an HTC activity
 * @param {Array} candidateDoctors - List of doctor codes that can cover this activity
 * @param {Object} schedule - The complete schedule
 * @param {string} day - Day that needs coverage
 * @returns {Object|null} Selected doctor info or null if none available
 */
function selectBestReplacement(candidateDoctors, schedule, day) {
  if (candidateDoctors.length === 0) {
    return null;
  }

  // Filter out doctors with TP on this day
  const availableDoctors = candidateDoctors.filter((doctorCode) => {
    const doctorSchedule = schedule[doctorCode];
    return !hasTPOnDay(doctorSchedule, day);
  });

  if (availableDoctors.length === 0) {
    return null; // All candidates have TP
  }

  // If only ONE doctor available (no TP), assign to them regardless of their schedule
  if (availableDoctors.length === 1) {
    const doctorCode = availableDoctors[0];
    const doctorSchedule = schedule[doctorCode];
    const availability = calculateDayAvailability(doctorSchedule, day);

    console.log(
      `✨ Only one available doctor without TP: ${doctorCode} - assigning regardless of capacity`
    );

    return {
      doctorCode,
      availability,
      score: 1, // Doesn't matter, it's the only one
    };
  }

  // Multiple doctors available - evaluate by free time
  const evaluations = availableDoctors.map((doctorCode) => {
    const doctorSchedule = schedule[doctorCode];
    const availability = calculateDayAvailability(doctorSchedule, day);

    return {
      doctorCode,
      availability,
      score: availability.isFullDayFree ? 1000 : availability.totalFreeHours,
    };
  });

  // Sort by score (descending) - higher score = better candidate
  evaluations.sort((a, b) => b.score - a.score);

  const selected = evaluations[0];

  // Return best doctor sorted by remaining capacity
  // Even if 0h remaining, assign if no TP (better than leaving slot empty)
  return selected;
}

/**
 * Main HTC Conflict Resolution Function
 *
 * @param {Object} schedule - The periodic schedule (doctor -> day -> timeSlot -> activities)
 * @param {string} cycleType - The rotation cycle type (honeymoon, NoMG, etc.)
 * @param {number} periodIndex - The period index within the cycle
 * @returns {Object} Resolution result with modified schedule and log
 */
export function resolveHTCConflicts(schedule, cycleType, periodIndex) {
  console.log(
    `🔧 HTC Conflict Resolution - Period ${
      periodIndex + 1
    }, Cycle: ${cycleType}`
  );

  const resolutionLog = [];
  const modifiedSchedule = JSON.parse(JSON.stringify(schedule)); // Deep clone

  // Get the rotation cycle period to know who's assigned to what
  const cyclePeriod = getRotationCyclePeriod(cycleType, periodIndex);

  if (!cyclePeriod) {
    console.warn("⚠️ Cannot resolve HTC conflicts - cycle period not found");
    return {
      success: false,
      schedule: modifiedSchedule,
      resolutionLog: ["Cycle period not found"],
    };
  }

  // Simplified approach: Scan for missing HTC activities and assign them
  let conflictsDetected = 0;
  let conflictsResolved = 0;

  // Step 1: Scan each day/timeslot for missing HTC activities
  DAYS_OF_WEEK.forEach((day) => {
    TIME_SLOTS.forEach((timeSlot) => {
      // Find which HTC activities are missing in this day/slot
      const missingActivities = findMissingHTCActivities(
        modifiedSchedule,
        day,
        timeSlot
      );

      // For each missing HTC activity, try to assign it
      missingActivities.forEach((htcActivity) => {
        conflictsDetected++;
        console.log(`⚠️ Missing: ${htcActivity} on ${day} ${timeSlot}`);

        // Find all doctors capable of this HTC activity (based on rotationSetting)
        const capableDoctors = findDoctorsOnActivity(htcActivity);

        console.log(`🔍 Capable doctors for ${htcActivity}:`, capableDoctors);

        // Select best available doctor for this day (filters out TP automatically)
        const replacement = selectBestReplacement(
          capableDoctors,
          modifiedSchedule,
          day
        );

        console.log(
          `🎯 Selected replacement for ${htcActivity} on ${day}:`,
          replacement
            ? `${replacement.doctorCode} (${
                replacement.availability.isFullDayFree
                  ? "full day free"
                  : `${replacement.availability.totalFreeHours}h available`
              })`
            : "none available"
        );

        if (replacement) {
          const doctorCode = replacement.doctorCode;

          // Apply reassignment - both AM and PM to same doctor
          TIME_SLOTS.forEach((slot) => {
            const currentActivities =
              modifiedSchedule[doctorCode][day][slot] || [];

            // Determine which HTC variant to add based on day and time
            let activityToAdd = htcActivity;

            // Handle visite variants
            if ((day === "Tuesday" || day === "Friday") && slot === "9am-1pm") {
              if (htcActivity === "HTC1") activityToAdd = "HTC1_visite";
              if (htcActivity === "HTC2") activityToAdd = "HTC2_visite";
            }

            // Only add if not already present
            if (!currentActivities.includes(activityToAdd)) {
              currentActivities.push(activityToAdd);
              modifiedSchedule[doctorCode][day][slot] = currentActivities;
            }
          });

          conflictsResolved++;
          const logEntry = `✅ Assigned ${htcActivity} on ${day} to ${doctorCode} (${
            replacement.availability.isFullDayFree
              ? "full day free"
              : `${replacement.availability.totalFreeHours}h available`
          })`;
          console.log(logEntry);
          resolutionLog.push(logEntry);
        } else {
          const logEntry = `❌ No available doctor for ${htcActivity} on ${day}`;
          console.warn(logEntry);
          resolutionLog.push(logEntry);
        }
      });
    });
  });

  console.log(
    `🔧 HTC Conflict Resolution complete - ${conflictsResolved}/${conflictsDetected} conflicts resolved`
  );

  return {
    success: true,
    schedule: modifiedSchedule,
    resolutionLog,
    conflictsDetected,
    conflictsResolved,
  };
}

// ============================================================================
// EMIT CONFLICT RESOLUTION
// ============================================================================

/**
 * Check if EMIT activity is missing on a specific day/slot
 * @param {Object} schedule - The complete schedule for all doctors
 * @param {string} day - Day of the week
 * @param {string} timeSlot - Time slot
 * @returns {boolean} True if EMIT is missing
 */
function findMissingEMITActivities(schedule, day, timeSlot) {
  const assignedActivities = [];

  // Collect all activities assigned by all doctors for this day/slot
  Object.values(schedule).forEach((doctorSchedule) => {
    if (doctorSchedule[day] && doctorSchedule[day][timeSlot]) {
      assignedActivities.push(...doctorSchedule[day][timeSlot]);
    }
  });

  // EMIT should be present on all weekdays, all time slots
  const shouldBePresent = DAYS_OF_WEEK.includes(day);

  if (shouldBePresent) {
    // Check if EMIT is assigned
    return !assignedActivities.includes("EMIT");
  }

  return false;
}

/**
 * Check if EMATIT activity is missing on a specific day/slot
 * @param {Object} schedule - The complete schedule for all doctors
 * @param {string} day - Day of the week
 * @param {string} timeSlot - Time slot
 * @returns {boolean} True if EMATIT is missing
 */
function findMissingEMATITActivities(schedule, day, timeSlot) {
  const assignedActivities = [];

  // Collect all activities assigned by all doctors for this day/slot
  Object.values(schedule).forEach((doctorSchedule) => {
    if (doctorSchedule[day] && doctorSchedule[day][timeSlot]) {
      assignedActivities.push(...doctorSchedule[day][timeSlot]);
    }
  });

  // EMATIT should be present on all weekdays, all time slots
  const shouldBePresent = DAYS_OF_WEEK.includes(day);

  if (shouldBePresent) {
    // Check if EMATIT is assigned
    return !assignedActivities.includes("EMATIT");
  }

  return false;
}

/**
 * Find all doctors with EMIT in their skills (eligible for EMIT assignment)
 * @returns {Array} List of doctor codes with EMIT skills
 */
function findDoctorsWithEMITSkills() {
  const doctors = [];

  Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
    if (profile.skills && profile.skills.includes("EMIT")) {
      doctors.push(doctorCode);
    }
  });

  return doctors;
}

/**
 * Find all doctors with EMATIT in their skills (eligible for EMATIT assignment)
 * @returns {Array} List of doctor codes with EMATIT skills
 */
function findDoctorsWithEMATITSkills() {
  const doctors = [];

  Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
    if (profile.skills && profile.skills.includes("EMATIT")) {
      doctors.push(doctorCode);
    }
  });

  return doctors;
}

/**
 * Check if a doctor has TP in a specific time slot
 * @param {Object} doctorSchedule - The doctor's schedule for the week
 * @param {string} day - Day of the week
 * @param {string} timeSlot - Specific time slot
 * @returns {boolean} True if doctor has TP on this slot
 */
function hasTPInSlot(doctorSchedule, day, timeSlot) {
  if (
    !doctorSchedule ||
    !doctorSchedule[day] ||
    !doctorSchedule[day][timeSlot]
  ) {
    return false;
  }

  const activities = doctorSchedule[day][timeSlot];
  return activities.includes("TP");
}

/**
 * Select best replacement doctor for EMIT activity using dual sorting criteria
 * @param {Array} candidateDoctors - List of doctor codes that can cover EMIT
 * @param {Object} schedule - The complete schedule for this period
 * @param {string} day - Day that needs coverage
 * @param {string} timeSlot - Time slot that needs coverage
 * @param {Object} cumulativeWorkload - Map of doctorCode -> total hours across cycle
 * @returns {Object|null} Selected doctor info or null if none available
 */
function selectBestReplacementForEMIT(
  candidateDoctors,
  schedule,
  day,
  timeSlot,
  cumulativeWorkload
) {
  if (candidateDoctors.length === 0) {
    return null;
  }

  // Filter out doctors with TP in this specific slot
  const availableDoctors = candidateDoctors.filter((doctorCode) => {
    const doctorSchedule = schedule[doctorCode];
    return !hasTPInSlot(doctorSchedule, day, timeSlot);
  });

  if (availableDoctors.length === 0) {
    console.log(
      `⚠️ No available doctors for EMIT on ${day} ${timeSlot} (all have TP)`
    );
    return null;
  }

  // ✅ NEW: Filter out doctors that would exceed the overload threshold
  const doctorsWithinThreshold = availableDoctors.filter((doctorCode) => {
    const doctorSchedule = schedule[doctorCode];
    const totalDuration = calculateSlotDurationIfAdded(
      doctorSchedule,
      day,
      timeSlot,
      "EMIT"
    );
    const overload = totalDuration - 4;

    if (overload > MAX_SLOT_OVERLOAD_THRESHOLD) {
      console.log(
        `⚠️ ${doctorCode} rejected for EMIT on ${day} ${timeSlot}: would cause ${totalDuration}h (${overload}h overload > ${MAX_SLOT_OVERLOAD_THRESHOLD}h threshold)`
      );
      return false;
    }

    return true;
  });

  if (doctorsWithinThreshold.length === 0) {
    console.log(
      `❌ No doctors available for EMIT on ${day} ${timeSlot} within overload threshold (${MAX_SLOT_OVERLOAD_THRESHOLD}h)`
    );
    return null;
  }

  // If only ONE doctor available within threshold, assign to them
  if (doctorsWithinThreshold.length === 1) {
    const doctorCode = doctorsWithinThreshold[0];
    const doctorSchedule = schedule[doctorCode];
    const remainingTime = calculateSlotAvailability(
      doctorSchedule,
      day,
      timeSlot
    );
    const totalWorkload = cumulativeWorkload[doctorCode] || 0;

    // Calculate score for consistency
    const score =
      remainingTime * EMIT_WEIGHT_CAPACITY -
      totalWorkload * EMIT_WEIGHT_BALANCE;

    const totalDuration = calculateSlotDurationIfAdded(
      doctorSchedule,
      day,
      timeSlot,
      "EMIT"
    );

    console.log(
      `✨ Only one available doctor within threshold: ${doctorCode} - assigning EMIT (total: ${totalDuration}h, score=${score.toFixed(
        2
      )})`
    );

    return {
      doctorCode,
      remainingTime,
      totalWorkload,
      score,
    };
  }

  // Multiple doctors available within threshold - evaluate using weighted composite score
  const evaluations = doctorsWithinThreshold.map((doctorCode) => {
    const doctorSchedule = schedule[doctorCode];
    const remainingTime = calculateSlotAvailability(
      doctorSchedule,
      day,
      timeSlot
    );
    const totalWorkload = cumulativeWorkload[doctorCode] || 0;
    const totalDuration = calculateSlotDurationIfAdded(
      doctorSchedule,
      day,
      timeSlot,
      "EMIT"
    );

    // Composite score: maximize capacity, minimize cumulative workload
    // Higher score = better candidate
    const score =
      remainingTime * EMIT_WEIGHT_CAPACITY -
      totalWorkload * EMIT_WEIGHT_BALANCE;

    return {
      doctorCode,
      remainingTime,
      totalWorkload,
      totalDuration,
      score,
    };
  });

  // Sort by composite score (descending - higher score is better)
  evaluations.sort((a, b) => b.score - a.score);

  const selected = evaluations[0];

  console.log(
    `🎯 EMIT selection for ${day} ${timeSlot}:`,
    evaluations.map(
      (e) =>
        `${e.doctorCode}(total:${e.totalDuration}h, remaining:${
          e.remainingTime
        }h, workload:${e.totalWorkload}h, score=${e.score.toFixed(2)})`
    )
  );
  console.log(
    `   → Selected: ${selected.doctorCode} (score=${selected.score.toFixed(
      2
    )}, slot total: ${selected.totalDuration}h, cumulative: ${
      selected.totalWorkload
    }h)`
  );

  return selected;
}

/**
 * Select best replacement doctor for EMATIT activity using dual sorting criteria
 * @param {Array} candidateDoctors - List of doctor codes that can cover EMATIT
 * @param {Object} schedule - The complete schedule for this period
 * @param {string} day - Day that needs coverage
 * @param {string} timeSlot - Time slot that needs coverage
 * @param {Object} cumulativeWorkload - Map of doctorCode -> total hours across cycle
 * @returns {Object|null} Selected doctor info or null if none available
 */
function selectBestReplacementForEMATIT(
  candidateDoctors,
  schedule,
  day,
  timeSlot,
  cumulativeWorkload
) {
  if (candidateDoctors.length === 0) {
    return null;
  }

  // Filter out doctors with TP in this specific slot
  const availableDoctors = candidateDoctors.filter((doctorCode) => {
    const doctorSchedule = schedule[doctorCode];
    return !hasTPInSlot(doctorSchedule, day, timeSlot);
  });

  if (availableDoctors.length === 0) {
    console.log(
      `⚠️ No available doctors for EMATIT on ${day} ${timeSlot} (all have TP)`
    );
    return null;
  }

  // ✅ NEW: Filter out doctors that would exceed the overload threshold
  const doctorsWithinThreshold = availableDoctors.filter((doctorCode) => {
    const doctorSchedule = schedule[doctorCode];
    const totalDuration = calculateSlotDurationIfAdded(
      doctorSchedule,
      day,
      timeSlot,
      "EMATIT"
    );
    const overload = totalDuration - 4;

    if (overload > MAX_SLOT_OVERLOAD_THRESHOLD) {
      console.log(
        `⚠️ ${doctorCode} rejected for EMATIT on ${day} ${timeSlot}: would cause ${totalDuration}h (${overload}h overload > ${MAX_SLOT_OVERLOAD_THRESHOLD}h threshold)`
      );
      return false;
    }

    return true;
  });

  if (doctorsWithinThreshold.length === 0) {
    console.log(
      `❌ No doctors available for EMATIT on ${day} ${timeSlot} within overload threshold (${MAX_SLOT_OVERLOAD_THRESHOLD}h)`
    );
    return null;
  }

  // If only ONE doctor available within threshold, assign to them
  if (doctorsWithinThreshold.length === 1) {
    const doctorCode = doctorsWithinThreshold[0];
    const doctorSchedule = schedule[doctorCode];
    const remainingTime = calculateSlotAvailability(
      doctorSchedule,
      day,
      timeSlot
    );
    const totalWorkload = cumulativeWorkload[doctorCode] || 0;

    // Calculate score for consistency
    const score =
      remainingTime * EMATIT_WEIGHT_CAPACITY -
      totalWorkload * EMATIT_WEIGHT_BALANCE;

    const totalDuration = calculateSlotDurationIfAdded(
      doctorSchedule,
      day,
      timeSlot,
      "EMATIT"
    );

    console.log(
      `✨ Only one available doctor within threshold: ${doctorCode} - assigning EMATIT (total: ${totalDuration}h, score=${score.toFixed(
        2
      )})`
    );

    return {
      doctorCode,
      remainingTime,
      totalWorkload,
      score,
    };
  }

  // Multiple doctors available within threshold - evaluate using weighted composite score
  const evaluations = doctorsWithinThreshold.map((doctorCode) => {
    const doctorSchedule = schedule[doctorCode];
    const remainingTime = calculateSlotAvailability(
      doctorSchedule,
      day,
      timeSlot
    );
    const totalWorkload = cumulativeWorkload[doctorCode] || 0;
    const totalDuration = calculateSlotDurationIfAdded(
      doctorSchedule,
      day,
      timeSlot,
      "EMATIT"
    );

    // Composite score: maximize capacity, minimize cumulative workload
    // Higher score = better candidate
    const score =
      remainingTime * EMATIT_WEIGHT_CAPACITY -
      totalWorkload * EMATIT_WEIGHT_BALANCE;

    return {
      doctorCode,
      remainingTime,
      totalWorkload,
      totalDuration,
      score,
    };
  });

  // Sort by composite score (descending - higher score is better)
  evaluations.sort((a, b) => b.score - a.score);

  const selected = evaluations[0];

  console.log(
    `🎯 EMATIT selection for ${day} ${timeSlot}:`,
    evaluations.map(
      (e) =>
        `${e.doctorCode}(total:${e.totalDuration}h, remaining:${
          e.remainingTime
        }h, workload:${e.totalWorkload}h, score=${e.score.toFixed(2)})`
    )
  );
  console.log(
    `   → Selected: ${selected.doctorCode} (score=${selected.score.toFixed(
      2
    )}, slot total: ${selected.totalDuration}h, cumulative: ${
      selected.totalWorkload
    }h)`
  );

  return selected;
}

/**
 * Main EMIT Conflict Resolution Function
 *
 * @param {Object} schedule - The periodic schedule (doctor -> day -> timeSlot -> activities)
 * @param {string} cycleType - The rotation cycle type (honeymoon, NoMG, etc.)
 * @param {number} periodIndex - The period index within the cycle
 * @param {Object} baseFullCycleSchedules - Base schedules for all periods (Pass 1 output)
 * @param {Object} dynamicCumulativeWorkload - Current cumulative workload including HTC adjustments
 * @returns {Object} Resolution result with modified schedule and log
 */
export function resolveEMITConflicts(
  schedule,
  cycleType,
  periodIndex,
  baseFullCycleSchedules,
  dynamicCumulativeWorkload
) {
  console.log(
    `🔧 EMIT Conflict Resolution - Period ${
      periodIndex + 1
    }, Cycle: ${cycleType}`
  );

  const resolutionLog = [];
  const modifiedSchedule = JSON.parse(JSON.stringify(schedule)); // Deep clone

  // ✅ Use the provided dynamic cumulative workload (includes baseline + HTC assignments)
  const cumulativeWorkload = dynamicCumulativeWorkload;

  console.log(
    `📊 Using full-cycle dynamic workload (baseline + HTC):`,
    cumulativeWorkload
  );

  // Find all doctors with EMIT skills
  const emitCapableDoctors = findDoctorsWithEMITSkills();
  console.log(`🔍 Doctors with EMIT skills:`, emitCapableDoctors);

  let conflictsDetected = 0;
  let conflictsResolved = 0;

  // Scan each day/timeslot for missing EMIT
  DAYS_OF_WEEK.forEach((day) => {
    TIME_SLOTS.forEach((timeSlot) => {
      const isMissing = findMissingEMITActivities(
        modifiedSchedule,
        day,
        timeSlot
      );

      if (isMissing) {
        conflictsDetected++;
        console.log(`⚠️ Missing: EMIT on ${day} ${timeSlot}`);

        // Select best available doctor for this slot
        const replacement = selectBestReplacementForEMIT(
          emitCapableDoctors,
          modifiedSchedule,
          day,
          timeSlot,
          cumulativeWorkload
        );

        if (replacement) {
          const doctorCode = replacement.doctorCode;

          // Add EMIT to this doctor's slot
          const currentActivities =
            modifiedSchedule[doctorCode][day][timeSlot] || [];

          if (!currentActivities.includes("EMIT")) {
            currentActivities.push("EMIT");
            modifiedSchedule[doctorCode][day][timeSlot] = currentActivities;
          }

          conflictsResolved++;
          const logEntry = `✅ Assigned EMIT on ${day} ${timeSlot} to ${doctorCode} (score=${replacement.score.toFixed(
            2
          )}: ${replacement.remainingTime}h slot capacity, ${
            replacement.totalWorkload
          }h cumulative workload)`;
          console.log(logEntry);
          resolutionLog.push(logEntry);
        } else {
          const logEntry = `❌ No available doctor for EMIT on ${day} ${timeSlot}`;
          console.warn(logEntry);
          resolutionLog.push(logEntry);
        }
      }
    });
  });

  console.log(
    `🔧 EMIT Conflict Resolution complete - ${conflictsResolved}/${conflictsDetected} conflicts resolved`
  );

  return {
    success: true,
    schedule: modifiedSchedule,
    resolutionLog,
    conflictsDetected,
    conflictsResolved,
  };
}

// ============================================================================
// EMATIT CONFLICT RESOLUTION
// ============================================================================

/**
 * Main EMATIT Conflict Resolution Function
 *
 * @param {Object} schedule - The periodic schedule (doctor -> day -> timeSlot -> activities)
 * @param {string} cycleType - The rotation cycle type (honeymoon, NoMG, etc.)
 * @param {number} periodIndex - The period index within the cycle
 * @param {Object} baseFullCycleSchedules - Base schedules for all periods (Pass 1 output)
 * @param {Object} dynamicCumulativeWorkload - Current cumulative workload including HTC + EMIT adjustments
 * @returns {Object} Resolution result with modified schedule and log
 */
export function resolveEMATITConflicts(
  schedule,
  cycleType,
  periodIndex,
  baseFullCycleSchedules,
  dynamicCumulativeWorkload
) {
  console.log(
    `🔧 EMATIT Conflict Resolution - Period ${
      periodIndex + 1
    }, Cycle: ${cycleType}`
  );

  const resolutionLog = [];
  const modifiedSchedule = JSON.parse(JSON.stringify(schedule)); // Deep clone

  // ✅ Use the provided dynamic cumulative workload (includes baseline + HTC + EMIT assignments)
  const cumulativeWorkload = dynamicCumulativeWorkload;

  console.log(
    `📊 Using full-cycle dynamic workload (baseline + HTC + EMIT):`,
    cumulativeWorkload
  );

  // Find all doctors with EMATIT skills
  const ematitCapableDoctors = findDoctorsWithEMATITSkills();
  console.log(`🔍 Doctors with EMATIT skills:`, ematitCapableDoctors);

  let conflictsDetected = 0;
  let conflictsResolved = 0;

  // Scan each day/timeslot for missing EMATIT
  DAYS_OF_WEEK.forEach((day) => {
    TIME_SLOTS.forEach((timeSlot) => {
      const isMissing = findMissingEMATITActivities(
        modifiedSchedule,
        day,
        timeSlot
      );

      if (isMissing) {
        conflictsDetected++;
        console.log(`⚠️ Missing: EMATIT on ${day} ${timeSlot}`);

        // Select best available doctor for this slot
        const replacement = selectBestReplacementForEMATIT(
          ematitCapableDoctors,
          modifiedSchedule,
          day,
          timeSlot,
          cumulativeWorkload
        );

        if (replacement) {
          const doctorCode = replacement.doctorCode;

          // Add EMATIT to this doctor's slot
          const currentActivities =
            modifiedSchedule[doctorCode][day][timeSlot] || [];

          if (!currentActivities.includes("EMATIT")) {
            currentActivities.push("EMATIT");
            modifiedSchedule[doctorCode][day][timeSlot] = currentActivities;
          }

          conflictsResolved++;
          const logEntry = `✅ Assigned EMATIT on ${day} ${timeSlot} to ${doctorCode} (score=${replacement.score.toFixed(
            2
          )}: ${replacement.remainingTime}h slot capacity, ${
            replacement.totalWorkload
          }h cumulative workload)`;
          console.log(logEntry);
          resolutionLog.push(logEntry);
        } else {
          const logEntry = `❌ No available doctor for EMATIT on ${day} ${timeSlot}`;
          console.warn(logEntry);
          resolutionLog.push(logEntry);
        }
      }
    });
  });

  console.log(
    `🔧 EMATIT Conflict Resolution complete - ${conflictsResolved}/${conflictsDetected} conflicts resolved`
  );

  return {
    success: true,
    schedule: modifiedSchedule,
    resolutionLog,
    conflictsDetected,
    conflictsResolved,
  };
}

// ============================================================================
// TELECS ASSIGNMENT
// ============================================================================

/**
 * Count TeleCs in a doctor's backbone schedule
 * Handles both single backbone and multiple backbones (like DL)
 *
 * @param {string} doctorCode - Doctor code
 * @param {Object} profile - Doctor profile from doctorProfiles
 * @param {number} periodIndex - Period index for selecting correct backbone
 * @returns {number} Count of TeleCs in backbone
 */
function countBackboneTeleCs(doctorCode, profile, periodIndex) {
  let activeBackbone = profile.backbone;

  // Handle doctors with multiple backbones (e.g., DL)
  if (profile.backbones && periodIndex !== null) {
    const backboneNames = profile.rotationSetting || Object.keys(profile.backbones);
    const backboneIndex = periodIndex % backboneNames.length;
    const backboneName = backboneNames[backboneIndex];
    activeBackbone = profile.backbones[backboneName];
  }

  if (!activeBackbone) return 0;

  let count = 0;
  DAYS_OF_WEEK.forEach((day) => {
    TIME_SLOTS.forEach((timeSlot) => {
      const activities = activeBackbone[day]?.[timeSlot] || [];
      if (activities.includes("TeleCs")) {
        count++;
      }
    });
  });

  return count;
}

/**
 * Main TeleCs Assignment Function
 *
 * Automatically assigns TeleCs to doctors based on their weeklyNeeds.TeleCs.count
 * Only assigns additional TeleCs beyond what's already in the backbone
 * Skips doctors whose backbone already satisfies their TeleCs needs
 *
 * @param {Object} schedule - The periodic schedule (doctor -> day -> timeSlot -> activities)
 * @param {string} cycleType - The rotation cycle type (honeymoon, NoMG, etc.)
 * @param {number} periodIndex - The period index within the cycle
 * @param {Object} baseFullCycleSchedules - Base schedules for all periods (Pass 1 output)
 * @param {Object} dynamicCumulativeWorkload - Current cumulative workload including HTC + EMIT + EMATIT adjustments
 * @returns {Object} Resolution result with modified schedule, log, and TeleCs assignments
 */
export function resolveTeleCsConflicts(
  schedule,
  cycleType,
  periodIndex,
  baseFullCycleSchedules,
  dynamicCumulativeWorkload
) {
  console.log(
    `🔧 TeleCs Assignment - Period ${periodIndex + 1}, Cycle: ${cycleType}`
  );

  const resolutionLog = [];
  const modifiedSchedule = JSON.parse(JSON.stringify(schedule)); // Deep clone
  const teleCsAssignments = {}; // Track assignments per doctor

  let conflictsDetected = 0;
  let conflictsResolved = 0;

  // For each doctor, check if they have weeklyNeeds.TeleCs
  Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
    if (!profile.weeklyNeeds?.TeleCs) {
      // Skip doctors without TeleCs needs
      return;
    }

    const teleCsNeeds = profile.weeklyNeeds.TeleCs;
    const neededCount = teleCsNeeds.count || 0;

    if (neededCount === 0) {
      return; // No TeleCs needed
    }

    // Count TeleCs in backbone
    const backboneTeleCs = countBackboneTeleCs(doctorCode, profile, periodIndex);

    // If backbone already satisfies the need, skip this doctor entirely
    if (backboneTeleCs >= neededCount) {
      console.log(
        `✅ ${doctorCode} already has ${backboneTeleCs} TeleCs in backbone (needs ${neededCount}) - skipping`
      );
      return;
    }

    console.log(
      `📞 ${doctorCode} needs ${neededCount} TeleCs (${backboneTeleCs} in backbone, ${neededCount - backboneTeleCs} additional needed)`
    );

    // Count existing TeleCs in schedule (total, including backbone)
    let existingCount = 0;
    const doctorSchedule = modifiedSchedule[doctorCode];

    if (!doctorSchedule) {
      console.warn(`⚠️ ${doctorCode} not found in schedule`);
      return;
    }

    DAYS_OF_WEEK.forEach((day) => {
      TIME_SLOTS.forEach((timeSlot) => {
        const activities = doctorSchedule[day]?.[timeSlot] || [];
        if (activities.includes("TeleCs")) {
          existingCount++;
        }
      });
    });

    console.log(`   Total existing TeleCs in schedule: ${existingCount} (${backboneTeleCs} from backbone)`);

    // Calculate remaining needed (additional TeleCs beyond current schedule)
    const remainingNeeded = neededCount - existingCount;

    if (remainingNeeded <= 0) {
      console.log(`   ✅ ${doctorCode} already has enough TeleCs in schedule`);
      // Don't add to teleCsAssignments - this doctor is satisfied
      return;
    }

    console.log(`   ⚠️ ${doctorCode} needs ${remainingNeeded} more TeleCs to reach ${neededCount} total`);
    conflictsDetected += remainingNeeded;

    // Find available slots for TeleCs
    const availableSlots = [];

    DAYS_OF_WEEK.forEach((day) => {
      TIME_SLOTS.forEach((timeSlot) => {
        const activities = doctorSchedule[day]?.[timeSlot] || [];

        // Skip if TP
        if (activities.includes("TP")) {
          return;
        }

        // Skip if already has TeleCs
        if (activities.includes("TeleCs")) {
          return;
        }

        // Check remaining capacity
        const remainingCapacity = calculateSlotAvailability(
          doctorSchedule,
          day,
          timeSlot
        );

        const teleCsDuration = docActivities["TeleCs"]?.duration || 3;

        if (remainingCapacity >= teleCsDuration) {
          availableSlots.push({ day, timeSlot, remainingCapacity });
        }
      });
    });

    console.log(
      `   Available slots for ${doctorCode}: ${availableSlots.length}`
    );

    // Assign additional TeleCs to available slots
    let additionalAssigned = 0;
    const slotsToFill = Math.min(remainingNeeded, availableSlots.length);

    for (let i = 0; i < slotsToFill; i++) {
      const slot = availableSlots[i];
      const activities = doctorSchedule[slot.day][slot.timeSlot];

      if (!activities.includes("TeleCs")) {
        activities.push("TeleCs");
        additionalAssigned++;
        conflictsResolved++;

        const logEntry = `✅ Assigned TeleCs to ${doctorCode} on ${slot.day} ${slot.timeSlot} (${slot.remainingCapacity}h available)`;
        console.log(`   ${logEntry}`);
        resolutionLog.push(logEntry);
      }
    }

    // Track assignment results (only track doctors who have shortages)
    const totalAssigned = backboneTeleCs + additionalAssigned;
    const missing = neededCount - totalAssigned;

    // Only add to teleCsAssignments if there's a shortage
    if (missing > 0) {
      teleCsAssignments[doctorCode] = {
        needed: neededCount,
        backboneTeleCs: backboneTeleCs,
        additionalAssigned: additionalAssigned,
        totalAssigned: totalAssigned,
        missing: missing,
      };

      const logEntry = `❌ ${doctorCode} missing ${missing} TeleCs (needed: ${neededCount}, backbone: ${backboneTeleCs}, additional: ${additionalAssigned}, total: ${totalAssigned})`;
      console.warn(`   ${logEntry}`);
      resolutionLog.push(logEntry);
    } else {
      console.log(`   ✅ ${doctorCode} TeleCs satisfied (backbone: ${backboneTeleCs}, additional: ${additionalAssigned}, total: ${totalAssigned})`);
    }
  });

  console.log(
    `🔧 TeleCs Assignment complete - ${conflictsResolved}/${conflictsDetected} TeleCs assigned`
  );

  return {
    success: true,
    schedule: modifiedSchedule,
    resolutionLog,
    teleCsAssignments,
    conflictsDetected,
    conflictsResolved,
  };
}

// Export helper functions for testing
export {
  hasTPOnDay,
  calculateDayAvailability,
  calculateSlotAvailability,
  calculateCumulativeWorkloadPerDoctor,
  findDoctorsOnActivity,
  findMissingHTCActivities,
  selectBestReplacement,
  findMissingEMITActivities,
  findDoctorsWithEMITSkills,
  selectBestReplacementForEMIT,
  findMissingEMATITActivities,
  findDoctorsWithEMATITSkills,
  selectBestReplacementForEMATIT,
};
