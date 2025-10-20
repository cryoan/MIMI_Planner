// Quick debug script to check period detection
import { initializePeriodSystem } from './src/periodCalculator.js';

console.log('\n=== DEBUGGING PERIOD SYSTEM ===\n');

const periodSystem = initializePeriodSystem();

console.log(`\n📅 Holiday Periods Found: ${periodSystem.holidayPeriods.length}`);
periodSystem.holidayPeriods.forEach(p => {
  console.log(`  ${p.name}: ${p.startYear}-W${p.startWeek} to ${p.endYear}-W${p.endWeek}`);
});

console.log(`\n📊 Inter-Holiday Periods: ${periodSystem.interHolidayPeriods.length}`);
periodSystem.interHolidayPeriods.forEach(p => {
  console.log(`  ${p.periodName}: ${p.startYear}-W${p.startWeek} to ${p.endYear}-W${p.endWeek} (${p.durationWeeks} weeks)`);
});

console.log(`\n✂️ Half-Periods (3-4 week chunks): ${periodSystem.halfPeriods.length}`);
const periods2026 = periodSystem.halfPeriods.filter(p => p.startYear === 2026).slice(0, 10);
console.log('First 10 periods in 2026:');
periods2026.forEach(p => {
  console.log(`  ${p.periodId}: W${p.startWeek} (${p.durationWeeks} weeks) - ${p.parentPeriod}`);
});

console.log('\n=== END DEBUG ===\n');
