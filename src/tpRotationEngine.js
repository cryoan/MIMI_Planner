// ============================================================================
// TP ROTATION ENGINE
// ============================================================================
// Core logic for calculating and applying Wednesday TP rotations

import {
  tpRotationConfig,
  getRotationOrder,
  getRotationPoolSize,
  isDoctorInRotationPool,
  getDoctorTPSwapConfig,
  validateTPRotationConfig
} from "./tpRotationConfig.js";
import { isHolidayWeek } from "./periodCalculator.js";
import { getWeek, getYear, parseISO, startOfWeek, getDate } from "date-fns";
import { doctorProfiles } from "./doctorSchedules.js";

/**
 * Check if a given week contains the third Wednesday of its month
 *
 * @param {number} weekNumber - ISO week number (1-52)
 * @param {number} year - Year
 * @returns {boolean} True if this week contains the third Wednesday of the month
 */
export function isThirdWednesdayWeek(weekNumber, year) {
  try {
    // Get the start of this ISO week (Monday)
    const weekStart = startOfWeek(parseISO(`${year}-W${String(weekNumber).padStart(2, '0')}-1`), { weekStartsOn: 1 });

    // Get all days of this week
    const daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      daysOfWeek.push(day);
    }

    // Find Wednesday (day 3, where Monday is 1)
    const wednesday = daysOfWeek[2]; // Index 2 = Wednesday (Monday is 0, Tuesday is 1)

    // Check if this Wednesday is the third Wednesday of its month
    const dayOfMonth = getDate(wednesday);
    const month = wednesday.getMonth();

    // Count Wednesdays in this month up to and including this date
    let wednesdayCount = 0;
    for (let day = 1; day <= dayOfMonth; day++) {
      const testDate = new Date(wednesday.getFullYear(), month, day);
      if (testDate.getDay() === 3) { // 3 = Wednesday
        wednesdayCount++;
      }
    }

    return wednesdayCount === 3;
  } catch (error) {
    console.error(`Error checking third Wednesday for week ${year}-W${weekNumber}:`, error);
    return false;
  }
}

/**
 * Calculate the total number of weeks from a starting point
 *
 * @param {number} currentWeek - Current ISO week number
 * @param {number} currentYear - Current year
 * @param {Object} startPoint - Starting reference point {week, year}
 * @returns {number} Total weeks elapsed since start
 */
function calculateWeeksFromStart(currentWeek, currentYear, startPoint) {
  const startYear = startPoint.year;
  const startWeek = startPoint.week;

  // Calculate total weeks elapsed
  let totalWeeks = 0;

  if (currentYear === startYear) {
    // Same year - simple difference
    totalWeeks = currentWeek - startWeek;
  } else {
    // Different years - need to account for year boundaries
    // Count remaining weeks in start year
    totalWeeks = 52 - startWeek;

    // Add full years between start and current year
    for (let year = startYear + 1; year < currentYear; year++) {
      totalWeeks += 52;
    }

    // Add weeks in current year
    totalWeeks += currentWeek;
  }

  return totalWeeks;
}

/**
 * Count non-vacation weeks between start and current week
 * This is used when skipVacationWeeks is enabled
 *
 * @param {number} currentWeek - Current ISO week number
 * @param {number} currentYear - Current year
 * @param {Object} startPoint - Starting reference point {week, year}
 * @returns {number} Total non-vacation weeks
 */
function countNonVacationWeeks(currentWeek, currentYear, startPoint) {
  const startYear = startPoint.year;
  const startWeek = startPoint.week;

  let nonVacationWeeks = 0;

  // Iterate through all weeks from start to current
  for (let year = startYear; year <= currentYear; year++) {
    const weekStart = (year === startYear) ? startWeek : 1;
    const weekEnd = (year === currentYear) ? currentWeek : 52;

    for (let week = weekStart; week <= weekEnd; week++) {
      // Skip the current week itself
      if (year === currentYear && week === currentWeek) {
        break;
      }

      // Check if this week is a vacation week
      const isVacation = isHolidayWeek(week, year);
      if (!isVacation) {
        nonVacationWeeks++;
      }
    }
  }

  return nonVacationWeeks;
}

