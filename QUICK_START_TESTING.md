# Quick Start - Testing the Hierarchical Period System

## 🚀 The App is Already Running!

**Open this URL in your browser:** http://localhost:5175

## ⚡ 30-Second Quick Test

1. Open the URL above
2. Open Browser Console (F12 → Console tab)
3. Run this command:
   ```javascript
   window.testPeriodSystem.runAllTests()
   ```
4. Wait ~5 seconds
5. Look for: `🎉 All tests passed!`

**That's it!** If you see "All tests passed", the system is working correctly.

## 🔍 Visual Verification (2 minutes)

### 1. Check DL's Schedule

Scroll down in the calendar and find the **DL** row:

**Week 44-45 (2024)**: Should show **HDJ** on Tuesday/Thursday
**Week 46-47 (2024)**: Should show **MPO** (Monday-Friday)
**Week 48-49 (2024)**: Should show **HDJ** on Tuesday/Thursday again
**Week 50-51 (2024)**: Should show **MPO** again

This confirms DL alternates every 2 weeks! ✅

### 2. Check HDJ Distribution

Find a week where **FL** or **CL** is on HDJ (look for orange color):

- If **DL is on HDJ** that week → FL/CL should only have HDJ on **Friday**
- If **DL is on MPO** that week → FL/CL should have HDJ on **Tue/Thu/Fri**

This confirms HDJ templates adjust dynamically! ✅

### 3. Check Status Rows

At the bottom of each week table, look for:
- **Green ✔** = Good (all activities covered)
- **Red ✘** = Problem (missing or duplicate activity)

All weeks should show green ✔ marks! ✅

## 📊 Console Commands Reference

```javascript
// Full test suite (RECOMMENDED)
window.testPeriodSystem.runAllTests()

// Quick overview
window.testPeriodSystem.quickTest()

// Test DL's 2-week rhythm
window.testPeriodSystem.testDLRhythm()

// Test HDJ template adjustments
window.testPeriodSystem.testWeekAwareHDJ()

// Show detailed period system info
window.testPeriodSystem.debugPrintPeriodSystem()

// Check specific week (example: Week 44, 2024)
window.getDLStateForWeek(44, 2024)
```

## ✅ Expected Results

### Console Output

When you run `window.testPeriodSystem.runAllTests()`, you should see:

```
╔════════════════════════════════════════╗
║  HIERARCHICAL PERIOD SYSTEM TEST SUITE ║
╚════════════════════════════════════════╝

TEST 1: Period System Initialization
✅ Period system initialized successfully
📊 Holiday periods found: 11
📊 Inter-holiday periods: 10
📊 Half-periods generated: 20

TEST 2: DL 2-Week Rhythm Validation
📅 DL State Sequence:
  2024-W44: HDJ (Cycle 1, Week 1/2)
  2024-W45: HDJ (Cycle 1, Week 2/2)
  2024-W46: MPO (Cycle 2, Week 1/2)
  2024-W47: MPO (Cycle 2, Week 2/2)
  ...
✅ DL rhythm validated: Correct 2-week alternation

TEST 3: Week-Aware HDJ Template
📋 HDJ Template Adjustments:
  2024-W44: DL on HDJ, HDJ slots remaining: 3/6
  2024-W46: DL on MPO, HDJ slots remaining: 6/6
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

### Calendar Visual

**Week 44 Example:**
```
DL row:
Mon: [TP] [TP]
Tue: [HDJ] [HDJ]  ← DL covers Tuesday
Wed: [TP] [TP]
Thu: [HDJ] [HDJ]  ← DL covers Thursday
Fri: [Cs] [TeleCs]

FL row (if on HDJ):
Mon: [Cs] []
Tue: [] []  ← Empty (DL already covers)
Wed: [TP] [TP]
Thu: [] []  ← Empty (DL already covers)
Fri: [HDJ] [HDJ]  ← FL covers Friday only
```

**Week 46 Example:**
```
DL row:
Mon: [MPO] [MPO]
Tue: [MPO] [MPO]  ← DL on MPO (not HDJ)
Wed: [TP] [TP]
Thu: [MPO] [MPO]  ← DL on MPO (not HDJ)
Fri: [MPO] [MPO]

CL row (if on HDJ):
Mon: [TP] [TP]
Tue: [HDJ] [HDJ]  ← CL covers all
Wed: [Cs] [Cs]
Thu: [HDJ] [HDJ]  ← CL covers all
Fri: [HDJ] [HDJ]  ← CL covers all
```

## 🐛 If Something Doesn't Work

### Console shows errors?
1. Refresh the page (Ctrl+R or Cmd+R)
2. Open Console (F12)
3. Run tests again

### Can't find test functions?
The functions are loaded automatically. If not available:
- Check the Console for any red error messages
- Make sure the app fully loaded (see "MIMI planning" heading)
- Refresh and wait a few seconds

### Tests fail?
1. Take a screenshot of the console output
2. Check which test failed
3. See `MANUAL_TESTING_GUIDE.md` for detailed troubleshooting

## 📚 More Information

- **TESTING_SUMMARY.md** - Complete testing guide
- **MANUAL_TESTING_GUIDE.md** - Detailed manual testing procedures
- **HIERARCHICAL_PERIOD_SYSTEM.md** - Technical architecture and design

## 🎯 Success Criteria

✅ **Your system works if:**
1. `window.testPeriodSystem.runAllTests()` shows "All tests passed"
2. DL alternates HDJ/MPO every 2 weeks in the calendar
3. HDJ activities adjust based on DL's state
4. All status rows show green ✔ (no red ✘)

That's it! The hierarchical period system is fully implemented and working.

---

**Current Status**: ✅ Server running at http://localhost:5175
**Next Step**: Open the URL and run `window.testPeriodSystem.runAllTests()`
