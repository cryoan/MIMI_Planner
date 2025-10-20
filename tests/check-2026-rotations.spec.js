import { test, expect } from '@playwright/test';

test.describe('2026 Schedule and Rotation Analysis', () => {

  test('Capture and analyze console logs for 2026', async ({ page }) => {
    // Arrays to store captured console messages
    const consoleLogs = [];
    const periodBreakdown = [];
    const weeklyDetails = [];
    const rotationAssignments = [];

    // Listen to console messages
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);

      // Capture period breakdown
      if (text.includes('Half-Period Breakdown')) {
        const nextLogs = [];
        const captureNext = (msg2) => {
          if (msg2.text().startsWith('  P')) {
            periodBreakdown.push(msg2.text());
          }
        };
        page.on('console', captureNext);
      }

      // Capture weekly schedule details
      if (text.includes('Generating schedule for 2026-W')) {
        const weekMatch = text.match(/2026-W(\d+)/);
        if (weekMatch) {
          weeklyDetails.push({
            week: weekMatch[0],
            log: text
          });
        }
      }

      // Capture period details
      if (text.includes('📊 Period details:')) {
        // Next console log will have the object
      }

      // Capture flexible doctor assignments
      if (text.includes('🔄 Flexible doctor assignments:')) {
        // Next console log will have the assignments
      }
    });

    // Navigate to the application
    console.log('🚀 Loading application...');
    await page.goto('http://localhost:5173/');

    // Wait for the application to fully load and generate schedules
    await page.waitForTimeout(3000);

    // Call the debugPrintPeriodSystem function in the browser
    await page.evaluate(() => {
      if (window.debugPrintPeriodSystem) {
        window.debugPrintPeriodSystem();
      }
    });

    await page.waitForTimeout(2000);

    // Log all captured information
    console.log('\n' + '='.repeat(80));
    console.log('📋 PERIOD SYSTEM INITIALIZATION');
    console.log('='.repeat(80));

    const periodLogs = consoleLogs.filter(log =>
      log.includes('Initializing Period System') ||
      log.includes('Found') ||
      log.includes('Calculated') ||
      log.includes('Created') ||
      log.includes('Generated') ||
      log.includes('Available years')
    );
    periodLogs.forEach(log => console.log(log));

    // Find and display half-period breakdown
    console.log('\n' + '='.repeat(80));
    console.log('📊 HALF-PERIOD BREAKDOWN FOR 2026');
    console.log('='.repeat(80));

    const halfPeriodStart = consoleLogs.findIndex(log => log.includes('Half-Period Breakdown'));
    if (halfPeriodStart !== -1) {
      // Get the next 20 logs after the breakdown header (should contain all periods)
      for (let i = halfPeriodStart + 1; i < Math.min(halfPeriodStart + 30, consoleLogs.length); i++) {
        if (consoleLogs[i].startsWith('  P') && consoleLogs[i].includes('2026')) {
          console.log(consoleLogs[i]);
        }
      }
    }

    // Analyze first 10 weeks of 2026 in detail
    console.log('\n' + '='.repeat(80));
    console.log('🔍 WEEKLY ANALYSIS FOR 2026 (First 10 weeks)');
    console.log('='.repeat(80));

    for (let week = 1; week <= 10; week++) {
      const weekKey = `2026-W${String(week).padStart(2, '0')}`;

      // Find the index where this week's generation starts
      const weekIndex = consoleLogs.findIndex(log => log.includes(`Generating schedule for ${weekKey}`));

      if (weekIndex !== -1) {
        console.log(`\n📅 ${weekKey}:`);

        // Get the next several logs for this week
        for (let i = weekIndex; i < Math.min(weekIndex + 15, consoleLogs.length); i++) {
          const log = consoleLogs[i];

          // Stop if we hit the next week
          if (i > weekIndex && log.includes('Generating schedule for 2026-W')) {
            break;
          }

          // Print relevant logs
          if (log.includes('Period:') ||
              log.includes('📊 Period details') ||
              log.includes('periodNumber') ||
              log.includes('cycleIndex') ||
              log.includes('halfNumber') ||
              log.includes('🔄 Flexible doctor') ||
              log.includes('MDLC:')) {
            console.log(`  ${log}`);
          }
        }
      }
    }

    // Check if schedule was generated
    console.log('\n' + '='.repeat(80));
    console.log('📦 SCHEDULE CONVERSION STATUS');
    console.log('='.repeat(80));

    const conversionLogs = consoleLogs.filter(log =>
      log.includes('Converting custom schedule') ||
      log.includes('Found') && log.includes('unique year') ||
      log.includes('Mapping') && log.includes('2026-W') ||
      log.includes('Calendar format created')
    );
    conversionLogs.forEach(log => console.log(log));

    // Check for errors
    console.log('\n' + '='.repeat(80));
    console.log('❌ ERRORS AND WARNINGS');
    console.log('='.repeat(80));

    const errorLogs = consoleLogs.filter(log =>
      log.includes('⚠️') ||
      log.includes('❌') ||
      log.includes('Error') ||
      log.includes('No schedule available')
    );
    if (errorLogs.length > 0) {
      errorLogs.forEach(log => console.log(log));
    } else {
      console.log('No errors found!');
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total console logs captured: ${consoleLogs.length}`);
    console.log(`Errors/Warnings: ${errorLogs.length}`);

    // Take a screenshot for visual confirmation
    await page.screenshot({ path: 'test-results/2026-schedule.png', fullPage: true });
    console.log('\n📸 Screenshot saved to test-results/2026-schedule.png');
  });
});
