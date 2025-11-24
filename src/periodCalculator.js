/**
 * Period Calculator - Hierarchical Two-Rhythm Scheduling System
 *
 * This module calculates two independent period systems:
 * 1. DL's fixed 2-week rhythm (HDJ/MPO alternation) - independent of holidays
 * 2. Regular doctors' variable periods based on inter-holiday durations (half periods)
 *
 * Key Features:
 * - Parses French public holidays from publicHolidays.js
 * - Calculates inter-holiday periods and divides them by 2
 * - Generates week-to-period mappings for both systems
 * - Provides lookup functions for schedule generation
 */

import { publicHolidays } from "./publicHolidays.js";
import { getISOWeek } from "date-fns";

// ============================================================================
// CONFIGURATION
// ============================================================================

export const scheduleConfig = {
  DL: {
    rhythmType: "fixed",
    cycleWeeks: 2, // 2-week alternating rhythm
    startWeek: 1, // Starting week in 2026 (backward inference from Week 2)
    startYear: 2026,
    startState: "MPO", // Week 1 = MPO (so Week 2 = HDJ as intended)
    states: ["HDJ", "MPO"], // Alternating states
  },
  regularDoctors: {
    rhythmType: "holiday-based",
    preferredWeeks: 3, // Prefer 3-week periods (ideal)
    maxWeeks: 4, // Maximum 4 weeks per period
    minWeeks: 2, // Minimum 2 weeks (for 5-week splits)
    // Note: divisionFactor removed - now using 3-4 week chunking logic
  },
};

// ============================================================================
// HOLIDAY PERIOD ANALYSIS
// ============================================================================

/**
 * Extract holiday boundaries from publicHolidays data
 * Focuses on multi-week vacation periods (not single-day holidays)
 * Returns array of {startWeek, endWeek, name} objects
 */
/**
 * Count how many workdays (Mon-Fri) in a week are vacation days
 * @param {number} weekNumber - ISO week number
 * @param {number} year - Year
 * @param {string} vacationName - Name of the vacation to check for
 * @returns {number} Count of vacation workdays (0-5)
 */
function countVacationWorkdays(weekNumber, year, vacationName) {
  const workdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  let vacationCount = 0;

  workdays.forEach(day => {
    // Check if this specific day has the vacation event
    const weekKey = `Week${weekNumber}`;
    const yearData = publicHolidays[year];

    if (yearData && yearData[weekKey] && yearData[weekKey][day]) {
      const eventName = yearData[weekKey][day]?.event?.name;
      if (eventName === vacationName) {
        vacationCount++;
      }
    }
  });

  return vacationCount;
}

