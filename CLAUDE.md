# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

### Testing
No test framework is currently configured in this project.

## Architecture

This is a React + Vite application for medical scheduling management called "MIMI planning". The application helps manage doctor schedules, workloads, and calendar planning for medical activities.

### Core Structure

**Main Components:**
- `App.jsx` - Root component that renders the main application layout with ScheduleProvider
- `Calendar.jsx` - Primary calendar component that displays yearly medical schedules
- `Workload.jsx` - Component for displaying workload charts and analytics
- `DocAgendaSetting.jsx` - Doctor agenda configuration component
- `ExcelExport.jsx` - Handles Excel file export functionality

**State Management:**
- `ScheduleContext.jsx` - React Context for managing schedule state across components
- `schedule.jsx` - Contains core scheduling logic, activity definitions, and doctor schedule configurations

**Scenario System:**
- `ScenarioComparison.jsx` - Scenario comparison component with radar chart visualization
- `scenarioConfigs.json` - Scenario definitions with configuration changes
- `scenarioEngine.js` - Applies scenario changes to base configuration

### Key Features

1. **Medical Activity Scheduling**: Manages different medical activities (HTC1, HTC2, EMIT, HDJ, AMI, etc.) with specific time slots (9am-1pm, 2pm-6pm)

2. **Multi-Year Calendar View**: Displays calendars for both 2024 and 2025 with medical scheduling

3. **Doctor Schedule Management**: Tracks doctor availability and assignments across different activities

4. **Workload Analytics**: Provides visual charts and analytics for workload distribution

5. **Excel Export**: Allows exporting schedule data to Excel format

6. **Public Holiday Integration**: Uses `publicHolidays.js` for holiday management

7. **Scenario Comparison System**: Dynamic scenario management with visual comparison
   - Multiple pre-configured scenarios (AMI duration changes, conflict resolution order, rotation cycles, etc.)
   - Real-time metrics calculation (workload equity, activity coverage, TeleCs coverage)
   - Radar chart visualization for comparing scenarios side-by-side
   - Apply scenarios to reconfigure the entire schedule dynamically

8. **Period-Based Configuration System**: Time-based configuration management
   - Define different configurations for specific date ranges (by week/year)
   - Automatic configuration switching based on current week during schedule generation
   - Doctor availability changes per period (e.g., doctor on TP during vacation)
   - Rotation cycle adjustments per period
   - Visual period headers in calendar view and Excel exports
   - Validation for gaps and overlaps between periods

### Technical Details

**Dependencies:**
- React 18.3.1 with TypeScript support
- Vite for build tooling
- Firebase (currently commented out but configured)
- Chart.js via react-chartjs-2 for analytics
- date-fns for date manipulation
- ExcelJS and XLSX for Excel functionality

**File Structure:**
- Mixed JSX and TSX files (transitioning to TypeScript)
- CSS modules for styling
- Commented out Firebase integration (ready for re-enabling)
- `doctorSchedules.js` (renamed from trash.js) - Core doctor scheduling configuration
- `periodConfigs.json` - Period-based configuration definitions
- `periodConfigEngine.js` - Period configuration management engine

**Color Coding System:**
Activities use specific color codes defined in schedule.jsx for visual differentiation in the calendar interface.

**Time Slot Management:**
The application uses a structured approach with predefined time slots and expected activities per day of the week.

## Period Configuration System

The application supports time-based configuration periods, allowing different settings for different date ranges throughout the year. This enables flexible scenario planning for doctor absences, seasonal adjustments, and temporary schedule changes.

### Overview

**Location:** `src/periodConfigs.json`
**Engine:** `src/periodConfigEngine.js`
**Integration:** `ScheduleContext.jsx`, `customPlanningLogic.js`, `Calendar.jsx`, `ExcelExport.jsx`

The period configuration system applies different settings to specific time periods (defined by week/year ranges). For each week during schedule generation, the system:
1. Looks up the applicable period configuration
2. Applies period-specific changes to base settings
3. Generates the schedule using modified configuration
4. Displays period information in calendar view and Excel exports

### Configuration Structure

Each period in `periodConfigs.json` includes:

```json
{
  "id": "unique-period-id",
  "name": "Display Name",
  "description": "Human-readable description shown in UI and exports",
  "dateRange": {
    "startWeek": 1,
    "startYear": 2026,
    "endWeek": 52,
    "endYear": 2026
  },
  "isDefault": false,
  "changes": {
    "doctorProfiles.DOCTOR.backbone.Monday.9am-1pm": ["replace", ["TP"]],
    "currentRotationCycle": "NoMG"
  }
}
```

**Required Fields:**
- `id` - Unique identifier for the period
- `name` - Display name shown in calendar headers and Excel
- `description` - Explanation of what this period represents
- `dateRange` - Start/end weeks (ISO week numbers 1-53) and years
- `changes` - Configuration modifications to apply (uses scenario engine format)