/**
 * Choose the best swap day for a doctor with dynamic swap options
 * Intelligently selects between Monday and Thursday based on doctor's Cs schedule
 *
 * @param {string} doctorCode - Doctor code (e.g., "MDLC", "FL")
 * @param {number} weekNumber - ISO week number
 * @param {number} year - Year
 * @param {Array<string>} swapOptions - Available swap days (e.g., ["Monday", "Thursday"])
 * @returns {string} Best day to swap to
 */
export function chooseBestSwapDay(doctorCode, weekNumber, year, swapOptions) {
  if (!Array.isArray(swapOptions) || swapOptions.length === 0) {
    console.error(`Invalid swap options for ${doctorCode}`);
    return "Thursday"; // Default fallback
  }

  // If only one option, return it
  if (swapOptions.length === 1) {
    return swapOptions[0];
  }

  // Get doctor's backbone to check Cs schedule
  const doctor = doctorProfiles[doctorCode];
  if (!doctor || !doctor.backbone) {
    console.warn(`No backbone found for ${doctorCode}, using first swap option`);
    return swapOptions[0];
  }

  const backbone = doctor.backbone;

  // Check which days have Cs activities
  const csSchedule = {};
  swapOptions.forEach(day => {
    const morningSlot = backbone[day]?.["9am-1pm"] || [];
    const afternoonSlot = backbone[day]?.["2pm-6pm"] || [];

    // Check if either slot has Cs or TeleCs
    const hasCsActivity = [...morningSlot, ...afternoonSlot].some(activity =>
      activity === "Cs" || activity === "TeleCs" || activity === "Cs_Prison"
    );

    csSchedule[day] = hasCsActivity;
  });

  // Prefer days without Cs activities
  for (const day of swapOptions) {
    if (!csSchedule[day]) {
      console.log(`📅 ${doctorCode}: Chose ${day} (no Cs conflict)`);
      return day;
    }
  }

  // If all options have Cs, return the first option as fallback
  console.warn(`⚠️ ${doctorCode}: All swap options have Cs, using ${swapOptions[0]} as fallback`);
  return swapOptions[0];
}

/**
 * Calculate which doctor should swap their TP for a given week
 *
 * @param {number} weekNumber - ISO week number
 * @param {number} year - Year
 * @returns {Object} Rotation result
 */
