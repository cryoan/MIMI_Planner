# Hierarchical Two-Rhythm Scheduling System

## Overview

This document describes the new hierarchical period system that solves the complex scheduling requirements where:

1. **DL** operates on a fixed 2-week rhythm (HDJ ↔ MPO alternation), independent of holidays
2. **Other doctors** rotate based on "half inter-holiday periods" (variable duration)
3. **HDJ activities** are dynamically adjusted per week based on DL's current state

## Problem Statement

The original requirement:
> "On one hand, we have DL that will alternate 2 weeks HDJ and 2 weeks MPO during the whole year, including holidays. On the other hand we have other doctors that will have rotation period of 'half inter french public holiday duration' (eg, if 6 weeks between 'vacances noel' and 'vacances hiver', then we would have 3 weeks and 3 weeks rotations). For the doctors that would rotate on HDJ activity, the detailed content of their HDJ presence would be the theoretical one (defined as in rotation templates in the UI) minus the DL related HDJ activity."

This creates a complex two-tier system where:
- DL's schedule must be calculated independently per week
- Other doctors' periods vary based on the French holiday calendar
- HDJ assignments must account for DL's current state each week

## Architecture

### Components

#### 1. **periodCalculator.js** - Core Period System

**Purpose**: Calculates and manages the two independent rhythm systems

**Key Functions**:
- `initializePeriodSystem()` - Parses holidays and generates all mappings
- `getRegularDoctorPeriod(week, year)` - Returns period info for regular doctors
- `getDLStateForWeek(week, year)` - Returns DL's state (HDJ or MPO) for a specific week
- `getPeriodIndexForWeek(week, year)` - Returns 0-based period index for rotation selection

**Configuration** (`scheduleConfig`):
```javascript
{
  DL: {
    rhythmType: "fixed",
    cycleWeeks: 2,              // 2-week cycle
    startWeek: 44,              // Starting week (2024)
    startYear: 2024,
    startState: "HDJ",          // Initial state
    states: ["HDJ", "MPO"]      // Alternating states
  },
  regularDoctors: {
    rhythmType: "holiday-based",
    divisionFactor: 2,          // Half the inter-holiday period
    minWeeks: 2,                // Minimum period length
    maxWeeks: 6                 // Maximum period length
  }
}
```

**How it works**:

1. **Holiday Extraction**: Parses `publicHolidays.js` to identify vacation periods
2. **Inter-Holiday Calculation**: Calculates the weeks between each holiday
3. **Half-Period Generation**: Divides inter-holiday periods by 2 for regular doctor rotations
4. **Week Mapping**: Creates lookup tables:
   - `weekToPeriodMap`: Maps each week → period info for regular doctors
   - `weekToDLStateMap`: Maps each week → DL's state (HDJ/MPO)

#### 2. **doctorSchedules.js** - Enhanced with Week-Aware Functions

**New Function**: `computeWeeklyHDJTemplate(weekNumber, year)`

**Purpose**: Dynamically adjusts HDJ template based on DL's state for the specific week

**Logic**:
```javascript
if (DL is on MPO this week) {
  return full_HDJ_template  // All 6 slots available (Tue/Thu/Fri, AM+PM)
} else if (DL is on HDJ this week) {
  return HDJ_template_minus_DL_slots  // Only 3 slots (Friday only)
}
```

**Updated Function**: `generateDoctorRotations()` now accepts `weekNumber` and `year` parameters

**Special DL Handling**:
- When `doctorCode === "DL"`, looks up the week's state
- Selects the appropriate backbone (HDJ or MPO) dynamically
- Logs: `📊 DL backbone for 2024-W44: HDJ`

#### 3. **customPlanningLogic.js** - Week-by-Week Generation

**New Function**: `generateWeekByWeekSchedules()`

**Purpose**: Replaces period-based generation with week-by-week processing

