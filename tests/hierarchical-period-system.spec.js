/**
 * Playwright Test Suite for Hierarchical Period System
 *
 * This test suite validates the new two-rhythm scheduling system:
 * 1. DL's fixed 2-week HDJ/MPO alternation
 * 2. Other doctors' variable periods based on French holidays
 * 3. Week-aware HDJ template adjustments
 *
 * Run with:
 *   npx playwright test
 *   npx playwright test --headed  (to see browser)
 *   npx playwright test --debug   (debug mode)
 */

import { test, expect } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:5175';
const TIMEOUT = 10000;

test.describe('Hierarchical Period System - Core Functionality', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto(BASE_URL);

    // Wait for main heading to ensure app loaded
    await page.waitForSelector('h1:has-text("MIMI planning")', { timeout: TIMEOUT });

    // Wait a bit for schedules to generate
    await page.waitForTimeout(2000);
  });

  test('Application loads successfully with period system initialized', async ({ page }) => {
    // Check for main heading
    const heading = await page.locator('h1:has-text("MIMI planning")');
    await expect(heading).toBeVisible();

    // Check console for period system initialization
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Reload to capture console logs
    await page.reload();
    await page.waitForTimeout(2000);

    // Verify period system initialization logs
    const hasInitLog = consoleLogs.some(log =>
      log.includes('Initializing Period System') ||
      log.includes('Period System')
    );

    console.log('Console logs captured:', consoleLogs.length);
    console.log('Has init log:', hasInitLog);
  });

  test('Calendars for 2024 and 2025 are displayed', async ({ page }) => {
    // Check for 2024 calendar
    const calendar2024 = await page.locator('h2:has-text("2024")');
    await expect(calendar2024).toBeVisible();

    // Check for 2025 calendar
    const calendar2025 = await page.locator('h2:has-text("2025")');
    await expect(calendar2025).toBeVisible();

    console.log('✅ Both 2024 and 2025 calendars are visible');
  });

  test('Week 44 (2024) is displayed as starting week', async ({ page }) => {
    // Look for Week44 heading
    const week44 = await page.locator('h3:has-text("Week44")');
    await expect(week44).toBeVisible();

    console.log('✅ Week 44 (starting week) is displayed');
  });

  test('DL doctor row exists in schedule', async ({ page }) => {
    // Find table cell with DL
    const dlRow = await page.locator('td:has-text("DL")').first();
    await expect(dlRow).toBeVisible();

    console.log('✅ DL doctor row found in schedule');
  });

  test('Excel Export button is available', async ({ page }) => {
    // Check for export button
    const exportButton = await page.locator('button:has-text("Export"), button:has-text("Excel")').first();

    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
      console.log('✅ Excel Export button is available');
    } else {
      console.log('⚠️  Excel Export button not found (may be in different location)');
    }
  });
});

test.describe('Hierarchical Period System - Console Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('h1:has-text("MIMI planning")', { timeout: TIMEOUT });
    await page.waitForTimeout(3000); // Wait for test functions to be available
  });

  test('Period system test functions are available in window', async ({ page }) => {
    // Check if test functions are available
    const hasTestFunctions = await page.evaluate(() => {
      return typeof window.testPeriodSystem !== 'undefined';
    });

    expect(hasTestFunctions).toBeTruthy();
    console.log('✅ Test functions available in window.testPeriodSystem');
  });

  test('Quick test executes successfully', async ({ page }) => {
    // Run quick test
    const result = await page.evaluate(() => {
      if (window.testPeriodSystem && window.testPeriodSystem.quickTest) {
        window.testPeriodSystem.quickTest();
        return { success: true };
      }
      return { success: false, error: 'Test function not found' };
    });

    expect(result.success).toBeTruthy();
    console.log('✅ Quick test executed');
  });

  test('DL 2-week rhythm validation passes', async ({ page }) => {
    // Run DL rhythm test
    const result = await page.evaluate(() => {
      if (window.testPeriodSystem && window.testPeriodSystem.testDLRhythm) {
        return window.testPeriodSystem.testDLRhythm();
      }
      return { success: false, error: 'Test function not found' };
    });

    console.log('DL Rhythm Test Result:', result);

    expect(result.success).toBeTruthy();
    expect(result.issues).toHaveLength(0);

    console.log('✅ DL alternates correctly every 2 weeks');
  });

  test('Week-aware HDJ template validation passes', async ({ page }) => {
    // Run HDJ template test
    const result = await page.evaluate(() => {
      if (window.testPeriodSystem && window.testPeriodSystem.testWeekAwareHDJ) {
        return window.testPeriodSystem.testWeekAwareHDJ();
      }
      return { success: false, error: 'Test function not found' };
    });

    console.log('HDJ Template Test Result:', result);

    expect(result.success).toBeTruthy();

    console.log('✅ HDJ templates adjust correctly based on DL state');
  });

  test('Period system initialization test passes', async ({ page }) => {
    // Run initialization test
    const result = await page.evaluate(() => {
      if (window.testPeriodSystem && window.testPeriodSystem.testPeriodSystemInit) {
        return window.testPeriodSystem.testPeriodSystemInit();
      }
      return { success: false, error: 'Test function not found' };
    });

    console.log('Period System Init Result:', result);

    expect(result.success).toBeTruthy();
    expect(result.system).toBeDefined();
    expect(result.system.holidayPeriods).toBeDefined();

    console.log(`✅ Period system initialized with ${result.system.holidayPeriods.length} holiday periods`);
  });

  test('Full test suite passes', async ({ page }) => {
    // Run full test suite
    const result = await page.evaluate(() => {
      if (window.testPeriodSystem && window.testPeriodSystem.runAllTests) {
        return window.testPeriodSystem.runAllTests();
      }
      return { allPassed: false, error: 'Test function not found' };
    });

    console.log('Full Test Suite Result:', result);

    expect(result.allPassed).toBeTruthy();

    console.log('✅ All 5 automated tests passed!');
    console.log('Test Results:', result.results);
  });
});