export function calculateTPRotationForWeek(weekNumber, year) {
  const logLevel = tpRotationConfig.logLevel;
  const colors = tpRotationConfig.logColors;

  // Check if rotation is enabled
  if (!tpRotationConfig.enabled) {
    if (logLevel >= 2) {
      console.log(`${colors.info} TP Rotation: Disabled (week ${year}-W${weekNumber})`);
    }
    return {
      enabled: false,
      weekKey: `${year}-W${String(weekNumber).padStart(2, '0')}`,
      doctorToSwap: null,
      swapConfig: null
    };
  }

  // Validate configuration
  const validation = validateTPRotationConfig();
  if (!validation.success) {
    console.error(`${colors.warning} TP Rotation: Configuration invalid, skipping rotation`);
    return {
      enabled: false,
      error: "Configuration validation failed",
      weekKey: `${year}-W${String(weekNumber).padStart(2, '0')}`,
      doctorToSwap: null,
      swapConfig: null
    };
  }

  const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;

  // PRIORITY 1: Check if this is a third Wednesday (overrides everything else)
  const isThirdWed = isThirdWednesdayWeek(weekNumber, year);
  if (isThirdWed) {
    if (logLevel >= 1) {
      console.log(`${colors.info} TP Rotation: Third Wednesday detected (${weekKey})`);
      console.log(`  ${colors.swap} MG: Wednesday → Friday`);
      console.log(`  ${colors.swap} CL: Monday → Wednesday`);
    }

    // Return special configuration for third Wednesday
    // Note: Both MG and CL swap on third Wednesdays
    return {
      enabled: true,
      isThirdWednesday: true,
      isVacationWeek: false,
      weekKey,
      weekNumber,
      year,
      doctorsToSwap: ["MG", "CL"], // Both doctors swap
      swapConfigs: {
        MG: getDoctorTPSwapConfig("MG"),
        CL: getDoctorTPSwapConfig("CL")
      }
    };
  }

  // PRIORITY 2: Check if this is a vacation week
  const isVacation = isHolidayWeek(weekNumber, year);
  if (isVacation && tpRotationConfig.skipVacationWeeks) {
    if (logLevel >= 2) {
      console.log(`${colors.info} TP Rotation: Vacation week detected (${weekKey}), skipping rotation`);
    }
    return {
      enabled: true,
      isThirdWednesday: false,
      isVacationWeek: true,
      weekKey,
      doctorToSwap: null,
      swapConfig: null
    };
  }

  // PRIORITY 3: Regular rotation (non-third Wednesdays, non-vacation)
  // Get rotation configuration (excludes MG and CL)
  const rotationOrder = getRotationOrder();
  const poolSize = getRotationPoolSize();
  const cycleWeeks = tpRotationConfig.rotationCycleWeeks;
  const startingWeek = tpRotationConfig.startingWeek;

  // Calculate weeks elapsed since start
  let weeksElapsed;
  if (tpRotationConfig.skipVacationWeeks) {
    // Count only non-vacation weeks
    weeksElapsed = countNonVacationWeeks(weekNumber, year, startingWeek);
  } else {
    // Count all weeks
    weeksElapsed = calculateWeeksFromStart(weekNumber, year, startingWeek);
  }

  // Handle yearly reset if enabled
  if (tpRotationConfig.resetEachYear && year > startingWeek.year) {
    // Calculate weeks elapsed in current year only
    weeksElapsed = weekNumber - 1;
    if (tpRotationConfig.skipVacationWeeks) {
      // Recalculate for current year only
      weeksElapsed = countNonVacationWeeks(weekNumber, year, { week: 1, year });
    }
  }

  // Determine which doctor should swap this week (rotation advances every week)
  const doctorIndex = weeksElapsed % poolSize;
  const doctorToSwap = rotationOrder[doctorIndex];

  // Get swap configuration for this doctor
  let swapConfig = getDoctorTPSwapConfig(doctorToSwap);

  // Handle dynamic swap day selection (for MDLC and FL)
  if (swapConfig && swapConfig.dynamicSwap && Array.isArray(swapConfig.swapToDay)) {
    const bestDay = chooseBestSwapDay(doctorToSwap, weekNumber, year, swapConfig.swapToDay);
    swapConfig = {
      ...swapConfig,
      swapToDay: bestDay, // Replace array with chosen day
      originalSwapOptions: swapConfig.swapToDay // Keep original options for reference
    };
  }

  if (logLevel >= 2) {
    console.log(`${colors.debug} TP Rotation for ${weekKey}:`);
    console.log(`  Weeks elapsed: ${weeksElapsed}`);
    console.log(`  Doctor index: ${doctorIndex}/${poolSize}`);
    console.log(`  ${colors.swap} Doctor to swap: ${doctorToSwap} (${swapConfig.originalTPDay} → ${swapConfig.swapToDay})`);
  }

  return {
    enabled: true,
    isThirdWednesday: false,
    isVacationWeek: false,
    weekKey,
    weekNumber,
    year,
    weeksElapsed,
    doctorIndex,
    doctorToSwap,
    swapConfig,
    rotationOrder
  };
}

/**
 * Apply TP swap to a doctor's backbone schedule
 * Creates a modified copy of the backbone with TP moved from one day to another
 *
 * @param {Object} backbone - Original backbone schedule
 * @param {string} fromDay - Day to remove TP from (e.g., "Wednesday")
 * @param {string} toDay - Day to add TP to (e.g., "Thursday" or "Friday")
 * @returns {Object} Modified backbone with TP swapped
 */
