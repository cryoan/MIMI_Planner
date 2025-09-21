import { buildRotationAvailability } from './simplifiedRoundRobinPlanner.js';

// Just test the basic rotation mapping without schedule dependencies
console.log('=== Testing Basic Rotation Mapping ===');

try {
  const rotationAvailability = buildRotationAvailability();
  console.log('✅ Rotation availability mapping works!');
  console.log('Rotation Availability:', rotationAvailability);

  // Show some statistics
  const rotationCount = Object.keys(rotationAvailability).length;
  const doctorCounts = Object.values(rotationAvailability).map(doctors => doctors.length);
  const avgDoctorsPerRotation = doctorCounts.reduce((a, b) => a + b, 0) / rotationCount;

  console.log(`\nStatistics:`);
  console.log(`- Total rotations: ${rotationCount}`);
  console.log(`- Average doctors per rotation: ${avgDoctorsPerRotation.toFixed(1)}`);

  console.log(`\nRotation distribution:`);
  Object.entries(rotationAvailability).forEach(([rotation, doctors]) => {
    console.log(`  ${rotation}: ${doctors.join(', ')} (${doctors.length} doctors)`);
  });

} catch (error) {
  console.log('❌ Error testing rotation mapping:', error.message);
}

console.log('\n=== Basic Test Complete ===');