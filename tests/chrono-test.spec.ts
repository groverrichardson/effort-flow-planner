import { test, expect } from '@playwright/test';

// This is a minimal test file to verify Playwright can run in Windsurf
// It avoids the complex setup that might cause issues

test('minimal test that should work in Windsurf', async ({ page }) => {
  // Simple test with no dependencies on chrono-node
  await page.goto('about:blank');
  await expect(page).toBeTruthy();
  console.log('Basic Playwright test is working!');
});

// Add a second test that we can run separately to isolate dependency issues
test('check if page loads without dependency issues', async ({ page }) => {
  await page.goto('about:blank');
  await page.setContent(`
    <html>
      <body>
        <h1>Test Page</h1>
        <p>This is a test page.</p>
      </body>
    </html>
  `);
  
  await expect(page.locator('h1')).toHaveText('Test Page');
  console.log('Page content test is working!');
});