function extractHolidayPeriods() {
  const holidayPeriods = [];
  const vacationNames = new Set(); // Track unique vacation period names

  console.log("🔍 Extracting holiday periods from publicHolidays...");
  console.log("  Years available:", Object.keys(publicHolidays).join(", "));

  // Iterate through years and weeks in publicHolidays
  Object.keys(publicHolidays).forEach((year) => {
    const yearData = publicHolidays[year];
    const weeks = Object.keys(yearData).sort((a, b) => {
      const weekA = parseInt(a.replace("Week", ""));
      const weekB = parseInt(b.replace("Week", ""));
      return weekA - weekB;
    });

    weeks.forEach((weekKey) => {
      const weekNumber = parseInt(weekKey.replace("Week", ""));
      const weekData = yearData[weekKey];

      // Extract all vacation names from this week (ignore single-day holidays)
      Object.keys(weekData).forEach((day) => {
        const eventName = weekData[day]?.event?.name;
        if (eventName && eventName.toLowerCase().includes("vacances")) {
          vacationNames.add(eventName);
        }
      });
    });
  });

  // For each vacation name, find CONTINUOUS occurrences (consecutive weeks)
  // This handles vacations that span year boundaries and vacations with the same name appearing multiple times
  vacationNames.forEach((vacationName) => {
    let currentPeriod = null;

    // Process all years in order
    const sortedYears = Object.keys(publicHolidays).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    sortedYears.forEach((year) => {
      const yearData = publicHolidays[year];
      const weeks = Object.keys(yearData)
        .filter((w) => !w.includes("NaN")) // Filter out invalid weeks
        .sort((a, b) => {
          const weekA = parseInt(a.replace("Week", ""));
          const weekB = parseInt(b.replace("Week", ""));
          return weekA - weekB;
        });

      weeks.forEach((weekKey) => {
        const weekNumber = parseInt(weekKey.replace("Week", ""));

        // Check if this week contains the vacation
        // Use workday-based detection: only mark as vacation week if 3+ workdays are vacation
        const vacationWorkdays = countVacationWorkdays(weekNumber, parseInt(year), vacationName);
        const hasVacation = vacationWorkdays >= 3; // Majority of workdays (3+ out of 5)

        if (hasVacation) {
          if (!currentPeriod) {
            // Start a new period
            currentPeriod = {
              name: vacationName,
              startWeek: weekNumber,
              startYear: parseInt(year),
              endWeek: weekNumber,
              endYear: parseInt(year),
              lastWeek: weekNumber,
              lastYear: parseInt(year),
            };
          } else {
            // Check if this is continuous with the current period
            const isContinuous =
              (parseInt(year) === currentPeriod.lastYear &&
                weekNumber === currentPeriod.lastWeek + 1) ||
              (parseInt(year) === currentPeriod.lastYear + 1 &&
                weekNumber === 1 &&
                currentPeriod.lastWeek >= 50);

            if (isContinuous) {
              // Extend the current period
              currentPeriod.endWeek = weekNumber;
              currentPeriod.endYear = parseInt(year);
              currentPeriod.lastWeek = weekNumber;
              currentPeriod.lastYear = parseInt(year);
            } else {
              // Gap detected - save current period and start a new one
              holidayPeriods.push({
                name: currentPeriod.name,
                startWeek: currentPeriod.startWeek,
                startYear: currentPeriod.startYear,
                endWeek: currentPeriod.endWeek,
                endYear: currentPeriod.endYear,
              });

              currentPeriod = {
                name: vacationName,
                startWeek: weekNumber,
                startYear: parseInt(year),
                endWeek: weekNumber,
                endYear: parseInt(year),
                lastWeek: weekNumber,
                lastYear: parseInt(year),
              };
            }
          }
        }
      });
    });

    // Don't forget to add the last period
    if (currentPeriod) {
      holidayPeriods.push({
        name: currentPeriod.name,
        startWeek: currentPeriod.startWeek,
        startYear: currentPeriod.startYear,
        endWeek: currentPeriod.endWeek,
        endYear: currentPeriod.endYear,
      });
    }
  });

  // Sort by start year and week
  holidayPeriods.sort((a, b) => {
    if (a.startYear !== b.startYear) {
      return a.startYear - b.startYear;
    }
    return a.startWeek - b.startWeek;
  });

  console.log(`  Found ${holidayPeriods.length} vacation periods:`);
  holidayPeriods.forEach((p) => {
    console.log(
      `    ${p.name}: ${p.startYear}-W${p.startWeek} to ${p.endYear}-W${p.endWeek}`
    );
  });

  // Additional logging for 2026 specifically
  const vacations2026 = holidayPeriods.filter(
    (p) => p.startYear === 2026 || p.endYear === 2026
  );
  console.log(`\n  📅 2026 vacations found: ${vacations2026.length}`);
  vacations2026.forEach((p) => {
    console.log(`    - ${p.name}: W${p.startWeek}-W${p.endWeek}`);
  });

  return holidayPeriods;
}

/**
 * Calculate inter-holiday periods (periods between holidays)
 * Returns array of {startWeek, endWeek, durationWeeks, periodName}
 */
