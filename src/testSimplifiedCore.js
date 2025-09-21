import {
  buildRotationAvailability,
  assignRotationsForTimeframe,
  generateCompleteSimplifiedSchedule
} from './simplifiedRoundRobinPlanner.js';
import { calculateRotationBoundaries } from './strictRoundRobinPlanning.js';

// Test the core functionality without JSX dependencies
console.log('=== Testing Simplified Round Robin Core ===');

// Test 1: Build rotation availability mapping
console.log('\n1. Testing rotation availability mapping:');
const rotationAvailability = buildRotationAvailability();
console.log('Rotation Availability:', rotationAvailability);

// Show some statistics
const rotationCount = Object.keys(rotationAvailability).length;
const doctorCounts = Object.values(rotationAvailability).map(doctors => doctors.length);
const avgDoctorsPerRotation = doctorCounts.reduce((a, b) => a + b, 0) / rotationCount;

console.log(`\nStatistics:`);
console.log(`- Total rotations: ${rotationCount}`);
console.log(`- Average doctors per rotation: ${avgDoctorsPerRotation.toFixed(1)}`);
console.log(`- Rotation distribution:`);
Object.entries(rotationAvailability).forEach(([rotation, doctors]) => {
  console.log(`  ${rotation}: ${doctors.join(', ')} (${doctors.length} doctors)`);
});

// Test 2: Test rotation boundaries
console.log('\n2. Testing rotation boundaries:');
const boundaries = calculateRotationBoundaries();
console.log(`Found ${boundaries.length} rotation periods:`);
boundaries.slice(0, 3).forEach(period => {
  console.log(`- ${period.name}: ${period.durationWeeks} weeks (${period.startDate.toDateString()} to ${period.endDate.toDateString()})`);
});

// Test 3: Test timeframe assignment
console.log('\n3. Testing timeframe assignment:');
if (boundaries.length > 0) {
  const firstPeriod = boundaries[0];
  const assignment = assignRotationsForTimeframe(firstPeriod, 0);

  console.log(`Assignments for ${firstPeriod.name}:`);
  Object.entries(assignment.rotationAssignments).forEach(([rotation, doctor]) => {
    console.log(`- ${rotation} → ${doctor}`);
  });

  console.log('\nDoctor workloads:');
  Object.entries(assignment.doctorWorkload).forEach(([doctor, rotations]) => {
    console.log(`- ${doctor}: ${rotations.join(', ')} (${rotations.length} rotations)`);
  });
}

// Test 4: Test complete schedule generation (just assignments)
console.log('\n4. Testing complete schedule generation:');
const completeSchedule = generateCompleteSimplifiedSchedule(3);
console.log(`Generated ${Object.keys(completeSchedule).length} timeframes:`);
Object.keys(completeSchedule).forEach(timeframeName => {
  const assignments = completeSchedule[timeframeName].rotationAssignments;
  const assignmentCount = Object.keys(assignments).length;
  console.log(`- ${timeframeName}: ${assignmentCount} rotation assignments`);
});

console.log('\n=== Core Test Complete ===');