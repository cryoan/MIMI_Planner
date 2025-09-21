// Test the improved simplified round robin system
import {
  generateCompleteValidatedSchedule,
  generateSimplifiedScheduleReport,
  buildRotationAvailability
} from './simplifiedRoundRobinPlanner.js';

console.log('🔧 TESTING IMPROVED SIMPLIFIED ROUND ROBIN SYSTEM');
console.log('================================================');

// Test 1: Check rotation availability mapping
console.log('\n1. Rotation Availability Mapping:');
const rotationAvailability = buildRotationAvailability();
Object.entries(rotationAvailability).forEach(([rotation, doctors]) => {
  console.log(`  ${rotation}: [${doctors.join(', ')}] (${doctors.length} doctors)`);
});

// Test 2: Generate schedule with improved algorithm
console.log('\n2. Generating Schedule with Improved Algorithm:');
const improvedSchedule = generateCompleteValidatedSchedule(3); // Test first 3 timeframes
console.log(`Generated ${Object.keys(improvedSchedule).length} timeframes`);

// Test 3: Show assignment results for first timeframe
const firstTimeframe = Object.keys(improvedSchedule)[0];
if (firstTimeframe) {
  const timeframeData = improvedSchedule[firstTimeframe];

  console.log(`\n3. First Timeframe Results (${firstTimeframe}):`);
  console.log('   Rotation Assignments:');
  Object.entries(timeframeData.rotationAssignments || {}).forEach(([rotation, doctor]) => {
    console.log(`     ${rotation} → ${doctor}`);
  });

  console.log('\n   Doctor Workloads:');
  Object.entries(timeframeData.doctorWorkload || {}).forEach(([doctor, rotations]) => {
    if (rotations.length > 0) {
      console.log(`     ${doctor}: [${rotations.join(', ')}] (${rotations.length} rotations)`);
    } else {
      console.log(`     ${doctor}: [] (0 rotations)`);
    }
  });

  // Show assignment statistics
  if (timeframeData.assignmentStats) {
    const stats = timeframeData.assignmentStats;
    console.log('\n   Assignment Statistics:');
    console.log(`     Assigned doctors: ${stats.assignedDoctorCount}/${stats.totalDoctors}`);
    if (stats.multipleAssignmentDoctors.length > 0) {
      console.log(`     ⚠️ Doctors with multiple rotations:`, stats.multipleAssignmentDoctors);
    } else {
      console.log(`     ✅ No doctors with multiple rotations`);
    }
  }

  // Show unassigned rotations
  if (timeframeData.unassignedRotations && timeframeData.unassignedRotations.length > 0) {
    console.log('\n   ⚠️ Unassigned Rotations:');
    timeframeData.unassignedRotations.forEach(({ rotation, reason }) => {
      console.log(`     ${rotation}: ${reason}`);
    });
  }

  // Show validation results
  if (timeframeData.validation) {
    const validation = timeframeData.validation;
    console.log('\n   Validation Results:');
    console.log(`     Coverage: ${validation.coveragePercentage.toFixed(1)}%`);
    console.log(`     Missing activities: ${validation.missingActivities.length}`);
    console.log(`     Duplicate activities: ${validation.duplicateActivities.length}`);
  }
}

// Test 4: Generate overall report
console.log('\n4. Overall System Report:');
const report = generateSimplifiedScheduleReport(improvedSchedule);
console.log('   Overall Statistics:');
console.log(`     Average coverage: ${report.overallStats.averageCoveragePercentage.toFixed(1)}%`);
console.log(`     Total missing activities: ${report.overallStats.totalMissingActivities}`);
console.log(`     Total duplicate activities: ${report.overallStats.totalDuplicateActivities}`);
console.log(`     Assigned doctors (avg): ${report.overallStats.totalAssignedDoctors}`);
console.log(`     Unassigned rotations: ${report.overallStats.totalUnassignedRotations}`);
console.log(`     Doctors with multiple rotations: ${report.overallStats.doctorsWithMultipleRotations}`);

if (report.recommendations.length > 0) {
  console.log('\n   📋 Recommendations:');
  report.recommendations.forEach((rec, idx) => {
    console.log(`     ${idx + 1}. ${rec}`);
  });
}

// Test 5: Compare with expectations
console.log('\n5. Testing Against Expectations:');
console.log('   Expected: One rotation per doctor per timeframe');
console.log('   Expected: RNV should get an assignment (has EMIT, EMATIT capabilities)');
console.log('   Expected: No doctor should get multiple rotations');

const firstTimeframeWorkloads = improvedSchedule[firstTimeframe]?.doctorWorkload || {};
const multipleRotationDoctors = Object.entries(firstTimeframeWorkloads)
  .filter(([_, rotations]) => rotations.length > 1);
const rnvAssignments = firstTimeframeWorkloads.RNV || [];

console.log('\n   Results:');
if (multipleRotationDoctors.length === 0) {
  console.log('   ✅ No doctors have multiple rotations');
} else {
  console.log('   ❌ Doctors with multiple rotations:', multipleRotationDoctors);
}

if (rnvAssignments.length > 0) {
  console.log(`   ✅ RNV has assignment: [${rnvAssignments.join(', ')}]`);
} else {
  console.log('   ❌ RNV has no assignments');
  // Check what rotations RNV could have gotten
  const rnvCapableRotations = Object.entries(rotationAvailability)
    .filter(([_, doctors]) => doctors.includes('RNV'))
    .map(([rotation, _]) => rotation);
  console.log(`   📝 RNV is capable of: [${rnvCapableRotations.join(', ')}]`);
}

console.log('\n🎯 TEST COMPLETE');