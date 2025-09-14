// Quick test runner for strict round robin algorithm
import { 
  calculateRotationBoundaries,
  analyzeCoverageGaps,
  getQualifiedDoctorsStrict,
  generateCompleteStrictSchedule,
  analyzeStrictSchedule,
  AVAILABLE_DOCTORS,
  ALL_ACTIVITIES
} from './strictRoundRobinPlanning.js';

console.log('🏥 STRICT ROUND ROBIN PLANNING SYSTEM TEST');
console.log('==========================================');

// Test 1: Show rotation boundaries
console.log('\n📅 VACATION-BASED ROTATION BOUNDARIES:');
try {
  const boundaries = calculateRotationBoundaries();
  boundaries.forEach((period, index) => {
    console.log(`${index + 1}. ${period.name}: ${period.durationWeeks} weeks (${period.startDate.toDateString()} - ${period.endDate.toDateString()})`);
  });
} catch (error) {
  console.error('Error calculating rotation boundaries:', error);
}

// Test 2: Analyze coverage gaps
console.log('\n🔍 COVERAGE GAP ANALYSIS (Strict Mode):');
try {
  const gapAnalysis = analyzeCoverageGaps();
  console.log(`Total activities: ${ALL_ACTIVITIES.length}`);
  console.log(`Covered activities: ${gapAnalysis.coveredActivities}`);
  console.log(`Uncovered activities: ${gapAnalysis.uncoveredActivities.length}`);
  
  if (gapAnalysis.uncoveredActivities.length > 0) {
    console.log(`🚨 Activities with NO qualified doctors:`);
    gapAnalysis.uncoveredActivities.forEach(activity => {
      console.log(`   • ${activity}`);
    });
  }
  
  console.log('\n👥 Activity Coverage Details:');
  ALL_ACTIVITIES.forEach(activity => {
    const qualifiedDoctors = getQualifiedDoctorsStrict(activity);
    const status = qualifiedDoctors.length > 0 ? '✅' : '❌';
    console.log(`   ${status} ${activity}: ${qualifiedDoctors.length} doctors [${qualifiedDoctors.join(', ')}]`);
  });
} catch (error) {
  console.error('Error in coverage gap analysis:', error);
}

// Test 3: Show doctor rotation settings
console.log('\n👨‍⚕️ DOCTOR ROTATION SETTINGS:');
AVAILABLE_DOCTORS.forEach(doctorCode => {
  const doctorProfile = doctorProfiles[doctorCode];
  const rotationSetting = doctorProfile?.rotationSetting || [];
  console.log(`   ${doctorCode}: [${rotationSetting.join(', ')}]`);
});

// Test 4: Generate strict schedule for first 2 rotations
console.log('\n🎯 GENERATING STRICT SCHEDULE (First 2 Rotations):');
try {
  const strictSchedule = generateCompleteStrictSchedule(AVAILABLE_DOCTORS, 2);
  
  console.log(`Generated schedules for ${Object.keys(strictSchedule).length} rotation periods`);
  
  Object.entries(strictSchedule).forEach(([rotationName, rotationData]) => {
    console.log(`\n📋 ${rotationName}:`);
    console.log('   Primary Activity Assignments:');
    Object.entries(rotationData.rotationAssignments || {}).forEach(([doctor, activity]) => {
      console.log(`     ${doctor} → ${activity}`);
    });
  });
  
  // Analyze the schedule
  console.log('\n📊 STRICT SCHEDULE ANALYSIS:');
  const analysis = analyzeStrictSchedule(strictSchedule);
  console.log(`   Overall Coverage: ${analysis.overallCoverage.coveragePercentage.toFixed(1)}%`);
  console.log(`   Covered Slots: ${analysis.overallCoverage.coveredSlots}/${analysis.overallCoverage.totalSlots}`);
  
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Top Recommendations:');
    analysis.recommendations.slice(0, 3).forEach(rec => {
      console.log(`   • ${rec}`);
    });
  }
  
} catch (error) {
  console.error('Error generating strict schedule:', error);
}

console.log('\n✅ STRICT ROUND ROBIN TEST COMPLETED');
console.log('=====================================');

// Export for use in other modules
export { AVAILABLE_DOCTORS, ALL_ACTIVITIES };