import { test, expect } from '@playwright/test';

test.describe('Task Form Authentication Debug', () => {
  test('should be authenticated when navigating to /tasks/create', async ({ page }) => {
    console.log('Starting task form auth debug test...');
    
    // Navigate to the exact same path as task form tests
    await page.goto('/tasks/create');
    console.log('Navigated to /tasks/create');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take a screenshot to see what page we're on
    await page.screenshot({ path: 'task-form-auth-debug.png' });
    
    // Check what page we're actually on
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we're on the login page (which would indicate auth failure)
    const isOnLoginPage = await page.locator('text=Sign In').isVisible({ timeout: 5000 }).catch(() => false);
    const hasTaskDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 5000 }).catch(() => false);
    
    console.log('Page state:', {
      currentUrl,
      isOnLoginPage,
      hasTaskDialog
    });
    
    // Check localStorage for auth token
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('sb-gslwiqavcqwjtpyeawyp-auth-token');
    });
    
    console.log('Auth token in localStorage:', authToken ? 'Present' : 'Missing');
    
    // Log the page content for debugging
    const bodyText = await page.locator('body').textContent();
    console.log('Page content preview:', bodyText?.substring(0, 200) + '...');
    
    expect(isOnLoginPage).toBe(false); // We should NOT be on login page
    expect(authToken).toBeTruthy(); // We SHOULD have auth token
  });
});