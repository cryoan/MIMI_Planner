# Console Commands to Debug 2026 Rotation Issue

## After refreshing the browser, run these commands in the console:

### 1. View Period Breakdown for 2026
```javascript
console.log("📋 2026 Period Breakdown:");
window.periodBreakdown2026.forEach(p => console.log(p));
```

### 2. Check Week-to-Period Mapping for First 10 Weeks
```javascript
console.log("\n🔍 Week-to-Period Mapping (Weeks 1-10):");
for (let week = 1; week <= 10; week++) {
  const weekKey = `2026-W${week}`;
  const period = window.getRegularDoctorPeriod(week, 2026);
  if (period) {
    console.log(`${weekKey}: Period ${period.periodId} (P#${period.periodNumber}), Week ${period.weekInPeriod}/${period.totalWeeksInPeriod}, Half ${period.halfNumber}`);
  }
}
```

### 3. Analyze MDLC Rotation Pattern
```javascript
console.log("\n🔄 MDLC Activity Rotation Analysis:");
// This will be in the schedule generation logs
// Look for lines like: "🔄 Flexible doctor assignments: { MDLC: 'EMIT', ... }"
```

### 4. Expected vs Actual
**Expected Behavior:**
- Inter-vacation periods should be split into 2 half-periods
- Each half-period should get a different `periodNumber`
- Different `periodNumber` → Different `cycleIndex` → Different activity for MDLC

**To Verify:**
1. Check if Week 1-3 are in one period (e.g., P1)
2. Check if Week 4-6 are in a different period (e.g., P2)
3. Look at console logs during schedule generation to see if MDLC's assigned activity changes between these periods

## Key Console Logs to Look For:

During page load, you should see:
1. `📋 Half-Period Breakdown:` - Shows all periods
2. For each week: `📊 Period details: { periodNumber: X, cycleIndex: Y, ...}`
3. For each week: `🔄 Flexible doctor assignments: { MDLC: 'ACTIVITY_NAME', ... }`

## What to Report:

Please share:
1. Output of command #1 (period breakdown)
2. Output of command #2 (week-to-period mapping)
3. From the console logs: What activity is MDLC assigned to in weeks 1, 4, and 7?
