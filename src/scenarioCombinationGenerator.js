// Scenario Combination Generator
// Generates all possible combinations of atomic scenarios for exhaustive testing

import scenarioConfigsData from './scenarioConfigs.json';

/**
 * Define scenario groups for combination generation
 * Each group represents a dimension of variation
 */
export const scenarioGroups = {
  BM: ['BM-EMIT-JV', 'BM-EMIT-LJ'],
  FL: ['FL-TP-Mer', 'FL-TP-J', 'FL-TP-L'],
  NS: ['NS-TP-0', 'NS-TP-J', 'NS-TP-L'],
  AMI: ['AMI-1', 'AMI-2'],
  Rotation: ['Rotation-NS-NoHDJ', 'Rotation-NS-HDJ']
};

/**
 * Generate all combinations using Cartesian product
 * @returns {Array} Array of combination objects with id, name, description, and atomicScenarios
 */
export function generateAllCombinations() {
  console.log('🧬 Generating all scenario combinations...');

  const combinations = [];
  const groups = Object.values(scenarioGroups);

  // Generate Cartesian product
  const cartesianProduct = (arrays) => {
    return arrays.reduce((acc, array) => {
      return acc.flatMap(x => array.map(y => [...x, y]));
    }, [[]]);
  };

  const allCombos = cartesianProduct(groups);

  console.log(`📊 Generated ${allCombos.length} combinations`);

  // Convert each combination to a structured object
  allCombos.forEach((combo, index) => {
    const scenarioIds = combo;

    // Get scenario details from config
    const scenarios = scenarioIds.map(id =>
      scenarioConfigsData.scenarios.find(s => s.id === id)
    ).filter(Boolean);

    if (scenarios.length !== scenarioIds.length) {
      console.warn(`⚠️ Some scenarios not found for combination ${index + 1}:`, scenarioIds);
      return;
    }

    // Create combination object
    const combination = {
      id: scenarioIds.join('_'),
      name: scenarios.map(s => s.name).join(' + '),
      description: `Combinaison: ${scenarios.map(s => s.description).join(', ')}`,
      atomicScenarios: scenarioIds,
      scenarios: scenarios // Full scenario objects for reference
    };

    combinations.push(combination);
  });

  console.log(`✅ Successfully generated ${combinations.length} valid combinations`);
  return combinations;
}

/**
 * Merge changes from multiple scenarios
 * @param {Array} scenarioIds - Array of scenario IDs to merge
 * @returns {Object} Merged changes object
 */
export function mergeScenariosChanges(scenarioIds) {
  console.log(`🔀 Merging changes from scenarios:`, scenarioIds);

  const mergedChanges = {};

  // Process scenarios in order (later scenarios override earlier ones)
  scenarioIds.forEach(scenarioId => {
    const scenario = scenarioConfigsData.scenarios.find(s => s.id === scenarioId);

    if (!scenario) {
      console.warn(`⚠️ Scenario ${scenarioId} not found`);
      return;
    }

    // Merge changes
    Object.entries(scenario.changes || {}).forEach(([path, value]) => {
      mergedChanges[path] = value;
    });
  });

  console.log(`✅ Merged ${Object.keys(mergedChanges).length} changes`);
  return mergedChanges;
}

/**
 * Get a specific combination by index
 * @param {number} index - Index of the combination (0-71)
 * @returns {Object} Combination object
 */
export function getCombinationByIndex(index) {
  const combinations = generateAllCombinations();

  if (index < 0 || index >= combinations.length) {
    throw new Error(`Invalid combination index: ${index}. Must be between 0 and ${combinations.length - 1}`);
  }

  return combinations[index];
}

/**
 * Find combinations containing a specific scenario
 * @param {string} scenarioId - Scenario ID to search for
 * @returns {Array} Array of combinations containing the scenario
 */
export function findCombinationsWithScenario(scenarioId) {
  const combinations = generateAllCombinations();
  return combinations.filter(combo => combo.atomicScenarios.includes(scenarioId));
}

/**
 * Validate that all atomic scenarios exist in config
 * @returns {Object} Validation result {valid: boolean, missing: []}
 */
export function validateScenarioGroups() {
  const allScenarioIds = Object.values(scenarioGroups).flat();
  const configScenarioIds = scenarioConfigsData.scenarios.map(s => s.id);

  const missing = allScenarioIds.filter(id => !configScenarioIds.includes(id));

  return {
    valid: missing.length === 0,
    missing,
    total: allScenarioIds.length,
    found: allScenarioIds.length - missing.length
  };
}

/**
 * Get statistics about combinations
 * @returns {Object} Statistics object
 */
export function getCombinationStats() {
  const validation = validateScenarioGroups();
  const totalCombinations = Object.values(scenarioGroups).reduce(
    (acc, group) => acc * group.length,
    1
  );

  return {
    totalCombinations,
    groupCount: Object.keys(scenarioGroups).length,
    groups: Object.entries(scenarioGroups).map(([name, scenarios]) => ({
      name,
      count: scenarios.length,
      scenarios
    })),
    validation
  };
}

// Run validation on module load
const validation = validateScenarioGroups();
if (!validation.valid) {
  console.error('❌ Scenario validation failed:', validation);
} else {
  console.log('✅ All atomic scenarios validated successfully');
}

export default {
  scenarioGroups,
  generateAllCombinations,
  mergeScenariosChanges,
  getCombinationByIndex,
  findCombinationsWithScenario,
  validateScenarioGroups,
  getCombinationStats
};
