// Test file for Custom Planning Logic - Simplified Version
import {
  executeCustomPlanningAlgorithm,
  generateCustomPlanningReport,
  assignRigidDoctors,
  createRotationDict,
  selectUniqueRotationPairs,
  createBaseScheduling,
  calculateRotationPeriods,
  createPeriodicVariations
} from './customPlanningLogic.js';

// Simplified test function for the custom logic implementation
export function testCustomPlanningLogic() {
  console.log('🧪 Testing Custom Planning Logic (Simplified Version)...');

  const testResults = {
    success: true,
    tests: [],
    errors: []
  };

  try {
    // Test 1: Phase 1 - Rigid doctors assignment
    console.log('\n📋 Test 1: Phase 1 - Rigid doctors assignment');
    const rigidResult = assignRigidDoctors();

    testResults.tests.push({
      name: 'Phase 1 - Rigid doctors',
      success: rigidResult.assignedDoctors.length > 0,
      details: `${rigidResult.assignedDoctors.length} rigid doctors assigned`,
      data: rigidResult
    });

    // Test 2: Rotation dictionary creation
    console.log('\n📋 Test 2: Rotation dictionary creation');
    const rotationDict = createRotationDict();

    testResults.tests.push({
      name: 'Rotation dictionary',
      success: Object.keys(rotationDict).length > 0,
      details: `${Object.keys(rotationDict).length} rotations mapped`,
      data: rotationDict
    });

    // Test 3: Complete base scheduling (Phase 1)
    console.log('\n📋 Test 3: Complete base scheduling');
    const baseScheduling = createBaseScheduling();

    testResults.tests.push({
      name: 'Base scheduling',
      success: Object.keys(baseScheduling.schedule).length > 0,
      details: `${Object.keys(baseScheduling.schedule).length} doctors scheduled`,
      data: baseScheduling
    });

    // Test 4: Rotation periods calculation (Phase 3)
    console.log('\n📋 Test 4: Rotation periods calculation');
    const rotationPeriods = calculateRotationPeriods();

    testResults.tests.push({
      name: 'Rotation periods',
      success: rotationPeriods.length > 0,
      details: `${rotationPeriods.length} rotation periods calculated`,
      data: rotationPeriods
    });

    // Test 5: Complete algorithm execution
    console.log('\n📋 Test 5: Complete algorithm execution');
    const algorithmResult = executeCustomPlanningAlgorithm();

    testResults.tests.push({
      name: 'Complete algorithm',
      success: algorithmResult.success,
      details: `Algorithm ${algorithmResult.success ? 'succeeded' : 'failed'} (simplified)`,
      data: algorithmResult
    });

    // Test 6: Report generation
    console.log('\n📋 Test 6: Report generation');
    const report = generateCustomPlanningReport(algorithmResult);

    testResults.tests.push({
      name: 'Report generation',
      success: report.success,
      details: `Report ${report.success ? 'generated' : 'failed'} (simplified)`,
      data: report
    });

    // Calculate overall success rate
    const successfulTests = testResults.tests.filter(test => test.success).length;
    const totalTests = testResults.tests.length;

    console.log(`\n✅ Tests completed: ${successfulTests}/${totalTests} successful`);

    if (successfulTests === totalTests) {
      console.log('🎉 All tests passed! Simplified custom logic is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the details above.');
      testResults.success = false;
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    testResults.success = false;
    testResults.errors.push(error.message);
  }

  return testResults;
}

// Quick validation function for simplified version
export function quickValidation() {
  console.log('🚀 Quick validation of Simplified Custom Planning Logic...');

  try {
    const result = executeCustomPlanningAlgorithm();

    if (result.success) {
      console.log('✅ Simplified algorithm execution: SUCCESS');
      console.log(`📊 Statistics:`, result.statistics);

      const report = generateCustomPlanningReport(result);
      console.log('✅ Simplified report generation: SUCCESS');
      console.log(`📋 Report summary:`, report.summary);

      return {
        valid: true,
        simplified: true,
        executionTime: result.statistics.executionTime,
        doctorsProcessed: result.statistics.doctorsProcessed,
        periodsGenerated: result.statistics.periodsGenerated
      };
    } else {
      console.log('❌ Simplified algorithm execution: FAILED');
      console.log('Errors:', result.errors);
      return { valid: false, errors: result.errors };
    }
  } catch (error) {
    console.error('❌ Simplified validation failed:', error);
    return { valid: false, error: error.message };
  }
}

// Export test functions for use in browser console
if (typeof window !== 'undefined') {
  window.testCustomLogic = testCustomPlanningLogic;
  window.quickValidationCustomLogic = quickValidation;
  console.log('📝 Simplified test functions available in console: testCustomLogic(), quickValidationCustomLogic()');
}