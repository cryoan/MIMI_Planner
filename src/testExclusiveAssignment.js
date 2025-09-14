// Test for exclusive activity assignment - no sharing between doctors per rotation period
import { 
  generateCompleteStrictSchedule, 
  validateActivityExclusivity,
  analyzeRuleCompliance,
  AVAILABLE_DOCTORS,
  ALL_ACTIVITIES,
  TIME_SLOT_DURATION,
  getActivityDuration 
} from './strictRoundRobinPlanning.js';

import { doctorProfiles } from './doctorSchedules.js';

// Mock expectedActivities for testing (since we can't import JSX)
// This simulates a typical weekly schedule requiring all activities
const mockExpectedActivities = {
  Monday: {
    "9am-1pm": ['HTC1', 'EMIT'],
    "2pm-6pm": ['HTC2', 'HDJ']
  },
  Tuesday: {
    "9am-1pm": ['HTC1_visite'],
    "2pm-6pm": ['EMATIT', 'AMI']
  },
  Wednesday: {
    "9am-1pm": ['HTC2_visite'],
    "2pm-6pm": ['EMIT']
  },
  Thursday: {
    "9am-1pm": ['HDJ'],
    "2pm-6pm": ['HTC1', 'EMATIT']
  },
  Friday: {
    "9am-1pm": ['AMI'],
    "2pm-6pm": ['HTC2', 'EMIT']
  }
};

// Inject mock for testing
global.expectedActivities = mockExpectedActivities;

/**
 * Test Exclusive Activity Assignment
 * Validates the core constraint: each activity can only be assigned to ONE doctor per rotation period
 */

console.log('🏥 EXCLUSIVE ACTIVITY ASSIGNMENT TEST');
console.log('====================================');

console.log('\n📋 TEST REQUIREMENTS:');
console.log('1. Each activity assigned to exactly ONE doctor per rotation period');
console.log('2. No sharing of activities between doctors within same period');
console.log('3. Same doctor handles ALL instances of their assigned activities');
console.log('4. HTC grouping: HTC1 owner gets all HTC1-related activities exclusively');

// Generate schedule with exclusive assignments
console.log('\n🎯 GENERATING EXCLUSIVE ASSIGNMENT SCHEDULE');
console.log('==========================================');

console.log('Testing with 3 rotation periods...');
const exclusiveSchedule = generateCompleteStrictSchedule(AVAILABLE_DOCTORS, 3);

console.log('\n📊 ACTIVITY EXCLUSIVITY VALIDATION');
console.log('==================================');

const exclusivityValidation = validateActivityExclusivity(exclusiveSchedule);

console.log(`\n📈 Exclusivity Results:`);
console.log(`   Total activities checked: ${exclusivityValidation.summary.activitiesChecked}`);
console.log(`   Exclusive activities: ${exclusivityValidation.summary.exclusiveActivities}`);
console.log(`   Shared activities: ${exclusivityValidation.summary.sharedActivities}`);
console.log(`   Exclusivity compliance: ${exclusivityValidation.compliancePercentage.toFixed(1)}%`);
console.log(`   Violations found: ${exclusivityValidation.totalViolations}`);

