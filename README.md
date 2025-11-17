# MIMI Planning

A comprehensive medical scheduling management application for coordinating doctor schedules, workloads, and calendar planning for medical activities.

## Overview

MIMI Planning is a React + Vite application that helps manage medical staff schedules across multiple activities, time slots, and periods. The system supports complex rotation patterns, workload analytics, scenario comparison, and flexible time-based configuration management.

## Features

- **📅 Multi-Year Calendar View** - Display and manage schedules for multiple years (2024, 2025, 2026+)
- **👨‍⚕️ Doctor Schedule Management** - Track doctor availability, assignments, and rotation patterns
- **🔄 Rotation Cycles** - Automated rotation through different medical activities
- **⏰ Time-Based Periods** - Configure different settings for specific date ranges (vacations, seasonal changes)
- **📊 Workload Analytics** - Visual charts showing workload distribution and equity
- **🔍 Scenario Comparison** - Compare different scheduling scenarios with radar charts
- **📤 Excel Export** - Export schedules to Excel with formatting and period information
- **🏖️ Holiday Integration** - Automatic handling of public holidays and vacation periods
- **🔄 TP Rotation** - Wednesday part-time rotation system with dynamic swapping

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cryoan/MIMI_Planner.git
cd MIMI_calendar

# Install dependencies
npm install
```

### Running the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

The application will be available at `http://localhost:5173` (or the next available port).

## Configuration

### Period-Based Configurations

The application supports time-based configuration periods, allowing different settings for different date ranges throughout the year.

**Configuration File:** `/src/periodConfigs.json`

#### Adding New Time Periods

To add a new time period, edit `src/periodConfigs.json` and add an entry to the `periodConfigurations` array:

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

#### Configurable Parameters

All configuration parameters can be modified per period:

**Doctor Schedules** (`doctorProfiles.*`):
- Set doctor availability for specific days and time slots
- Example: `"doctorProfiles.MG.backbone.Monday.9am-1pm": ["replace", ["TP"]]`
- Mark doctors as unavailable (TP - temps partiel) during vacations

**Activity Durations** (`docActivities.*`):
- Modify how long activities take
- Example: `"docActivities.AMI.duration": 2`
- Adjust scheduling based on seasonal workload

**Rotation Cycles** (`currentRotationCycle`):
- Switch between different rotation patterns
- Example: `"currentRotationCycle": "NoMG"`
- Use when specific doctors are unavailable

**And more:**
- Conflict resolution order
- Expected activities per day
- Any parameter accessible via the scenario engine

#### Period Configuration Examples

**Doctor Vacation:**
```json
{
  "id": "mg-vacation-april-august",
  "name": "MG en TP (Avril-Août)",
  "description": "MG indisponible d'avril à août - utilisation du cycle NoMG",
  "dateRange": {
    "startWeek": 14,
    "startYear": 2026,
    "endWeek": 35,
    "endYear": 2026
  },
  "changes": {
    "doctorProfiles.MG.backbone.Monday.9am-1pm": ["replace", ["TP"]],
    "doctorProfiles.MG.backbone.Monday.2pm-6pm": ["replace", ["TP"]],
    "currentRotationCycle": "NoMG"
  }
}
```

**Default Period (Required):**
```json
{
  "id": "base-config",
  "name": "Configuration Standard",
  "description": "Configuration par défaut avec tous les médecins actifs",
  "dateRange": {
    "startWeek": 1,
    "startYear": 2026,
    "endWeek": 52,
    "endYear": 2026
  },
  "isDefault": true,
  "changes": {}
}
```

### Doctor Schedules

Doctor schedules are defined in `/src/doctorSchedules.js` with:
- **Backbones**: Fixed weekly schedules
- **Skills**: Activities each doctor can perform
- **Rotation Settings**: Which activities they rotate through
- **Weekly Needs**: TeleCs requirements and constraints

### Activities

Medical activities are configured in `/src/doctorSchedules.js`:
- HTC1/HTC2 - Hospital consultations
- EMIT/EMATIT - Emergency interventions
- HDJ - Day hospital
- AMI - Medical activity
- TeleCs - Teleconsultation
- MPO - Medical practice organization
- TP - Part-time (unavailable)

## Usage

### Viewing Schedules

1. Open the application in your browser
2. Navigate through weeks using the calendar interface
3. Period headers will show when configurations change
4. Colored cells represent different activities
5. Purple highlighting indicates vacation periods

### Comparing Scenarios

1. Navigate to the Scenario Comparison view
2. Select multiple scenarios to compare
3. View radar charts showing metrics like:
   - Workload equity
   - Activity coverage
   - TeleCs coverage
4. Apply scenarios to see their effects on the schedule

### Exporting to Excel

1. Click the Excel Export button
2. The exported file includes:
   - All weeks with formatted schedules
   - Period headers with names and descriptions
   - Color-coded activities
   - Vacation period highlighting

## Architecture

### Technology Stack

- **Frontend**: React 18.3.1
- **Build Tool**: Vite
- **Language**: JavaScript/TypeScript (transitioning)
- **State Management**: React Context API
- **Charts**: Chart.js via react-chartjs-2
- **Date Handling**: date-fns
- **Excel Export**: ExcelJS + XLSX
- **Styling**: CSS Modules

### Key Components

- `App.jsx` - Root application component
- `Calendar.jsx` - Main calendar display with period headers
- `ScheduleContext.jsx` - Global state management
- `Workload.jsx` - Workload analytics and charts
- `ScenarioComparison.jsx` - Scenario comparison interface
- `ExcelExport.jsx` - Excel export functionality

### Core Systems

**Period Configuration Engine** (`periodConfigEngine.js`):
- Manages time-based configuration periods
- Validates period definitions
- Applies configuration changes per week
- Provides period boundary information

**Planning Algorithm** (`customPlanningLogic.js`):
- Week-by-week schedule generation
- Applies period configurations dynamically
- Resolves activity conflicts
- Handles vacation weeks

**Scenario Engine** (`scenarioEngine.js`):
- Applies configuration changes via path notation
- Supports array operations (add, remove, replace)
- Used by both scenarios and period configurations

## Development

### Project Structure

```
src/
├── components/
│   ├── Calendar.jsx          # Main calendar view
│   ├── Workload.jsx          # Analytics dashboard
│   └── ExcelExport.jsx       # Export functionality
├── context/
│   └── ScheduleContext.jsx   # State management
├── config/
│   ├── periodConfigs.json    # Period configurations
│   ├── scenarioConfigs.json  # Scenario definitions
│   ├── doctorSchedules.js    # Doctor templates
│   └── publicHolidays.js     # Holiday data
├── engines/
│   ├── periodConfigEngine.js # Period management
│   ├── scenarioEngine.js     # Scenario application
│   └── customPlanningLogic.js # Core algorithm
└── utils/
    ├── periodCalculator.js   # Period calculations
    └── tpRotationEngine.js   # TP rotation logic
```

### Adding New Features

**Adding a New Doctor:**
1. Update `doctorSchedules.js` with doctor profile
2. Add to rotation cycles in `simplifiedRotationCycles`
3. System automatically generates schedules

**Creating New Scenarios:**
1. Edit `scenarioConfigs.json`
2. Define changes using path notation
3. Scenarios appear in comparison view

**Modifying Periods:**
1. Edit `periodConfigs.json`
2. Add/modify period configurations
3. Changes apply automatically during schedule generation

## Contributing

This is a private medical scheduling application. For questions or issues, please contact the development team.

## License

Proprietary - All rights reserved

---

Built with ❤️ for medical staff scheduling
