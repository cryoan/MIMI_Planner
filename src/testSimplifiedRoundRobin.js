import {
  buildRotationAvailability,
  generateCompleteValidatedSchedule,
  generateSimplifiedScheduleReport
} from './simplifiedRoundRobinPlanner.js';

// Test the simplified round robin system
console.log('=== Testing Simplified Round Robin System ===');

// Test 1: Build rotation availability mapping
console.log('\n1. Testing rotation availability mapping:');
const rotationAvailability = buildRotationAvailability();
console.log('Rotation Availability:', rotationAvailability);

// Test 2: Generate complete validated schedule
console.log('\n2. Testing complete validated schedule generation:');
const completeSchedule = generateCompleteValidatedSchedule(3); // Test with 3 timeframes
console.log('Complete Schedule Keys:', Object.keys(completeSchedule));

// Show detailed results for first timeframe
const firstTimeframe = Object.keys(completeSchedule)[0];
if (firstTimeframe) {
  console.log(`\nFirst Timeframe (${firstTimeframe}) Details:`);
  console.log('- Rotation Assignments:', completeSchedule[firstTimeframe].rotationAssignments);
  console.log('- Doctor Workload:', completeSchedule[firstTimeframe].doctorWorkload);
  console.log('- Validation:', {
    coveragePercentage: completeSchedule[firstTimeframe].validation.coveragePercentage,
    missingActivities: completeSchedule[firstTimeframe].validation.missingActivities.length,
    duplicateActivities: completeSchedule[firstTimeframe].validation.duplicateActivities.length
  });
}

// Test 3: Generate comprehensive report
console.log('\n3. Testing report generation:');
const report = generateSimplifiedScheduleReport(completeSchedule);
console.log('Report Summary:', {
  systemType: report.systemType,
  totalTimeframes: report.totalTimeframes,
  averageCoverage: report.overallStats.averageCoveragePercentage.toFixed(1) + '%',
  recommendationsCount: report.recommendations.length
});

console.log('\nRecommendations:');
report.recommendations.forEach((rec, idx) => {
  console.log(`${idx + 1}. ${rec}`);
});

// Test 4: Detailed validation analysis
console.log('\n4. Detailed validation analysis for each timeframe:');
Object.entries(completeSchedule).forEach(([timeframeName, timeframeData]) => {
  const validation = timeframeData.validation;
  console.log(`\n${timeframeName}:`);
  console.log(`  - Coverage: ${validation.coveragePercentage.toFixed(1)}%`);
  console.log(`  - Missing: ${validation.missingActivities.length} activities`);
  console.log(`  - Duplicates: ${validation.duplicateActivities.length} activities`);

  if (validation.missingActivities.length > 0) {
    console.log('  - Missing Details:', validation.missingActivities.slice(0, 2)); // Show first 2
  }

  if (validation.duplicateActivities.length > 0) {
    console.log('  - Duplicate Details:', validation.duplicateActivities.slice(0, 2)); // Show first 2
  }
});

console.log('\n=== Test Complete ===');

export { completeSchedule, report, rotationAvailability };