export function applyTPSwapToBackbone(backbone, fromDay, toDay) {
  // Deep clone the backbone to avoid modifying the original
  const modifiedBackbone = JSON.parse(JSON.stringify(backbone));

  const timeSlots = ["9am-1pm", "2pm-6pm"];

  // Remove TP from the original day
  timeSlots.forEach(slot => {
    if (modifiedBackbone[fromDay] && modifiedBackbone[fromDay][slot]) {
      const activities = modifiedBackbone[fromDay][slot];
      const tpIndex = activities.indexOf("TP");
      if (tpIndex !== -1) {
        activities.splice(tpIndex, 1);
      }
    }
  });

  // Add TP to the new day
  timeSlots.forEach(slot => {
    if (modifiedBackbone[toDay] && modifiedBackbone[toDay][slot]) {
      // Only add TP if it's not already present
      const activities = modifiedBackbone[toDay][slot];
      if (!activities.includes("TP")) {
        // Clear existing activities and add TP (TP takes the full slot)
        modifiedBackbone[toDay][slot] = ["TP"];
      }
    }
  });

  return modifiedBackbone;
}

/**
 * Get modified backbone for a doctor based on TP rotation for a specific week
 *
 * @param {string} doctorCode - Doctor code
 * @param {Object} originalBackbone - Original backbone from doctorProfiles
 * @param {number} weekNumber - ISO week number
 * @param {number} year - Year
 * @returns {Object} Modified backbone or original if no swap needed
 */
export function getModifiedBackboneForWeek(doctorCode, originalBackbone, weekNumber, year) {
  // Check if this doctor is in the rotation pool
  if (!isDoctorInRotationPool(doctorCode)) {
    return originalBackbone; // Not in pool, return original
  }

  // Calculate rotation for this week
  const rotation = calculateTPRotationForWeek(weekNumber, year);

  // Check if rotation is enabled and valid
  if (!rotation.enabled || rotation.isVacationWeek || !rotation.doctorToSwap) {
    return originalBackbone; // No rotation this week, return original
  }

  // Check if this doctor is the one who should swap this week
  if (rotation.doctorToSwap !== doctorCode) {
    return originalBackbone; // Not this doctor's turn, return original
  }

  // This doctor should swap their TP this week
  const swapConfig = rotation.swapConfig;
  const modifiedBackbone = applyTPSwapToBackbone(
    originalBackbone,
    swapConfig.originalTPDay,
    swapConfig.swapToDay
  );

  if (tpRotationConfig.logLevel >= 1) {
    const colors = tpRotationConfig.logColors;
    console.log(`${colors.success} Applied TP swap to ${doctorCode}: ${swapConfig.originalTPDay} → ${swapConfig.swapToDay} (${rotation.weekKey})`);
  }

  return modifiedBackbone;
}

/**
 * Get modified backbones for all doctors with special handling
 * Handles doctors with multiple backbones (like DL with MPO/HDJ)
 * Also handles third Wednesday special case with MG and CL
 *
 * @param {string} doctorCode - Doctor code
 * @param {Object} doctorProfile - Complete doctor profile from doctorProfiles
 * @param {number} weekNumber - ISO week number
 * @param {number} year - Year
 * @returns {Object} Modified doctor profile with updated backbone(s)
 */
