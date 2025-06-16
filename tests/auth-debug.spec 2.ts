import { test, expect } from '@playwright/test';

test.describe('Authentication Debug', () => {
  test('should be authenticated and not see login page', async ({ page }) => {
    console.log('Starting auth debug test...');
    
    // Navigate to the home page
    await page.goto('/');
    
    // Take a screenshot to see what page we're on
    await page.screenshot({ path: 'auth-debug-home.png' });
    
    // Check if we're on the login page (which would indicate auth failure)
    const isOnLoginPage = await page.locator('text=Sign In').isVisible({ timeout: 5000 }).catch(() => false);
    const isOnDashboard = await page.locator('text=Dashboard').isVisible({ timeout: 5000 }).catch(() => false);
    
    console.log('Auth debug results:', {
      currentUrl: page.url(),
      isOnLoginPage,
      isOnDashboard
    });
    
    // Check localStorage for auth token
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('sb-gslwiqavcqwjtpyeawyp-auth-token');
    });
    
    console.log('Auth token in localStorage:', authToken ? 'Present' : 'Missing');
    
    // If we have auth token but still on login, there's an app logic issue
    // If we don't have auth token, there's a Playwright storage state issue
    expect(isOnLoginPage).toBe(false); // We should NOT be on login page
    expect(authToken).toBeTruthy(); // We SHOULD have auth token
  });
});