function calculateInterHolidayPeriods(holidayPeriods) {
  const interHolidayPeriods = [];

  console.log("\n🔍 Calculating inter-holiday periods...");
  console.log(`  Processing ${holidayPeriods.length} vacation periods`);

  if (holidayPeriods.length === 0) {
    console.warn("  ⚠️ No holiday periods found!");
    return interHolidayPeriods;
  }

  // ✅ NEW: Add period from START OF YEAR to first vacation
  const firstHoliday = holidayPeriods[0];
  if (firstHoliday.startWeek > 1) {
    const durationWeeks = firstHoliday.startWeek - 1;
    interHolidayPeriods.push({
      periodName: `Start of ${firstHoliday.startYear}`,
      startWeek: 1,
      startYear: firstHoliday.startYear,
      endWeek: firstHoliday.startWeek - 1,
      endYear: firstHoliday.startYear,
      durationWeeks,
    });
    console.log(`  ✅ Added beginning of year period: ${firstHoliday.startYear}-W1 to W${firstHoliday.startWeek - 1} (${durationWeeks} weeks)`);
  }

  // Original logic: periods BETWEEN vacations
  for (let i = 0; i < holidayPeriods.length - 1; i++) {
    const currentHoliday = holidayPeriods[i];
    const nextHoliday = holidayPeriods[i + 1];

    // Start after current holiday ends
    let startWeek = currentHoliday.endWeek + 1;
    let startYear = currentHoliday.endYear;

    // Handle year transition
    if (startWeek > 52) {
      startWeek = 1;
      startYear++;
    }

    // End before next holiday starts
    let endWeek = nextHoliday.startWeek - 1;
    let endYear = nextHoliday.startYear;

    // Calculate duration
    let durationWeeks;
    if (endYear === startYear) {
      durationWeeks = endWeek - startWeek + 1;
    } else {
      // Cross-year calculation
      durationWeeks = 52 - startWeek + 1 + endWeek;
    }

    if (durationWeeks > 0) {
      interHolidayPeriods.push({
        periodName: `After ${currentHoliday.name}`,
        startWeek,
        startYear,
        endWeek,
        endYear,
        durationWeeks,
      });
    }
  }

  // ✅ NEW: Add period from last vacation to END OF YEAR
  const lastHoliday = holidayPeriods[holidayPeriods.length - 1];
  if (lastHoliday.endWeek < 52) {
    const durationWeeks = 52 - lastHoliday.endWeek;
    interHolidayPeriods.push({
      periodName: `End of ${lastHoliday.endYear}`,
      startWeek: lastHoliday.endWeek + 1,
      startYear: lastHoliday.endYear,
      endWeek: 52,
      endYear: lastHoliday.endYear,
      durationWeeks,
    });
    console.log(`  ✅ Added end of year period: ${lastHoliday.endYear}-W${lastHoliday.endWeek + 1} to W52 (${durationWeeks} weeks)`);
  }

  console.log(
    `\n  📊 Created ${interHolidayPeriods.length} inter-holiday periods (including year boundaries):`
  );
  interHolidayPeriods.forEach((p) => {
    console.log(
      `    ${p.periodName}: ${p.startYear}-W${p.startWeek} to ${p.endYear}-W${p.endWeek} (${p.durationWeeks} weeks)`
    );
  });

  return interHolidayPeriods;
}

/**
 * Calculate how to split a given duration into 3-4 week periods
 * Rules:
 * - 1-2 weeks: keep as single period (no rotation)
 * - 3-4 weeks: keep as single period (ideal)
 * - 5 weeks: split as [3, 2]
 * - 6 weeks: split as [3, 3]
 * - 7+ weeks: repeatedly take 4-week chunks, then handle remainder
 * - Prefer larger periods first (e.g., [4, 3] not [3, 4])
 */
