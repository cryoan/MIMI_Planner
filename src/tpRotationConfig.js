// ============================================================================
// TP ROTATION CONFIGURATION
// ============================================================================
// This file configures the Wednesday TP rotation pool to better distribute
// part-time days across doctors and reduce activity coverage conflicts.

/**
 * TP Rotation Configuration
 *
 * PROBLEM:
 * Too many doctors have TP (temps partiel) on Wednesday, causing missing
 * activities in the schedule. This creates conflicts that are difficult
 * to resolve during the conflict resolution phase.
 *
 * SOLUTION:
 * Create a rotating pool where doctors take turns moving their Wednesday TP
 * to another day (Thursday for most, Friday for YC). This ensures that
 * only 1 out of N doctors is unavailable on Wednesday at any given time.
 *
 * HOW IT WORKS:
 * - Every rotationCycleWeeks, the rotation advances to the next doctor
 * - Only one doctor at a time has their Wednesday TP moved
 * - Vacation weeks are skipped (rotation doesn't advance)
 * - Rotation continues across years (no reset)
 */

export const tpRotationConfig = {
  // ============================================================================
  // MAIN CONFIGURATION
  // ============================================================================

  /**
   * Enable/disable the TP rotation system
   * Set to false to revert to static backbone TP assignments
   */
  enabled: true,

  /**
   * Doctors participating in the Wednesday TP rotation pool
   *
   * Format:
   * {
   *   doctorCode: {
   *     originalTPDay: "Wednesday",      // Day that has TP in the backbone
   *     swapToDay: "Thursday" | "Friday", // Day to move TP to when it's their turn
   *     description: "..."                // Optional description
   *   }
   * }
   */
  rotationPool: {
    YC: {
      originalTPDay: "Wednesday",
      swapToDay: "Friday",
      description: "YC has Monday + Wednesday TP. Wednesday moves to Friday when it's their turn."
    },
    BM: {
      originalTPDay: "Wednesday",
      swapToDay: "Thursday",
      description: "BM has Tuesday + Wednesday + Friday TP. Wednesday moves to Thursday when it's their turn."
    },
    FL: {
      originalTPDay: "Wednesday",
      swapToDay: "Thursday",
      description: "FL has only Wednesday TP. Moves to Thursday when it's their turn."
    },
    MG: {
      originalTPDay: "Wednesday",
      swapToDay: "Thursday",
      description: "MG has only Wednesday TP. Moves to Thursday when it's their turn."
    },
    MDLC: {
      originalTPDay: "Wednesday",
      swapToDay: "Thursday",
      description: "MDLC has only Wednesday TP. Moves to Thursday when it's their turn."
    }
  },

  /**
   * Rotation cycle length in weeks
   *
   * With 5 doctors in the pool, the rotation cycles through all doctors every
   * 5 weeks. Each doctor swaps once per cycle (once every 5 weeks).
   *
   * The rotation advances EVERY working week (vacation weeks are skipped).
   * Week 1: YC swaps, Week 2: BM swaps, Week 3: FL swaps, Week 4: MG swaps,
   * Week 5: MDLC swaps, Week 6: YC swaps again (cycle repeats)
   */
  rotationCycleWeeks: 5,

  /**
   * Starting week for the rotation cycle
   *
   * This is the reference point for calculating which doctor is in rotation.
   * Format: { week: number, year: number }
   *
   * Default: Week 1 of 2026 (aligns with current planning year)
   */
  startingWeek: {
    week: 1,
    year: 2026
  },

  /**
   * Doctor rotation order
   *
   * This array defines the sequence in which doctors take turns swapping their TP.
   * The order determines who goes first, second, etc.
   *
   * To change the order, simply rearrange the doctor codes in this array.
   */
  rotationOrder: ["YC", "BM", "FL", "MG", "MDLC"],

  // ============================================================================
  // ADVANCED CONFIGURATION
  // ============================================================================

  /**
   * Skip vacation weeks
   *
   * When true, rotation doesn't advance during vacation weeks.
   * This ensures that the rotation only progresses during normal working weeks.
   *
   * Recommended: true (fairness - rotation only advances during working weeks)
   */
  skipVacationWeeks: true,

  /**
   * Reset rotation each year
   *
   * When true, rotation resets to the first doctor every January.
   * When false, rotation continues across years (continuous rotation).
   *
   * Recommended: false (fairness - continuous rotation across years)
   */
  resetEachYear: false,

  /**
   * Logging verbosity
   *
   * 0 = Silent (no logs)
   * 1 = Basic (only major events)
   * 2 = Detailed (show rotation calculations)
   * 3 = Debug (show all internal state)
   */
  logLevel: 2,

  /**
   * Color codes for console logging
   */
  logColors: {
    info: "🔄",
    success: "✅",
    warning: "⚠️",
    debug: "🔍",
    swap: "🔀"
  }
};

