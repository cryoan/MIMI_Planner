# Console Test Script - Copy & Paste into Browser Console

If `window.testPeriodSystem` is not available, you can copy-paste these test scripts directly into the browser console.

## Test 1: Check if Period Functions Are Available

```javascript
console.log('Testing period functions availability...');
console.log('getDLStateForWeek:', typeof window.getDLStateForWeek);
console.log('getRegularDoctorPeriod:', typeof window.getRegularDoctorPeriod);
console.log('debugPrintPeriodSystem:', typeof window.debugPrintPeriodSystem);
```

**Expected Output**: All should show `"function"`

---

## Test 2: DL's 2-Week Rhythm (Quick Visual Check)

```javascript
console.log('\n=== DL 2-WEEK RHYTHM TEST ===\n');

const weeks2024 = [44, 45, 46, 47, 48, 49, 50, 51, 52];
const weeks2025 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log('2024 Weeks:');
weeks2024.forEach(w => {
  const state = window.getDLStateForWeek(w, 2024);
  console.log(`  W${w}: ${state?.state} (Cycle ${state?.cycleNumber}, Week ${state?.weekInCycle}/2)`);
});

console.log('\n2025 Weeks:');
weeks2025.forEach(w => {
  const state = window.getDLStateForWeek(w, 2025);
  console.log(`  W${w}: ${state?.state} (Cycle ${state?.cycleNumber}, Week ${state?.weekInCycle}/2)`);
});

console.log('\n✅ Check: DL should alternate every 2 weeks (HDJ→HDJ→MPO→MPO→HDJ...)');
```

**Expected Output**:
```
2024 Weeks:
  W44: HDJ (Cycle 1, Week 1/2)
  W45: HDJ (Cycle 1, Week 2/2)
  W46: MPO (Cycle 2, Week 1/2)
  W47: MPO (Cycle 2, Week 2/2)
  W48: HDJ (Cycle 3, Week 1/2)
  W49: HDJ (Cycle 3, Week 2/2)
  W50: MPO (Cycle 4, Week 1/2)
  W51: MPO (Cycle 4, Week 2/2)
  W52: HDJ (Cycle 5, Week 1/2)

2025 Weeks:
  W1: HDJ (Cycle 5, Week 2/2)
  W2: MPO (Cycle 6, Week 1/2)
  W3: MPO (Cycle 6, Week 2/2)
  ...
```

---

## Test 3: Validate DL Rhythm Logic

```javascript
console.log('\n=== VALIDATING DL RHYTHM LOGIC ===\n');

let isValid = true;
let previousState = null;
let consecutiveWeeks = 0;
const issues = [];

const allWeeks = [
  ...Array.from({ length: 9 }, (_, i) => ({ week: 44 + i, year: 2024 })),
  ...Array.from({ length: 20 }, (_, i) => ({ week: i + 1, year: 2025 }))
];

allWeeks.forEach(({ week, year }) => {
  const dlState = window.getDLStateForWeek(week, year);

  if (dlState) {
    if (previousState === dlState.state) {
      consecutiveWeeks++;
    } else {
      if (previousState !== null && consecutiveWeeks !== 2) {
        issues.push(`Invalid cycle: ${consecutiveWeeks} weeks of ${previousState} before ${year}-W${week}`);
        isValid = false;
      }
      consecutiveWeeks = 1;
    }
    previousState = dlState.state;
  }
});

if (isValid && issues.length === 0) {
  console.log('✅ DL rhythm is VALID: Alternates correctly every 2 weeks');
} else {
  console.log('❌ DL rhythm has ISSUES:');
  issues.forEach(issue => console.log('  -', issue));
}
```

**Expected Output**: `✅ DL rhythm is VALID: Alternates correctly every 2 weeks`

---

## Test 4: Regular Doctor Period Mapping

```javascript
console.log('\n=== REGULAR DOCTOR PERIODS ===\n');

const testWeeks = [
  { week: 44, year: 2024 },
  { week: 47, year: 2024 },
  { week: 50, year: 2024 },
  { week: 1, year: 2025 },
  { week: 10, year: 2025 },
  { week: 20, year: 2025 }
];

testWeeks.forEach(({ week, year }) => {
  const periodInfo = window.getRegularDoctorPeriod(week, year);

  if (periodInfo) {
    console.log(`${year}-W${String(week).padStart(2, '0')}:`);
    console.log(`  Period: ${periodInfo.periodId} (${periodInfo.parentPeriod})`);
    console.log(`  Half ${periodInfo.halfNumber}, Week ${periodInfo.weekInPeriod}/${periodInfo.totalWeeksInPeriod}`);
  } else {
    console.log(`${year}-W${String(week).padStart(2, '0')}: No period mapping`);
  }
});

console.log('\n✅ Periods should vary in length based on French holidays');
```