function calculateSplitPattern(totalWeeks) {
  // Very short periods: keep as-is (no rotation)
  if (totalWeeks <= 2) {
    return [totalWeeks];
  }

  // Ideal single periods
  if (totalWeeks === 3 || totalWeeks === 4) {
    return [totalWeeks];
  }

  // Special case: 5 weeks
  if (totalWeeks === 5) {
    return [3, 2]; // Prefer 3-week period first
  }

  // Special case: 6 weeks
  if (totalWeeks === 6) {
    return [3, 3]; // Two equal 3-week periods
  }

  // For 7+ weeks: repeatedly take 4-week chunks while remaining >= 7
  const periods = [];
  let remaining = totalWeeks;

  while (remaining >= 7) {
    periods.push(4);
    remaining -= 4;
  }

  // Handle remainder (0-6 weeks left)
  if (remaining === 6) {
    periods.push(3, 3);
  } else if (remaining === 5) {
    periods.push(3, 2);
  } else if (remaining >= 3) {
    periods.push(remaining); // 3 or 4 weeks
  } else if (remaining > 0) {
    periods.push(remaining); // 1-2 weeks (edge case)
  }

  return periods;
}

/**
 * Split inter-holiday periods into 3-4 week periods for regular doctor rotations
 * New logic: periods of 3 weeks (ideal) or 4 weeks maximum
 * Returns array of sub-periods
 */
function createHalfPeriods(interHolidayPeriods) {
  const halfPeriods = [];
  let periodCounter = 1;

  console.log("\n🔬 INTER-HOLIDAY PERIOD SPLITTING (3-4 week chunks):");

  interHolidayPeriods.forEach((period) => {
    const {
      startWeek,
      startYear,
      endWeek,
      endYear,
      durationWeeks,
      periodName,
    } = period;

    console.log(`\n  ${periodName}:`);
    console.log(
      `    Total: ${startYear}-W${startWeek} to ${endYear}-W${endWeek} (${durationWeeks} weeks)`
    );

    // Calculate split pattern using new 3-4 week logic
    const splitPattern = calculateSplitPattern(durationWeeks);
    console.log(`    Split pattern: [${splitPattern.join(", ")}] weeks`);

    // Create periods based on split pattern
    let currentWeek = startWeek;
    let currentYear = startYear;
    let halfNumber = 1;

    splitPattern.forEach((periodDuration) => {
      halfPeriods.push({
        periodId: `P${periodCounter}`,
        periodNumber: periodCounter,
        parentPeriod: periodName,
        startWeek: currentWeek,
        startYear: currentYear,
        durationWeeks: periodDuration,
        halfNumber: halfNumber,
      });
      periodCounter++;
      halfNumber++;

      // Advance to next period start week
      currentWeek += periodDuration;
      if (currentWeek > 52) {
        currentWeek -= 52;
        currentYear++;
      }
    });
  });

  return halfPeriods;
}

// ============================================================================
// WEEK-TO-PERIOD MAPPING GENERATION
// ============================================================================

/**
 * Generate mapping: week → regular doctor period
 * Returns object: { "2024-W44": {periodId, periodNumber, ...}, ... }
 */
function generateWeekToPeriodMap(halfPeriods) {
  const weekMap = {};

  halfPeriods.forEach((period) => {
    const {
      periodId,
      periodNumber,
      startWeek,
      startYear,
      durationWeeks,
      parentPeriod,
      halfNumber,
    } = period;

    for (let i = 0; i < durationWeeks; i++) {
      let week = startWeek + i;
      let year = startYear;

      if (week > 52) {
        week -= 52;
        year++;
      }

      const weekKey = `${year}-W${week}`;
      weekMap[weekKey] = {
        periodId,
        periodNumber,
        parentPeriod,
        halfNumber,
        weekInPeriod: i + 1,
        totalWeeksInPeriod: durationWeeks,
      };
    }
  });

  return weekMap;
}

