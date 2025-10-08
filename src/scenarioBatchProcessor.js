// Scenario Batch Processor
// Handles batch calculation of metrics for all scenario combinations

import { generateAllCombinations, mergeScenariosChanges } from './scenarioCombinationGenerator';
import { applyScenarioChanges } from './scenarioEngine';
import { executeCustomPlanningAlgorithm } from './customPlanningLogic';
import {
  doctorProfiles as initialDoctorProfiles,
  docActivities as initialDocActivities,
  wantedActivities as initialWantedActivities,
  rotationTemplates as initialRotationTemplates,
} from './doctorSchedules.js';
import { expectedActivities as initialExpectedActivities } from './schedule.jsx';

/**
 * Calculate metrics for all combinations
 * @param {Function} onProgress - Progress callback (current, total)
 * @param {Function} calculateMetrics - Metrics calculation function from ScheduleContext
 * @returns {Promise<Array>} Array of results sorted by total score (ascending)
 */
export async function calculateAllCombinationMetrics(onProgress, calculateMetrics) {
  console.log('🚀 Starting batch calculation of all combinations...');

  const combinations = generateAllCombinations();
  const results = [];

  for (let i = 0; i < combinations.length; i++) {
    const combo = combinations[i];

    try {
      console.log(`\n📊 Processing combination ${i + 1}/${combinations.length}: ${combo.id}`);

      // 1. Merge changes from atomic scenarios
      const mergedChanges = mergeScenariosChanges(combo.atomicScenarios);

      // 2. Build base config
      const baseConfig = {
        doctorProfiles: initialDoctorProfiles,
        docActivities: initialDocActivities,
        wantedActivities: initialWantedActivities,
        rotationTemplates: initialRotationTemplates,
        expectedActivities: initialExpectedActivities,
        rotationCycle: 'honeymoon_NS_noHDJ' // Default
      };

      // 3. Apply merged changes to base config
      const modifiedConfig = applyScenarioChanges(baseConfig, {
        ...combo,
        changes: mergedChanges
      });

      // 4. Execute planning algorithm
      const scheduleResult = executeCustomPlanningAlgorithm(
        modifiedConfig.rotationCycle || 'honeymoon_NS_noHDJ',
        {
          doctorProfiles: modifiedConfig.doctorProfiles,
          wantedActivities: modifiedConfig.wantedActivities,
          docActivities: modifiedConfig.docActivities,
          rotationTemplates: modifiedConfig.rotationTemplates,
          conflictResolutionOrder: modifiedConfig.conflictResolutionOrder
        },
        modifiedConfig.conflictResolutionOrder
      );

      // 5. Calculate metrics using the provided function
      const metrics = calculateMetrics(scheduleResult, modifiedConfig.docActivities);

      // 6. Calculate total score (SANS MAD car en heures, unité différente)
      const totalScore =
        (metrics.totalMissingActivities || 0) +
        (metrics.totalOverloadedSlots || 0) +
        (metrics.totalTeleCsMissing || 0);

      // Store result
      results.push({
        combination: combo,
        metrics,
        totalScore,
        // Optionally store schedule for debugging (can be large)
        // scheduleResult
      });

      console.log(`✅ Combination ${i + 1} complete. Score: ${totalScore}`);
    } catch (error) {
      console.error(`❌ Error processing combination ${i + 1}:`, error);

      // Store error result
      results.push({
        combination: combo,
        error: error.message,
        totalScore: Infinity, // Worst score for errors
        metrics: {
          totalMissingActivities: 0,
          totalOverloadedSlots: 0,
          totalTeleCsMissing: 0,
          workloadMAD: 0
        }
      });
    }

    // Call progress callback
    if (onProgress) {
      onProgress(i + 1, combinations.length);
    }

    // Small delay to avoid blocking UI (allows React to update)
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Sort by total score (ascending = best first)
  results.sort((a, b) => a.totalScore - b.totalScore);

  console.log(`\n🎉 Batch calculation complete!`);
  console.log(`📊 Best score: ${results[0]?.totalScore}`);
  console.log(`📊 Worst score: ${results[results.length - 1]?.totalScore}`);

  return results;
}

/**
 * Save results to localStorage
 * @param {Array} results - Array of calculation results
 */
export function saveResultsToCache(results) {
  try {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      totalCombinations: results.length,
      results: results.map(r => ({
        id: r.combination.id,
        name: r.combination.name,
        atomicScenarios: r.combination.atomicScenarios,
        totalScore: r.totalScore,
        metrics: r.metrics,
        error: r.error
      }))
    };

    localStorage.setItem('scenarioCombinationResults', JSON.stringify(data));
    console.log(`💾 Saved ${results.length} results to cache`);
  } catch (error) {
    console.error('❌ Error saving to cache:', error);
  }
}

