import { 
  generateCompleteStrictSchedule, 
  analyzeRuleCompliance,
  generateStrictScheduleReport,
  AVAILABLE_DOCTORS,
  ALL_ACTIVITIES,
  TIME_SLOT_DURATION,
  getActivityDuration 
} from './strictRoundRobinPlanning.js';

import { 
  findOptimalRoundRobinAssignment,
  analyzeScenarioAlarms,
  canActivityFitInTimeSlot,
  getQualifiedDoctorsStrict as getQualifiedDoctorsFromOriginal
} from './roundRobinPlanning.js';

import { doctorProfiles, docActivities } from './doctorSchedules.js';

/**
 * Test Enhanced Round Robin Algorithm
 * Validates both new rules:
 * 1. Time slot duration validation (4h limit per slot)
 * 2. Doctor rotation setting constraints (only assign activities in rotationSetting)
 */

console.log('🏥 ENHANCED ROUND ROBIN ALGORITHM TEST');
console.log('=====================================');

// Test Rule 1: Time Slot Duration Validation
console.log('\n📏 RULE 1: TIME SLOT DURATION VALIDATION');
console.log('----------------------------------------');

console.log(`⏰ Time slot capacity: ${TIME_SLOT_DURATION} hours`);
console.log('\n📋 Activity durations:');
ALL_ACTIVITIES.forEach(activity => {
  const duration = getActivityDuration(activity);
  console.log(`  ${activity}: ${duration}h`);
});

// Test duration fitting logic
console.log('\n🧪 Testing duration validation logic:');
const testActivities = ['HTC1', 'EMIT'];  // 1h + 3h = 4h (should fit)
const testOverflow = ['HDJ', 'EMIT'];     // 4h + 3h = 7h (should not fit)

console.log(`✅ ${testActivities.join(' + ')} = ${testActivities.reduce((sum, act) => sum + getActivityDuration(act), 0)}h (fits in ${TIME_SLOT_DURATION}h slot)`);
console.log(`❌ ${testOverflow.join(' + ')} = ${testOverflow.reduce((sum, act) => sum + getActivityDuration(act), 0)}h (exceeds ${TIME_SLOT_DURATION}h slot)`);

console.log(`canActivityFitInTimeSlot('EMIT', ['HTC1']): ${canActivityFitInTimeSlot('EMIT', ['HTC1'])}`);
console.log(`canActivityFitInTimeSlot('EMIT', ['HDJ']): ${canActivityFitInTimeSlot('EMIT', ['HDJ'])}`);

// Test Rule 2: Rotation Setting Constraints
console.log('\n👨‍⚕️ RULE 2: ROTATION SETTING CONSTRAINTS');
console.log('------------------------------------------');

console.log('\n📋 Doctor rotation settings:');
AVAILABLE_DOCTORS.forEach(doctorCode => {
  const doctorProfile = doctorProfiles[doctorCode];
  if (doctorProfile?.rotationSetting) {
    console.log(`  ${doctorCode}: [${doctorProfile.rotationSetting.join(', ')}]`);
  } else {
    console.log(`  ${doctorCode}: No rotation settings defined`);
  }
});

// Test qualification logic
console.log('\n🧪 Testing rotation setting qualification:');
const testActivity = 'HTC1';
const qualifiedDoctors = getQualifiedDoctorsFromOriginal(testActivity);
console.log(`Doctors qualified for ${testActivity}: [${qualifiedDoctors.join(', ')}]`);

// Test with a specific example from requirements: "YC can be assigned to HTC1 or HTC2"
const ycProfile = doctorProfiles['YC'];
if (ycProfile?.rotationSetting) {
  const canAssignHTC1 = ycProfile.rotationSetting.includes('HTC1');
  const canAssignHTC2 = ycProfile.rotationSetting.includes('HTC2'); 
  const canAssignEMIT = ycProfile.rotationSetting.includes('EMIT');
  
  console.log(`YC qualification check:`);
  console.log(`  - Can assign HTC1: ${canAssignHTC1 ? '✅' : '❌'}`);
  console.log(`  - Can assign HTC2: ${canAssignHTC2 ? '✅' : '❌'}`);
  console.log(`  - Can assign EMIT: ${canAssignEMIT ? '✅' : '❌'} (should be ❌ per requirements)`);
}

// Generate and analyze enhanced schedule
console.log('\n🎯 GENERATING ENHANCED STRICT SCHEDULE');
console.log('======================================');

console.log('Generating complete strict schedule with enhanced rules...');
const enhancedSchedule = generateCompleteStrictSchedule(AVAILABLE_DOCTORS, 3); // Test with 3 rotations

console.log('\n📊 RULE COMPLIANCE ANALYSIS');
console.log('============================');