/**
 * Generate mapping: week → DL's state (HDJ or MPO)
 * Returns object: { "2024-W44": "HDJ", "2024-W45": "HDJ", "2024-W46": "MPO", ... }
 */
function generateWeekToDLStateMap() {
  const dlConfig = scheduleConfig.DL;
  const stateMap = {};

  // Calculate for all years present in publicHolidays data
  let currentWeek = dlConfig.startWeek;
  let currentYear = dlConfig.startYear;
  let cycleCounter = 0;

  // Find which index the startState is in the states array
  const startStateIndex = dlConfig.states.indexOf(dlConfig.startState);
  if (startStateIndex === -1) {
    console.error(`startState "${dlConfig.startState}" not found in states array`);
  }

  // Get max year from publicHolidays to determine coverage
  const maxYear = Math.max(
    ...Object.keys(publicHolidays).map((y) => parseInt(y))
  );
  const totalWeeks =
    52 - dlConfig.startWeek + 1 + 52 * (maxYear - dlConfig.startYear);

  for (let i = 0; i < totalWeeks; i++) {
    const weekKey = `${currentYear}-W${currentWeek}`;

    // SPECIAL CASE: First week is a partial cycle (1 week) using startState
    // This represents the last week of the previous cycle (backward inference)
    if (i === 0) {
      stateMap[weekKey] = {
        state: dlConfig.startState,
        cycleNumber: 0, // Week 0 (partial cycle before official start)
        weekInCycle: 1,
      };
    } else {
      // NORMAL CASE: All subsequent weeks follow the regular 2-week cycle pattern
      // Adjust cycleCounter to account for the first partial week
      const adjustedCounter = cycleCounter - 1;
      const weeksInCurrentCycle = adjustedCounter % dlConfig.cycleWeeks;
      const cycleIndex = Math.floor(adjustedCounter / dlConfig.cycleWeeks) % dlConfig.states.length;
      const currentState = dlConfig.states[cycleIndex];

      stateMap[weekKey] = {
        state: currentState,
        cycleNumber: Math.floor(adjustedCounter / dlConfig.cycleWeeks) + 1,
        weekInCycle: weeksInCurrentCycle + 1,
      };
    }

    // Increment
    cycleCounter++;
    currentWeek++;

    if (currentWeek > 52) {
      currentWeek = 1;
      currentYear++;
    }
  }

  return stateMap;
}

// ============================================================================
// PUBLIC API - INITIALIZATION
// ============================================================================

/**
 * Initialize and calculate all period mappings
 * Call this once at application startup
 */
export function initializePeriodSystem() {
  console.log("🗓️ Initializing Period System...");

  // Show available years in publicHolidays
  const availableYears = Object.keys(publicHolidays)
    .map((y) => parseInt(y))
    .sort();
  console.log(
    `📆 Available years in publicHolidays: ${availableYears.join(", ")}`
  );

  // Step 1: Extract holiday periods
  const holidayPeriods = extractHolidayPeriods();
  console.log(`✅ Found ${holidayPeriods.length} holiday periods`);

  // Step 2: Calculate inter-holiday periods
  const interHolidayPeriods = calculateInterHolidayPeriods(holidayPeriods);
  console.log(
    `✅ Calculated ${interHolidayPeriods.length} inter-holiday periods`
  );

  // Step 3: Create half-periods for regular doctors
  const halfPeriods = createHalfPeriods(interHolidayPeriods);
  console.log(
    `✅ Created ${halfPeriods.length} half-periods for regular doctors`
  );

  // Show detailed breakdown of half-periods for debugging rotation issues
  console.log("\n📋 Half-Period Breakdown:");
  const periodBreakdown2026 = [];
  halfPeriods.forEach((p) => {
    const log = `  ${p.periodId}: ${p.startYear}-W${p.startWeek} (${p.durationWeeks} weeks) - ${p.parentPeriod} - Half ${p.halfNumber}`;
    console.log(log);
    if (p.startYear === 2026) {
      periodBreakdown2026.push(log);
    }
  });

  // Make 2026 periods easily accessible in console
  if (typeof window !== "undefined") {
    window.periodBreakdown2026 = periodBreakdown2026;
    window.allHalfPeriods = halfPeriods;
  }

  // Step 4: Generate week mappings
  const weekToPeriodMap = generateWeekToPeriodMap(halfPeriods);
  const weekToDLStateMap = generateWeekToDLStateMap();
  console.log(
    `✅ Generated week mappings (${
      Object.keys(weekToPeriodMap).length
    } weeks mapped for regular doctors)`
  );
  console.log(
    `✅ Generated DL state mappings (${
      Object.keys(weekToDLStateMap).length
    } weeks mapped)`
  );

  return {
    holidayPeriods,
    interHolidayPeriods,
    halfPeriods,
    weekToPeriodMap,
    weekToDLStateMap,
  };
}

