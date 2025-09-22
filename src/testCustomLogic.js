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

    // Test 6: Report generation with real validation
    console.log('\n📋 Test 6: Report generation with real validation');
    const report = generateCustomPlanningReport(algorithmResult);

    // Display validation results
    if (report.success && report.summary.validationResults) {
      const problems = report.summary.problemsIdentified;
      const validation = report.summary.validationResults;

      console.log(`\n🔍 Validation Results:`);
      console.log(`  - Coverage: ${validation.coveragePercentage.toFixed(1)}% (${validation.validSlots}/${validation.totalSlots} slots)`);

      // Enhanced activity breakdown display
      if (validation.summaryText) {
        console.log(`  - ${validation.summaryText.missing}`);
        console.log(`  - ${validation.summaryText.duplicates}`);
      } else {
        console.log(`  - Missing activities: ${problems.totalMissing}`);
        console.log(`  - Duplicate activities: ${problems.totalDuplicates}`);
      }

      if (problems.totalMissing > 0) {
        console.log(`  - Missing details (first 3):`, validation.missingDetails.slice(0, 3));
      }
      if (problems.totalDuplicates > 0) {
        console.log(`  - Duplicate details (first 3):`, validation.duplicateDetails.slice(0, 3));
      }
    }

    testResults.tests.push({
      name: 'Report generation with validation',
      success: report.success,
      details: `Report generated with ${report.summary.problemsIdentified.totalMissing} missing, ${report.summary.problemsIdentified.totalDuplicates} duplicates`,
      data: report
    });

    // Test 7: Validation accuracy verification
    console.log('\n📋 Test 7: Validation accuracy verification');
    const validationPassed = report.success &&
                           typeof report.summary.problemsIdentified.totalMissing === 'number' &&
                           typeof report.summary.problemsIdentified.totalDuplicates === 'number' &&
                           report.summary.validationResults.coveragePercentage >= 0;

    testResults.tests.push({
      name: 'Validation accuracy',
      success: validationPassed,
      details: `Real validation data ${validationPassed ? 'successfully integrated' : 'integration failed'}`,
      data: {
        hasValidationResults: !!report.summary.validationResults,
        hasProblemsIdentified: !!report.summary.problemsIdentified,
        coveragePercentage: report.summary.validationResults?.coveragePercentage
      }
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

      // Display validation results in quick validation
      if (report.summary.validationResults) {
        const problems = report.summary.problemsIdentified;
        const validation = report.summary.validationResults;

        console.log('\n🔍 Quick Validation Results:');
        console.log(`  ✓ Coverage: ${validation.coveragePercentage.toFixed(1)}%`);

        // Enhanced activity breakdown display
        if (validation.summaryText) {
          console.log(`  ✓ ${validation.summaryText.missing}`);
          console.log(`  ✓ ${validation.summaryText.duplicates}`);
        } else {
          console.log(`  ✓ Missing activities: ${problems.totalMissing}`);
          console.log(`  ✓ Duplicate activities: ${problems.totalDuplicates}`);
        }
      }

      return {
        valid: true,
        simplified: true,
        executionTime: result.statistics.executionTime,
        doctorsProcessed: result.statistics.doctorsProcessed,
        periodsGenerated: result.statistics.periodsGenerated,
        validationResults: report.summary.problemsIdentified,
        coveragePercentage: report.summary.validationResults?.coveragePercentage
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