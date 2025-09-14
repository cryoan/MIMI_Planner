// Test file for Round Robin Planning functionality - Activity-Based Assignment
import { 
  findOptimalRoundRobinAssignment, 
  generateRoundRobinScenario, 
  analyzeScenarioAlarms,
  summarizeActivityAssignments,
  AVAILABLE_DOCTORS,
  DEFAULT_PERIODS,
  ALL_ACTIVITIES
} from './roundRobinPlanning.js';

// Test basic round robin generation
export function testBasicRoundRobin() {
  console.log('🧪 Testing Basic Round Robin Generation...');
  
  try {
    const testDoctors = ['YC', 'FL', 'GC']; // Smaller subset for testing
    const testPeriods = DEFAULT_PERIODS.slice(0, 8); // Just 2 months for testing
    
    console.log(`Testing with doctors: ${testDoctors.join(', ')}`);
    console.log(`Testing with periods: ${testPeriods.join(', ')}`);
    
    const scenario = generateRoundRobinScenario(testDoctors, testPeriods, 0);
    
    console.log('✅ Successfully generated round robin scenario');
    console.log('Sample period (M1_S1):');
    console.log(JSON.stringify(scenario.M1_S1, null, 2));
    
    return scenario;
  } catch (error) {
    console.error('❌ Error in basic round robin test:', error);
    return null;
  }
}

// Test alarm analysis
export function testAlarmAnalysis(scenario) {
  console.log('\n🔍 Testing Alarm Analysis...');
  
  if (!scenario) {
    console.log('No scenario provided for alarm analysis');
    return null;
  }
  
  try {
    const alarmAnalysis = analyzeScenarioAlarms(scenario);
    
    console.log('✅ Successfully analyzed scenario alarms');
    console.log(`Total alarms: ${alarmAnalysis.totalAlarms}`);
    console.log(`Missing activities: ${alarmAnalysis.missingActivities}`);
    console.log(`Duplicate activities: ${alarmAnalysis.duplicateActivities}`);
    console.log(`Backbone conflicts: ${alarmAnalysis.backboneConflicts || 0}`);
    
    if (Object.keys(alarmAnalysis.details.missing).length > 0) {
      console.log('\n🚨 Missing Activities Details:');
      Object.entries(alarmAnalysis.details.missing).slice(0, 3).forEach(([key, activities]) => {
        console.log(`  ${key}: ${activities.join(', ')}`);
      });
    }
    
    if (Object.keys(alarmAnalysis.details.duplicates).length > 0) {
      console.log('\n⚠️  Duplicate Activities Details:');
      Object.entries(alarmAnalysis.details.duplicates).slice(0, 3).forEach(([key, duplicates]) => {
        duplicates.forEach(dup => {
          console.log(`  ${key}: ${dup.activity} assigned to ${dup.doctors.join(', ')}`);
        });
      });
    }
    
    if (Object.keys(alarmAnalysis.details.backboneConflicts || {}).length > 0) {
      console.log('\n💥 Backbone Conflicts Details:');
      Object.entries(alarmAnalysis.details.backboneConflicts).slice(0, 3).forEach(([key, conflict]) => {
        console.log(`  ${conflict.doctor}: backbone [${conflict.backbone.join(', ')}] vs assigned [${conflict.assigned.join(', ')}]`);
      });
    }
    
    return alarmAnalysis;
  } catch (error) {
    console.error('❌ Error in alarm analysis test:', error);
    return null;
  }
}