**Process**:
1. For each week in 2024-2025:
   - Get period info for regular doctors
   - Get DL state for this week
   - Generate schedules with week parameters
   - Store weekly schedule with full metadata

**Integration**: `executeCustomPlanningAlgorithm()` now uses:
```javascript
const weeklySchedules = generateWeekByWeekSchedules(...)
const periodicSchedule = convertWeeklySchedulesToPeriodFormat(weeklySchedules)
```

#### 4. **testPeriodSystem.js** - Comprehensive Test Suite

**Available Tests**:
1. `testPeriodSystemInit()` - Validates holiday parsing and period generation
2. `testDLRhythm()` - Validates DL's 2-week alternation
3. `testWeekAwareHDJ()` - Validates dynamic HDJ template adjustment
4. `testRegularDoctorPeriods()` - Validates period mapping for regular doctors
5. `testFullSystemIntegration()` - Full end-to-end test

**Usage**:
```javascript
// In browser console
window.testPeriodSystem.runAllTests()
window.testPeriodSystem.quickTest()
```

## Data Flow

```
publicHolidays.js
       ↓
periodCalculator.js
  ↓            ↓
  |            getDLStateForWeek(week, year)
  |                   ↓
  |            computeWeeklyHDJTemplate(week, year)
  |                   ↓
  |            generateDoctorRotations(doctorCode, ..., week, year)
  |                   ↓
  getRegularDoctorPeriod(week, year)
       ↓
generateWeekByWeekSchedules()
       ↓
executeCustomPlanningAlgorithm()
```

## Example Week Calculation

### Week 2024-W44 (First week)

**Regular Doctors**:
- Period Info: `{periodId: "P1", periodNumber: 1, parentPeriod: "After Vacances de la Toussaint", weekInPeriod: 1, totalWeeksInPeriod: 3}`
- Rotation Index: 0 (first period)
- Activity assignment from rotation cycle

**DL**:
- State: `{state: "HDJ", cycleNumber: 1, weekInCycle: 1}`
- Backbone: `doctorProfiles.DL.backbones.HDJ`

**HDJ Template for Others**:
```javascript
// Base HDJ template: Tue/Thu/Fri (AM+PM) = 6 slots
// DL covers: Tue/Thu (AM+PM) = 4 slots
// Remaining: Friday (AM+PM) = 2 slots

{
  Monday: { "9am-1pm": [], "2pm-6pm": [] },
  Tuesday: { "9am-1pm": [], "2pm-6pm": [] },  // ← DL covers this
  Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
  Thursday: { "9am-1pm": [], "2pm-6pm": [] }, // ← DL covers this
  Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] }  // ← Available for others
}
```

### Week 2024-W46 (Third week)

**Regular Doctors**:
- Period Info: `{periodId: "P1", periodNumber: 1, parentPeriod: "After Vacances de la Toussaint", weekInPeriod: 3, totalWeeksInPeriod: 3}`
- Rotation Index: 0 (still first period)

**DL**:
- State: `{state: "MPO", cycleNumber: 2, weekInCycle: 1}`
- Backbone: `doctorProfiles.DL.backbones.MPO`

**HDJ Template for Others**:
```javascript
// Base HDJ template: Tue/Thu/Fri (AM+PM) = 6 slots
// DL covers: NONE (on MPO this week)
// Remaining: ALL 6 slots available

{
  Monday: { "9am-1pm": [], "2pm-6pm": [] },
  Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },  // ← Available
  Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
  Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] }, // ← Available
  Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] }    // ← Available
}
```

## Configuration Parameters

All configuration is centralized in `periodCalculator.js`:

```javascript
export const scheduleConfig = {
  DL: {
    rhythmType: "fixed",      // Fixed rhythm type
    cycleWeeks: 2,            // Duration of each cycle
    startWeek: 44,            // Starting week number
    startYear: 2024,          // Starting year
    startState: "HDJ",        // Initial state
    states: ["HDJ", "MPO"]    // Available states
  },
  regularDoctors: {
    rhythmType: "holiday-based",  // Based on holidays
    divisionFactor: 2,            // Divide inter-holiday by 2
    minWeeks: 2,                  // Minimum period duration
    maxWeeks: 6                   // Maximum period duration
  }
}
```

