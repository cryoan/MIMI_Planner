# Manual Testing Guide - Hierarchical Period System

## Quick Start

The development server is currently running at: **http://localhost:5175**

Open this URL in your browser to see the MIMI planning application.

## 🎯 What to Look For

### 1. Initial Load
- Page should display "MIMI planning" heading
- Two calendar sections: **2024** and **2025**
- Starting from **Week 44** in 2024

### 2. Console Logs (Open DevTools with F12)

**Expected Console Output:**
```
🗓️ Initializing Period System...
✅ Found X holiday periods
✅ Calculated X inter-holiday periods
✅ Created X half-periods for regular doctors
✅ Generated week mappings (X weeks mapped)

📅 Generating schedule for 2024-W44...
  Period: P1, DL state: HDJ
  🔒 YC: rigid schedule maintained
  🔒 GC: rigid schedule maintained
  ✅ FL: assigned to HDJ (week-aware)
  ✅ CL: assigned to AMI (week-aware)
  🏥 DL: HDJ (week 1/2)

📊 DL backbone for 2024-W44: HDJ
📊 Week 2024-W44: DL on HDJ, adjusted HDJ template

✅ Using week-aware HDJ template for 2024-W44
```

## 📋 Test Checklist

### Test 1: DL's 2-Week Rhythm ⭐ MOST IMPORTANT

**Steps:**
1. Find the **DL** row in the calendar
2. Check activities for each week

**Expected Pattern:**

| Week | DL State | Activities | Notes |
|------|----------|------------|-------|
| W44 (2024) | HDJ | Tue/Thu: HDJ | Week 1 of HDJ cycle |
| W45 (2024) | HDJ | Tue/Thu: HDJ | Week 2 of HDJ cycle |
| W46 (2024) | **MPO** | Mon-Fri: MPO | Week 1 of MPO cycle |
| W47 (2024) | **MPO** | Mon-Fri: MPO | Week 2 of MPO cycle |
| W48 (2024) | HDJ | Tue/Thu: HDJ | Week 1 of HDJ cycle |
| W49 (2024) | HDJ | Tue/Thu: HDJ | Week 2 of HDJ cycle |
| W50 (2024) | **MPO** | Mon-Fri: MPO | Week 1 of MPO cycle |

**Verification:**
- ✅ DL alternates every 2 weeks
- ✅ HDJ weeks show Tue/Thu/Fri with HDJ
- ✅ MPO weeks show Mon-Fri with MPO

**Console Command:**
```javascript
window.testPeriodSystem.testDLRhythm()
```

**Expected Output:**
```
✅ DL rhythm validated: Correct 2-week alternation
```

---

### Test 2: Week-Aware HDJ Templates ⭐ CRITICAL

**Steps:**
1. Find weeks where **FL**, **CL**, or **NS** are assigned to HDJ
2. Compare their HDJ schedule with DL's state

**Example - Week 44 (DL on HDJ):**
- **DL**: Should have HDJ on Tue/Thu (AM+PM)
- **Other doctor on HDJ** (e.g., FL): Should only have HDJ on **Friday** (AM+PM)
- **Reason**: DL already covers Tue/Thu

**Example - Week 46 (DL on MPO):**
- **DL**: Should have MPO activities (not HDJ)
- **Other doctor on HDJ**: Should have HDJ on **Tue/Thu/Fri** (AM+PM)
- **Reason**: DL is not covering any HDJ this week

**Console Command:**
```javascript
window.testPeriodSystem.testWeekAwareHDJ()
```

**Expected Output:**
```
✅ HDJ templates validated: Correct dynamic adjustment
```

---

### Test 3: Period System Initialization

**Console Command:**
```javascript
window.testPeriodSystem.testPeriodSystemInit()
```

**Expected Output:**
```
✅ Period system initialized successfully
📊 Holiday periods found: X
📊 Inter-holiday periods: X
📊 Half-periods generated: X
📊 Weeks mapped: X
```

---

### Test 4: Regular Doctor Periods

**Console Command:**
```javascript
window.testPeriodSystem.testRegularDoctorPeriods()
```

**Expected Output:**
```
📅 Period Assignments:
  2024-W44: P1 (After Vacances de la Toussaint - Half 1)
    Week 1/3 in period
  2024-W47: P2 (After Vacances de la Toussaint - Half 2)
    Week 1/3 in period
  ...
```

---

### Test 5: Full System Integration

