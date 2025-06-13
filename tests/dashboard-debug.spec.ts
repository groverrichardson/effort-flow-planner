import { test, expect } from '@playwright/test';

test('Debug dashboard page rendering', async ({ page }) => {
  console.log('Starting dashboard debug test');
  
  // Navigate directly to dashboard
  await page.goto('/dashboard');
  
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot for analysis
  await page.screenshot({ path: 'screenshots/dashboard-debug.png' });
  
  // Check if we got a 404 page
  const notFoundText = await page.locator('text="404"').count();
  console.log(`404 elements found: ${notFoundText}`);
  
  if (notFoundText > 0) {
    console.log('⚠️ Dashboard page is showing 404 Not Found!');
  }
  
  // Analyze page content
  const contentText = await page.textContent('body');
  console.log('Page text content:', contentText);
  
  // No assertion - this is just for debugging
});