/**
 * Load results from localStorage
 * @returns {Object|null} Cached data or null
 */
export function loadResultsFromCache() {
  try {
    const stored = localStorage.getItem('scenarioCombinationResults');

    if (!stored) {
      console.log('ℹ️ No cached results found');
      return null;
    }

    const data = JSON.parse(stored);

    // Reconstruct the combination object structure for consistency
    // Cache saves flat properties (id, name, atomicScenarios) but the app expects { combination: {...} }
    if (data.results) {
      data.results = data.results.map(r => ({
        combination: {
          id: r.id,
          name: r.name,
          atomicScenarios: r.atomicScenarios
        },
        totalScore: r.totalScore,
        metrics: r.metrics,
        error: r.error
      }));
    }

    console.log(`💾 Loaded ${data.results?.length || 0} results from cache (${data.timestamp})`);

    return data;
  } catch (error) {
    console.error('❌ Error loading from cache:', error);
    return null;
  }
}

/**
 * Clear cached results
 */
export function clearResultsCache() {
  try {
    localStorage.removeItem('scenarioCombinationResults');
    console.log('🗑️ Cache cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
}

/**
 * Check if cache is valid (not too old, correct version)
 * @param {number} maxAgeHours - Maximum age in hours (default: 24)
 * @returns {boolean} True if cache is valid
 */
export function isCacheValid(maxAgeHours = 24) {
  const cached = loadResultsFromCache();

  if (!cached) {
    return false;
  }

  // Check version
  if (cached.version !== '1.0') {
    console.warn('⚠️ Cache version mismatch');
    return false;
  }

  // Check age
  const cacheDate = new Date(cached.timestamp);
  const now = new Date();
  const ageHours = (now - cacheDate) / (1000 * 60 * 60);

  if (ageHours > maxAgeHours) {
    console.warn(`⚠️ Cache is ${ageHours.toFixed(1)} hours old (max: ${maxAgeHours})`);
    return false;
  }

  // Check completeness
  if (!cached.results || cached.results.length !== cached.totalCombinations) {
    console.warn('⚠️ Cache is incomplete');
    return false;
  }

  console.log(`✅ Cache is valid (${ageHours.toFixed(1)} hours old)`);
  return true;
}

/**
 * Get cache info
 * @returns {Object} Cache information
 */
export function getCacheInfo() {
  const cached = loadResultsFromCache();

  if (!cached) {
    return {
      exists: false,
      timestamp: null,
      age: null,
      resultCount: 0,
      valid: false
    };
  }

  const cacheDate = new Date(cached.timestamp);
  const now = new Date();
  const ageHours = (now - cacheDate) / (1000 * 60 * 60);

  return {
    exists: true,
    timestamp: cached.timestamp,
    age: ageHours,
    resultCount: cached.results?.length || 0,
    valid: isCacheValid(),
    version: cached.version
  };
}

export default {
  calculateAllCombinationMetrics,
  saveResultsToCache,
  loadResultsFromCache,
  clearResultsCache,
  isCacheValid,
  getCacheInfo
};