export function getModifiedDoctorProfile(doctorCode, doctorProfile, weekNumber, year) {
  // Check if this doctor is in the rotation pool
  if (!isDoctorInRotationPool(doctorCode)) {
    return doctorProfile; // Not in pool, return original
  }

  // Calculate rotation for this week
  const rotation = calculateTPRotationForWeek(weekNumber, year);

  // Check if rotation is enabled
  if (!rotation.enabled || rotation.isVacationWeek) {
    return doctorProfile; // No rotation this week, return original
  }

  // Handle third Wednesday special case (MG and CL both swap)
  if (rotation.isThirdWednesday) {
    const doctorsToSwap = rotation.doctorsToSwap || [];
    if (!doctorsToSwap.includes(doctorCode)) {
      return doctorProfile; // This doctor doesn't swap on third Wednesdays
    }

    // This doctor should swap on third Wednesday
    const swapConfig = rotation.swapConfigs[doctorCode];
    if (!swapConfig) {
      console.warn(`No swap config found for ${doctorCode} on third Wednesday`);
      return doctorProfile;
    }

    // Clone and apply swap
    const modifiedProfile = JSON.parse(JSON.stringify(doctorProfile));

    // Handle single backbone
    if (modifiedProfile.backbone && !modifiedProfile.backbones) {
      modifiedProfile.backbone = applyTPSwapToBackbone(
        modifiedProfile.backbone,
        swapConfig.originalTPDay,
        swapConfig.swapToDay
      );
    }

    // Handle multiple backbones
    if (modifiedProfile.backbones) {
      Object.keys(modifiedProfile.backbones).forEach(backboneName => {
        modifiedProfile.backbones[backboneName] = applyTPSwapToBackbone(
          modifiedProfile.backbones[backboneName],
          swapConfig.originalTPDay,
          swapConfig.swapToDay
        );
      });
    }

    if (tpRotationConfig.logLevel >= 1) {
      const colors = tpRotationConfig.logColors;
      console.log(`${colors.success} Applied third Wednesday TP swap to ${doctorCode}: ${swapConfig.originalTPDay} → ${swapConfig.swapToDay} (${rotation.weekKey})`);
    }

    return modifiedProfile;
  }

  // Handle regular rotation (non-third Wednesday)
  if (!rotation.doctorToSwap) {
    return doctorProfile; // No doctor to swap this week
  }

  // Check if this doctor is the one who should swap this week
  if (rotation.doctorToSwap !== doctorCode) {
    return doctorProfile; // Not this doctor's turn, return original
  }

  // Clone the doctor profile
  const modifiedProfile = JSON.parse(JSON.stringify(doctorProfile));
  const swapConfig = rotation.swapConfig;

  // Handle single backbone
  if (modifiedProfile.backbone && !modifiedProfile.backbones) {
    modifiedProfile.backbone = applyTPSwapToBackbone(
      modifiedProfile.backbone,
      swapConfig.originalTPDay,
      swapConfig.swapToDay
    );
  }

  // Handle multiple backbones (like DL with MPO/HDJ)
  if (modifiedProfile.backbones) {
    Object.keys(modifiedProfile.backbones).forEach(backboneName => {
      modifiedProfile.backbones[backboneName] = applyTPSwapToBackbone(
        modifiedProfile.backbones[backboneName],
        swapConfig.originalTPDay,
        swapConfig.swapToDay
      );
    });
  }

  if (tpRotationConfig.logLevel >= 1) {
    const colors = tpRotationConfig.logColors;
    console.log(`${colors.success} Applied TP swap to ${doctorCode} profile: ${swapConfig.originalTPDay} → ${swapConfig.swapToDay} (${rotation.weekKey})`);
  }

  return modifiedProfile;
}

/**
 * Get rotation summary for a range of weeks
 * Useful for previewing rotation schedule
 * Updated to handle third Wednesday special case
 *
 * @param {number} startWeek - Starting week number
 * @param {number} startYear - Starting year
 * @param {number} numWeeks - Number of weeks to preview
 * @returns {Array} Array of rotation summaries
 */
