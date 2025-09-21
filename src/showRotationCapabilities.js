import { doctorProfiles } from './doctorSchedules.js';
import { buildRotationAvailability, generateCompleteSimplifiedSchedule } from './simplifiedRoundRobinPlanner.js';

console.log('=== Doctor Rotation Capabilities (from rotationSetting) ===\n');

// Show what rotations each doctor can do
Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
  if (profile.rotationSetting && profile.rotationSetting.length > 0) {
    console.log(`${doctorCode}: ${profile.rotationSetting.join(', ')}`);
  } else {
    console.log(`${doctorCode}: No rotations defined`);
  }
});

console.log('\n=== Rotation Availability (inverted structure) ===\n');

// Show which doctors can do each rotation
const rotationAvailability = buildRotationAvailability();
Object.entries(rotationAvailability).forEach(([rotation, doctors]) => {
  console.log(`${rotation}: ${doctors.join(', ')} (${doctors.length} doctors)`);
});

console.log('\n=== Round Robin Assignments by Time Period ===\n');

// Show actual assignments for each time period
try {
  const completeSchedule = generateCompleteSimplifiedSchedule();

  Object.entries(completeSchedule).forEach(([timeframeName, timeframeData]) => {
    console.log(`${timeframeName}:`);

    const assignments = timeframeData.rotationAssignments;

    // Group by doctor to show what each doctor is assigned
    const doctorAssignments = {};
    Object.entries(assignments).forEach(([rotation, doctor]) => {
      if (!doctorAssignments[doctor]) {
        doctorAssignments[doctor] = [];
      }
      doctorAssignments[doctor].push(rotation);
    });

    // Sort doctors alphabetically and show their assignments
    Object.keys(doctorAssignments)
      .sort()
      .forEach(doctor => {
        const rotations = doctorAssignments[doctor];
        console.log(`  ${doctor}: ${rotations.join(', ')}`);
      });

    console.log(''); // Empty line between periods
  });

} catch (error) {
  console.error('Error generating assignments:', error.message);
}

export { rotationAvailability };