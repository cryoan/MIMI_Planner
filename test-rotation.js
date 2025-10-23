// Test script for TP Rotation
import { calculateTPRotationForWeek, getRotationSummary } from './src/tpRotationEngine.js';
import { initializePeriodSystem } from './src/periodCalculator.js';

console.log('='.repeat(80));
console.log('TP ROTATION TEST - 2026 Full Year Analysis');
console.log('='.repeat(80));

// Initialize period system
initializePeriodSystem();

// Test first 15 weeks of 2026
console.log('\n📊 Testing first 15 weeks of 2026:\n');

for (let week = 1; week <= 15; week++) {
  const rotation = calculateTPRotationForWeek(week, 2026);

  const vacationFlag = rotation.isVacationWeek ? '🏖️  VACATION' : '💼 Working';
  const doctorInfo = rotation.doctorToSwap
    ? `${rotation.doctorToSwap} (${rotation.swapConfig.originalTPDay} → ${rotation.swapConfig.swapToDay})`
    : 'Nobody';

  const elapsedStr = rotation.weeksElapsed !== undefined ? String(rotation.weeksElapsed).padStart(2, ' ') : 'N/A';
  const indexStr = rotation.doctorIndex !== undefined ? `${rotation.doctorIndex}/5` : 'N/A';

  console.log(
    `Week ${String(week).padStart(2, '0')}: ${vacationFlag} | ` +
    `Elapsed: ${elapsedStr} | ` +
    `Index: ${indexStr} | ` +
    `Doctor: ${doctorInfo}`
  );
}

// Test for weeks around typical vacation periods
console.log('\n📊 Testing weeks 6-10 (Feb vacation period):\n');
for (let week = 6; week <= 10; week++) {
  const rotation = calculateTPRotationForWeek(week, 2026);
  console.log(
    `Week ${week}: ${rotation.isVacationWeek ? 'VACATION' : 'Working'} | ` +
    `Elapsed: ${rotation.weeksElapsed} | ` +
    `Doctor: ${rotation.doctorToSwap || 'None'}`
  );
}

// Get full year summary
console.log('\n📊 Full Year Rotation Summary:\n');
const summary = getRotationSummary(1, 2026, 52);

// Count swaps per doctor
const swapCounts = {};
const rotationOrder = ['YC', 'BM', 'FL', 'MG', 'MDLC'];
rotationOrder.forEach(doc => swapCounts[doc] = 0);

let vacationWeeks = 0;
let workingWeeks = 0;

summary.forEach(entry => {
  if (entry.isVacationWeek) {
    vacationWeeks++;
  } else if (entry.doctorToSwap) {
    swapCounts[entry.doctorToSwap]++;
    workingWeeks++;
  }
});

console.log('Vacation weeks:', vacationWeeks);
console.log('Working weeks:', workingWeeks);
console.log('\nSwaps per doctor:');
rotationOrder.forEach(doc => {
  console.log(`  ${doc}: ${swapCounts[doc]} swaps`);
});

// Check for consecutive swaps (bug indicator)
console.log('\n⚠️  Checking for consecutive swaps (should be NONE):');
let consecutiveIssues = [];
for (let i = 0; i < summary.length - 1; i++) {
  const current = summary[i];
  const next = summary[i + 1];

  if (!current.isVacationWeek && !next.isVacationWeek &&
      current.doctorToSwap && next.doctorToSwap &&
      current.doctorToSwap === next.doctorToSwap) {
    consecutiveIssues.push({
      doctor: current.doctorToSwap,
      week1: current.week,
      week2: next.week
    });
  }
}

if (consecutiveIssues.length === 0) {
  console.log('✅ No consecutive swaps found - rotation is working correctly!');
} else {
  console.log(`❌ Found ${consecutiveIssues.length} consecutive swap issues:`);
  consecutiveIssues.forEach(issue => {
    console.log(`   ${issue.doctor}: weeks ${issue.week1} and ${issue.week2}`);
  });
}

// Show rotation pattern for working weeks
console.log('\n📋 Rotation Pattern (first 20 working weeks):');
let workingWeekCount = 0;
let weekNum = 1;
while (workingWeekCount < 20 && weekNum <= 52) {
  const rotation = calculateTPRotationForWeek(weekNum, 2026);
  if (!rotation.isVacationWeek) {
    workingWeekCount++;
    console.log(`  ${String(workingWeekCount).padStart(2, '0')}. Week ${String(weekNum).padStart(2, '0')}: ${rotation.doctorToSwap}`);
  }
  weekNum++;
}

console.log('\n' + '='.repeat(80));
console.log('Test Complete');
console.log('='.repeat(80));