export function getRotationSummary(startWeek, startYear, numWeeks = 10) {
  const summary = [];

  let currentWeek = startWeek;
  let currentYear = startYear;

  for (let i = 0; i < numWeeks; i++) {
    const rotation = calculateTPRotationForWeek(currentWeek, currentYear);

    // Handle third Wednesday special case
    if (rotation.isThirdWednesday) {
      const swapDetails = rotation.doctorsToSwap.map(doctor => {
        const config = rotation.swapConfigs[doctor];
        return `${doctor}: ${config.originalTPDay} → ${config.swapToDay}`;
      }).join(", ");

      summary.push({
        week: currentWeek,
        year: currentYear,
        weekKey: rotation.weekKey,
        isThirdWednesday: true,
        doctorsToSwap: rotation.doctorsToSwap,
        swapDetails,
        isVacationWeek: false
      });
    } else {
      // Regular rotation or vacation week
      const swapDetails = rotation.doctorToSwap && rotation.swapConfig
        ? `${rotation.doctorToSwap}: ${rotation.swapConfig.originalTPDay} → ${rotation.swapConfig.swapToDay}`
        : "No swap";

      summary.push({
        week: currentWeek,
        year: currentYear,
        weekKey: rotation.weekKey,
        isThirdWednesday: false,
        doctorToSwap: rotation.doctorToSwap,
        swapConfig: rotation.swapConfig,
        swapDetails,
        isVacationWeek: rotation.isVacationWeek
      });
    }

    // Advance to next week
    currentWeek++;
    if (currentWeek > 52) {
      currentWeek = 1;
      currentYear++;
    }
  }

  return summary;
}

/**
 * Pretty print rotation summary to console
 * Useful for debugging and validation
 *
 * @param {number} startWeek - Starting week number
 * @param {number} startYear - Starting year
 * @param {number} numWeeks - Number of weeks to preview
 */
export function printRotationSummary(startWeek, startYear, numWeeks = 20) {
  console.log("\n" + "=".repeat(80));
  console.log("📅 WEDNESDAY TP ROTATION SCHEDULE");
  console.log("=".repeat(80));
  console.log(`Preview: ${numWeeks} weeks starting from ${startYear}-W${String(startWeek).padStart(2, '0')}\n`);

  const summary = getRotationSummary(startWeek, startYear, numWeeks);

  summary.forEach((entry, index) => {
    const weekLabel = `${entry.weekKey}`.padEnd(12);

    if (entry.isThirdWednesday) {
      console.log(`${weekLabel} 🌟 THIRD WEDNESDAY: ${entry.swapDetails}`);
    } else if (entry.isVacationWeek) {
      console.log(`${weekLabel} 🏖️  VACATION WEEK: No rotation`);
    } else {
      console.log(`${weekLabel} 🔄  ${entry.swapDetails}`);
    }
  });

  console.log("\n" + "=".repeat(80) + "\n");
}

/**
 * Export rotation statistics for analysis
 *
 * @param {number} startWeek - Starting week number
 * @param {number} startYear - Starting year
 * @param {number} numWeeks - Number of weeks to analyze
 * @returns {Object} Rotation statistics
 */
export function getRotationStatistics(startWeek, startYear, numWeeks = 52) {
  const summary = getRotationSummary(startWeek, startYear, numWeeks);
  const rotationOrder = getRotationOrder();

  // Count swaps per doctor
  const swapCounts = {};
  rotationOrder.forEach(doctor => {
    swapCounts[doctor] = 0;
  });

  let vacationWeeks = 0;

  summary.forEach(entry => {
    if (entry.isVacationWeek) {
      vacationWeeks++;
    } else if (entry.doctorToSwap) {
      swapCounts[entry.doctorToSwap]++;
    }
  });

  return {
    totalWeeks: numWeeks,
    workingWeeks: numWeeks - vacationWeeks,
    vacationWeeks,
    swapCounts,
    averageSwapsPerDoctor: Object.values(swapCounts).reduce((a, b) => a + b, 0) / rotationOrder.length,
    fairnessScore: calculateFairnessScore(swapCounts)
  };
}

/**
 * Calculate fairness score (0-1, where 1 = perfectly equal distribution)
 *
 * @param {Object} swapCounts - Map of doctor -> swap count
 * @returns {number} Fairness score
 */
function calculateFairnessScore(swapCounts) {
  const counts = Object.values(swapCounts);
  if (counts.length === 0) return 1;

  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);

  // Normalize: lower std dev = higher fairness
  // Perfect fairness (stdDev = 0) = score 1
  // High variance = score closer to 0
  return mean === 0 ? 1 : Math.max(0, 1 - (stdDev / mean));
}
