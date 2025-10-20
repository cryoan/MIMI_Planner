# START HERE - Testing Your Hierarchical Period System

## ⚡ Quick Test (30 Seconds)

### Step 1: Open the Application
**URL:** http://localhost:5175

The dev server is already running!

### Step 2: Open Browser Console
- Press **F12** (Windows/Linux)
- Or **Cmd+Option+J** (Mac)
- Click on the **Console** tab

### Step 3: Copy-Paste This Test Script

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

### Step 4: Press Enter

You should see:

```
╔════════════════════════════════════════╗
║    HIERARCHICAL PERIOD SYSTEM TEST     ║
╚════════════════════════════════════════╝

1️⃣ Testing function availability...
   ✅ Functions available

2️⃣ Testing DL rhythm...
   ✅ DL rhythm correct
   Pattern: HDJ → HDJ → MPO → MPO → HDJ → HDJ → MPO → MPO → HDJ

3️⃣ Testing period mapping...
   ✅ Period mapping works
   Week 44 → P1 (After Vacances de la Toussaint)

╔════════════════════════════════════════╗
║           TEST SUMMARY                 ║
╚════════════════════════════════════════╝

🎉 ALL TESTS PASSED! System is working correctly.
```

---

## 🔍 Visual Verification (2 Minutes)

After the console test passes, visually verify in the calendar:

### 1. Find the DL Row

Scroll down and look for the row labeled **DL**.

**Check these weeks:**
- **Week 44-45**: Should have **HDJ** activities on Tuesday/Thursday
- **Week 46-47**: Should have **MPO** activities Monday-Friday
- **Week 48-49**: Should have **HDJ** activities on Tuesday/Thursday again
- **Week 50-51**: Should have **MPO** activities Monday-Friday again

✅ **This confirms DL alternates every 2 weeks!**

### 2. Check HDJ Distribution

Find a week where another doctor (FL, CL, or NS) has **HDJ** (orange color):

**Example - Week 44 (DL is on HDJ):**
- DL has: Tue/Thu with HDJ
- Other doctor with HDJ has: **Only Friday** with HDJ

**Example - Week 46 (DL is on MPO):**
- DL has: MPO activities (not HDJ)
- Other doctor with HDJ has: **Tue/Thu/Fri** with HDJ (full coverage)

✅ **This confirms HDJ adjusts dynamically!**

### 3. Check Status Rows

At the bottom of each week table:
- **Green ✔** = Good
- **Red ✘** = Problem

All weeks should have **green ✔** marks.

✅ **This confirms complete coverage!**

---

## 📊 More Console Commands

If you want to explore further:

### Show detailed DL rhythm:
```javascript
for (let w = 44; w <= 52; w++) {
  const state = window.getDLStateForWeek(w, 2024);
  console.log(`2024-W${w}: ${state?.state} (Cycle ${state?.cycleNumber}, Week ${state?.weekInCycle}/2)`);
}
```

### Show period information:
```javascript
const period = window.getRegularDoctorPeriod(44, 2024);
console.log(period);
```

### Show full system debug:
```javascript
window.debugPrintPeriodSystem();
```

---

## ✅ You're Done!

If you see:
- ✅ Console test passes
- ✅ DL alternates HDJ/MPO every 2 weeks in calendar
- ✅ HDJ activities adjust correctly
- ✅ Green ✔ marks in status rows

**The hierarchical period system is working perfectly!**

---

## 📚 Additional Resources

- **CONSOLE_TEST_SCRIPT.md** - More detailed console tests
- **MANUAL_TESTING_GUIDE.md** - Complete manual testing procedures
- **HIERARCHICAL_PERIOD_SYSTEM.md** - Technical architecture documentation
- **TESTING_SUMMARY.md** - Comprehensive testing summary

---

## 🐛 Troubleshooting

### Functions not available?
1. Refresh the page (Ctrl+R or Cmd+R)
2. Wait 2-3 seconds
3. Try the test again

### Tests fail?
1. Check console for red error messages
2. See **CONSOLE_TEST_SCRIPT.md** for alternative tests
3. Review **MANUAL_TESTING_GUIDE.md** for debugging steps

### Calendar not showing?
1. Make sure you're at http://localhost:5175
2. Check Network tab in DevTools for failed requests
3. Look for any red error messages in Console

---

**Current Status:** ✅ Server running at http://localhost:5175
**Next Step:** Open the URL and run the console test above!
