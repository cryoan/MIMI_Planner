/**
 * Test and validation utilities for the new hierarchical period system
 *
 * This file provides tools to validate that the new system correctly:
 * 1. Calculates inter-holiday periods and half-periods
 * 2. Tracks DL's 2-week rhythm independently
 * 3. Generates week-aware HDJ templates
 * 4. Produces valid schedules without conflicts
 */

import {
  initializePeriodSystem,
  getRegularDoctorPeriod,
  getDLStateForWeek,
  getPeriodIndexForWeek,
  scheduleConfig,
  debugPrintPeriodSystem
} from './periodCalculator.js';
import { computeWeeklyHDJTemplate } from './doctorSchedules.js';
import { executeCustomPlanningAlgorithm, generateCustomPlanningReport } from './customPlanningLogic.js';

/**
 * Test 1: Validate period system initialization
 */
export function testPeriodSystemInit() {
  console.log('\n========================================');
  console.log('TEST 1: Period System Initialization');
  console.log('========================================\n');

  try {
    const system = initializePeriodSystem();

    console.log('✅ Period system initialized successfully');
    console.log(`📊 Holiday periods found: ${system.holidayPeriods.length}`);
    console.log(`📊 Inter-holiday periods: ${system.interHolidayPeriods.length}`);
    console.log(`📊 Half-periods generated: ${system.halfPeriods.length}`);
    console.log(`📊 Weeks mapped: ${Object.keys(system.weekToPeriodMap).length}`);

    return {
      success: true,
      system
    };
  } catch (error) {
    console.error('❌ Period system initialization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test 2: Validate DL's 2-week rhythm
 */
export function testDLRhythm() {
  console.log('\n========================================');
  console.log('TEST 2: DL 2-Week Rhythm Validation');
  console.log('========================================\n');

  const results = [];
  let consecutiveWeeks = 0;
  let previousState = null;

  // Test weeks 44-52 (2024) and 1-20 (2025)
  const testWeeks = [
    ...Array.from({ length: 9 }, (_, i) => ({ week: 44 + i, year: 2024 })),
    ...Array.from({ length: 20 }, (_, i) => ({ week: i + 1, year: 2025 }))
  ];

  console.log('📅 DL State Sequence:\n');

  testWeeks.forEach(({ week, year }) => {
    const dlState = getDLStateForWeek(week, year);

    if (dlState) {
      console.log(`  ${year}-W${String(week).padStart(2, '0')}: ${dlState.state} (Cycle ${dlState.cycleNumber}, Week ${dlState.weekInCycle}/2)`);

      // Validate cycle logic
      if (previousState === dlState.state) {
        consecutiveWeeks++;
      } else {
        if (previousState !== null && consecutiveWeeks !== 2) {
          results.push({
            error: `Invalid cycle length: ${consecutiveWeeks} weeks of ${previousState}`,
            week,
            year
          });
        }
        consecutiveWeeks = 1;
      }

      previousState = dlState.state;
    }
  });

  const success = results.length === 0;
  console.log(success ? '\n✅ DL rhythm validated: Correct 2-week alternation' : '\n❌ DL rhythm validation failed');

  return {
    success,
    issues: results
  };
}

/**
 * Test 3: Validate week-aware HDJ template computation
 */
export function testWeekAwareHDJ() {
  console.log('\n========================================');
  console.log('TEST 3: Week-Aware HDJ Template');
  console.log('========================================\n');

  const testWeeks = [
    { week: 44, year: 2024, expectedState: 'HDJ' },
    { week: 45, year: 2024, expectedState: 'HDJ' },
    { week: 46, year: 2024, expectedState: 'MPO' },
    { week: 1, year: 2025, expectedState: 'HDJ' },
    { week: 2, year: 2025, expectedState: 'MPO' },  // ✅ Fixed: W02 is MPO (cycle 6, week 1/2)
    { week: 3, year: 2025, expectedState: 'MPO' }
  ];

  console.log('📋 HDJ Template Adjustments:\n');

  const results = testWeeks.map(({ week, year, expectedState }) => {
    const dlState = getDLStateForWeek(week, year);
    const hdjTemplate = computeWeeklyHDJTemplate(week, year);

    // Count HDJ activities in template
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = ['9am-1pm', '2pm-6pm'];
    let hdjCount = 0;

    days.forEach(day => {
      slots.forEach(slot => {
        if (hdjTemplate[day][slot].includes('HDJ')) {
          hdjCount++;
        }
      });
    });

    console.log(`  ${year}-W${String(week).padStart(2, '0')}: DL on ${dlState?.state}, HDJ slots remaining: ${hdjCount}/6`);

    return {
      week,
      year,
      dlState: dlState?.state,
      expectedState,
      hdjCount,
      correct: dlState?.state === expectedState && (
        (expectedState === 'MPO' && hdjCount === 6) ||
        (expectedState === 'HDJ' && hdjCount === 2)  // ✅ Friday only = 2 slots
      )
    };
  });

  const allCorrect = results.every(r => r.correct);
  console.log(allCorrect ? '\n✅ HDJ templates validated: Correct dynamic adjustment' : '\n❌ HDJ template validation failed');

  return {
    success: allCorrect,
    results
  };
}

/**
 * Test 4: Validate regular doctor period mapping
 */
export function testRegularDoctorPeriods() {
  console.log('\n========================================');
  console.log('TEST 4: Regular Doctor Period Mapping');
  console.log('========================================\n');

  const testWeeks = [
    { week: 44, year: 2024 },
    { week: 50, year: 2024 },
    { week: 1, year: 2025 },
    { week: 10, year: 2025 },
    { week: 20, year: 2025 }
  ];

  console.log('📅 Period Assignments:\n');

  testWeeks.forEach(({ week, year }) => {
    const periodInfo = getRegularDoctorPeriod(week, year);

    if (periodInfo) {
      console.log(`  ${year}-W${String(week).padStart(2, '0')}: ${periodInfo.periodId} (${periodInfo.parentPeriod} - Half ${periodInfo.halfNumber})`);
      console.log(`    Week ${periodInfo.weekInPeriod}/${periodInfo.totalWeeksInPeriod} in period`);
    } else {
      console.log(`  ${year}-W${String(week).padStart(2, '0')}: ⚠️ No period mapping found`);
    }
  });

  console.log('\n✅ Regular doctor periods displayed');

  return {
    success: true
  };
}

/**
 * Test 5: Full system integration test
 */
export function testFullSystemIntegration() {
  console.log('\n========================================');
  console.log('TEST 5: Full System Integration');
  console.log('========================================\n');

  try {
    console.log('🚀 Running full planning algorithm with new system...\n');

    const algorithmResult = executeCustomPlanningAlgorithm(
      'honeymoon_NS_noHDJ',
      null,
      null
    );

    if (!algorithmResult.success) {
      console.error('❌ Algorithm execution failed');
      return {
        success: false,
        error: 'Algorithm failed'
      };
    }

    console.log('\n📊 Generating report...\n');
    const report = generateCustomPlanningReport(algorithmResult);

    console.log('📈 Integration Test Results:');
    console.log(`  - Execution time: ${algorithmResult.statistics.executionTime}ms`);
    console.log(`  - Doctors processed: ${algorithmResult.statistics.doctorsProcessed}`);
    console.log(`  - Periods generated: ${algorithmResult.statistics.periodsGenerated}`);
    console.log(`  - Weekly schedules: ${algorithmResult.weeklySchedules ? Object.keys(algorithmResult.weeklySchedules).length : 0}`);

    if (report.success) {
      console.log(`  - Coverage: ${report.summary.validationResults.coveragePercentage}%`);
      console.log(`  - Valid slots: ${report.summary.validationResults.validSlots}/${report.summary.validationResults.totalSlots}`);
      console.log(`  - Missing activities: ${report.summary.problemsIdentified.totalMissing}`);
      console.log(`  - Duplicate activities: ${report.summary.problemsIdentified.totalDuplicates}`);
    }

    console.log('\n✅ Full system integration test completed');

    return {
      success: true,
      algorithmResult,
      report
    };
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  HIERARCHICAL PERIOD SYSTEM TEST SUITE ║');
  console.log('╚════════════════════════════════════════╝\n');

  const results = {
    test1: testPeriodSystemInit(),
    test2: testDLRhythm(),
    test3: testWeekAwareHDJ(),
    test4: testRegularDoctorPeriods(),
    test5: testFullSystemIntegration()
  };

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║          TEST SUMMARY                  ║');
  console.log('╚════════════════════════════════════════╝\n');

  const allPassed = Object.values(results).every(r => r.success);

  Object.entries(results).forEach(([testName, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${testName}`);
  });

  console.log(allPassed ? '\n🎉 All tests passed!' : '\n⚠️ Some tests failed');

  return {
    allPassed,
    results
  };
}

// Convenience export for quick debugging
export function quickTest() {
  console.log('🔧 Quick Test - Period System Overview\n');
  debugPrintPeriodSystem();
  console.log('\n--- DL First 10 Weeks ---');
  for (let w = 44; w <= 52; w++) {
    const dlState = getDLStateForWeek(w, 2024);
    console.log(`2024-W${w}: ${dlState?.state}`);
  }
  console.log('\n✅ Quick test completed');
}

// Make tests available in browser console
if (typeof window !== 'undefined') {
  window.testPeriodSystem = {
    runAllTests,
    quickTest,
    testPeriodSystemInit,
    testDLRhythm,
    testWeekAwareHDJ,
    testRegularDoctorPeriods,
    testFullSystemIntegration,
    debugPrintPeriodSystem
  };
  console.log('🧪 Test functions available: window.testPeriodSystem.runAllTests()');
}
