import {
  doctorProfiles,
  generateDoctorRotations,
  docActivities,
  applyTPRotationToProfiles,
  isTPRotationEnabled,
} from "./doctorSchedules.js";
import { expectedActivities as staticExpectedActivities } from "./schedule.jsx";
import {
  resolveHTCConflicts,
  resolveEMITConflicts,
  resolveEMATITConflicts,
  resolveTeleCsConflicts,
  calculateCumulativeWorkloadPerDoctor,
  setDynamicDocActivities,
  resetDocActivities,
} from "./activityConflictResolver.js";
import {
  getRegularDoctorPeriod,
  getDLStateForWeek,
  getPeriodIndexForWeek,
  initializePeriodSystem,
  scheduleConfig,
  isHolidayWeek,
  isHolidayDay
} from "./periodCalculator.js";
import { calculateTPRotationForWeek } from "./tpRotationEngine.js";

// Custom Planning Logic - Algorithme de Planification Médical Progressif et Fiable
// Implémentation en 3 phases selon les spécifications utilisateur

console.log("Custom Planning Logic Module Loaded");

// Initialize period system on module load
initializePeriodSystem();

/**
 * Year Configuration - Change this to plan different years
 * Examples:
 * - [2024] - only 2024 (weeks 44-52)
 * - [2025] - only 2025 (weeks 1-52)
 * - [2026] - only 2026 (weeks 1-52)
 * - [2024, 2025] - both 2024 and 2025
 * - [2024, 2025, 2026] - all three years
 */
export const PLANNING_CONFIG = {
  yearsToPlan: [2026],  // Default: plan for 2026 only
};

/**
 * Configuration de l'algorithme
 */