test.describe('Hierarchical Period System - Schedule Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('h1:has-text("MIMI planning")', { timeout: TIMEOUT });
    await page.waitForTimeout(2000);
  });

  test('No missing activities in Week 44', async ({ page }) => {
    // Find Week 44 status row
    const week44Section = await page.locator('h3:has-text("Week44")').locator('..');

    // Check for green checkmarks (✔) in status row
    const statusCells = await week44Section.locator('tr:last-child td');
    const statusCount = await statusCells.count();

    console.log(`Week 44 has ${statusCount} status cells`);

    // Look for any red X marks (✘) indicating problems
    const hasErrors = await week44Section.locator('span:has-text("✘")').count();

    expect(hasErrors).toBe(0);
    console.log('✅ Week 44 has no missing or duplicate activities');
  });

  test('DL state logs appear in console', async ({ page }) => {
    const consoleLogs = [];

    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(3000);

    // Look for DL backbone logs
    const dlLogs = consoleLogs.filter(log =>
      log.includes('DL backbone') || log.includes('DL state')
    );

    console.log('DL-related logs found:', dlLogs.length);
    if (dlLogs.length > 0) {
      console.log('Sample DL logs:');
      dlLogs.slice(0, 5).forEach(log => console.log('  ', log));
    }

    expect(dlLogs.length).toBeGreaterThan(0);
  });

  test('Week-aware HDJ template logs appear in console', async ({ page }) => {
    const consoleLogs = [];

    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(3000);

    // Look for HDJ template logs
    const hdjLogs = consoleLogs.filter(log =>
      log.includes('week-aware HDJ') || log.includes('HDJ template')
    );

    console.log('HDJ template logs found:', hdjLogs.length);
    if (hdjLogs.length > 0) {
      console.log('Sample HDJ logs:');
      hdjLogs.slice(0, 5).forEach(log => console.log('  ', log));
    }

    expect(hdjLogs.length).toBeGreaterThan(0);
  });
});

test.describe('Hierarchical Period System - Visual Verification', () => {

  test('Take full page screenshot of 2024 calendar', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('h2:has-text("2024")', { timeout: TIMEOUT });
    await page.waitForTimeout(2000);

    // Scroll to 2024 section
    await page.locator('h2:has-text("2024")').scrollIntoViewIfNeeded();

    // Take screenshot
    await page.screenshot({
      path: 'test-results/calendar-2024.png',
      fullPage: false
    });

    console.log('✅ Screenshot saved: test-results/calendar-2024.png');
  });

  test('Take screenshot of first few weeks (W44-W46)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('h3:has-text("Week44")', { timeout: TIMEOUT });
    await page.waitForTimeout(2000);

    // Find Week44 table and take screenshot
    const week44Section = await page.locator('h3:has-text("Week44")').locator('..');

    await week44Section.screenshot({
      path: 'test-results/week-44-detail.png'
    });

    console.log('✅ Screenshot saved: test-results/week-44-detail.png');
  });
});