**Optional Fields:**
- `isDefault` - Set to `true` for the fallback period (exactly one required)

### How It Works

**Week-by-Week Processing:**
1. During schedule generation, for each week the system queries `getPeriodConfigForWeek(week, year)`
2. Non-default (specific) periods take precedence over the default period
3. Period changes are applied using the scenario engine (`applyPeriodConfig()`)
4. Modified configuration is used for that week's schedule generation

**Visual Display:**
- Calendar view shows period headers with names and descriptions at period boundaries
- Excel exports include period headers with blue styling
- Period changes are clearly visible to users

**Validation:**
The system validates on load:
- Exactly one default period exists
- Week numbers are valid (1-53)
- Start week comes before end week
- Warns about overlapping periods (first match wins)

### Adding New Time Periods

To add more time periods, edit `/src/periodConfigs.json`:

```json
{
  "id": "summer-vacation-2026",
  "name": "Summer Vacation Coverage",
  "description": "Reduced staffing during July-August vacation period",
  "dateRange": {
    "startWeek": 27,
    "startYear": 2026,
    "endWeek": 35,
    "endYear": 2026
  },
  "changes": {
    "doctorProfiles.FL.backbone.Monday.9am-1pm": ["replace", ["TP"]],
    "currentRotationCycle": "reduced_summer_cycle"
  }
}
```

### Configurable Parameters

All configuration parameters can be modified per period:

**Doctor Schedules** (`doctorProfiles.*`):
- `doctorProfiles.DOCTOR.backbone.Day.TimeSlot` - Fixed schedule for specific doctor/day/time
- Set to `["TP"]` to mark doctor as unavailable (temps partiel)
- Supports array operations: `["replace", ["TP"]]`, `["add", ["NewActivity"]]`, `["remove", ["Activity"]]`

**Activity Durations** (`docActivities.*`):
- `docActivities.AMI.duration` - Change activity duration (e.g., 1 → 2 hours)
- `docActivities.HDJ.duration` - Modify any activity duration

**Rotation Cycles** (`currentRotationCycle`):
- Switch to different rotation cycle (e.g., `"NoMG"` when doctor MG unavailable)
- Must reference existing rotation cycle defined in `customPlanningLogic.js`

**And More:**
- Any configuration accessible via scenario engine path notation
- See `scenarioEngine.js` for supported path formats

### Use Cases

**Common scenarios for period configurations:**

1. **Doctor Vacations/Absences**
   - Set doctor schedule to TP for vacation weeks
   - Switch to rotation cycle that excludes the absent doctor
   - Example: MG unavailable April-August (weeks 14-35)

2. **Seasonal Adjustments**
   - Reduce activities during summer vacation period
   - Increase coverage during busy medical seasons
   - Adjust rotation patterns for school holidays

3. **Temporary Schedule Changes**
   - Short-term rotation cycle modifications
   - Activity duration adjustments for specific periods
   - Coverage pattern changes for conferences or training

4. **Multi-Year Planning**
   - Define different settings for 2024, 2025, 2026
   - Plan ahead for known schedule changes
   - Maintain historical configurations

### Best Practices

- **Use descriptive names and descriptions** - These appear in the UI and help users understand what's active
- **Define a comprehensive default period** - Covers the entire year as fallback
- **Avoid overlapping periods** - First match wins; use specific date ranges
- **Test rotation cycles exist** - Verify `currentRotationCycle` references valid cycles
- **Document period purpose** - Use descriptions to explain why the period exists

## Refactored Architecture (New Simplified System)

The medical scheduling system has been refactored to improve maintainability and prepare for adding new doctors:

### Key Improvements:
- **Reduced Complexity**: From 48 redundant combinations to 18 unique rotation cycles (62.5% reduction)
- **Better Organization**: `doctorSchedules.js` contains all doctor templates and rotation definitions
- **Algorithmic Assignment**: Week-to-rotation mapping is now computed rather than hard-coded
- **Easier Maintenance**: Adding new doctors or modifying schedules requires minimal code changes

### Switching to New System:
To use the simplified system, replace in Calendar.jsx:
```javascript
// Old system
const originalSchedule = doctorsSchedule(doc);

// New simplified system
const originalSchedule = simplifiedDoctorsSchedule(doc);
```

### Adding New Doctors:
1. Add doctor templates to `doctorSchedules.js` in the `docChunks` section
2. Define rotation patterns in the `doc` object
3. Add the doctor to rotation cycles in `simplifiedRotationCycles`
4. The system automatically generates the complete calendar

### Benefits for New Doctor Integration:
- **Single Point of Change**: Doctor additions only require updates in `doctorSchedules.js`
- **Validated Coverage**: The system ensures all medical activities remain covered
- **Flexible Rotation**: Easy to experiment with different rotation patterns
- **Reduced Risk**: Less code to modify means fewer chances for errors