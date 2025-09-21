import { generateCompleteSimplifiedSchedule } from './simplifiedRoundRobinPlanner.js';

// Generate a clean overview of rotation assignments per time period
function generateRotationOverview() {
  console.log('=== Simplified Round Robin - Rotation Overview ===\n');

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
    console.error('Error generating overview:', error.message);
  }
}

// Export for use in browser console or other modules
export { generateRotationOverview };

// Auto-run if this file is imported
generateRotationOverview();