// Test optimization
export function testOptimization() {
  console.log('\n🎯 Testing Round Robin Optimization...');
  
  try {
    const testDoctors = ['YC', 'FL', 'GC', 'CL']; // 4 doctors for realistic test
    const testPeriods = DEFAULT_PERIODS.slice(0, 12); // 3 months
    
    console.log(`Optimizing for ${testDoctors.length} doctors over ${testPeriods.length} periods`);
    console.log('This may take a few seconds...');
    
    const results = findOptimalRoundRobinAssignment(testDoctors, testPeriods, 10);
    
    console.log('✅ Successfully completed optimization');
    console.log(`Best alarm count: ${results.lowestAlarmCount}`);
    console.log(`Best offset: ${results.bestOffset}`);
    console.log(`Scenarios tested: ${results.allResults.length}`);
    
    // Show top 3 scenarios
    console.log('\n📊 Top 3 scenarios:');
    results.allResults.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. Offset ${result.offset}: ${result.alarmCount} alarms 
        (${result.alarmAnalysis.missingActivities} missing, ${result.alarmAnalysis.duplicateActivities} duplicates, ${result.alarmAnalysis.backboneConflicts || 0} backbone conflicts)`);
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error in optimization test:', error);
    return null;
  }
}

// Test activity assignment summary
export function testActivityAssignmentSummary(scenario) {
  console.log('\n📋 Testing Activity Assignment Summary...');
  
  if (!scenario) {
    console.log('No scenario provided for summary');
    return null;
  }
  
  try {
    const summary = summarizeActivityAssignments(scenario);
    
    console.log('✅ Successfully generated activity assignment summary');
    
    // Show activity assignments for first few periods
    Object.entries(summary).slice(0, 2).forEach(([period, periodSummary]) => {
      console.log(`\n${period}:`);
      ['Monday', 'Tuesday'].forEach(day => {
        const dayAssignments = periodSummary[day];
        console.log(`  ${day}:`);
        ['9am-1pm', '2pm-6pm'].forEach(timeSlot => {
          const slotAssignments = dayAssignments[timeSlot];
          if (Object.keys(slotAssignments).length > 0) {
            const assignmentStrings = Object.entries(slotAssignments).map(([activity, doctor]) => `${activity}→${doctor}`);
            console.log(`    ${timeSlot}: ${assignmentStrings.join(', ')}`);
          } else {
            console.log(`    ${timeSlot}: no assignments`);
          }
        });
      });
    });
    
    // Check activity coverage
    const firstPeriod = Object.values(summary)[0];
    if (firstPeriod) {
      const mondayMorning = firstPeriod.Monday?.['9am-1pm'] || {};
      const assignedActivities = Object.keys(mondayMorning);
      const missedActivities = ALL_ACTIVITIES.filter(activity => !assignedActivities.includes(activity));
      
      console.log(`\nActivity Coverage Analysis (Monday 9am-1pm):`);
      console.log(`  Assigned: ${assignedActivities.join(', ')}`);
      if (missedActivities.length > 0) {
        console.log(`  Missing: ${missedActivities.join(', ')}`);
      } else {
        console.log(`  Missing: none ✅`);
      }
    }
    
    return summary;
  } catch (error) {
    console.error('❌ Error in activity assignment summary test:', error);
    return null;
  }
}

// Run all tests
export function runAllTests() {
  console.log('🚀 Starting Activity-Based Round Robin Planning Tests\n');
  console.log('='.repeat(60));
  
  const scenario = testBasicRoundRobin();
  const alarmAnalysis = testAlarmAnalysis(scenario);
  const summary = testActivityAssignmentSummary(scenario);
  const optimization = testOptimization();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 All tests completed!');
  console.log('\n📈 Expected Improvements with Activity-Based Assignment:');
  console.log('  • Duplicate activities should be near zero (one doctor per activity)');
  console.log('  • Main alarm sources: missing activities and backbone conflicts');
  console.log('  • Round robin ensures fair distribution of activity assignments');
  
  return {
    scenario,
    alarmAnalysis,
    summary,
    optimization
  };
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testRoundRobin = runAllTests;
  window.roundRobinTests = {
    testBasicRoundRobin,
    testAlarmAnalysis,
    testActivityAssignmentSummary,
    testOptimization,
    runAllTests
  };
}