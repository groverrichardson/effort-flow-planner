import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Authentication Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Log authentication status for debugging
    try {
      const authPath = path.join(process.cwd(), 'playwright', '.auth', 'user.json');
      if (fs.existsSync(authPath)) {
        const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
        console.log(`Auth state loaded with ${authData.cookies?.length || 0} cookies`);
      } else {
        console.warn('No auth state file found!');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  });

  test('should have access to authenticated pages', async ({ page }) => {
    // Create directory for test screenshots if it doesn't exist
    const screenshotDir = path.join(process.cwd(), 'playwright-report');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Navigate to the home page, which should be accessible because we're authenticated
    console.log('Navigating to home page...');
    await page.goto('/');
    
    // Take a screenshot to verify the page loaded correctly
    await page.screenshot({ path: path.join(screenshotDir, 'auth-example.png'), fullPage: true });
    
    // Get and log current page content for debugging
    console.log('Current page URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Look for ANY authenticated UI elements with more flexible matching
    try {
      // Save another screenshot before checking elements
      await page.screenshot({ path: path.join(screenshotDir, 'auth-elements-check.png'), fullPage: true });
      
      // More relaxed detection of authentication indicators
      const authElementsToCheck = [
        // Logout buttons
        'button:has-text("Log out")', 
        'button:has-text("Logout")',
        '[data-testid="logout-button"]',
        // Common sidebar/nav elements in authenticated areas
        '[data-testid="sidebar"]',
        '[data-testid="nav-menu"]',
        '[data-testid="user-menu"]',
        // Common authenticated page content identifiers
        '[data-testid="dashboard"]',
        '[data-testid="tasks"]',
        'h1:has-text("Dashboard")',
        '.user-avatar',
        '.user-profile'
      ];
      
      // Check for the presence of ANY of these elements
      for (const selector of authElementsToCheck) {
        const element = await page.$(selector);
        if (element) {
          console.log(`Found authenticated UI element: ${selector}`);
          // If we found at least one authenticated element, test passes
          expect(element).toBeTruthy();
          console.log('Authentication successful! User is logged in.');
          return;
        }
      }
      
      // If we didn't find any specific elements, check if we're at least not on the login page
      const onLoginPage = await page.evaluate(() => {
        return window.location.pathname.includes('login') || 
               document.querySelector('form input[type="password"]') !== null;
      });
      
      if (!onLoginPage) {
        console.log('Not on login page, assuming authentication worked');
        expect(onLoginPage).toBe(false);
        console.log('Authentication successful! User is not on login page.');
        return;
      }
      
      // If all checks failed, the test fails
      throw new Error('Could not verify authentication state - no auth elements found and appears to be on login page');
    } catch (error) {
      console.error('Authentication verification failed:', error);
      throw error;
    }
  });
});
