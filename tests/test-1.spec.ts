import { test, expect } from '@playwright/test';

// This test verifies the dashboard functionality
test('dashboard visual test', async ({ page }, testInfo) => {
    // Navigate to login page using relative URL (will use baseURL from config)
    await page.goto('/login');
    
    // Use Quick Access to bypass login
    await page.getByRole('button', { name: 'Quick Access (Bypass Login)' }).click();
    
    // Take screenshot of the dashboard
    const dashboardScreenshotPath = testInfo.outputPath('dashboard-page.png');
    await page.screenshot({ fullPage: true, path: dashboardScreenshotPath });
    await testInfo.attach('dashboard-page', { path: dashboardScreenshotPath });
    
    // Verify dashboard has loaded successfully by checking for common dashboard elements
    // Add more specific assertions as needed
    await expect(page).toHaveURL(/.*\/dashboard/);
});
