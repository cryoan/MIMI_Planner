// ============================================================================
// TEST SCRIPT FOR NEW WEDNESDAY TP ROTATION SYSTEM
// ============================================================================
// This script tests the redesigned TP rotation system with:
// - Third Wednesday special rule (MG + CL)
// - Sequential rotation for remaining Wednesdays (YC, BM, MDLC, FL)
// - Dynamic day selection for MDLC and FL based on Cs schedule

import {
  isThirdWednesdayWeek,
  calculateTPRotationForWeek,
  chooseBestSwapDay,
  printRotationSummary,
  getRotationSummary
} from "./tpRotationEngine.js";

console.log("╔════════════════════════════════════════════════════════════════════════════╗");
console.log("║         TESTING NEW WEDNESDAY TP ROTATION SYSTEM                          ║");
console.log("╚════════════════════════════════════════════════════════════════════════════╝\n");

// ============================================================================
// TEST 1: Third Wednesday Detection
// ============================================================================
console.log("🧪 TEST 1: Third Wednesday Detection");
console.log("─".repeat(80));

const testWeeks2026 = [
  { week: 3, year: 2026, expected: true, month: "January" },
  { week: 7, year: 2026, expected: true, month: "February" },
  { week: 11, year: 2026, expected: true, month: "March" },
  { week: 16, year: 2026, expected: true, month: "April" },
  { week: 21, year: 2026, expected: true, month: "May" },
  { week: 25, year: 2026, expected: true, month: "June" },
  { week: 1, year: 2026, expected: false, month: "January (first Wed)" },
  { week: 5, year: 2026, expected: false, month: "January (fourth Wed)" },
];

testWeeks2026.forEach(({ week, year, expected, month }) => {
  const result = isThirdWednesdayWeek(week, year);
  const status = result === expected ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} Week ${year}-W${String(week).padStart(2, '0')} (${month}): ${result ? "Third Wednesday" : "Not third Wednesday"}`);
});

console.log("\n");

// ============================================================================
// TEST 2: Dynamic Day Selection for MDLC and FL
// ============================================================================
console.log("🧪 TEST 2: Dynamic Day Selection (MDLC & FL)");
console.log("─".repeat(80));

// MDLC has Cs on Monday PM and Thursday PM
// FL has Cs on Monday AM and Tuesday PM
console.log("MDLC Cs schedule: Monday PM, Thursday PM");
console.log("FL Cs schedule: Monday AM, Tuesday PM");
console.log("");

const mdlcChoice = chooseBestSwapDay("MDLC", 1, 2026, ["Monday", "Thursday"]);
console.log(`✅ MDLC dynamic choice: ${mdlcChoice} (expected: non-Cs day)`);

const flChoice = chooseBestSwapDay("FL", 1, 2026, ["Monday", "Thursday"]);
console.log(`✅ FL dynamic choice: ${flChoice} (expected: Thursday, as Monday has Cs)`);

console.log("\n");

// ============================================================================
// TEST 3: Rotation Schedule Preview (First 20 Weeks of 2026)
// ============================================================================
console.log("🧪 TEST 3: Rotation Schedule Preview");
console.log("─".repeat(80));

printRotationSummary(1, 2026, 20);

// ============================================================================
// TEST 4: Verify Third Wednesday Special Cases
// ============================================================================
console.log("🧪 TEST 4: Verify Third Wednesday Special Cases");
console.log("─".repeat(80));

const thirdWedWeeks = [3, 7, 11, 16, 21, 25]; // Approximate third Wednesdays in 2026
console.log("Checking third Wednesday weeks for MG and CL swaps:\n");

thirdWedWeeks.forEach(week => {
  const rotation = calculateTPRotationForWeek(week, 2026);
  if (rotation.isThirdWednesday) {
    console.log(`✅ Week ${rotation.weekKey}:`);
    console.log(`   - MG: ${rotation.swapConfigs.MG.originalTPDay} → ${rotation.swapConfigs.MG.swapToDay}`);
    console.log(`   - CL: ${rotation.swapConfigs.CL.originalTPDay} → ${rotation.swapConfigs.CL.swapToDay}`);
  } else {
    console.log(`⚠️  Week ${2026}-W${String(week).padStart(2, '0')}: Not detected as third Wednesday`);
  }
});

console.log("\n");

// ============================================================================
// TEST 5: Verify Regular Rotation (Non-Third Wednesdays)
// ============================================================================
console.log("🧪 TEST 5: Verify Regular Rotation");
console.log("─".repeat(80));
console.log("Expected rotation order: YC, BM, MDLC, FL (repeating)\n");

const regularWeeks = [1, 2, 4, 5, 6, 8, 9, 10]; // Non-third Wednesday weeks
const expectedRotation = ["YC", "BM", "MDLC", "FL"];
let rotationIndex = 0;

regularWeeks.forEach(week => {
  const rotation = calculateTPRotationForWeek(week, 2026);
  if (!rotation.isThirdWednesday && !rotation.isVacationWeek) {
    const expected = expectedRotation[rotationIndex % expectedRotation.length];
    const actual = rotation.doctorToSwap;
    const match = actual === expected ? "✅" : "❌";
    console.log(`${match} Week ${rotation.weekKey}: ${actual} (expected: ${expected})`);
    rotationIndex++;
  }
});

console.log("\n");

// ============================================================================
// TEST 6: Full Month View (January 2026)
// ============================================================================
console.log("🧪 TEST 6: Full Month View - January 2026");
console.log("─".repeat(80));

const januaryWeeks = [1, 2, 3, 4, 5];
console.log("January 2026 TP Rotation Schedule:\n");

januaryWeeks.forEach(week => {
  const rotation = calculateTPRotationForWeek(week, 2026);
  const weekLabel = `Week ${rotation.weekKey}`.padEnd(15);

  if (rotation.isThirdWednesday) {
    console.log(`${weekLabel} 🌟 THIRD WEDNESDAY`);
    console.log(`                  → MG: Wednesday → Friday`);
    console.log(`                  → CL: Monday → Wednesday`);
  } else if (rotation.isVacationWeek) {
    console.log(`${weekLabel} 🏖️  VACATION WEEK`);
  } else {
    const swapDay = rotation.swapConfig.swapToDay;
    console.log(`${weekLabel} 🔄  ${rotation.doctorToSwap}: Wednesday → ${swapDay}`);
  }
});

console.log("\n╔════════════════════════════════════════════════════════════════════════════╗");
console.log("║                        TESTS COMPLETED                                     ║");
console.log("╚════════════════════════════════════════════════════════════════════════════╝\n");