// ============================================================================
// PUBLIC API - LOOKUP FUNCTIONS
// ============================================================================

let cachedPeriodSystem = null;

/**
 * Get or initialize the period system (lazy loading)
 */
function getPeriodSystem() {
  if (!cachedPeriodSystem) {
    cachedPeriodSystem = initializePeriodSystem();
  }
  return cachedPeriodSystem;
}

// ✅ FIX: Clear cache when this module is hot-reloaded
// This prevents stale data after code changes while avoiding infinite loops
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 HMR: Clearing period system cache');
    cachedPeriodSystem = null;
  });
}

/**
 * Get regular doctor period info for a specific week
 * @param {number} weekNumber - ISO week number (1-52)
 * @param {number} year - Year (2024 or 2025)
 * @returns {Object} Period info or null if not found
 */
export function getRegularDoctorPeriod(weekNumber, year) {
  const { weekToPeriodMap } = getPeriodSystem();
  const weekKey = `${year}-W${weekNumber}`;
  return weekToPeriodMap[weekKey] || null;
}

/**
 * Get DL's state (HDJ or MPO) for a specific week
 * @param {number} weekNumber - ISO week number (1-52)
 * @param {number} year - Year (2024 or 2025)
 * @returns {Object} State info with {state, cycleNumber, weekInCycle}
 */
export function getDLStateForWeek(weekNumber, year) {
  const { weekToDLStateMap } = getPeriodSystem();
  const weekKey = `${year}-W${weekNumber}`;
  return weekToDLStateMap[weekKey] || null;
}

/**
 * Get the period index (0-based) for rotation cycle selection
 * This is used to select which rotation template to use
 * @param {number} weekNumber - ISO week number (1-52)
 * @param {number} year - Year (2024 or 2025)
 * @returns {number} Period index (0-based) or 0 if not found
 */
export function getPeriodIndexForWeek(weekNumber, year) {
  const periodInfo = getRegularDoctorPeriod(weekNumber, year);
  return periodInfo ? periodInfo.periodNumber - 1 : 0; // Convert to 0-based index
}

/**
 * Check if a week is during a holiday
 * @param {number} weekNumber - ISO week number (1-52)
 * @param {number} year - Year (2024 or 2025)
 * @returns {boolean}
 */
export function isHolidayWeek(weekNumber, year) {
  const { holidayPeriods } = getPeriodSystem();
  return holidayPeriods.some((holiday) => {
    if (holiday.startYear === year && holiday.endYear === year) {
      return weekNumber >= holiday.startWeek && weekNumber <= holiday.endWeek;
    } else if (holiday.startYear === year && holiday.endYear > year) {
      return weekNumber >= holiday.startWeek;
    } else if (holiday.startYear < year && holiday.endYear === year) {
      return weekNumber <= holiday.endWeek;
    }
    return false;
  });
}

