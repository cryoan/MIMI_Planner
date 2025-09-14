// Test file for Strict Round Robin Planning functionality
import { 
  calculateRotationBoundaries,
  getRotationPeriodForWeek,
  getQualifiedDoctorsStrict,
  analyzeCoverageGaps,
  generateStrictRotationScenario,
  generateCompleteStrictSchedule,
  analyzeStrictSchedule,
  generateStrictScheduleReport,
  AVAILABLE_DOCTORS,
  ALL_ACTIVITIES
} from './strictRoundRobinPlanning.js';

// Test rotation boundary calculation
export function testRotationBoundaries() {
  console.log('🧪 Testing Rotation Boundary Calculation...');
  
  try {
    const boundaries = calculateRotationBoundaries();
    
    console.log('✅ Successfully calculated rotation boundaries');
    console.log(`Total rotation periods: ${boundaries.length}`);
    
    console.log('\n📅 Rotation Periods:');
    boundaries.forEach((period, index) => {
      console.log(`${index + 1}. ${period.name}`);
      console.log(`   Duration: ${period.durationWeeks} weeks (Week ${period.startWeek} - ${period.endWeek})`);
      console.log(`   Dates: ${period.startDate.toDateString()} - ${period.endDate.toDateString()}`);
    });
    
    // Test week lookup
    console.log('\n🔍 Testing Week Lookup:');
    const testWeeks = [1, 20, 40, 52];
    testWeeks.forEach(week => {
      const period = getRotationPeriodForWeek(week, 2025);
      console.log(`Week ${week}: ${period ? period.name : 'Not found'}`);
    });
    
    return boundaries;
  } catch (error) {
    console.error('❌ Error in rotation boundary test:', error);
    return null;
  }
}

// Test coverage gap analysis
export function testCoverageGaps() {
  console.log('\n🔍 Testing Coverage Gap Analysis...');
  
  try {
    const gapAnalysis = analyzeCoverageGaps();
    
    console.log('✅ Successfully analyzed coverage gaps');
    console.log(`Total activities: ${gapAnalysis.totalActivities}`);
    console.log(`Covered activities: ${gapAnalysis.coveredActivities}`);
    console.log(`Uncovered activities: ${gapAnalysis.uncoveredActivities.length}`);
    
    if (gapAnalysis.uncoveredActivities.length > 0) {
      console.log('\n🚨 Uncovered Activities:');
      gapAnalysis.uncoveredActivities.forEach(activity => {
        console.log(`  • ${activity} - No doctors have this in their rotationSetting`);
      });
    }
    
    console.log('\n👥 Activity Coverage by Doctor:');
    Object.entries(gapAnalysis.activityCoverage).forEach(([activity, coverage]) => {
      const status = coverage.isCovered ? '✅' : '❌';
      console.log(`  ${status} ${activity}: ${coverage.doctorCount} doctors (${coverage.qualifiedDoctors.join(', ')})`);
    });
    
    if (gapAnalysis.recommendedChanges.length > 0) {
      console.log('\n💡 Recommendations:');
      gapAnalysis.recommendedChanges.forEach(recommendation => {
        console.log(`  • ${recommendation}`);
      });
    }
    
    return gapAnalysis;
  } catch (error) {
    console.error('❌ Error in coverage gap test:', error);
    return null;
  }
}

