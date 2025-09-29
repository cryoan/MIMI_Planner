// Test functions for Custom Planning Logic

import { executeCustomPlanningAlgorithm, generateCustomPlanningReport } from './customPlanningLogic.js';

export const testCustomPlanningLogic = () => {
  console.log('🧪 Testing Custom Planning Logic...');

  try {
    const result = executeCustomPlanningAlgorithm();
    const report = generateCustomPlanningReport(result);

    console.log('✅ Custom Planning Logic Test Results:');
    console.log('Algorithm:', report.algorithmType);
    console.log('Execution Time:', report.executionTime);
    console.log('Periods Generated:', report.periodsGenerated);
    console.log('Total Doctors:', report.summary.totalDoctors);
    console.log('Phases:', Object.keys(result.phases));

    if (result.finalSchedule) {
      console.log('📅 Final Schedule Generated:', Object.keys(result.finalSchedule));
    }

    if (result.periodicSchedule) {
      console.log('🔄 Periodic Variations:', Object.keys(result.periodicSchedule));
    }

    console.log('📋 Recommendations:');
    report.recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));

    return { success: true, result, report };
  } catch (error) {
    console.error('❌ Custom Planning Logic Test Failed:', error);
    return { success: false, error: error.message };
  }
};

export const quickValidation = () => {
  console.log('⚡ Quick Custom Logic Validation...');

  const testResult = testCustomPlanningLogic();

  if (testResult.success) {
    console.log('✅ Quick validation passed - Custom logic is working');
    return true;
  } else {
    console.error('❌ Quick validation failed:', testResult.error);
    return false;
  }
};