if (exclusivityValidation.totalViolations > 0) {
  console.log('\n⚠️  EXCLUSIVITY VIOLATIONS FOUND:');
  exclusivityValidation.exclusivityViolations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.violation}`);
    console.log(`   Doctors: [${violation.violatingDoctors.join(', ')}]`);
  });
} else {
  console.log('\n✅ NO EXCLUSIVITY VIOLATIONS - All activities are exclusively assigned!');
}

// Analyze activity ownership patterns
console.log('\n🔍 ACTIVITY OWNERSHIP ANALYSIS');
console.log('==============================');

console.log('\nActivity ownership patterns:');
Object.entries(exclusivityValidation.activityOwnership).forEach(([activity, ownerSet]) => {
  const owners = Array.from(ownerSet);
  console.log(`${activity}: ${owners.length} assignment(s)`);
  
  // Group by rotation period
  const ownersByPeriod = {};
  owners.forEach(owner => {
    const [rotationName, doctorCode] = owner.split(':');
    if (!ownersByPeriod[rotationName]) {
      ownersByPeriod[rotationName] = [];
    }
    ownersByPeriod[rotationName].push(doctorCode);
  });
  
  Object.entries(ownersByPeriod).forEach(([period, doctors]) => {
    if (doctors.length === 1) {
      console.log(`  ✅ ${period}: ${doctors[0]} (exclusive)`);
    } else {
      console.log(`  ❌ ${period}: [${doctors.join(', ')}] (SHARED - VIOLATION!)`);
    }
  });
});

// Test specific scenarios
console.log('\n🧪 SPECIFIC SCENARIO TESTING');
console.log('============================');

// Check HTC grouping exclusivity
console.log('\nTesting HTC grouping exclusivity:');
const htc1Owners = exclusivityValidation.activityOwnership['HTC1'] || new Set();
const htc1VisiteOwners = exclusivityValidation.activityOwnership['HTC1_visite'] || new Set();

console.log(`HTC1 assignments: ${Array.from(htc1Owners).join(', ')}`);
console.log(`HTC1_visite assignments: ${Array.from(htc1VisiteOwners).join(', ')}`);

// Check if HTC1 and HTC1_visite have same owners per period
let htcGroupingValid = true;
const htc1ByPeriod = {};
const htc1VisiteByPeriod = {};

htc1Owners.forEach(owner => {
  const [period] = owner.split(':');
  htc1ByPeriod[period] = owner.split(':')[1];
});

htc1VisiteOwners.forEach(owner => {
  const [period] = owner.split(':');
  htc1VisiteByPeriod[period] = owner.split(':')[1];
});

Object.keys(htc1ByPeriod).forEach(period => {
  const htc1Doctor = htc1ByPeriod[period];
  const htc1VisiteDoctor = htc1VisiteByPeriod[period];
  
  if (htc1VisiteDoctor && htc1Doctor !== htc1VisiteDoctor) {
    console.log(`❌ Period ${period}: HTC1 (${htc1Doctor}) vs HTC1_visite (${htc1VisiteDoctor}) - different doctors!`);
    htcGroupingValid = false;
  } else if (htc1VisiteDoctor) {
    console.log(`✅ Period ${period}: ${htc1Doctor} handles both HTC1 and HTC1_visite`);
  }
});

console.log(`HTC grouping compliance: ${htcGroupingValid ? '✅ Passed' : '❌ Failed'}`);

// Check multiple time slots same doctor
console.log('\nTesting same doctor handles multiple instances:');
Object.entries(exclusiveSchedule).forEach(([rotationName, rotationData]) => {
  if (rotationData.activityOwnership) {
    console.log(`\n${rotationName} activity ownership:`);
    Object.entries(rotationData.activityOwnership).forEach(([activity, doctor]) => {
      console.log(`  ${activity} → ${doctor} (exclusive owner)`);
    });
    
    // Verify this doctor handles ALL instances in the weekly schedule
    Object.entries(rotationData.activityOwnership).forEach(([activity, ownerDoctor]) => {
      let totalInstances = 0;
      let ownerInstances = 0;
      
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const timeSlots = ['9am-1pm', '2pm-6pm'];
      
      days.forEach(day => {
        timeSlots.forEach(timeSlot => {
          Object.entries(rotationData.weeklySchedule).forEach(([doctorCode, schedule]) => {
            const activities = schedule[day]?.[timeSlot] || [];
            if (activities.includes(activity)) {
              totalInstances++;
              if (doctorCode === ownerDoctor) {
                ownerInstances++;
              }
            }
          });
        });
      });
      
      if (totalInstances > 0) {
        const consistency = (ownerInstances === totalInstances) ? '✅' : '❌';
        console.log(`    ${activity}: ${ownerInstances}/${totalInstances} instances handled by owner ${consistency}`);
      }
    });
  }
});

// Overall compliance check
console.log('\n📊 OVERALL COMPLIANCE SUMMARY');
console.log('=============================');

const ruleCompliance = analyzeRuleCompliance(exclusiveSchedule);

console.log(`Duration rule compliance: ${ruleCompliance.summary.durationViolationCount === 0 ? '✅ Passed' : '❌ Failed'} (${ruleCompliance.summary.durationViolationCount} violations)`);
console.log(`Rotation setting compliance: ${ruleCompliance.summary.rotationSettingViolationCount === 0 ? '✅ Passed' : '❌ Failed'} (${ruleCompliance.summary.rotationSettingViolationCount} violations)`);
console.log(`Activity exclusivity compliance: ${exclusivityValidation.totalViolations === 0 ? '✅ Passed' : '❌ Failed'} (${exclusivityValidation.totalViolations} violations)`);
console.log(`HTC grouping compliance: ${htcGroupingValid ? '✅ Passed' : '❌ Failed'}`);

const allRulesPassed = 
  ruleCompliance.summary.durationViolationCount === 0 &&
  ruleCompliance.summary.rotationSettingViolationCount === 0 &&
  exclusivityValidation.totalViolations === 0 &&
  htcGroupingValid;

console.log('\n🎊 FINAL VALIDATION RESULT');
console.log('==========================');

if (allRulesPassed) {
  console.log('🎉 SUCCESS: All rules including EXCLUSIVE ASSIGNMENT implemented correctly!');
  console.log('\n✅ VALIDATED FEATURES:');
  console.log('1. ⏰ Time slot duration validation (4h limit)');
  console.log('2. 👨‍⚕️ Rotation setting constraints');
  console.log('3. 🏥 HTC activity grouping');
  console.log('4. 🎯 EXCLUSIVE ACTIVITY ASSIGNMENT (NEW)');
  console.log('   - Each activity assigned to exactly ONE doctor per rotation period');
  console.log('   - No sharing between doctors within same period');
  console.log('   - Same doctor handles ALL instances of assigned activities');
} else {
  console.log('⚠️  VALIDATION FAILED: Issues found with exclusive assignment implementation');
  console.log('\nPlease review violations above and fix the algorithm.');
}

console.log('\n✅ EXCLUSIVE ASSIGNMENT TEST COMPLETED');

export {
  exclusiveSchedule,
  exclusivityValidation,
  htcGroupingValid,
  allRulesPassed
};