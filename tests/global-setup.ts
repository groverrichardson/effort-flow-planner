import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { loadEnvVariables } from './setup-env';

/**
 * Global setup function to create authentication state for tests.
 * 
 * This will:
 * 1. Create the auth directory if it doesn't exist
 * 2. Launch a browser and authenticate
 * 3. Save the authenticated session state for tests to use
 */
async function globalSetup(config: FullConfig) {
  console.log('Starting global setup for authentication...');
  
  // Load environment variables from .env file
  loadEnvVariables();
  
  // Ensure credentials are available in environment variables
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
  
  if (!email || !password) {
    console.error('⛔ Authentication credentials not found in environment variables. Halting test run');
    console.error('Please ensure PLAYWRIGHT_TEST_USER_EMAIL and PLAYWRIGHT_TEST_USER_PASSWORD are set');
    process.exit(1);
  }
  
  // Create the auth directory if it doesn't exist
  const authDir = path.join(__dirname, '..', 'playwright', '.auth');
  if (!fs.existsSync(authDir)) {
    console.log(`Creating authentication directory: ${authDir}`);
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  // Get base URL from config
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:5173';
  
  // Launch browser and create a new context
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto(`${baseURL}/login`);
    
    // Wait for login form elements to be visible
    console.log('Looking for login form elements...');
    
    // Try different selectors for email input
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      '[data-testid="email-input"]',
      '#email'
    ];
    
    // Try different selectors for password input
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      '[data-testid="password-input"]',
      '#password'
    ];
    
    // Try different selectors for submit button
    const submitSelectors = [
      'button[type="submit"]',
      '[data-testid="login-button"]',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      'form button'
    ];
    
    let emailInput: any = null;
    let passwordInput: any = null;
    let submitButton: any = null;
    
    // Find email input
    for (const selector of emailSelectors) {
      try {
        console.log(`Trying email selector: ${selector}`);
        const tempEmailInput = page.locator(selector).first();
        const isVisible = await tempEmailInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          console.log(`Found visible email input with selector: ${selector}`);
          emailInput = tempEmailInput;
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} failed: ${e.message}`);
      }
    }
    
    // Find password input
    for (const selector of passwordSelectors) {
      try {
        console.log(`Trying password selector: ${selector}`);
        const tempPasswordInput = page.locator(selector).first();
        const isVisible = await tempPasswordInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          console.log(`Found visible password input with selector: ${selector}`);
          passwordInput = tempPasswordInput;
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} failed: ${e.message}`);
      }
    }
    
    // Find submit button
    for (const selector of submitSelectors) {
      try {
        console.log(`Trying submit button selector: ${selector}`);
        const tempSubmitButton = page.locator(selector).first();
        const isVisible = await tempSubmitButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          console.log(`Found visible submit button with selector: ${selector}`);
          submitButton = tempSubmitButton;
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} failed: ${e.message}`);
      }
    }
    
    // Take screenshot of what we found (or didn't find)
    await page.screenshot({ path: path.join(authDir, 'login-form-elements.png') });
    console.log(`Screenshot saved: ${path.join(authDir, 'login-form-elements.png')}`);
    
    // Check if we found all elements
    if (!emailInput || !passwordInput || !submitButton) {
      console.error('Could not find all login form elements');
      throw new Error('Login form elements not found. Check screenshot for details.');
    }
    
    // Fill in and submit the login form
    console.log('Filling email...');
    await emailInput.fill(email);
    
    console.log('Filling password...');
    await passwordInput.fill(password);
    
    console.log('Clicking submit button...');
    await submitButton.click();
    
    // Wait for redirect after login
    console.log('Waiting for redirect after login...');
    await page.waitForURL('**/(dashboard|home|tasks|/)**', { timeout: 15000 });
    console.log(`Authentication successful. Redirected to: ${page.url()}`);
    
    // Take a verification screenshot
    await page.screenshot({ path: path.join(authDir, 'auth-verification.png') });
    console.log('Verification screenshot saved');
    
    // Save storage state to the auth file
    const storageStatePath = path.join(authDir, 'user.json');
    await context.storageState({ path: storageStatePath });
    console.log(`Authentication state saved to: ${storageStatePath}`);
    
    console.log('Global setup completed successfully! 🎉');
  } catch (error) {
    console.error(`Authentication failed: ${error.message}`);
    await page.screenshot({ path: path.join(authDir, 'auth-error.png') });
    console.error(`Error screenshot saved to: ${path.join(authDir, 'auth-error.png')}`);
    throw error;
  } finally {
    // Close browser regardless of outcome
    await browser.close();
  }
}

export default globalSetup;