// Test strict doctor qualification
export function testQualifiedDoctors() {
  console.log('\n👨‍⚕️ Testing Strict Doctor Qualification...');
  
  try {
    console.log('Activity qualification (strict mode):');
    ALL_ACTIVITIES.forEach(activity => {
      const qualifiedDoctors = getQualifiedDoctorsStrict(activity);
      console.log(`  ${activity}: ${qualifiedDoctors.length} doctors (${qualifiedDoctors.join(', ')})`);
    });
    
    console.log('\n📋 Doctor Rotation Settings:');
    // Import doctorProfiles dynamically
    import('./doctorSchedules.js').then(module => {
      AVAILABLE_DOCTORS.forEach(doctor => {
        const doctorProfile = module.doctorProfiles[doctor];
        const rotationSetting = doctorProfile?.rotationSetting || [];
        console.log(`  ${doctor}: [${rotationSetting.join(', ')}]`);
      });
    }).catch(error => {
      console.log('  Could not load doctor profiles:', error.message);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error in qualified doctors test:', error);
    return null;
  }
}

// Test strict rotation scenario generation
export function testStrictRotationScenario() {
  console.log('\n🎯 Testing Strict Rotation Scenario Generation...');
  
  try {
    const boundaries = calculateRotationBoundaries();
    if (!boundaries || boundaries.length === 0) {
      throw new Error('No rotation boundaries available');
    }
    
    // Test with first rotation period
    const testRotation = boundaries[0];
    const testDoctors = ['YC', 'FL', 'GC', 'CL']; // Subset for testing
    
    console.log(`Testing with rotation: ${testRotation.name}`);
    console.log(`Testing with doctors: ${testDoctors.join(', ')}`);
    
    const scenario = generateStrictRotationScenario(testDoctors, testRotation, 0);
    
    console.log('✅ Successfully generated strict rotation scenario');
    
    console.log('\n👨‍⚕️ Primary Activity Assignments:');
    Object.entries(scenario.rotationAssignments).forEach(([doctor, activity]) => {
      console.log(`  ${doctor} → ${activity}`);
    });
    
    // Show sample daily schedule
    console.log('\n📅 Sample Schedule (Monday):');
    Object.entries(scenario.weeklySchedule).forEach(([doctor, schedule]) => {
      const mondayMorning = schedule.Monday['9am-1pm'].join(', ') || 'none';
      const mondayAfternoon = schedule.Monday['2pm-6pm'].join(', ') || 'none';
      console.log(`  ${doctor}: 9am-1pm [${mondayMorning}] | 2pm-6pm [${mondayAfternoon}]`);
    });
    
    return scenario;
  } catch (error) {
    console.error('❌ Error in strict rotation scenario test:', error);
    return null;
  }
}

// Test complete strict schedule generation
export function testCompleteStrictSchedule() {
  console.log('\n🏥 Testing Complete Strict Schedule Generation...');
  
  try {
    console.log('This may take a few seconds...');
    
    // Generate for first 3 rotations to avoid too much output
    const completeSchedule = generateCompleteStrictSchedule(AVAILABLE_DOCTORS, 3);
    
    console.log('✅ Successfully generated complete strict schedule');
    console.log(`Generated schedules for ${Object.keys(completeSchedule).length} rotation periods`);
    
    // Show rotation overview
    console.log('\n📊 Rotation Overview:');
    Object.entries(completeSchedule).forEach(([rotationName, rotationData]) => {
      const assignmentCount = Object.keys(rotationData.rotationAssignments || {}).length;
      console.log(`  ${rotationName}: ${assignmentCount} doctors with primary assignments`);
      
      // Show primary assignments for this rotation
      const assignments = Object.entries(rotationData.rotationAssignments || {})
        .map(([doctor, activity]) => `${doctor}→${activity}`)
        .join(', ');
      console.log(`    Assignments: ${assignments}`);
    });
    
    return completeSchedule;
  } catch (error) {
    console.error('❌ Error in complete strict schedule test:', error);
    return null;
  }
}

// Test schedule analysis
export function testScheduleAnalysis(strictSchedule) {
  console.log('\n📊 Testing Schedule Analysis...');
  
  if (!strictSchedule) {
    console.log('No strict schedule provided for analysis');
    return null;
  }
  
  try {
    const analysis = analyzeStrictSchedule(strictSchedule);
    
    console.log('✅ Successfully analyzed strict schedule');
    console.log(`Total rotations analyzed: ${analysis.totalRotations}`);
    console.log(`Overall coverage: ${analysis.overallCoverage.coveragePercentage.toFixed(1)}%`);
    console.log(`Covered slots: ${analysis.overallCoverage.coveredSlots}/${analysis.overallCoverage.totalSlots}`);
    
    console.log('\n🎯 Activity Distribution:');
    Object.entries(analysis.activityDistribution).forEach(([activity, dist]) => {
      console.log(`  ${activity}: ${dist.totalAssignments} assignments, ${dist.assignedDoctors.length} doctors, ${dist.rotationsWithActivity} rotations`);
    });
    
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.recommendations.slice(0, 5).forEach(rec => {
        console.log(`  • ${rec}`);
      });
      if (analysis.recommendations.length > 5) {
        console.log(`  ... and ${analysis.recommendations.length - 5} more recommendations`);
      }
    }
    
    return analysis;
  } catch (error) {
    console.error('❌ Error in schedule analysis test:', error);
    return null;
  }
}

// Test complete report generation
export function testReportGeneration(strictSchedule) {
  console.log('\n📋 Testing Report Generation...');
  
  if (!strictSchedule) {
    console.log('No strict schedule provided for report');
    return null;
  }
  
  try {
    const report = generateStrictScheduleReport(strictSchedule);
    
    console.log('✅ Successfully generated strict schedule report');
    console.log('\n📈 Report Summary:');
    console.log(`  System Type: ${report.systemType}`);
    console.log(`  Total Rotations: ${report.summary.totalRotations}`);
    console.log(`  Average Rotation Duration: ${report.summary.averageRotationDuration.toFixed(1)} weeks`);
    console.log(`  Overall Coverage: ${report.summary.overallCoveragePercentage.toFixed(1)}%`);
    console.log(`  Activities with Gaps: ${report.summary.activitiesWithGaps.length}`);
    console.log(`  Total Recommendations: ${report.summary.recommendationsCount}`);
    
    if (report.summary.activitiesWithGaps.length > 0) {
      console.log(`\n🚨 Activities with Coverage Gaps: ${report.summary.activitiesWithGaps.join(', ')}`);
    }
    
    return report;
  } catch (error) {
    console.error('❌ Error in report generation test:', error);
    return null;
  }
}

// Run all tests
export function runAllStrictTests() {
  console.log('🚀 Starting Strict Round Robin Planning Tests\n');
  console.log('='.repeat(60));
  
  const boundaries = testRotationBoundaries();
  const gapAnalysis = testCoverageGaps();
  const qualifiedDoctors = testQualifiedDoctors();
  const rotationScenario = testStrictRotationScenario();
  const completeSchedule = testCompleteStrictSchedule();
  const scheduleAnalysis = testScheduleAnalysis(completeSchedule);
  const report = testReportGeneration(completeSchedule);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 All Strict Round Robin tests completed!');
  
  console.log('\n📋 Key Findings:');
  if (gapAnalysis) {
    console.log(`  • ${gapAnalysis.uncoveredActivities.length} activities have no qualified doctors`);
    console.log(`  • ${gapAnalysis.coveredActivities}/${gapAnalysis.totalActivities} activities are covered`);
  }
  
  if (scheduleAnalysis) {
    console.log(`  • Overall coverage: ${scheduleAnalysis.overallCoverage.coveragePercentage.toFixed(1)}%`);
    console.log(`  • ${scheduleAnalysis.recommendations.length} recommendations generated`);
  }
  
  console.log('\n🎯 Strict Mode Benefits:');
  console.log('  • Doctors only assigned activities from their rotationSetting');
  console.log('  • Consistent "hat" maintained for entire rotation periods');
  console.log('  • Rotation boundaries aligned with vacation periods');
  console.log('  • Clear baseline for identifying coverage gaps');
  
  return {
    boundaries,
    gapAnalysis,
    qualifiedDoctors,
    rotationScenario,
    completeSchedule,
    scheduleAnalysis,
    report
  };
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testStrictRoundRobin = runAllStrictTests;
  window.strictRoundRobinTests = {
    testRotationBoundaries,
    testCoverageGaps,
    testQualifiedDoctors,
    testStrictRotationScenario,
    testCompleteStrictSchedule,
    testScheduleAnalysis,
    testReportGeneration,
    runAllStrictTests
  };
  
  console.log('Strict Round Robin tests loaded. Use window.testStrictRoundRobin() to run all tests.');
}