**Console Command:**
```javascript
window.testPeriodSystem.runAllTests()
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║  HIERARCHICAL PERIOD SYSTEM TEST SUITE ║
╚════════════════════════════════════════╝

TEST 1: Period System Initialization
✅ Period system initialized successfully

TEST 2: DL 2-Week Rhythm Validation
✅ DL rhythm validated: Correct 2-week alternation

TEST 3: Week-Aware HDJ Template
✅ HDJ templates validated: Correct dynamic adjustment

TEST 4: Regular Doctor Period Mapping
✅ Regular doctor periods displayed

TEST 5: Full System Integration
✅ Full system integration test completed

╔════════════════════════════════════════╗
║          TEST SUMMARY                  ║
╚════════════════════════════════════════╝

✅ PASS: test1
✅ PASS: test2
✅ PASS: test3
✅ PASS: test4
✅ PASS: test5

🎉 All tests passed!
```

---

## 🔍 Visual Inspection Guide

### Week 44 Example (DL on HDJ - First 2-week cycle)

**DL Row:**
```
Mon: [other activities]
Tue: [HDJ] (AM + PM)
Wed: [TP or other]
Thu: [HDJ] (AM + PM)
Fri: [Cs or other activities]
```

**FL Row (if assigned to HDJ):**
```
Mon: [Cs]
Tue: [   ]  ← Should be EMPTY (DL covers this)
Wed: [TP]
Thu: [   ]  ← Should be EMPTY (DL covers this)
Fri: [HDJ] (AM + PM)  ← FL covers this
```

### Week 46 Example (DL on MPO - First MPO cycle)

**DL Row:**
```
Mon: [MPO] (AM + PM)
Tue: [MPO] (AM + PM)
Wed: [TP]
Thu: [MPO] (AM + PM)
Fri: [MPO] (AM + PM)
```

**CL Row (if assigned to HDJ):**
```
Mon: [TP]
Tue: [HDJ] (AM + PM)  ← CL covers this
Wed: [Cs]
Thu: [HDJ] (AM + PM)  ← CL covers this
Fri: [HDJ] (AM + PM)  ← CL covers this
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Console shows errors about missing holidays

**Solution**: Check `src/publicHolidays.js` has data for 2024-2025

### Issue 2: DL rhythm is not alternating correctly

**Solution**: Check console for:
```javascript
window.testPeriodSystem.debugPrintPeriodSystem()
```

Look at the DL State Map section.

### Issue 3: HDJ templates not adjusting

**Check:**
1. Console logs for "Using week-aware HDJ template"
2. Run: `window.testPeriodSystem.testWeekAwareHDJ()`

### Issue 4: All tests fail

**Solution**: Refresh the page to reinitialize the period system.

---

## 🎨 Color Coding Reference

- **Green (HTC1/HTC2)**: Hospital activities
- **Blue (EMIT/EMATIT)**: Emergency activities
- **Orange (HDJ)**: Day hospital
- **Light Orange (AMI)**: AMI activities
- **Light Gray (MPO)**: MPO activities
- **Purple (WE)**: Weekend shifts

---

## 📊 Quick Debug Commands

**Print full system details:**
```javascript
window.testPeriodSystem.debugPrintPeriodSystem()
```

**Quick overview:**
```javascript
window.testPeriodSystem.quickTest()
```

**Check specific week:**
```javascript
// Get DL state for week 44, 2024
const dlState = window.getDLStateForWeek(44, 2024);
console.log(dlState);

// Get period info for week 44, 2024
const periodInfo = window.getRegularDoctorPeriod(44, 2024);
console.log(periodInfo);
```

---

## ✅ Success Criteria

Your system is working correctly if:

1. **✅ DL alternates HDJ/MPO every 2 weeks** consistently throughout 2024-2025
2. **✅ HDJ activities** are distributed correctly:
   - When DL is on HDJ: Other doctors get only Friday HDJ
   - When DL is on MPO: Other doctors get full Tue/Thu/Fri HDJ
3. **✅ All automated tests pass** (`window.testPeriodSystem.runAllTests()`)
4. **✅ No red X marks** in the calendar status rows (no missing/duplicate activities)
5. **✅ Console shows period initialization** and week-by-week generation logs

---

## 📞 Need Help?

1. Check `HIERARCHICAL_PERIOD_SYSTEM.md` for architecture details
2. Review console logs for error messages
3. Run debug commands above
4. Check `src/periodCalculator.js` for configuration

---

## 🚀 Next Steps

After verifying the system works:

1. **Test different rotation cycles** (if UI has selector)
2. **Export to Excel** and verify format
3. **Test with modified holidays** (change `src/publicHolidays.js`)
4. **Adjust configuration** in `src/periodCalculator.js`:
   - Change DL cycle length: `cycleWeeks: 3`
   - Change division factor: `divisionFactor: 3`
