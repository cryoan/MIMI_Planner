// Scenario Engine - Apply configuration changes to base medical scheduling data
// Supports path-based modifications and array operations

/**
 * Deep clone utility that properly handles nested objects
 * Avoids JSON.parse/stringify to preserve object references where needed
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Get nested property value by path
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-separated path (e.g., "doctorProfiles.FL.skills")
 * @returns {*} Value at path or undefined
 */
function getByPath(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Set nested property value by path
 * @param {Object} obj - Object to modify (mutated in place)
 * @param {string} path - Dot-separated path
 * @param {*} value - Value to set
 */
function setByPath(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    // Validate that we're not creating invalid paths
    if (current[key] === null || current[key] === undefined) {
      // Create intermediate object only if parent exists
      if (typeof current === 'object' && current !== null) {
        current[key] = {};
      } else {
        console.error(`Cannot set property '${key}' on non-object at path: ${keys.slice(0, i).join('.')}`);
        return;
      }
    } else if (typeof current[key] !== 'object') {
      console.error(`Cannot traverse through non-object property '${key}' at path: ${keys.slice(0, i).join('.')}`);
      return;
    }

    current = current[key];
  }

  const finalKey = keys[keys.length - 1];
  current[finalKey] = value;

  console.log(`✅ Set ${path} = ${JSON.stringify(value)}`);
}

/**
 * Apply array operation (add, remove, replace)
 * @param {Array} baseArray - Original array
 * @param {Array} operation - [operation, value] or just value for replace
 * @returns {Array} Modified array
 */
function applyArrayOperation(baseArray, operation) {
  if (!Array.isArray(operation)) {
    // Direct replacement
    return operation;
  }

  const [op, value] = operation;
  const result = [...baseArray];

  switch (op) {
    case 'add':
    case 'push':
      if (Array.isArray(value)) {
        result.push(...value);
      } else {
        result.push(value);
      }
      break;

    case 'remove':
      if (Array.isArray(value)) {
        return result.filter(item => !value.includes(item));
      } else {
        return result.filter(item => item !== value);
      }

    case 'replace':
      return Array.isArray(value) ? value : [value];

    default:
      console.warn(`Unknown array operation: ${op}`);
      return result;
  }

  return result;
}

/**
 * Apply a single change to configuration
 * @param {Object} config - Configuration object to modify
 * @param {string} path - Dot-separated path to property
 * @param {*} changeValue - New value or operation
 * @returns {Object} Modified configuration
 */
function applyChange(config, path, changeValue) {
  const currentValue = getByPath(config, path);

  // Handle array operations
  if (Array.isArray(currentValue) && Array.isArray(changeValue)) {
    const newValue = applyArrayOperation(currentValue, changeValue);
    setByPath(config, path, newValue);
  } else {
    // Direct replacement
    setByPath(config, path, changeValue);
  }

  return config;
}

/**
 * Apply scenario changes to base configuration
 * @param {Object} baseConfig - Base configuration object
 * @param {Object} scenario - Scenario with changes definition
 * @returns {Object} Modified configuration
 */
export function applyScenarioChanges(baseConfig, scenario) {
  if (!scenario || !scenario.changes) {
    return deepClone(baseConfig);
  }

  console.log(`🎬 Applying scenario "${scenario.name}" (${scenario.id})`);
  console.log('📋 Changes to apply:', scenario.changes);

  // Clone base config to avoid mutations
  const modifiedConfig = deepClone(baseConfig);

  console.log('🔍 Base config before changes:', {
    docActivitiesKeys: Object.keys(modifiedConfig.docActivities || {}),
    doctorProfilesKeys: Object.keys(modifiedConfig.doctorProfiles || {}),
    sampleAMI: modifiedConfig.docActivities?.AMI
  });

  // Apply each change
  Object.entries(scenario.changes).forEach(([path, value]) => {
    try {
      console.log(`\n🔧 Applying change: ${path} = ${JSON.stringify(value)}`);
      applyChange(modifiedConfig, path, value);
    } catch (error) {
      console.error(`❌ Failed to apply change at path "${path}":`, error);
    }
  });

  console.log('🔍 Modified config after changes:', {
    docActivitiesKeys: Object.keys(modifiedConfig.docActivities || {}),
    sampleAMI: modifiedConfig.docActivities?.AMI,
    conflictResolutionOrder: modifiedConfig.conflictResolutionOrder
  });

  return modifiedConfig;
}

/**
 * Load scenarios from config and generate modified configurations
 * @param {Object} baseConfig - Base configuration
 * @param {Array} scenarios - Array of scenario definitions
 * @returns {Array} Array of {scenario, config} objects
 */
export function loadScenarios(baseConfig, scenarios) {
  if (!Array.isArray(scenarios)) {
    console.warn('Scenarios must be an array');
    return [];
  }

  return scenarios.map(scenario => ({
    scenario,
    config: applyScenarioChanges(baseConfig, scenario)
  }));
}

/**
 * Validate scenario definition
 * @param {Object} scenario - Scenario to validate
 * @returns {Object} {valid: boolean, errors: []}
 */
export function validateScenario(scenario) {
  const errors = [];

  if (!scenario.id) {
    errors.push('Scenario missing required field: id');
  }

  if (!scenario.name) {
    errors.push('Scenario missing required field: name');
  }

  if (!scenario.changes || typeof scenario.changes !== 'object') {
    errors.push('Scenario missing or invalid changes object');
  }

  // Validate color format (optional but recommended)
  if (scenario.color && !/^rgba?\(/.test(scenario.color)) {
    errors.push('Scenario color should be in rgba() or rgb() format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get default scenario color based on index
 * @param {number} index - Scenario index
 * @returns {string} RGBA color string
 */
export function getDefaultScenarioColor(index) {
  const colors = [
    'rgba(54, 162, 235, 0.6)',   // Blue
    'rgba(255, 99, 132, 0.6)',   // Red
    'rgba(75, 192, 192, 0.6)',   // Green
    'rgba(255, 206, 86, 0.6)',   // Yellow
    'rgba(153, 102, 255, 0.6)',  // Purple
    'rgba(255, 159, 64, 0.6)',   // Orange
    'rgba(199, 199, 199, 0.6)',  // Gray
    'rgba(83, 102, 255, 0.6)',   // Indigo
  ];

  return colors[index % colors.length];
}

/**
 * Merge conflict resolution order changes
 * Special handling for conflict resolution order in customPlanningLogic
 * @param {Array} baseOrder - Default order
 * @param {Array} scenarioOrder - Scenario-specific order
 * @returns {Array} Merged order
 */
export function mergeConflictResolutionOrder(baseOrder, scenarioOrder) {
  if (!scenarioOrder) {
    return baseOrder;
  }

  // Validate that all required conflict types are present
  const requiredTypes = ['HTC', 'EMIT', 'EMATIT', 'TeleCs'];
  const missing = requiredTypes.filter(type => !scenarioOrder.includes(type));

  if (missing.length > 0) {
    console.warn(`Scenario conflict resolution order missing: ${missing.join(', ')}. Using base order.`);
    return baseOrder;
  }

  return scenarioOrder;
}

export default {
  applyScenarioChanges,
  loadScenarios,
  validateScenario,
  getDefaultScenarioColor,
  mergeConflictResolutionOrder,
};