**To modify**:
1. Change DL's cycle duration: `cycleWeeks: 3` for 3-week cycles
2. Change division factor: `divisionFactor: 3` for thirds instead of halves
3. Change min/max constraints: `minWeeks: 1, maxWeeks: 4`

## Benefits

✅ **Simple Parameters**: Just configure weeks and division factors
✅ **Automatic Calculation**: Holiday periods calculated automatically from calendar
✅ **Accurate HDJ Distribution**: No overlaps or gaps in HDJ coverage
✅ **Independent Rhythms**: DL and regular doctors operate on separate systems
✅ **Flexible**: Easy to adjust period lengths and cycle durations
✅ **Maintainable**: All logic centralized and well-documented
✅ **Testable**: Comprehensive test suite validates all functionality

## Migration from Old System

The new system is integrated but backward compatible:

**Old way** (period-based):
```javascript
const periodicSchedule = createPeriodicVariations(...)
```

**New way** (week-based with automatic conversion):
```javascript
const weeklySchedules = generateWeekByWeekSchedules(...)
const periodicSchedule = convertWeeklySchedulesToPeriodFormat(weeklySchedules)
```

**Result structure** includes both:
- `result.periodicSchedule` - Period-based format (for backward compatibility)
- `result.weeklySchedules` - Week-by-week format (new granular data)

## Debugging

**Console Functions** (available in browser):

```javascript
// Run all tests
window.testPeriodSystem.runAllTests()

// Quick overview
window.testPeriodSystem.quickTest()

// Print full system details
window.testPeriodSystem.debugPrintPeriodSystem()

// Individual tests
window.testPeriodSystem.testDLRhythm()
window.testPeriodSystem.testWeekAwareHDJ()
```

**Console Logs**:
- `🗓️ Initializing Period System...` - Period calculation start
- `📅 Generating schedule for 2024-W44...` - Week generation start
- `📊 DL backbone for 2024-W44: HDJ` - DL state selection
- `✅ Using week-aware HDJ template for 2024-W44` - HDJ adjustment

## Example Output

```
📅 DL State Sequence:

  2024-W44: HDJ (Cycle 1, Week 1/2)
  2024-W45: HDJ (Cycle 1, Week 2/2)
  2024-W46: MPO (Cycle 2, Week 1/2)
  2024-W47: MPO (Cycle 2, Week 2/2)
  2024-W48: HDJ (Cycle 3, Week 1/2)
  2024-W49: HDJ (Cycle 3, Week 2/2)
  2024-W50: MPO (Cycle 4, Week 1/2)
  2024-W51: MPO (Cycle 4, Week 2/2)
  2024-W52: HDJ (Cycle 5, Week 1/2)

✅ DL rhythm validated: Correct 2-week alternation
```

## Future Enhancements

Potential improvements:
1. **UI Integration**: Add period/DL state indicators to calendar view
2. **Dynamic Configuration**: Allow users to modify `scheduleConfig` from UI
3. **Advanced Validation**: Add more comprehensive conflict detection
4. **Export Functions**: Export weekly/period summaries to Excel
5. **Visual Timeline**: Show DL rhythm and period boundaries graphically

## Technical Notes

- Uses ISO week numbers (1-52)
- Handles year transitions correctly (2024-W52 → 2025-W01)
- All dates use `date-fns` for consistency
- Deep cloning prevents mutation bugs
- Lazy loading of period system (initialized once on first use)
- All functions are pure (no side effects except logging)

## Support

For questions or issues:
1. Check console logs for detailed execution trace
2. Run test suite: `window.testPeriodSystem.runAllTests()`
3. Review this document for architecture details
4. Check `periodCalculator.js` for configuration options