/**
 * Get the list of doctors in the rotation pool
 * @returns {Array<string>} Array of doctor codes
 */
export function getRotationPoolDoctors() {
  return Object.keys(tpRotationConfig.rotationPool);
}

/**
 * Get the rotation order
 * @returns {Array<string>} Array of doctor codes in rotation order
 */
export function getRotationOrder() {
  return tpRotationConfig.rotationOrder;
}

/**
 * Get the total number of doctors in rotation
 * @returns {number} Total doctors in rotation pool
 */
export function getRotationPoolSize() {
  return tpRotationConfig.rotationOrder.length;
}

/**
 * Check if a doctor is in the rotation pool
 * @param {string} doctorCode - Doctor code to check
 * @returns {boolean} True if doctor is in rotation pool
 */
export function isDoctorInRotationPool(doctorCode) {
  return tpRotationConfig.rotationPool.hasOwnProperty(doctorCode);
}

/**
 * Get TP swap configuration for a specific doctor
 * @param {string} doctorCode - Doctor code
 * @returns {Object|null} TP swap configuration or null if not in pool
 */
export function getDoctorTPSwapConfig(doctorCode) {
  return tpRotationConfig.rotationPool[doctorCode] || null;
}

// ============================================================================
// EXAMPLE CONFIGURATION PRESETS
// ============================================================================

/**
 * Example preset configurations for different scenarios
 * Uncomment and modify as needed
 */

// PRESET 1: Fast rotation (every week, each doctor swaps every 5 weeks)
// export const fastRotationPreset = {
//   ...tpRotationConfig,
//   rotationCycleWeeks: 1
// };

// PRESET 2: Slow rotation (every 10 weeks, each doctor swaps every 50 weeks)
// export const slowRotationPreset = {
//   ...tpRotationConfig,
//   rotationCycleWeeks: 10
// };

// PRESET 3: Yearly reset rotation
// export const yearlyResetPreset = {
//   ...tpRotationConfig,
//   resetEachYear: true
// };

// PRESET 4: Include vacation weeks
// export const includeVacationPreset = {
//   ...tpRotationConfig,
//   skipVacationWeeks: false
// };

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

/**
 * Validate the TP rotation configuration
 * @returns {Object} Validation result with success flag and errors
 */
export function validateTPRotationConfig() {
  const errors = [];
  const warnings = [];

  // Check if rotation pool is defined
  if (!tpRotationConfig.rotationPool || Object.keys(tpRotationConfig.rotationPool).length === 0) {
    errors.push("Rotation pool is empty or undefined");
  }

  // Check if rotation order is defined and matches pool
  if (!tpRotationConfig.rotationOrder || tpRotationConfig.rotationOrder.length === 0) {
    errors.push("Rotation order is empty or undefined");
  }

  // Check if all doctors in rotationOrder exist in rotationPool
  tpRotationConfig.rotationOrder.forEach(doctorCode => {
    if (!tpRotationConfig.rotationPool[doctorCode]) {
      errors.push(`Doctor ${doctorCode} in rotation order but not in rotation pool`);
    }
  });

  // Check if all doctors in rotationPool are in rotationOrder
  Object.keys(tpRotationConfig.rotationPool).forEach(doctorCode => {
    if (!tpRotationConfig.rotationOrder.includes(doctorCode)) {
      warnings.push(`Doctor ${doctorCode} in rotation pool but not in rotation order`);
    }
  });

  // Check rotation cycle weeks
  if (tpRotationConfig.rotationCycleWeeks <= 0) {
    errors.push("Rotation cycle weeks must be positive");
  }

  // Check starting week
  if (!tpRotationConfig.startingWeek || !tpRotationConfig.startingWeek.week || !tpRotationConfig.startingWeek.year) {
    errors.push("Starting week is not properly defined");
  }

  return {
    success: errors.length === 0,
    errors,
    warnings
  };
}

// Validate configuration on module load
const validationResult = validateTPRotationConfig();
if (!validationResult.success) {
  console.error("❌ TP Rotation Configuration Validation Failed:");
  validationResult.errors.forEach(error => console.error(`  - ${error}`));
}
if (validationResult.warnings.length > 0) {
  console.warn("⚠️ TP Rotation Configuration Warnings:");
  validationResult.warnings.forEach(warning => console.warn(`  - ${warning}`));
}
