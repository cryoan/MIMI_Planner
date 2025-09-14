// Browser console test for strict round robin system
// This file can be imported and run in the browser to test the strict algorithm

export async function runStrictTestInBrowser() {
  console.log('🏥 STRICT ROUND ROBIN BROWSER TEST');
  console.log('==================================');
  
  try {
    // Import modules dynamically
    const strictModule = await import('./strictRoundRobinPlanning.js');
    const doctorModule = await import('./doctorSchedules.js');
    
    console.log('✅ Modules loaded successfully');
    
    // Test 1: Show available doctors and their rotation settings
    console.log('\n👨‍⚕️ AVAILABLE DOCTORS & ROTATION SETTINGS:');
    strictModule.AVAILABLE_DOCTORS.forEach(doctorCode => {
      const doctorProfile = doctorModule.doctorProfiles[doctorCode];
      const rotationSetting = doctorProfile?.rotationSetting || [];
      console.log(`   ${doctorCode}: [${rotationSetting.join(', ')}]`);
    });
    
    // Test 2: Coverage gap analysis
    console.log('\n🔍 COVERAGE GAP ANALYSIS:');
    const gapAnalysis = strictModule.analyzeCoverageGaps();
    console.log(`   Total activities: ${strictModule.ALL_ACTIVITIES.length}`);
    console.log(`   Covered activities: ${gapAnalysis.coveredActivities}`);
    console.log(`   Uncovered activities: ${gapAnalysis.uncoveredActivities.length}`);
    
    if (gapAnalysis.uncoveredActivities.length > 0) {
      console.log('\n🚨 Activities with NO qualified doctors:');
      gapAnalysis.uncoveredActivities.forEach(activity => {
        console.log(`     • ${activity}`);
      });
    }
    
    // Test 3: Show activity coverage
    console.log('\n📋 ACTIVITY COVERAGE (Strict Mode):');
    strictModule.ALL_ACTIVITIES.forEach(activity => {
      const qualifiedDoctors = strictModule.getQualifiedDoctorsStrict(activity);
      const status = qualifiedDoctors.length > 0 ? '✅' : '❌';
      console.log(`   ${status} ${activity}: ${qualifiedDoctors.length} doctors [${qualifiedDoctors.join(', ')}]`);
    });
    
    // Test 4: Rotation boundaries
    console.log('\n📅 ROTATION BOUNDARIES:');
    const boundaries = strictModule.calculateRotationBoundaries();
    boundaries.slice(0, 5).forEach((period, index) => {
      console.log(`   ${index + 1}. ${period.name}: ${period.durationWeeks} weeks`);
    });
    console.log(`   ... and ${boundaries.length - 5} more rotation periods`);
    
    // Test 5: Generate a sample strict schedule (just first rotation)
    console.log('\n🎯 SAMPLE STRICT ROTATION:');
    if (boundaries.length > 0) {
      const sampleRotation = strictModule.generateStrictRotationScenario(
        strictModule.AVAILABLE_DOCTORS.slice(0, 4), // First 4 doctors for testing
        boundaries[0],
        0
      );
      
      console.log(`   Rotation: ${sampleRotation.rotationPeriod.name}`);
      console.log('   Primary Activity Assignments:');
      Object.entries(sampleRotation.rotationAssignments).forEach(([doctor, activity]) => {
        console.log(`     ${doctor} → ${activity}`);
      });
    }
    
    console.log('\n✅ STRICT ROUND ROBIN BROWSER TEST COMPLETED');
    console.log('============================================');
    
    return {
      gapAnalysis,
      boundaries,
      doctorCount: strictModule.AVAILABLE_DOCTORS.length,
      activityCount: strictModule.ALL_ACTIVITIES.length,
      uncoveredActivities: gapAnalysis.uncoveredActivities
    };
    
  } catch (error) {
    console.error('❌ Error in strict round robin browser test:', error);
    return { error: error.message };
  }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  // Make it available globally
  window.runStrictTest = runStrictTestInBrowser;
  console.log('Strict Round Robin browser test loaded. Run with: runStrictTest()');
}