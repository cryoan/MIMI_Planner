// Quick test to verify the new activity-based round robin algorithm
import { 
  generateRoundRobinScenario, 
  analyzeScenarioAlarms, 
  summarizeActivityAssignments,
  AVAILABLE_DOCTORS
} from './roundRobinPlanning.js';

export function quickTestNewAlgorithm() {
  console.log('🔄 Quick Test: New Activity-Based Round Robin Algorithm');
  console.log('='.repeat(50));
  
  try {
    // Test with a small subset
    const testDoctors = AVAILABLE_DOCTORS.slice(0, 6); // First 6 doctors
    const testPeriods = ['M1_S1', 'M1_S2']; // Just 2 periods for quick test
    
    console.log(`Testing with doctors: ${testDoctors.join(', ')}`);
    console.log(`Testing with periods: ${testPeriods.join(', ')}`);
    
    // Generate scenario
    const scenario = generateRoundRobinScenario(testDoctors, testPeriods, 0);
    console.log('\n✅ Generated scenario successfully');
    
    // Analyze alarms
    const alarmAnalysis = analyzeScenarioAlarms(scenario);
    console.log('\n📊 Alarm Analysis:');
    console.log(`  Total alarms: ${alarmAnalysis.totalAlarms}`);
    console.log(`  Missing activities: ${alarmAnalysis.missingActivities}`);
    console.log(`  Duplicate activities: ${alarmAnalysis.duplicateActivities} (should be 0!)`);
    console.log(`  Backbone conflicts: ${alarmAnalysis.backboneConflicts || 0}`);
    
    // Show activity assignments
    const activitySummary = summarizeActivityAssignments(scenario);
    console.log('\n🎯 Activity Assignments for M1_S1 Monday:');
    
    if (activitySummary.M1_S1?.Monday) {
      ['9am-1pm', '2pm-6pm'].forEach(timeSlot => {
        const assignments = activitySummary.M1_S1.Monday[timeSlot];
        console.log(`  ${timeSlot}:`);
        if (Object.keys(assignments).length > 0) {
          Object.entries(assignments).forEach(([activity, doctor]) => {
            console.log(`    ${activity} → ${doctor}`);
          });
        } else {
          console.log(`    No assignments`);
        }
      });
    }
    
    // Verify one-doctor-per-activity constraint
    let duplicateFound = false;
    Object.entries(activitySummary).forEach(([period, periodData]) => {
      Object.entries(periodData).forEach(([day, dayData]) => {
        Object.entries(dayData).forEach(([timeSlot, assignments]) => {
          const activities = Object.keys(assignments);
          const doctors = Object.values(assignments);
          const uniqueDoctors = [...new Set(doctors)];
          
          if (activities.length !== uniqueDoctors.length) {
            console.warn(`⚠️  Found duplicate doctor assignment in ${period} ${day} ${timeSlot}`);
            duplicateFound = true;
          }
        });
      });
    });
    
    if (!duplicateFound && alarmAnalysis.duplicateActivities === 0) {
      console.log('\n🎉 SUCCESS: One-doctor-per-activity constraint verified! ✅');
    } else {
      console.log('\n❌ ISSUE: Constraint violation detected');
    }
    
    return { scenario, alarmAnalysis, activitySummary };
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return null;
  }
}

// Add to window for browser testing
if (typeof window !== 'undefined') {
  window.quickTestNewAlgorithm = quickTestNewAlgorithm;
}