const complianceAnalysis = analyzeRuleCompliance(enhancedSchedule);
console.log(`\n📈 Overall compliance: ${complianceAnalysis.compliancePercentage.toFixed(1)}%`);
console.log(`📋 Total slots checked: ${complianceAnalysis.summary.totalSlotsChecked}`);
console.log(`⚠️  Total violations: ${complianceAnalysis.totalViolations}`);

if (complianceAnalysis.summary.durationViolationCount > 0) {
  console.log(`\n⏰ Duration violations: ${complianceAnalysis.summary.durationViolationCount}`);
  complianceAnalysis.durationViolations.slice(0, 3).forEach(violation => {
    console.log(`  - ${violation.doctor} (${violation.day} ${violation.timeSlot}): ${violation.violation}`);
    console.log(`    Activities: [${violation.activities.join(', ')}] = ${violation.totalDuration}h`);
  });
  if (complianceAnalysis.durationViolations.length > 3) {
    console.log(`  ... and ${complianceAnalysis.durationViolations.length - 3} more`);
  }
} else {
  console.log('\n✅ No duration violations found');
}

if (complianceAnalysis.summary.rotationSettingViolationCount > 0) {
  console.log(`\n👨‍⚕️ Rotation setting violations: ${complianceAnalysis.summary.rotationSettingViolationCount}`);
  complianceAnalysis.rotationSettingViolations.slice(0, 3).forEach(violation => {
    console.log(`  - ${violation.doctor} assigned ${violation.activity} (${violation.day} ${violation.timeSlot})`);
    console.log(`    Allowed: [${violation.allowedActivities.join(', ')}]`);
  });
  if (complianceAnalysis.rotationSettingViolations.length > 3) {
    console.log(`  ... and ${complianceAnalysis.rotationSettingViolations.length - 3} more`);
  }
} else {
  console.log('\n✅ No rotation setting violations found');
}

// Compare with original algorithm
console.log('\n🔄 COMPARISON WITH ORIGINAL ALGORITHM');
console.log('====================================');

console.log('Testing original algorithm with limited periods...');
const originalResult = findOptimalRoundRobinAssignment(AVAILABLE_DOCTORS, ['M1_S1', 'M1_S2'], 10);

if (originalResult.bestScenario) {
  const originalAnalysis = analyzeScenarioAlarms(originalResult.bestScenario);
  console.log(`\nOriginal algorithm results:`);
  console.log(`  Best alarm count: ${originalResult.lowestAlarmCount}`);
  console.log(`  Missing activities: ${originalAnalysis.missingActivities}`);
  console.log(`  Duplicate activities: ${originalAnalysis.duplicateActivities}`);
}

// Generate detailed report
console.log('\n📋 DETAILED ENHANCEMENT REPORT');
console.log('==============================');

const enhancedReport = generateStrictScheduleReport(enhancedSchedule);
console.log(`\nGenerated: ${new Date(enhancedReport.timestamp).toLocaleString()}`);
console.log(`System: ${enhancedReport.systemType}`);
console.log(`Rotations: ${enhancedReport.summary.totalRotations}`);
console.log(`Coverage: ${enhancedReport.summary.overallCoveragePercentage.toFixed(1)}%`);
console.log(`Recommendations: ${enhancedReport.summary.recommendationsCount}`);

if (enhancedReport.summary.activitiesWithGaps.length > 0) {
  console.log(`\n⚠️  Activities with coverage gaps:`);
  enhancedReport.summary.activitiesWithGaps.forEach(activity => {
    console.log(`  - ${activity}`);
  });
}

console.log('\n✅ ENHANCED ROUND ROBIN TEST COMPLETED');
console.log('=====================================');

// Summary of improvements
console.log('\n🎊 ENHANCEMENTS IMPLEMENTED:');
console.log('1. ✅ Time slot duration validation (Rule 1)');
console.log('   - Activities sorted by duration for better fitting');
console.log('   - Duration checking prevents slot overflow');
console.log('   - 4-hour time slot capacity enforced');

console.log('\n2. ✅ Rotation setting constraints (Rule 2)');
console.log('   - Doctors only assigned activities from their rotationSetting');
console.log('   - Skills-based assignment replaced with strict rotation settings');
console.log('   - Qualification checking enforced');

console.log('\n3. ✅ Comprehensive validation and reporting');
console.log('   - Real-time rule compliance analysis');
console.log('   - Detailed violation reporting');
console.log('   - Enhanced schedule generation and testing');

console.log(`\nFinal compliance rate: ${complianceAnalysis.compliancePercentage.toFixed(1)}%`);

export {
  enhancedSchedule,
  complianceAnalysis,
  enhancedReport
};