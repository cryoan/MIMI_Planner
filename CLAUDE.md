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

**Color Coding System:**
Activities use specific color codes defined in schedule.jsx for visual differentiation in the calendar interface.

**Time Slot Management:**
The application uses a structured approach with predefined time slots and expected activities per day of the week.

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