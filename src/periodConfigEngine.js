// Period Configuration Engine - Apply time-based configuration changes
// Extends scenario engine concepts to support time-based periods

import periodConfigsData from './periodConfigs.json';
import { applyScenarioChanges } from './scenarioEngine.js';

/**
 * Calculate week number from date
 * @param {Date} date - Date to calculate week for
 * @returns {number} ISO week number (1-52/53)
 */
function getWeekNumber(date) {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return 1 + Math.round(((tempDate - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

/**
 * Check if a week falls within a period's date range
 * @param {number} week - Week number to check
 * @param {number} year - Year to check
 * @param {Object} period - Period configuration with dateRange
 * @returns {boolean} True if week is within period
 */
function isWeekInPeriod(week, year, period) {
  const { startWeek, startYear, endWeek, endYear } = period.dateRange;

  // Convert to comparable numbers (yearWeek format: YYYYWW)
  const weekNum = year * 100 + week;
  const periodStart = startYear * 100 + startWeek;
  const periodEnd = endYear * 100 + endWeek;

  return weekNum >= periodStart && weekNum <= periodEnd;
}

/**
 * Get period configuration for a specific week and year
 * @param {number} week - Week number (1-52/53)
 * @param {number} year - Year
 * @returns {Object|null} Period configuration or null if no match
 */
export function getPeriodConfigForWeek(week, year) {
  const { periodConfigurations } = periodConfigsData;

  // Find non-default periods first (more specific)
  const specificPeriod = periodConfigurations.find(
    period => !period.isDefault && isWeekInPeriod(week, year, period)
  );

  if (specificPeriod) {
    console.log(`📅 Week ${week}, ${year} -> Period: "${specificPeriod.name}"`);
    return specificPeriod;
  }

  // Fall back to default period
  const defaultPeriod = periodConfigurations.find(period => period.isDefault);

  if (defaultPeriod) {
    console.log(`📅 Week ${week}, ${year} -> Default period: "${defaultPeriod.name}"`);
    return defaultPeriod;
  }

  console.warn(`⚠️ No period configuration found for week ${week}, ${year}`);
  return null;
}

/**
 * Apply period configuration changes to base config
 * Reuses scenario engine logic for consistency
 * @param {Object} baseConfig - Base configuration object
 * @param {Object} periodConfig - Period configuration with changes
 * @returns {Object} Modified configuration
 */
export function applyPeriodConfig(baseConfig, periodConfig) {
  if (!periodConfig || !periodConfig.changes || Object.keys(periodConfig.changes).length === 0) {
    console.log('📅 No period changes to apply, using base config');
    return baseConfig;
  }

  console.log(`📅 Applying period config: "${periodConfig.name}"`);

  // Reuse scenario engine's applyScenarioChanges
  // Convert period config to scenario format
  const scenarioFormat = {
    id: periodConfig.id,
    name: periodConfig.name,
    description: periodConfig.description,
    changes: periodConfig.changes
  };

  return applyScenarioChanges(baseConfig, scenarioFormat);
}

/**
 * Get all active periods for a given year
 * @param {number} year - Year to get periods for
 * @returns {Array} Array of periods with week ranges
 */
export function getAllActivePeriods(year) {
  const { periodConfigurations } = periodConfigsData;
  const periods = [];

  // For each week in the year, determine which period applies
  const weeksInYear = 52; // Simplified, could be 53 for some years
  const weekToPeriodMap = new Map();

  for (let week = 1; week <= weeksInYear; week++) {
    const period = getPeriodConfigForWeek(week, year);
    if (period) {
      const periodId = period.id;
      if (!weekToPeriodMap.has(periodId)) {
        weekToPeriodMap.set(periodId, {
          ...period,
          weeks: []
        });
      }
      weekToPeriodMap.get(periodId).weeks.push(week);
    }
  }

  // Convert to array and add computed boundaries
  weekToPeriodMap.forEach(period => {
    periods.push({
      id: period.id,
      name: period.name,
      description: period.description,
      firstWeek: Math.min(...period.weeks),
      lastWeek: Math.max(...period.weeks),
      weekCount: period.weeks.length
    });
  });

  // Sort by first week
  periods.sort((a, b) => a.firstWeek - b.firstWeek);

  return periods;
}

/**
 * Validate period configurations for gaps and overlaps
 * @returns {Object} {valid: boolean, errors: [], warnings: []}
 */
export function validatePeriodConfigs() {
  const { periodConfigurations } = periodConfigsData;
  const errors = [];
  const warnings = [];

  // Check for required default period
  const defaultPeriods = periodConfigurations.filter(p => p.isDefault);
  if (defaultPeriods.length === 0) {
    errors.push('No default period configuration found');
  } else if (defaultPeriods.length > 1) {
    errors.push(`Multiple default periods found: ${defaultPeriods.map(p => p.id).join(', ')}`);
  }

  // Validate each period
  periodConfigurations.forEach(period => {
    if (!period.id) {
      errors.push('Period missing required field: id');
    }
    if (!period.name) {
      errors.push('Period missing required field: name');
    }
    if (!period.dateRange) {
      errors.push(`Period ${period.id} missing dateRange`);
    } else {
      const { startWeek, startYear, endWeek, endYear } = period.dateRange;
      if (!startWeek || !startYear || !endWeek || !endYear) {
        errors.push(`Period ${period.id} has incomplete dateRange`);
      }
      if (startWeek < 1 || startWeek > 53 || endWeek < 1 || endWeek > 53) {
        errors.push(`Period ${period.id} has invalid week numbers (must be 1-53)`);
      }
      const startNum = startYear * 100 + startWeek;
      const endNum = endYear * 100 + endWeek;
      if (startNum > endNum) {
        errors.push(`Period ${period.id} has startWeek after endWeek`);
      }
    }
  });

  // Check for overlaps between non-default periods
  const nonDefaultPeriods = periodConfigurations.filter(p => !p.isDefault);
  for (let i = 0; i < nonDefaultPeriods.length; i++) {
    for (let j = i + 1; j < nonDefaultPeriods.length; j++) {
      const p1 = nonDefaultPeriods[i];
      const p2 = nonDefaultPeriods[j];

      // Check if periods overlap
      const p1Start = p1.dateRange.startYear * 100 + p1.dateRange.startWeek;
      const p1End = p1.dateRange.endYear * 100 + p1.dateRange.endWeek;
      const p2Start = p2.dateRange.startYear * 100 + p2.dateRange.startWeek;
      const p2End = p2.dateRange.endYear * 100 + p2.dateRange.endWeek;

      if (!(p1End < p2Start || p2End < p1Start)) {
        warnings.push(`Periods "${p1.name}" and "${p2.name}" overlap - first match will be used`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get period boundaries for visual display
 * Returns weeks where periods change
 * @param {number} year - Year to get boundaries for
 * @returns {Array} Array of {week, periodName, periodDescription}
 */
export function getPeriodBoundaries(year) {
  const boundaries = [];
  let currentPeriod = null;

  for (let week = 1; week <= 52; week++) {
    const period = getPeriodConfigForWeek(week, year);

    if (!currentPeriod || period?.id !== currentPeriod?.id) {
      boundaries.push({
        week,
        periodId: period?.id,
        periodName: period?.name,
        periodDescription: period?.description
      });
      currentPeriod = period;
    }
  }

  return boundaries;
}

/**
 * Load all period configurations
 * @returns {Array} Array of period configurations
 */
export function loadPeriodConfigs() {
  return periodConfigsData.periodConfigurations;
}

export default {
  getPeriodConfigForWeek,
  applyPeriodConfig,
  getAllActivePeriods,
  validatePeriodConfigs,
  getPeriodBoundaries,
  loadPeriodConfigs
};