/**
 * Check if a specific day is a vacation/holiday day (day-level granularity)
 * This is more precise than isHolidayWeek() which checks entire weeks
 *
 * @param {number} weekNumber - ISO week number (1-52)
 * @param {string} dayName - Day name in English (e.g., "Monday", "Tuesday")
 * @param {number} year - Year (2024, 2025, 2026, etc.)
 * @returns {boolean} True if this specific day is a vacation/holiday day
 *
 * @example
 * // Check if Monday of week 7 in 2026 is a vacation day
 * isHolidayDay(7, "Monday", 2026); // returns false (working day)
 * isHolidayDay(7, "Saturday", 2026); // returns true (vacation starts)
 */
export function isHolidayDay(weekNumber, dayName, year) {
  // Query publicHolidays structure for this specific day
  const weekKey = `Week${weekNumber}`;

  // Helper function to check if a specific year/week/day is a vacation
  const checkVacation = (checkYear) => {
    const yearData = publicHolidays[checkYear];
    if (!yearData) return false;

    const weekData = yearData[weekKey];
    if (!weekData) return false;

    const dayData = weekData[dayName];
    if (!dayData || !dayData.event) return false;

    const eventName = dayData.event.name || "";
    return eventName.toLowerCase().includes("vacances");
  };

  // PRIMARY: Check the requested year
  if (checkVacation(year)) {
    return true;
  }

  // FALLBACK: Check adjacent year for cross-year weeks
  // Week 1 may have vacation data in previous year (Dec 29-31)
  // Week 52-53 may have vacation data in next year (Jan 1-3)
  let adjacentYear = null;
  if (weekNumber === 1) {
    adjacentYear = year - 1;  // Check previous year for Week 1
  } else if (weekNumber >= 52) {
    adjacentYear = year + 1;  // Check next year for Week 52-53
  }

  if (adjacentYear !== null && checkVacation(adjacentYear)) {
    return true;
  }

  return false;
}

/**
 * Debug: Print period system summary
 */
export function debugPrintPeriodSystem() {
  const system = getPeriodSystem();

  console.log("\n=== PERIOD SYSTEM SUMMARY ===\n");

  console.log("📅 Holiday Periods:");
  system.holidayPeriods.forEach((h) => {
    console.log(
      `  ${h.name}: ${h.startYear}-W${h.startWeek} → ${h.endYear}-W${h.endWeek}`
    );
  });

  console.log("\n🔄 Regular Doctor Half-Periods:");
  system.halfPeriods.forEach((p) => {
    console.log(
      `  ${p.periodId} (${p.parentPeriod} - Half ${p.halfNumber}): ${p.startYear}-W${p.startWeek}, ${p.durationWeeks} weeks`
    );
  });

  console.log("\n💉 DL State Map (first 10 weeks):");
  const dlWeeks = Object.keys(system.weekToDLStateMap).slice(0, 10);
  dlWeeks.forEach((weekKey) => {
    const info = system.weekToDLStateMap[weekKey];
    console.log(
      `  ${weekKey}: ${info.state} (Cycle ${info.cycleNumber}, Week ${info.weekInCycle})`
    );
  });

  console.log("\n=== END SUMMARY ===\n");
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export const _testExports = {
  extractHolidayPeriods,
  calculateInterHolidayPeriods,
  createHalfPeriods,
  generateWeekToPeriodMap,
  generateWeekToDLStateMap,
};

// ============================================================================
// MAKE FUNCTIONS AVAILABLE IN BROWSER CONSOLE FOR DEBUGGING
// ============================================================================

if (typeof window !== "undefined") {
  window.getRegularDoctorPeriod = getRegularDoctorPeriod;
  window.getDLStateForWeek = getDLStateForWeek;
  window.getPeriodIndexForWeek = getPeriodIndexForWeek;
  window.isHolidayDay = isHolidayDay;
  window.isHolidayWeek = isHolidayWeek;
  window.debugPrintPeriodSystem = debugPrintPeriodSystem;
  console.log("🔧 Period helper functions available in window");
}