---

## Test 5: Full System Debug Info

```javascript
console.log('\n=== FULL PERIOD SYSTEM DEBUG INFO ===\n');

if (typeof window.debugPrintPeriodSystem === 'function') {
  window.debugPrintPeriodSystem();
} else {
  console.log('⚠️ debugPrintPeriodSystem function not available');
  console.log('Available functions:', Object.keys(window).filter(k => k.includes('Period') || k.includes('DL')));
}
```

---

## Quick Validation: All-in-One Test

```javascript
(function runQuickValidation() {
  console.clear();
  console.log('╔════════════════════════════════════════╗');
  console.log('║    HIERARCHICAL PERIOD SYSTEM TEST     ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Test 1: Functions available
  console.log('1️⃣ Testing function availability...');
  const hasDL = typeof window.getDLStateForWeek === 'function';
  const hasPeriod = typeof window.getRegularDoctorPeriod === 'function';
  console.log(hasDL && hasPeriod ? '   ✅ Functions available' : '   ❌ Functions missing');

  if (!hasDL || !hasPeriod) {
    console.log('\n⚠️ Core functions not available. Refresh the page and try again.');
    return;
  }

  // Test 2: DL rhythm for first 10 weeks
  console.log('\n2️⃣ Testing DL rhythm...');
  const dlStates = [];
  for (let w = 44; w <= 52; w++) {
    const state = window.getDLStateForWeek(w, 2024);
    dlStates.push(state?.state);
  }

  // Check pattern: HDJ, HDJ, MPO, MPO, HDJ, HDJ, MPO, MPO, HDJ
  const expectedPattern = ['HDJ', 'HDJ', 'MPO', 'MPO', 'HDJ', 'HDJ', 'MPO', 'MPO', 'HDJ'];
  const patternMatches = dlStates.every((state, i) => state === expectedPattern[i]);
  console.log(patternMatches ? '   ✅ DL rhythm correct' : '   ❌ DL rhythm incorrect');
  console.log('   Pattern:', dlStates.join(' → '));

  // Test 3: Period mapping
  console.log('\n3️⃣ Testing period mapping...');
  const period = window.getRegularDoctorPeriod(44, 2024);
  const hasPeriodMapping = period && period.periodId;
  console.log(hasPeriodMapping ? '   ✅ Period mapping works' : '   ❌ Period mapping failed');
  if (period) {
    console.log(`   Week 44 → ${period.periodId} (${period.parentPeriod})`);
  }

  // Summary
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           TEST SUMMARY                 ║');
  console.log('╚════════════════════════════════════════╝');

  const allPassed = (hasDL && hasPeriod) && patternMatches && hasPeriodMapping;

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! System is working correctly.\n');
    console.log('Visual verification:');
    console.log('1. Check DL row in calendar - should alternate HDJ/MPO every 2 weeks');
    console.log('2. Check HDJ doctors - should have reduced HDJ when DL is on HDJ');
    console.log('3. Check status rows - should show green ✔ marks');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED. See details above.\n');
  }
})();
```

---

## Usage Instructions

1. **Open** http://localhost:5175
2. **Open Browser Console** (F12 → Console tab)
3. **Copy the script** you want to run (e.g., "Quick Validation: All-in-One Test")
4. **Paste into console** and press Enter
5. **Review the output**

---

## Expected Results Summary

✅ **Functions Available**: All period functions should be in `window`
✅ **DL Rhythm**: Should alternate `HDJ → HDJ → MPO → MPO` every 2 weeks
✅ **Period Mapping**: Regular doctors should have period assignments
✅ **No Errors**: Console should not show red error messages

---

## Troubleshooting

### If functions are not available:
1. Refresh the page (Ctrl+R or Cmd+R)
2. Wait 2-3 seconds for app to load
3. Try again

### If tests fail:
1. Check console for red error messages
2. Look for import errors or module loading issues
3. Try the "Full System Debug Info" test to see what's available

### If calendar doesn't show correctly:
1. Check Network tab in DevTools
2. Look for failed requests (red entries)
3. Check if all JavaScript files loaded successfully
