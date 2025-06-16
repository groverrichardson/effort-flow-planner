import { test as base, expect } from '@playwright/test';

// Create a test that doesn't use the authenticated state
const test = base;

// Override the storageState to be undefined for this test file only
test.use({ storageState: undefined });

test('login page visual test', async ({ page }, testInfo) => {
    // Navigate to login page using relative URL (will use baseURL from config)
    await page.goto('/login');
    
    // Take screenshot with an assertion (for verification)
    await expect(page).toHaveScreenshot('login-page.png', {
        // Lower the threshold for differences to ensure screenshots are always attached
        // even if they're identical to the baseline
        threshold: 0.1,
        maxDiffPixels: 100
    });
    
    // Also capture screenshot and save it directly to the test results directory
    const loginScreenshotPath = testInfo.outputPath('login-page-report.png');
    await page.screenshot({ fullPage: true, path: loginScreenshotPath });
    await testInfo.attach('login-page-report', { path: loginScreenshotPath });
    
    // Click on create account tab
    await page.getByRole('tab', { name: 'Create Account' }).click();
    
    // Take screenshot of create account page with the same threshold setting
    await expect(page).toHaveScreenshot('create-account-page.png', {
        threshold: 0.1,
        maxDiffPixels: 100
    });
    
    // Also capture screenshot and save it directly to the test results directory
    const createAccountScreenshotPath = testInfo.outputPath('create-account-page-report.png');
    await page.screenshot({ fullPage: true, path: createAccountScreenshotPath });
    await testInfo.attach('create-account-page-report', { path: createAccountScreenshotPath });
});