const TIME_SLOTS = ["9am-1pm", "2pm-6pm"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// ============================================================================
// WEEK-BY-WEEK SCHEDULE GENERATION (NEW ARCHITECTURE)
// ============================================================================

/**
 * Generate schedules week-by-week using the new hierarchical period system
 * This replaces the old period-based generation with week-aware generation
 *
 * @param {Object} baseSchedule - Base schedule for rigid doctors
 * @param {Object} rotationAssignments - Doctor rotation assignments
 * @param {string} cycleType - Rotation cycle type (honeymoon, NoMG, etc.)
 * @param {Object} dynamicDoctorProfiles - Dynamic doctor profiles
 * @param {Object} dynamicWantedActivities - Dynamic wanted activities
 * @param {Array} conflictResolutionOrder - Order of conflict resolution
 * @param {Object} dynamicDocActivities - Dynamic activity durations
 * @returns {Object} Weekly schedules with full metadata
 */
function generateWeekByWeekSchedules(
  baseSchedule,
  rotationAssignments,
  cycleType,
  dynamicDoctorProfiles = null,
  dynamicWantedActivities = null,
  conflictResolutionOrder = ["HTC", "EMIT", "EMATIT", "TeleCs"],
  dynamicDocActivities = null
) {
  console.log("🗓️ Generating week-by-week schedules using new architecture...");

  const profilesData = dynamicDoctorProfiles || doctorProfiles;
  const weeklySchedules = {};

  // Set dynamic docActivities for conflict resolution
  if (dynamicDocActivities) {
    setDynamicDocActivities(dynamicDocActivities);
  }

  // Define weeks to generate based on PLANNING_CONFIG
  const weeksToGenerate = [];
  PLANNING_CONFIG.yearsToPlan.forEach(year => {
    if (year === 2024) {
      // 2024 starts from week 44 (when planning data begins)
      weeksToGenerate.push(...Array.from({ length: 9 }, (_, i) => ({ week: 44 + i, year: 2024 })));
    } else {
      // Full year (weeks 1-52)
      weeksToGenerate.push(...Array.from({ length: 52 }, (_, i) => ({ week: i + 1, year })));
    }
  });

  console.log(`📅 Planning for year(s): ${PLANNING_CONFIG.yearsToPlan.join(', ')} (${weeksToGenerate.length} weeks total)`);

  // Identify rigid vs flexible doctors
  const rigidDoctors = [];
  const flexibleDoctors = [];

  Object.entries(rotationAssignments).forEach(([doctorCode]) => {
    const profile = profilesData[doctorCode];
    if (profile?.rotationSetting?.length <= 1) {
      rigidDoctors.push(doctorCode);
    } else {
      flexibleDoctors.push(doctorCode);
    }
  });

  console.log(`🔒 Rigid doctors: ${rigidDoctors.join(", ")}`);
  console.log(`🔄 Flexible doctors: ${flexibleDoctors.join(", ")}`);

  // Get rotation cycle
  const selectedCycle = rotation_cycles[cycleType] || rotation_cycles.honeymoon_NS_noHDJ;

  // Generate schedule for each week
  weeksToGenerate.forEach(({ week, year }) => {
    const weekKey = `${year}-W${String(week).padStart(2, '0')}`;
    console.log(`\n📅 Generating schedule for ${weekKey}...`);

    // Get period info for this week
    const periodInfo = getRegularDoctorPeriod(week, year);
    const dlState = getDLStateForWeek(week, year);
    let periodIndex = periodInfo ? periodInfo.periodNumber - 1 : 0;

    // ============================================================================
    // TP ROTATION APPLICATION (BEFORE ALL SCHEDULE GENERATION)
    // ============================================================================
    // Apply TP rotation to doctor profiles BEFORE any schedule generation
    // This ensures that all subsequent operations (rotation generation, conflict
    // resolution) use the modified backbones with rotated TP days.

    let weekDoctorProfiles = profilesData;

    if (isTPRotationEnabled()) {
      // Calculate TP rotation for this week
      const tpRotation = calculateTPRotationForWeek(week, year);

      if (tpRotation.enabled && !tpRotation.isVacationWeek && tpRotation.doctorToSwap) {
        console.log(`  🔄 TP Rotation: ${tpRotation.doctorToSwap} swaps ${tpRotation.swapConfig.originalTPDay} → ${tpRotation.swapConfig.swapToDay}`);

        // Apply TP rotation to all doctor profiles for this week
        weekDoctorProfiles = applyTPRotationToProfiles(profilesData, week, year);

        console.log(`  ✅ TP Rotation applied for ${weekKey}`);
      } else if (tpRotation.isVacationWeek) {
        console.log(`  🏖️ TP Rotation: Skipped (vacation week)`);
      } else {
        console.log(`  ℹ️ TP Rotation: No swap this week (cycle week ${tpRotation.weekInCycle || 0}/${tpRotation.cycleWeeks || 0})`);
      }
    }

    // ✅ NEW: Check vacation status for ALL days (including weekends)
    // Working days (Mon-Fri) determine if we apply conflict resolution
    // All days (Mon-Sun) determine which days get backbone-only schedules
    const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const workingDayVacationStatus = workingDays.map(day => ({
      day,
      isVacation: isHolidayDay(week, day, year)
    }));

    const allDayVacationStatus = allDays.map(day => ({
      day,
      isVacation: isHolidayDay(week, day, year)
    }));

    const allWorkingDaysAreVacation = workingDayVacationStatus.every(d => d.isVacation);
    const someWorkingDaysAreVacation = workingDayVacationStatus.some(d => d.isVacation);
    const anyDayIsVacation = allDayVacationStatus.some(d => d.isVacation);

    if (anyDayIsVacation) {
      console.log(`  📅 Vacation days detected for ${weekKey}:`);
      allDayVacationStatus.forEach(({ day, isVacation }) => {
        if (isVacation) {
          console.log(`    ${day}: 🏖️ VACATION`);
        }
      });
      if (!allWorkingDaysAreVacation) {
        console.log(`  📅 Working days in this week:`);
        workingDayVacationStatus.forEach(({ day, isVacation }) => {
          if (!isVacation) {
            console.log(`    ${day}: 💼 WORKING`);
          }
        });
      }
    }

    // Handle FULL vacation weeks specially (all working days are vacation)
    if (allWorkingDaysAreVacation) {
      console.log(`  🏖️ Full vacation week detected - using BACKBONE-ONLY schedules`);

      // Generate backbone-only schedules for all doctors
      const weekSchedule = {};

      // Get all doctors from both rotationAssignments and baseSchedule
      const allDoctors = new Set([
        ...Object.keys(rotationAssignments),
        ...Object.keys(baseSchedule)
      ]);

      // All doctors use their backbone schedule ONLY during full vacation
      // ✅ Use weekDoctorProfiles which may have TP rotations applied
      allDoctors.forEach((doctorCode) => {
        const profile = weekDoctorProfiles[doctorCode];
        if (!profile || (!profile.backbone && !profile.backbones)) {
          console.warn(`  ⚠️ No backbone found for ${doctorCode}`);
          return;
        }

        let activeBackbone = profile.backbone;

        // Special handling for DL with multiple backbones (2-week rhythm)
        if (doctorCode === "DL" && profile.backbones && dlState) {
          if (profile.backbones[dlState.state]) {
            activeBackbone = profile.backbones[dlState.state];
            console.log(`  🏥 DL: ${dlState.state} backbone (vacation week, week ${dlState.weekInCycle}/${scheduleConfig.DL.cycleWeeks})`);
          }
        } else {
          console.log(`  🏖️ ${doctorCode}: backbone-only (vacation)`);
        }

        // Use ONLY the backbone, no rotation activities
        weekSchedule[doctorCode] = deepClone(activeBackbone);
      });

      // Store vacation week schedule (no conflict resolution needed)
      weeklySchedules[weekKey] = {
        week,
        year,
        periodInfo: { periodId: 'VACATION', periodNumber: 0, parentPeriod: 'Full Vacation Week' },
        dlState,
        schedule: weekSchedule
      };

      return; // Skip normal processing for vacation weeks
    }

    // ✅ Don't skip weeks without period info - they might be partial vacation weeks
    // Just log a warning but continue processing
    if (!periodInfo) {
      console.warn(`⚠️ No period info for ${weekKey}, treating as standard week...`);
      // Set a default periodIndex to avoid errors
      periodIndex = 0;
    }

    console.log(`  Period: ${periodInfo?.periodId || 'N/A'}, DL state: ${dlState?.state}`);

    const weekSchedule = {};

    // 1. Keep rigid doctors unchanged (but use TP-rotated backbones if applicable)
    rigidDoctors.forEach((doctorCode) => {
      // ✅ Use weekDoctorProfiles to get TP-rotation-aware backbone
      const doctorProfile = weekDoctorProfiles[doctorCode];
      if (doctorProfile && doctorProfile.backbone) {
        weekSchedule[doctorCode] = deepClone(doctorProfile.backbone);
        console.log(`  🔒 ${doctorCode}: rigid schedule (with TP rotation if applicable)`);
      } else if (baseSchedule[doctorCode]) {
        // Fallback to baseSchedule if no profile found
        weekSchedule[doctorCode] = deepClone(baseSchedule[doctorCode]);
        console.log(`  🔒 ${doctorCode}: rigid schedule maintained (no profile)`);
      }
    });

    // 2. Get rotation assignments for this period from the cycle
    const cycleIndex = periodIndex % selectedCycle.periods.length;
    const periodRotations = selectedCycle.periods[cycleIndex];

    if (periodInfo) {
      console.log(`  📊 Period details:`, {
        periodNumber: periodInfo.periodNumber,
        periodIndex,
        cycleIndex,
        parentPeriod: periodInfo.parentPeriod,
        halfNumber: periodInfo.halfNumber,
        weekInPeriod: periodInfo.weekInPeriod,
        totalWeeksInPeriod: periodInfo.totalWeeksInPeriod
      });
    } else {
      console.log(`  📊 No period info - using default periodIndex: ${periodIndex}`);
    }

    console.log(`  🎯 Period rotations (cycle ${cycleIndex}):`, periodRotations);
    console.log(`  🔄 Flexible doctor assignments:`, {
      MDLC: periodRotations.MDLC || Object.entries(periodRotations).find(([_, doc]) => doc === 'MDLC')?.[0],
      RNV: periodRotations.RNV || Object.entries(periodRotations).find(([_, doc]) => doc === 'RNV')?.[0],
      MG: periodRotations.MG || Object.entries(periodRotations).find(([_, doc]) => doc === 'MG')?.[0],
      FL: periodRotations.FL || Object.entries(periodRotations).find(([_, doc]) => doc === 'FL')?.[0],
      CL: periodRotations.CL || Object.entries(periodRotations).find(([_, doc]) => doc === 'CL')?.[0],
      NS: periodRotations.NS || Object.entries(periodRotations).find(([_, doc]) => doc === 'NS')?.[0]
    });

    // 3. Generate schedules for flexible doctors with WEEK-AWARE rotation generation
    flexibleDoctors.forEach((doctorCode) => {
      // Skip DL - it has special handling later
      if (doctorCode === "DL") {
        return;
      }

      const assignedActivity = periodRotations[doctorCode] ||
                               Object.entries(periodRotations).find(([_, doc]) => doc === doctorCode)?.[0];

      if (!assignedActivity && doctorCode !== "DL") {
        console.warn(`  ⚠️ No activity assignment for ${doctorCode} in period ${periodIndex}`);
        // ✅ Use TP-rotated backbone if available
        const doctorProfile = weekDoctorProfiles[doctorCode];
        if (doctorProfile && doctorProfile.backbone) {
          weekSchedule[doctorCode] = deepClone(doctorProfile.backbone);
        } else {
          weekSchedule[doctorCode] = deepClone(baseSchedule[doctorCode]);
        }
        return;
      }

      try {
        // ✅ WEEK-AWARE GENERATION: Pass week and year to generateDoctorRotations
        // ✅ USE weekDoctorProfiles which may have TP rotations applied
        const generatedRotations = generateDoctorRotations(
          doctorCode,
          weekDoctorProfiles,  // Use TP-rotation-aware profiles
          dynamicWantedActivities,
          periodIndex,
          dynamicDocActivities,
          week,  // ✅ NEW: Week parameter
          year   // ✅ NEW: Year parameter
        );

        if (generatedRotations[assignedActivity]) {
          weekSchedule[doctorCode] = deepClone(generatedRotations[assignedActivity]);
          console.log(`  ✅ ${doctorCode}: assigned to ${assignedActivity} (week-aware)`);
        } else {
          // ✅ Use TP-rotated backbone if available
          const doctorProfile = weekDoctorProfiles[doctorCode];
          if (doctorProfile && doctorProfile.backbone) {
            weekSchedule[doctorCode] = deepClone(doctorProfile.backbone);
          } else {
            weekSchedule[doctorCode] = deepClone(baseSchedule[doctorCode]);
          }
          console.warn(`  ⚠️ Activity ${assignedActivity} not found for ${doctorCode}`);
        }
      } catch (error) {
        console.error(`  ❌ Error generating rotation for ${doctorCode}:`, error);
        // ✅ Use TP-rotated backbone if available
        const doctorProfile = weekDoctorProfiles[doctorCode];
        if (doctorProfile && doctorProfile.backbone) {
          weekSchedule[doctorCode] = deepClone(doctorProfile.backbone);
        } else {
          weekSchedule[doctorCode] = deepClone(baseSchedule[doctorCode]);
        }
      }
    });

    // 4. Special handling for DL (always use week-based backbone)
    if (rotationAssignments["DL"]) {
      try {
        // ✅ DL uses week-aware backbone selection (implemented in generateDoctorRotations)
        // ✅ USE weekDoctorProfiles which may have TP rotations applied
        const dlRotations = generateDoctorRotations(
          "DL",
          weekDoctorProfiles,  // Use TP-rotation-aware profiles
          dynamicWantedActivities,
          periodIndex,
          dynamicDocActivities,
          week,  // ✅ Week-based backbone selection
          year
        );

        if (dlState && dlRotations[dlState.state]) {
          weekSchedule["DL"] = deepClone(dlRotations[dlState.state]);
          console.log(`  🏥 DL: ${dlState.state} (week ${dlState.weekInCycle}/${scheduleConfig.DL.cycleWeeks})`);
        }
      } catch (error) {
        console.error(`  ❌ Error with DL backbone:`, error);
      }
    }

    // 5. Apply conflict resolution to this week's schedule
    console.log(`  🔧 Applying conflict resolution for ${weekKey}...`);

    // Calculate cumulative workload up to this week for balanced assignments
    const cumulativeWorkload = calculateCumulativeWorkloadPerDoctor(weeklySchedules);

    // Apply conflict resolvers in the specified order
    let resolvedSchedule = weekSchedule;

    conflictResolutionOrder.forEach(conflictType => {
      if (conflictType === "HTC") {
        const htcResult = resolveHTCConflicts(resolvedSchedule, cycleType, periodIndex);
        if (htcResult.success) {
          resolvedSchedule = htcResult.schedule;
          console.log(`    ✅ HTC conflicts resolved`);
        }
      } else if (conflictType === "EMIT") {
        const emitResult = resolveEMITConflicts(
          resolvedSchedule,
          cycleType,
          periodIndex,
          weeklySchedules,
          cumulativeWorkload
        );
        if (emitResult.success) {
          resolvedSchedule = emitResult.schedule;
          console.log(`    ✅ EMIT conflicts resolved`);
        }
      } else if (conflictType === "EMATIT") {
        const ematitResult = resolveEMATITConflicts(
          resolvedSchedule,
          cycleType,
          periodIndex,
          weeklySchedules,
          cumulativeWorkload
        );
        if (ematitResult.success) {
          resolvedSchedule = ematitResult.schedule;
          console.log(`    ✅ EMATIT conflicts resolved`);
        }
      } else if (conflictType === "TeleCs") {
        const telecsResult = resolveTeleCsConflicts(
          resolvedSchedule,
          cycleType,
          periodIndex,
          weeklySchedules,
          cumulativeWorkload
        );
        if (telecsResult.success) {
          resolvedSchedule = telecsResult.schedule;
          console.log(`    ✅ TeleCs assigned`);
        }
      }
    });

    // 6. ✅ NEW: Replace vacation days with backbone-only schedules
    // This applies to:
    // - Mixed weeks (some working days are vacation, some are not)
    // - Weeks where only weekends are vacation
    if (anyDayIsVacation && !allWorkingDaysAreVacation) {
      console.log(`  🏖️ Post-processing: replacing vacation days with backbone...`);
      resolvedSchedule = replaceVacationDaysWithBackbone(
        resolvedSchedule,
        allDayVacationStatus,  // ✅ Use all days, including weekends
        dynamicDoctorProfiles,
        week,
        year
      );
    }

    // Store the RESOLVED schedule with metadata
    weeklySchedules[weekKey] = {
      week,
      year,
      periodInfo: periodInfo || { periodId: 'UNKNOWN', periodNumber: 0, parentPeriod: 'No Period Info' },
      dlState,
      schedule: resolvedSchedule  // ✅ Use resolved schedule instead of base schedule
    };
  });

  console.log(`✅ Generated ${Object.keys(weeklySchedules).length} weekly schedules`);
  return weeklySchedules;
}

// Helper function for deep cloning
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Replace vacation days in a week schedule with backbone-only schedules
 * This ensures that during vacation days, only the backbone activities are shown
 *
 * @param {Object} weekSchedule - Week schedule with all doctors
 * @param {Array} workingDayVacationStatus - Array of {day, isVacation} objects
 * @param {Object} dynamicDoctorProfiles - Doctor profiles containing backbone definitions
 * @param {number} week - Week number
 * @param {number} year - Year
 * @returns {Object} Modified week schedule with backbone-only on vacation days
 */
function replaceVacationDaysWithBackbone(
  weekSchedule,
  workingDayVacationStatus,
  dynamicDoctorProfiles,
  week,
  year
) {
  const modifiedSchedule = deepClone(weekSchedule);
  const profilesData = dynamicDoctorProfiles || doctorProfiles;

  // Find which days are vacation days
  const vacationDays = workingDayVacationStatus
    .filter(d => d.isVacation)
    .map(d => d.day);

  if (vacationDays.length === 0) {
    return modifiedSchedule; // No vacation days, return as-is
  }

  console.log(`  🏖️ Replacing vacation days with backbone: ${vacationDays.join(', ')}`);

  // For each doctor, replace their vacation day schedules with backbone only
  Object.keys(modifiedSchedule).forEach(doctorCode => {
    const profile = profilesData[doctorCode];
    if (!profile || !profile.backbone) {
      return; // Skip if no backbone defined
    }

    let activeBackbone = profile.backbone;

    // Special handling for DL with multiple backbones (2-week rhythm)
    if (doctorCode === "DL" && profile.backbones) {
      const dlState = getDLStateForWeek(week, year);
      if (dlState && profile.backbones[dlState.state]) {
        activeBackbone = profile.backbones[dlState.state];
      }
    }

    // Replace each vacation day with backbone schedule
    vacationDays.forEach(day => {
      if (activeBackbone[day]) {
        modifiedSchedule[doctorCode][day] = deepClone(activeBackbone[day]);
        console.log(`    ${doctorCode}.${day}: replaced with backbone`);
      }
    });
  });

  return modifiedSchedule;
}

/**
 * Convert weekly schedules to period format for backward compatibility
 * Groups weeks by period and provides the same structure as createPeriodicVariations
 *
 * @param {Object} weeklySchedules - Weekly schedules from generateWeekByWeekSchedules
 * @returns {Object} Period-based schedule format
 */
function convertWeeklySchedulesToPeriodFormat(weeklySchedules) {
  const periodicSchedule = {};

  Object.entries(weeklySchedules).forEach(([weekKey, weekData]) => {
    const { week, year, periodInfo, dlState, schedule } = weekData;

    // Use period ID as the key (e.g., "P1", "P2", etc.)
    const periodKey = periodInfo.periodId;

    if (!periodicSchedule[periodKey]) {
      periodicSchedule[periodKey] = {
        period: periodInfo,
        weeks: [],
        schedule: null  // Will use the last week's schedule as representative
      };
    }

    // Store week info
    periodicSchedule[periodKey].weeks.push({
      weekKey,
      week,
      year,
      dlState
    });

    // Use this week's schedule (last week in period will be used)
    periodicSchedule[periodKey].schedule = schedule;
  });

  console.log(`📦 Converted ${Object.keys(weeklySchedules).length} weekly schedules to ${Object.keys(periodicSchedule).length} periods`);
  return periodicSchedule;
}

/**
 * Activity-centric rotation cycles with descriptions and metadata
 * Each cycle includes a description and periods array for better documentation
 */
export const rotation_cycles = {
  honeymoon_NS_noHDJ: {
    description: "NS 100% et sans HDJ",
    periods: [
      {
        period: 1,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 2,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 3,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
      {
        period: 4,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 5,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 6,
        HTC1: "NS",
        HDJ: "CL",
        AMI: "FL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
    ],
  },
  honeymoon_NS_HDJ: {
    description: "NS 100% et avec HDJ",
    periods: [
      {
        period: 1,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 2,
        HTC1: "CL",
        HDJ: "NS",
        AMI: "FL",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 3,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
      {
        period: 4,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 5,
        HTC1: "CL",
        HDJ: "NS",
        AMI: "FL",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 6,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
    ],
  },
  NoMG: {
    description: "MG en dispo",
    periods: [
      {
        period: 1,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
      },
      {
        period: 2,
        HTC1: "NS",
        HDJ: "CL",
        AMI: "FL",
        HTC2: "RNV",
        EMIT: "MDLC",
      },
      {
        period: 3,
        HTC1: "FL",
        HDJ: "NS",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MDLC",
      },
      {
        period: 4,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
      },
      {
        period: 5,
        HTC1: "NS",
        HDJ: "CL",
        AMI: "FL",
        HTC2: "RNV",
        EMIT: "MDLC",
      },
      {
        period: 6,
        HTC1: "FL",
        HDJ: "NS",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MDLC",
      },
    ],
  },
  emergency: {
    description:
      "Emergency coverage cycle with reduced rotations and minimal changes for crisis situations",
    periods: [
      {
        period: 1,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 2,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 3,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 4,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 5,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
      {
        period: 6,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS FOR TWO-PASS ALGORITHM
// ============================================================================

/**
 * Update cumulative workload tracker with new assignments from conflict resolution
 * Compares resolved schedule against base schedule to find newly added activities
 *
 * @param {Object} dynamicWorkload - Current cumulative workload tracker (mutated in-place)
 * @param {Object} resolvedSchedule - Schedule after conflict resolution (HTC or EMIT)
 * @param {Object} baseSchedule - Original schedule before resolution
 */
function updateDynamicWorkload(
  dynamicWorkload,
  resolvedSchedule,
  baseSchedule
) {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const SLOTS = ["9am-1pm", "2pm-6pm"];

  Object.keys(resolvedSchedule).forEach((doctor) => {
    DAYS.forEach((day) => {
      SLOTS.forEach((slot) => {
        const resolvedActivities =
          resolvedSchedule[doctor]?.[day]?.[slot] || [];
        const baseActivities = baseSchedule[doctor]?.[day]?.[slot] || [];

        // Find newly added activities (in resolved but not in base)
        const addedActivities = resolvedActivities.filter(
          (activity) => !baseActivities.includes(activity)
        );

        // Add their duration to the dynamic workload
        addedActivities.forEach((activity) => {
          // ✅ Use ?? to handle 0-duration activities correctly
          const duration = docActivities[activity]?.duration ?? 1;
          if (!dynamicWorkload[doctor]) {
            dynamicWorkload[doctor] = 0;
          }
          dynamicWorkload[doctor] += duration;
        });
      });
    });
  });
}

/**
 * Convert custom planning result to calendar format (same as UI)
 */
function convertCustomToCalendarFormat(customScheduleData) {
  const calendarFormat = {
    2024: { Month1: {} },
    2025: { Month1: {} },
  };

  if (customScheduleData.success) {
    // Priority 1: Use final adjusted schedule for first weeks
    if (customScheduleData.finalSchedule) {
      const firstWeeks = ["Week44", "Week45", "Week46", "Week47"];
      firstWeeks.forEach((weekKey) => {
        calendarFormat[2024].Month1[weekKey] = customScheduleData.finalSchedule;
      });
    }

    // Priority 2: Use periodic variations for following weeks
    if (customScheduleData.periodicSchedule) {
      const periods = Object.keys(customScheduleData.periodicSchedule);
      periods.slice(0, 6).forEach((periodName, index) => {
        const weekNumber = 48 + index;
        const year = weekNumber > 52 ? 2025 : 2024;
        const adjustedWeekNumber =
          weekNumber > 52 ? weekNumber - 52 : weekNumber;
        const weekKey = `Week${adjustedWeekNumber}`;

        if (customScheduleData.periodicSchedule[periodName].schedule) {
          if (year === 2024) {
            calendarFormat[2024].Month1[weekKey] =
              customScheduleData.periodicSchedule[periodName].schedule;
          } else {
            calendarFormat[2025].Month1[weekKey] =
              customScheduleData.periodicSchedule[periodName].schedule;
          }
        }
      });
    }

    // Fallback: If no final schedule, use only periodic
    if (
      !customScheduleData.finalSchedule &&
      customScheduleData.periodicSchedule
    ) {
      const periods = Object.keys(customScheduleData.periodicSchedule);
      periods.slice(0, 10).forEach((periodName, index) => {
        const weekNumber = 44 + index;
        const year = weekNumber > 52 ? 2025 : 2024;
        const adjustedWeekNumber =
          weekNumber > 52 ? weekNumber - 52 : weekNumber;
        const weekKey = `Week${adjustedWeekNumber}`;

        if (customScheduleData.periodicSchedule[periodName].schedule) {
          if (year === 2024) {
            calendarFormat[2024].Month1[weekKey] =
              customScheduleData.periodicSchedule[periodName].schedule;
          } else {
            calendarFormat[2025].Month1[weekKey] =
              customScheduleData.periodicSchedule[periodName].schedule;
          }
        }
      });
    }
  }

  return calendarFormat;
}

/**
 * Validate calendar format and count total missing/duplicates (same as UI checkAssignments)
 */
function validateCalendarFormat(schedule, expectedActivities) {
  const duplicateActivities = ["EMIT", "HDJ", "AMI", "HTC1", "HTC2", "EMATIT"];
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = ["9am-1pm", "2pm-6pm"];

  let totalMissing = 0;
  let totalDuplicates = 0;
  let totalSlots = 0;
  let validSlots = 0;

  const problems = {
    missing: [],
    duplicates: [],
  };

  // Track activity counts for detailed breakdown
  const missingActivityCounts = {};
  const duplicateActivityCounts = {};

  Object.keys(schedule).forEach((year) => {
    Object.keys(schedule[year]).forEach((month) => {
      Object.keys(schedule[year][month]).forEach((week) => {
        daysOfWeek.forEach((day) => {
          timeSlots.forEach((slot) => {
            totalSlots++;

            const assigned = [];

            // Collect all activities assigned by all doctors for this slot
            Object.keys(schedule[year][month][week]).forEach((doctor) => {
              if (
                schedule[year][month][week][doctor][day] &&
                schedule[year][month][week][doctor][day][slot]
              ) {
                assigned.push(
                  ...schedule[year][month][week][doctor][day][slot]
                );
              }
            });

            const expected = expectedActivities[day]?.[slot] || [];

            // Check for missing activities
            expected.forEach((activity) => {
              if (!assigned.includes(activity)) {
                totalMissing++;
                problems.missing.push({
                  year,
                  month,
                  week,
                  day,
                  slot,
                  activity,
                });

                // Count by activity type
                if (!missingActivityCounts[activity]) {
                  missingActivityCounts[activity] = 0;
                }
                missingActivityCounts[activity]++;
              }
            });

            // Check for duplicate activities
            const activityCounts = {};
            assigned.forEach((activity) => {
              if (duplicateActivities.includes(activity)) {
                if (!activityCounts[activity]) {
                  activityCounts[activity] = 0;
                }
                activityCounts[activity]++;
              }
            });

            const duplicates = Object.entries(activityCounts)
              .filter(([activity, count]) => count > 1)
              .map(([activity, count]) => `${activity} (${count})`);

            if (duplicates.length > 0) {
              totalDuplicates += duplicates.length;
              problems.duplicates.push({
                year,
                month,
                week,
                day,
                slot,
                duplicates,
              });

              // Count by activity type for duplicates
              Object.entries(activityCounts)
                .filter(([activity, count]) => count > 1)
                .forEach(([activity, count]) => {
                  if (!duplicateActivityCounts[activity]) {
                    duplicateActivityCounts[activity] = 0;
                  }
                  duplicateActivityCounts[activity] += 1; // Count each duplicate instance
                });
            }

            // Check if slot is valid (no missing and no duplicates)
            if (
              expected.every((activity) => assigned.includes(activity)) &&
              duplicates.length === 0
            ) {
              validSlots++;
            }
          });
        });
      });
    });
  });

  // Create formatted summary strings
  const formatActivityBreakdown = (activityCounts, total) => {
    if (total === 0) return "";

    const sortedActivities = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a) // Sort by count descending
      .map(([activity, count]) => `${activity} ${count}`)
      .join(", ");

    return ` (${sortedActivities})`;
  };

  const missingSummary = `Missing total: ${totalMissing}${formatActivityBreakdown(
    missingActivityCounts,
    totalMissing
  )}`;
  const duplicateSummary = `Duplicate total: ${totalDuplicates}${formatActivityBreakdown(
    duplicateActivityCounts,
    totalDuplicates
  )}`;

  return {
    totalMissing,
    totalDuplicates,
    totalSlots,
    validSlots,
    coveragePercentage: totalSlots > 0 ? (validSlots / totalSlots) * 100 : 0,
    problems,
    activityBreakdown: {
      missing: missingActivityCounts,
      duplicates: duplicateActivityCounts,
    },
    summaryText: {
      missing: missingSummary,
      duplicates: duplicateSummary,
      combined: `${missingSummary}\n${duplicateSummary}`,
    },
  };
}

/**
 * Utilitaires de base
 */

// Structure de planning vide (utilisée dans d'autres modules)
export const getEmptySchedule = () => ({
  Monday: { "9am-1pm": [], "2pm-6pm": [] },
  Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
  Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
  Thursday: { "9am-1pm": [], "2pm-6pm": [] },
  Friday: { "9am-1pm": [], "2pm-6pm": [] },
});

// Vérifier si un médecin a une seule rotation possible
const hasSingleRotation = (doctorCode, profilesData = null) => {
  const profiles = profilesData || doctorProfiles;
  const profile = profiles[doctorCode];
  return (
    profile && profile.rotationSetting && profile.rotationSetting.length === 1
  );
};

// Vérifier si un médecin a plusieurs rotations possibles
const hasMultipleRotations = (doctorCode, profilesData = null) => {
  const profiles = profilesData || doctorProfiles;
  const profile = profiles[doctorCode];
  return (
    profile && profile.rotationSetting && profile.rotationSetting.length > 1
  );
};

/**
 * PHASE 1: CONSTITUTION PROGRESSIVE DU PLANNING
 *
 * Phase 1.1: Remplir éléments rigides (médecins avec une seule rotation)
 * Phase 1.2: Remplir éléments souples (médecins avec rotations multiples)
 */

/**
 * Phase 1.1: Assigner les médecins rigides (rotationSetting.length = 1)
 * @param {Object} timeUnit - Unité de temps considérée
 * @returns {Object} Planning avec médecins rigides assignés
 */
export function assignRigidDoctors(
  dynamicDoctorProfiles = null,
  dynamicWantedActivities = null,
  dynamicDocActivities = null
) {
  console.log("Phase 1.1: Assignation des médecins rigides...");

  const profilesData = dynamicDoctorProfiles || doctorProfiles;
  const rigidSchedule = {};
  const availableDoctors = Object.keys(profilesData);

  // 🔍 Debug: Log BM's backbone if it exists
  if (profilesData.BM) {
    console.log("🎯 BM backbone in assignRigidDoctors:", {
      Thursday: profilesData.BM.backbone?.Thursday,
      Friday: profilesData.BM.backbone?.Friday,
      rotationSetting: profilesData.BM.rotationSetting,
    });
  }

  // Identifier les médecins avec une seule rotation
  const rigidDoctors = availableDoctors.filter((doctorCode) =>
    hasSingleRotation(doctorCode, profilesData)
  );

  console.log("Médecins rigides identifiés:", rigidDoctors);

  // Pour chaque médecin rigide, utiliser sa seule rotation disponible
  rigidDoctors.forEach((doctorCode) => {
    const profile = profilesData[doctorCode];
    const rotationName = profile.rotationSetting[0]; // Seule rotation disponible

    try {
      // Générer les rotations disponibles pour ce médecin
      const generatedRotations = generateDoctorRotations(
        doctorCode,
        dynamicDoctorProfiles,
        dynamicWantedActivities,
        null,
        dynamicDocActivities
      );

      if (generatedRotations[rotationName]) {
        rigidSchedule[doctorCode] = deepClone(generatedRotations[rotationName]);
        console.log(
          `✅ ${doctorCode} assigné à rotation ${rotationName} (rigide)`
        );

        // 🔍 Debug: Log BM's schedule after assignment
        if (doctorCode === "BM") {
          console.log("🎯 BM's generated schedule:", {
            Thursday: rigidSchedule[doctorCode]?.Thursday,
            Friday: rigidSchedule[doctorCode]?.Friday,
          });
        }
      } else {
        console.warn(
          `⚠️ Rotation ${rotationName} non trouvée pour ${doctorCode}`
        );
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'assignation de ${doctorCode}:`, error);
    }
  });

  // 🔍 Debug: Log final rigid schedule
  console.log(
    "📋 Rigid doctors in final schedule:",
    Object.keys(rigidSchedule)
  );
  if (rigidSchedule.BM) {
    console.log("🎯 BM present in rigidSchedule:", {
      Thursday: rigidSchedule.BM?.Thursday,
      Friday: rigidSchedule.BM?.Friday,
    });
  } else {
    console.warn("⚠️ BM NOT found in rigidSchedule!");
  }

  return {
    schedule: rigidSchedule,
    assignedDoctors: rigidDoctors,
    rotationAssignments: rigidDoctors.reduce((acc, doctor) => {
      acc[doctor] = profilesData[doctor].rotationSetting[0]; // ✅ Fixed: Use dynamic profilesData instead of static doctorProfiles
      return acc;
    }, {}),
  };
}

/**
 * Phase 1.2: Créer dictionnaire rotation -> docteurs pour médecins souples
 * @returns {Object} Dictionnaire {rotation: [docteurs correspondants]}
 */
export function createRotationDict(dynamicDoctorProfiles = null) {
  console.log("Phase 1.2: Création du dictionnaire rotation -> docteurs...");

  const profilesData = dynamicDoctorProfiles || doctorProfiles;
  const rotationDict = {};
  const availableDoctors = Object.keys(profilesData);

  // Identifier les médecins avec plusieurs rotations
  const flexibleDoctors = availableDoctors.filter((doctorCode) =>
    hasMultipleRotations(doctorCode, profilesData)
  );

  flexibleDoctors.forEach((doctorCode) => {
    const profile = profilesData[doctorCode];

    profile.rotationSetting.forEach((rotation) => {
      if (!rotationDict[rotation]) {
        rotationDict[rotation] = [];
      }
      rotationDict[rotation].push(doctorCode);
    });
  });

  console.log("Dictionnaire rotation -> docteurs:", rotationDict);
  return rotationDict;
}

/**
 * Phase 1.2: Sélectionner un médecin responsable par rotation (couple unique)
 * @param {Object} rotationDict - Dictionnaire rotation -> docteurs
 * @param {Object} existingAssignments - Assignations existantes des médecins rigides
 * @returns {Object} Couples uniques doctor-rotation
 */
export function selectUniqueRotationPairs(
  rotationDict,
  existingAssignments = {}
) {
  console.log("Phase 1.2: Sélection couples uniques doctor-rotation...");

  const uniquePairs = { ...existingAssignments };
  const assignedDoctors = new Set(Object.keys(existingAssignments));

  // Pour chaque rotation, choisir un médecin responsable
  Object.entries(rotationDict).forEach(([rotation, doctors]) => {
    // Filtrer les médecins déjà assignés
    const availableDoctors = doctors.filter(
      (doctor) => !assignedDoctors.has(doctor)
    );

    if (availableDoctors.length > 0) {
      // Pour l'instant, prendre le premier disponible
      // Peut être amélioré avec une logique de rotation équitable
      const selectedDoctor = availableDoctors[0];
      uniquePairs[selectedDoctor] = rotation;
      assignedDoctors.add(selectedDoctor);

      console.log(`✅ ${rotation} → ${selectedDoctor} (couple unique)`);
    } else {
      console.warn(`⚠️ Aucun médecin disponible pour rotation ${rotation}`);
    }
  });

  return uniquePairs;
}

/**
 * Phase 1: Constitution complète du planning de base
 * @param {Object} timeUnit - Unité de temps considérée
 * @returns {Object} Planning concaténé complet
 */
export function createBaseScheduling(
  dynamicDoctorProfiles = null,
  dynamicWantedActivities = null,
  dynamicDocActivities = null
) {
  console.log("Phase 1: Constitution du planning de base...");

  // Phase 1.1: Médecins rigides
  const rigidResult = assignRigidDoctors(
    dynamicDoctorProfiles,
    dynamicWantedActivities,
    dynamicDocActivities
  );

  // Phase 1.2: Médecins souples
  const rotationDict = createRotationDict(dynamicDoctorProfiles);
  const uniquePairs = selectUniqueRotationPairs(
    rotationDict,
    rigidResult.rotationAssignments
  );

  // Générer le planning complet à partir des couples uniques
  const completeSchedule = { ...rigidResult.schedule };

  Object.entries(uniquePairs).forEach(([doctorCode, rotationName]) => {
    if (!completeSchedule[doctorCode]) {
      try {
        const generatedRotations = generateDoctorRotations(
          doctorCode,
          dynamicDoctorProfiles,
          dynamicWantedActivities,
          null,
          dynamicDocActivities
        );

        if (generatedRotations[rotationName]) {
          completeSchedule[doctorCode] = deepClone(
            generatedRotations[rotationName]
          );
          console.log(
            `✅ ${doctorCode} assigné à rotation ${rotationName} (souple)`
          );
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'assignation de ${doctorCode}:`,
          error
        );
      }
    }
  });

  return {
    schedule: completeSchedule,
    rotationAssignments: uniquePairs,
    rigidDoctors: rigidResult.assignedDoctors,
    flexibleDoctors: Object.keys(uniquePairs).filter(
      (doctor) => !rigidResult.assignedDoctors.includes(doctor)
    ),
  };
}

/**
 * PHASE 2: SIMPLIFIÉE - PAS DE RÉSOLUTION DE CONFLITS
 *
 * Pour l'instant, on garde le planning tel qu'il est généré en Phase 1
 * sans tenter de résoudre les conflits automatiquement
 */

/**
 * PHASE 3: VARIATION PÉRIODIQUE DES ROTATIONS
 *
 * Créer les variations périodiques selon les rotationSettings
 * et les unités de temps définies
 */

/**
 * Calculer les périodes de rotation basées sur les vacances scolaires
 * @returns {Array} Périodes de rotation
 *
 * NOTE: 12 periods are needed for a complete cycle:
 * - 6 honeymoon rotation positions (activities rotating among flexible doctors)
 * - × 2 DL backbone states (MPO and HDJ alternating each period)
 * = 12 unique combinations to cover the full rotation cycle
 */
export function calculateRotationPeriods() {
  console.log("Phase 3: Calcul des périodes de rotation...");

  // 12 periods covering the full academic year (2024-2025)
  // Each period is approximately 3-4 weeks
  // DL alternates backbones: odd periods = MPO, even periods = HDJ
  const rotationPeriods = [
    // First semester 2024-2025
    { name: "Période 1", startWeek: 44, endWeek: 47, year: 2024 }, // DL: MPO
    { name: "Période 2", startWeek: 48, endWeek: 51, year: 2024 }, // DL: HDJ
    { name: "Période 3", startWeek: 52, endWeek: 3, year: 2025 }, // DL: MPO
    { name: "Période 4", startWeek: 4, endWeek: 7, year: 2025 }, // DL: HDJ
    { name: "Période 5", startWeek: 8, endWeek: 11, year: 2025 }, // DL: MPO
    { name: "Période 6", startWeek: 12, endWeek: 15, year: 2025 }, // DL: HDJ

    // Second semester 2025 - completes the full cycle
    { name: "Période 7", startWeek: 16, endWeek: 19, year: 2025 }, // DL: MPO
    { name: "Période 8", startWeek: 20, endWeek: 23, year: 2025 }, // DL: HDJ
    { name: "Période 9", startWeek: 24, endWeek: 27, year: 2025 }, // DL: MPO
    { name: "Période 10", startWeek: 28, endWeek: 31, year: 2025 }, // DL: HDJ
    { name: "Période 11", startWeek: 32, endWeek: 35, year: 2025 }, // DL: MPO
    { name: "Période 12", startWeek: 36, endWeek: 39, year: 2025 }, // DL: HDJ
  ];

  console.log("Périodes de rotation calculées:", rotationPeriods.length);
  console.log(
    "📊 Full cycle coverage: 6 honeymoon rotations × 2 DL backbones = 12 periods"
  );
  return rotationPeriods;
}

/**
 * Créer les variations périodiques des rotations avec round-robin contraint
 * @param {Object} baseSchedule - Planning de base
 * @param {Object} rotationAssignments - Assignations des rotations
 * @param {string} cycleType - Type de cycle de rotation à utiliser
 * @param {Object} dynamicDoctorProfiles - Dynamic doctor profiles
 * @param {Object} dynamicWantedActivities - Dynamic wanted activities
 * @param {Array} conflictResolutionOrder - Order of conflict resolution (default: ["HTC", "EMIT", "EMATIT", "TeleCs"])
 * @returns {Object} Planning avec variations périodiques
 */
export function createPeriodicVariations(
  baseSchedule,
  rotationAssignments,
  cycleType = "honeymoon",
  dynamicDoctorProfiles = null,
  dynamicWantedActivities = null,
  conflictResolutionOrder = ["HTC", "EMIT", "EMATIT", "TeleCs"],
  dynamicDocActivities = null
) {
  console.log("Phase 3: Création des variations périodiques...");
  console.log("🔧 Conflict resolution order:", conflictResolutionOrder);

  // Set dynamic docActivities for conflict resolution
  if (dynamicDocActivities) {
    console.log(
      "🎯 Setting dynamic docActivities for conflict resolution:",
      dynamicDocActivities
    );
    setDynamicDocActivities(dynamicDocActivities);
  }

  const profilesData = dynamicDoctorProfiles || doctorProfiles;
  const rotationPeriods = calculateRotationPeriods();
  const periodicSchedule = {};

  // Validate conflict resolution order
  const requiredResolvers = ["HTC", "EMIT", "EMATIT", "TeleCs"];
  const missingResolvers = requiredResolvers.filter(
    (r) => !conflictResolutionOrder.includes(r)
  );
  if (missingResolvers.length > 0) {
    console.warn(
      `⚠️ Missing conflict resolvers: ${missingResolvers.join(
        ", "
      )}. Using default order.`
    );
    conflictResolutionOrder = ["HTC", "EMIT", "EMATIT", "TeleCs"];
  }

  // Identifier les médecins rigides et flexibles
  const rigidDoctors = [];
  const flexibleDoctors = [];

  Object.entries(rotationAssignments).forEach(([doctorCode]) => {
    const profile = profilesData[doctorCode]; // ✅ Fixed: Use dynamic profilesData
    if (profile?.rotationSetting?.length <= 1) {
      rigidDoctors.push(doctorCode);
    } else {
      flexibleDoctors.push(doctorCode);
    }
  });

  console.log(`🔍 Rigid doctors:`, rigidDoctors);
  console.log(`🔍 Flexible doctors:`, flexibleDoctors);
  console.log(`🔍 All rotation assignments:`, rotationAssignments);

  // Valider le premier cycle disponible avant utilisation
  const firstCycle = Object.values(rotation_cycles)[0];
  const cycleValidation = validateHoneyMoonCycle(firstCycle.periods);
  if (!cycleValidation.valid) {
    console.warn("⚠️ Cycle invalide:", cycleValidation.missing);
  }
  console.log("🍯 Cycle validation:", cycleValidation);
  console.log("📝 Cycle description:", firstCycle.description);

  // ===========================================================================
  // PASS 1: Generate all period schedules WITHOUT conflict resolution
  // This creates the baseline for full-cycle workload calculation
  // ===========================================================================
  console.log("\n🔄 PASS 1: Generating base schedules for all periods...");
  const basePeriodicSchedule = {};

  rotationPeriods.forEach((period, periodIndex) => {
    console.log(`\n📅 Generating base schedule for ${period.name}...`);
    const periodSchedule = {};

    // 1. Garder les médecins rigides inchangés
    rigidDoctors.forEach((doctorCode) => {
      if (baseSchedule[doctorCode]) {
        periodSchedule[doctorCode] = deepClone(baseSchedule[doctorCode]);
        console.log(`  🔒 ${doctorCode}: planning rigide conservé`);
      }
    });

    // 2. Appliquer le système HoneyMoon pour les médecins flexibles
    const newFlexibleAssignments = applyHoneyMoonRotation(
      periodIndex,
      cycleType
    );
    console.log(
      `🔍 ${period.name} - Flexible assignments to apply:`,
      newFlexibleAssignments
    );

    // 3. Générer les plannings pour les nouvelles assignations
    newFlexibleAssignments.forEach(({ doctor, activity }) => {
      try {
        const generatedRotations = generateDoctorRotations(
          doctor,
          dynamicDoctorProfiles,
          dynamicWantedActivities,
          periodIndex,
          dynamicDocActivities
        );

        if (generatedRotations[activity]) {
          periodSchedule[doctor] = deepClone(generatedRotations[activity]);
          console.log(`  ✅ ${doctor}: assigned to ${activity} rotation`);
        } else {
          periodSchedule[doctor] = deepClone(baseSchedule[doctor]);
          console.log(`  ⚠️ Rotation ${activity} non trouvée pour ${doctor}`);
        }
      } catch (error) {
        console.error(`❌ Erreur rotation ${doctor}:`, error);
        periodSchedule[doctor] = deepClone(baseSchedule[doctor]);
      }
    });

    // 4. Gestion spéciale pour DL avec 2 backbones
    if (
      rotationAssignments["DL"] &&
      doctorProfiles["DL"]?.rotationSetting?.length === 2
    ) {
      const backboneIndex = periodIndex % 2;
      const selectedRotation =
        doctorProfiles["DL"].rotationSetting[backboneIndex];

      try {
        const generatedRotations = generateDoctorRotations(
          "DL",
          dynamicDoctorProfiles,
          dynamicWantedActivities,
          periodIndex,
          dynamicDocActivities
        );
        if (generatedRotations[selectedRotation]) {
          periodSchedule["DL"] = deepClone(
            generatedRotations[selectedRotation]
          );
          console.log(`  🏥 DL backbone alternance: ${selectedRotation}`);
        }
      } catch (error) {
        console.error(`❌ Erreur backbone DL:`, error);
      }
    }

    // Store base schedule WITHOUT conflict resolution
    basePeriodicSchedule[period.name] = {
      period,
      schedule: periodSchedule,
    };
  });

  // Calculate full-cycle baseline workload BEFORE any conflict resolution
  console.log(
    "\n📊 Calculating full-cycle baseline workload (before conflict resolution)..."
  );
  const baselineCumulativeWorkload =
    calculateCumulativeWorkloadPerDoctor(basePeriodicSchedule);
  console.log(
    "📊 Baseline workload across all periods:",
    baselineCumulativeWorkload
  );

  // ===========================================================================
  // PASS 2: Apply conflict resolution with full-cycle workload visibility
  // HTC resolution runs first, then EMIT resolution sees HTC adjustments
  // ===========================================================================
  console.log(
    "\n🔄 PASS 2: Applying conflict resolution with full-cycle fairness..."
  );
  const finalPeriodicSchedule = {};

  // Clone baseline workload - will be updated as we add HTC/EMIT assignments
  const dynamicCumulativeWorkload = JSON.parse(
    JSON.stringify(baselineCumulativeWorkload)
  );

  // Map resolver names to functions
  const resolverFunctions = {
    HTC: resolveHTCConflicts,
    EMIT: resolveEMITConflicts,
    EMATIT: resolveEMATITConflicts,
    TeleCs: resolveTeleCsConflicts,
  };

  rotationPeriods.forEach((period, periodIndex) => {
    console.log(`\n🔧 Resolving conflicts for ${period.name}...`);

    // Start with base schedule from Pass 1
    let periodSchedule = deepClone(basePeriodicSchedule[period.name].schedule);
    let baseScheduleSnapshot = deepClone(periodSchedule); // For tracking changes
    let resolvedSchedule = periodSchedule;

    // Store resolution results for each type
    const resolutionResults = {};

    // Apply conflict resolvers in the specified order
    conflictResolutionOrder.forEach((resolverType, index) => {
      console.log(
        `\n🔧 Step ${
          index + 1
        }: Applying ${resolverType} conflict resolution for ${period.name}...`
      );

      const resolverFunc = resolverFunctions[resolverType];
      if (!resolverFunc) {
        console.warn(`⚠️ Unknown resolver type: ${resolverType}`);
        return;
      }

      // All resolvers except HTC need full-cycle data
      const needsFullCycleData = resolverType !== "HTC";

      const resolution = needsFullCycleData
        ? resolverFunc(
            resolvedSchedule,
            cycleType,
            periodIndex,
            basePeriodicSchedule,
            dynamicCumulativeWorkload
          )
        : resolverFunc(resolvedSchedule, cycleType, periodIndex);

      if (resolution.success) {
        console.log(
          `✅ ${resolverType} conflicts resolved: ${resolution.conflictsResolved}/${resolution.conflictsDetected}`
        );
        if (resolution.resolutionLog && resolution.resolutionLog.length > 0) {
          resolution.resolutionLog.forEach((log) => console.log(`  ${log}`));
        }
        resolvedSchedule = resolution.schedule;

        // Update cumulative workload with new assignments
        console.log(
          `📊 Updating cumulative workload with ${resolverType} assignments...`
        );
        updateDynamicWorkload(
          dynamicCumulativeWorkload,
          resolvedSchedule,
          baseScheduleSnapshot
        );
        console.log(
          `📊 Workload after ${resolverType}:`,
          dynamicCumulativeWorkload
        );

        // Store resolution result
        resolutionResults[resolverType] = {
          conflictsDetected: resolution.conflictsDetected,
          conflictsResolved: resolution.conflictsResolved,
          resolutionLog: resolution.resolutionLog || [],
          teleCsAssignments: resolution.teleCsAssignments, // Only for TeleCs
        };
      } else {
        console.warn(
          `⚠️ ${resolverType} conflict resolution failed for ${period.name}`
        );
      }

      // Update snapshot after each resolution step
      baseScheduleSnapshot = deepClone(resolvedSchedule);
    });

    // Store final schedule with all resolution logs
    finalPeriodicSchedule[period.name] = {
      period,
      schedule: resolvedSchedule,
      htcResolution: resolutionResults.HTC,
      emitResolution: resolutionResults.EMIT,
      ematitResolution: resolutionResults.EMATIT,
      teleCsResolution: resolutionResults.TeleCs,
      conflictResolutionOrder, // Track the order used
    };
  });

  // Reset docActivities to static version after processing
  if (dynamicDocActivities) {
    console.log("🔄 Resetting docActivities to static version");
    resetDocActivities();
  }

  return finalPeriodicSchedule;
}

/**
 * Activity-centric rotation logic
 * Replaces complex round-robin with direct activity-to-doctor mapping
 * @param {number} periodIndex - Index de la période (0 = période 1)
 * @param {string} cycleType - Type de cycle ('honeymoon', 'summer', 'emergency')
 * @returns {Array} Nouvelles assignations selon le cycle spécifié
 */
function applyHoneyMoonRotation(periodIndex, cycleType = "honeymoon") {
  console.log(
    `  🍯 Rotation pour période ${periodIndex + 1} (cycle: ${cycleType}):`
  );

  // Sélectionner le cycle de rotation approprié
  let rotationCycleData = rotation_cycles[cycleType];
  if (!rotationCycleData) {
    const firstAvailable = Object.keys(rotation_cycles)[0];
    console.warn(
      `⚠️ Cycle ${cycleType} non trouvé, utilisation du premier cycle disponible: ${firstAvailable}`
    );
    rotationCycleData = rotation_cycles[firstAvailable];
  } else {
    console.log(`✅ Utilisation du cycle: ${cycleType}`);
  }

  // Afficher la description du cycle pour le débogage
  console.log(`    📝 Description: ${rotationCycleData.description}`);

  // Obtenir les assignations pour cette période (cycle si nécessaire)
  const rotationCycle = rotationCycleData.periods;
  const currentPeriod = rotationCycle[periodIndex % rotationCycle.length];

  // Convertir les assignations en format {doctor, activity}
  const assignments = [];
  console.log(`🔍 Current period data:`, currentPeriod);
  Object.entries(currentPeriod).forEach(([activity, doctor]) => {
    if (activity !== "period") {
      // Exclure le champ 'period'
      assignments.push({
        doctor,
        activity,
      });
      console.log(`    🍯 ${activity} → ${doctor}`);
    }
  });

  console.log(`🔍 Period ${periodIndex + 1} final assignments:`, assignments);
  return assignments;
}

/**
 * Valider qu'un cycle de rotation couvre toutes les activités requises
 * @param {Array} rotationCycle - Cycle de rotation à valider
 * @param {Array} requiredActivities - Activités requises
 * @returns {Object} Résultat de validation {valid: boolean, missing: [], extras: []}
 */
function validateHoneyMoonCycle(
  rotationCycle,
  requiredActivities = ["HTC1", "HTC2", "HDJ", "AMI", "EMIT", "EMATIT"]
) {
  const validation = {
    valid: true,
    missing: [],
    extras: [],
    periods: rotationCycle.length,
  };

  rotationCycle.forEach((period, index) => {
    const periodActivities = Object.keys(period).filter(
      (key) => key !== "period"
    );

    // Vérifier les activités manquantes
    const missing = requiredActivities.filter(
      (activity) => !periodActivities.includes(activity)
    );
    if (missing.length > 0) {
      validation.valid = false;
      validation.missing.push(`Période ${index + 1}: ${missing.join(", ")}`);
    }

    // Vérifier les activités supplémentaires
    const extras = periodActivities.filter(
      (activity) => !requiredActivities.includes(activity)
    );
    if (extras.length > 0) {
      validation.extras.push(`Période ${index + 1}: ${extras.join(", ")}`);
    }
  });

  return validation;
}

/**
 * ALGORITHME PRINCIPAL - ORCHESTRATION DES 3 PHASES
 */

/**
 * Exécuter l'algorithme complet de planification personnalisée
 * @param {string} cycleType - Type de cycle de rotation ('honeymoon', 'summer', 'emergency')
 * @param {Object} dynamicData - Dynamic data from ScheduleContext
 * @param {Array} conflictResolutionOrder - Order of conflict resolution
 * @returns {Object} Résultat complet de la planification
 */
export function executeCustomPlanningAlgorithm(
  cycleType = "honeymoon",
  dynamicData = null,
  conflictResolutionOrder = null
) {
  console.log(
    `🚀 Démarrage algorithme de planification personnalisée (cycle: ${cycleType})...`
  );

  // Extract dynamic data with fallbacks to static imports
  const {
    doctorProfiles: dynamicDoctorProfiles = doctorProfiles,
    wantedActivities: dynamicWantedActivities = null,
    docActivities: dynamicDocActivities = null,
    rotationTemplates: dynamicRotationTemplates = null,
    conflictResolutionOrder: dataConflictOrder = null,
  } = dynamicData || {};

  console.log(
    "📥 executeCustomPlanningAlgorithm received dynamicDocActivities.AMI:",
    dynamicDocActivities?.AMI
  );

  // ✅ Set dynamic docActivities at the START to ensure all conflict resolvers use correct durations
  if (dynamicDocActivities) {
    console.log(
      "🎯 Setting dynamic docActivities at algorithm start:",
      dynamicDocActivities
    );
    setDynamicDocActivities(dynamicDocActivities);
  }

  // Use conflict resolution order from parameter, or from data, or default
  const finalConflictOrder = conflictResolutionOrder ||
    dataConflictOrder || ["HTC", "EMIT", "EMATIT", "TeleCs"];

  const startTime = Date.now();
  const result = {
    success: true,
    phases: {},
    finalSchedule: {},
    periodicSchedule: {},
    statistics: {},
    errors: [],
  };

  try {
    // PHASE 1: Constitution progressive
    console.log("\n📋 PHASE 1: Constitution progressive du planning");
    const phase1Result = createBaseScheduling(
      dynamicDoctorProfiles,
      dynamicWantedActivities,
      dynamicDocActivities
    );
    result.phases.phase1 = phase1Result;

    // PHASE 2: Conflict Resolution (Applied Week-by-Week in Phase 3)
    console.log("\n🔧 PHASE 2: Conflict Resolution Active (Applied per Week)");
    const adjustedSchedule = phase1Result.schedule; // Base schedule before weekly conflict resolution

    result.phases.phase2 = {
      description:
        "Conflict resolution enabled - applied week-by-week during schedule generation",
      adjustedSchedule,
    };

    // PHASE 3: Variation périodique (NEW WEEK-BY-WEEK SYSTEM)
    console.log("\n🔄 PHASE 3: Création des variations périodiques (week-by-week)");

    // ✅ NEW: Use week-by-week generation with hierarchical period system
    const weeklySchedules = generateWeekByWeekSchedules(
      adjustedSchedule,
      phase1Result.rotationAssignments,
      cycleType,
      dynamicDoctorProfiles,
      dynamicWantedActivities,
      finalConflictOrder,
      dynamicDocActivities
    );

    // Convert to period format for backward compatibility
    const periodicSchedule = convertWeeklySchedulesToPeriodFormat(weeklySchedules);

    result.phases.phase3 = periodicSchedule;
    result.periodicSchedule = periodicSchedule;
    result.weeklySchedules = weeklySchedules; // ✅ NEW: Also store weekly schedules
    result.finalSchedule = adjustedSchedule;

    // Statistiques
    const endTime = Date.now();
    result.statistics = {
      executionTime: endTime - startTime,
      doctorsProcessed: Object.keys(phase1Result.schedule).length,
      rigidDoctors: phase1Result.rigidDoctors.length,
      flexibleDoctors: phase1Result.flexibleDoctors.length,
      periodsGenerated: Object.keys(periodicSchedule).length,
      simplified: true, // Marqueur pour indiquer la version simplifiée
    };

    console.log("✅ Algorithme terminé avec succès");
    console.log("📊 Statistiques:", result.statistics);
  } catch (error) {
    console.error("❌ Erreur dans l'algorithme:", error);
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

/**
 * UTILITAIRES DE VALIDATION ET RAPPORT
 */

/**
 * Générer un rapport détaillé de l'exécution
 * @param {Object} algorithmResult - Résultat de l'algorithme
 * @param {Object} dynamicExpectedActivities - Dynamic expectedActivities from ScheduleContext
 * @returns {Object} Rapport détaillé
 */
export function generateCustomPlanningReport(
  algorithmResult,
  dynamicExpectedActivities = null
) {
  console.log("📋 Génération du rapport de planification personnalisée...");

  const expectedActivities =
    dynamicExpectedActivities || staticExpectedActivities;

  if (!algorithmResult.success) {
    return {
      success: false,
      error: "Algorithme a échoué",
      errors: algorithmResult.errors,
    };
  }

  // Convert to calendar format and perform UI-equivalent validation
  const calendarFormat = convertCustomToCalendarFormat(algorithmResult);
  const validation = validateCalendarFormat(calendarFormat, expectedActivities);
  const realProblems = {
    totalMissing: validation.totalMissing,
    totalDuplicates: validation.totalDuplicates,
  };

  const report = {
    timestamp: new Date().toISOString(),
    algorithmType: "Custom Planning Logic - Simplified 3 Phases",
    success: true,
    summary: {
      totalDoctors: algorithmResult.statistics.doctorsProcessed,
      rigidDoctors: algorithmResult.statistics.rigidDoctors,
      flexibleDoctors: algorithmResult.statistics.flexibleDoctors,
      problemsIdentified: realProblems,
      periodsGenerated: algorithmResult.statistics.periodsGenerated,
      executionTime: `${algorithmResult.statistics.executionTime}ms`,
      simplified: true,
      validationResults: {
        coveragePercentage: validation.coveragePercentage,
        totalSlots: validation.totalSlots,
        validSlots: validation.validSlots,
        missingDetails: validation.problems.missing.slice(0, 5), // Show first 5 for debugging
        duplicateDetails: validation.problems.duplicates.slice(0, 5), // Show first 5 for debugging
        calendarFormatUsed: true, // Indicates this used the same validation as UI
        summaryText: validation.summaryText, // Enhanced summary with activity breakdown
        activityBreakdown: validation.activityBreakdown, // Detailed counts by activity
      },
    },
    phases: {
      phase1: {
        description: "Constitution progressive - Rigides puis souples",
        rigidAssignments: algorithmResult.phases.phase1?.rigidDoctors || [],
        flexibleAssignments:
          algorithmResult.phases.phase1?.flexibleDoctors || [],
        rotationPairs: algorithmResult.phases.phase1?.rotationAssignments || {},
      },
      phase2: {
        description:
          "Phase 2 simplifiée - Pas de résolution automatique des conflits",
        problemsSummary: realProblems,
        conflictsResolved: 0,
      },
      phase3: {
        description: "Variation périodique des rotations",
        periodsCreated: Object.keys(algorithmResult.periodicSchedule).length,
        rotationCycles: "Basé sur rotationSettings et unités de temps",
      },
    },
    recommendations: [],
  };

  // Ajouter des recommandations pour la version simplifiée
  if (report.summary.flexibleDoctors === 0) {
    report.recommendations.push(
      "Aucun médecin flexible détecté - envisager d'ajouter des rotations multiples"
    );
  }

  if (report.summary.rigidDoctors > report.summary.flexibleDoctors) {
    report.recommendations.push(
      "Plus de médecins rigides que flexibles - consider adding more rotation options"
    );
  }

  report.recommendations.push(
    "Version simplifiée - Phase 2 de résolution des conflits désactivée pour une approche plus directe"
  );

  console.log("📊 Rapport généré avec succès");
  return report;
}

/**
 * Comparer avec les autres systèmes de planification
 * @param {Object} customResult - Résultat du système personnalisé
 * @param {Object} simplifiedResult - Résultat du système simplifié (optionnel)
 * @param {Object} originalResult - Résultat du système original (optionnel)
 * @returns {Object} Comparaison détaillée
 */
export function compareWithOtherSystems(
  customResult,
  simplifiedResult = null,
  originalResult = null
) {
  console.log("🔄 Comparaison avec les autres systèmes...");

  const comparison = {
    customLogic: {
      name: "Custom Planning Logic",
      coverage: calculateCoverage(customResult.finalSchedule),
      flexibility: "Haute - 3 phases distinctes",
      transparency: "Très haute - chaque étape explicite",
      maintenance: "Bonne - code structuré",
    },
    simplified: simplifiedResult
      ? {
          name: "Simplified Round Robin",
          coverage: calculateCoverage(simplifiedResult),
          flexibility: "Moyenne - cycles prédéfinis",
          transparency: "Moyenne",
          maintenance: "Moyenne",
        }
      : null,
    original: originalResult
      ? {
          name: "Original System",
          coverage: calculateCoverage(originalResult),
          flexibility: "Faible - statique",
          transparency: "Faible",
          maintenance: "Difficile",
        }
      : null,
    advantages: [
      "Résolution automatique des conflits",
      "Respect strict des backbones",
      "Variation périodique intelligente",
      "Traçabilité complète des décisions",
    ],
    limitations: [
      "Complexité accrue",
      "Temps d'exécution plus long",
      "Nécessite configuration précise des rotationSettings",
    ],
  };

  return comparison;
}

/**
 * Calculer le taux de couverture d'un planning
 * @param {Object} schedule - Planning à analyser
 * @returns {number} Pourcentage de couverture
 */
function calculateCoverage(schedule) {
  if (!schedule) return 0;

  let totalSlots = 0;
  let coveredSlots = 0;

  Object.keys(schedule).forEach((doctor) => {
    DAYS_OF_WEEK.forEach((day) => {
      TIME_SLOTS.forEach((slot) => {
        totalSlots++;
        if (
          schedule[doctor][day] &&
          schedule[doctor][day][slot] &&
          schedule[doctor][day][slot].length > 0
        ) {
          coveredSlots++;
        }
      });
    });
  });

  return totalSlots > 0 ? (coveredSlots / totalSlots) * 100 : 0;
}
