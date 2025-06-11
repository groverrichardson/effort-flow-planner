/**
 * Navigation Helper Utilities
 * 
 * This file provides robust navigation functions with verification and retries
 * to ensure stable end-to-end tests using route configuration objects.
 */

import { Page } from '@playwright/test';
import { verifyUrl, waitForUrlMatch } from './urlVerification';
import { getRouteById, getRouteByPath, RouteConfig } from './routeConfig';
import { verifyRouteElements, ElementVerificationResult, ElementVerificationOptions } from './routeElementVerifier';

/**
 * Navigation result object returned by navigation functions
 */
export interface NavigationResult {
  /** Whether navigation was successful */
  success: boolean;
  
  /** The target route that was navigated to (ID or path) */
  targetRoute: string;
  
  /** Route configuration object used */
  routeConfig?: RouteConfig;
  
  /** The actual URL after navigation */
  actualUrl: string;
  
  /** Whether the URL was verified to match the expected route */
  urlVerified: boolean;
  
  /** Whether the page elements were verified */
  elementsVerified: boolean;
  
  /** Details about element verification */
  elementDetails?: {
    /** Elements that were successfully found */
    found: string[];
    
    /** Optional elements that were not found */
    notFound: string[];
    
    /** Required elements that were not found */
    missing?: string[];
  };
  
  /** Error message if navigation failed */
  errorMessage?: string;
  
  /** Path to screenshot if one was taken */
  screenshotPath?: string;
  
  /** Timestamp when navigation completed */
  timestamp: number;
  
  /** Duration in milliseconds that navigation took */
  duration: number;
}

/**
 * Options for navigation functions
 */
export interface NavigationOptions {
  /** Maximum number of retries if navigation fails */
  maxRetries?: number;
  
  /** Timeout for navigation in milliseconds */
  timeout?: number;
  
  /** Whether to throw an error if navigation fails */
  throwOnFailure?: boolean;
  
  /** Options for route element verification */
  verificationOptions?: ElementVerificationOptions;
}

/**
 * Navigates to a given route and verifies the result.
 *
 * @param page The Playwright Page object.
 * @param route The route to navigate to (can be a route ID or a path).
 * @param options Navigation options.
 * @returns A promise that resolves with a NavigationResult object.
 */
export async function navigateTo(page: Page, route: string, options: NavigationOptions = {}): Promise<NavigationResult> {
  const startTime = Date.now();
  const { maxRetries = 1, timeout = 15000, throwOnFailure = false, verificationOptions } = options;

  let routeConfig = getRouteById(route) || getRouteByPath(route);
  // Set default options for routes not found in configuration
  if (!routeConfig) {
    routeConfig = {
      id: route,
      path: route,
      title: route,
      elements: [],
      requiresAuth: false
    };
  }
  
  // Generate the result object with default values (will be updated below)
  const result: NavigationResult = {
    success: false,
    targetRoute: routeConfig.id,
    routeConfig: routeConfig,
    actualUrl: '',
    urlVerified: false,
    elementsVerified: false,
    elementDetails: { found: [], notFound: [], missing: [] },
    timestamp: Date.now(),
    duration: 0
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(routeConfig.path, { timeout });

      const urlVerified = await verifyUrl(page, routeConfig.path);
      const elementResult = await verifyRouteElements(page, routeConfig, verificationOptions);

      // Update result with actual values
      result.actualUrl = page.url();
      result.urlVerified = urlVerified;
      result.elementsVerified = elementResult.success;
      result.elementDetails = elementResult.details;
      result.timestamp = Date.now();
      result.duration = Date.now() - startTime;
      result.success = urlVerified && elementResult.success;

      if (result.success) {
        return result;
      }

      if (attempt === maxRetries) {
        result.errorMessage = `Navigation to ${route} failed after ${maxRetries} attempts.`;
        if (throwOnFailure) throw new Error(result.errorMessage);
        return result;
      }
    } catch (error) {
      if (attempt === maxRetries) {
        const errorMessage = `Navigation to ${route} failed with error: ${error.message}`;
        if (throwOnFailure) throw new Error(errorMessage);
        return {
          success: false,
          targetRoute: route,
          actualUrl: page.url(),
          urlVerified: false,
          elementsVerified: false,
          errorMessage,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        };
      }
    }
  }

  // This should not be reached, but as a fallback:
  const finalErrorMessage = `Navigation to ${route} failed unexpectedly.`;
  if (throwOnFailure) throw new Error(finalErrorMessage);
  return {
    success: false,
    targetRoute: route,
    actualUrl: page.url(),
    urlVerified: false,
    elementsVerified: false,
    errorMessage: finalErrorMessage,
    timestamp: Date.now(),
    duration: Date.now() - startTime,
  };
}

/**
 * Authenticates the user by filling out the login form.
 *
 * @param page The Playwright Page object.
 */
export async function authenticate(page: Page): Promise<void> {
  console.log('[Auth] Starting authentication...');
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;

  if (!email || !password) {
    console.error('[Auth] Error: Authentication credentials not found in environment variables.');
    throw new Error('Authentication credentials not found in environment variables.');
  }

  // Check if already logged in by looking for a common authenticated page element
  console.log('[Auth] Checking if already authenticated...');
  try {
    // Try to access the dashboard - if it works, we're already logged in
    await page.goto('/dashboard', { timeout: 5000 });
    const dashboardElement = page.locator('[data-testid="task-summary"]');
    const isLoggedIn = await dashboardElement.isVisible({ timeout: 3000 }).catch(() => false);
    if (isLoggedIn) {
      console.log('[Auth] Already logged in, skipping authentication.');
      return;
    }
  } catch (e) {
    console.log('[Auth] Not currently authenticated, proceeding with login.');
  }

  // Navigate to login page
  try {
    console.log('[Auth] Navigating to /login...');
    await page.goto('/login', { timeout: 15000 });
    console.log(`[Auth] Current URL after navigation: ${page.url()}`);
    
    // Debug: Take screenshot right after navigation
    await page.screenshot({ path: 'debug-login-page-initial.png' });
    console.log('[Auth] Screenshot saved: debug-login-page-initial.png');
    
    // Debug: Check page content
    const pageContent = await page.content();
    console.log(`[Auth] Page content length: ${pageContent.length} characters`);
    console.log(`[Auth] Page contains login form: ${pageContent.includes('type="email"')}`);
  } catch (e) {
    console.error(`[Auth] Navigation to /login failed: ${e.message}`);
    await page.screenshot({ path: 'auth-nav-failed.png' });
    throw e;
  }

  // Wait for the form elements to be ready with multiple selector strategies
  console.log('[Auth] Attempting to find login form elements using multiple strategies...');

  // Define multiple selector strategies for each element
  const emailSelectors = [
    'input[type="email"]',
    'input#email',
    'input[placeholder*="email"]',
    'input[name="email"]',
    'input.email-input'
  ];

  const passwordSelectors = [
    'input[type="password"]',
    'input#password',
    'input[placeholder*="password"]',
    'input[name="password"]',
    'input.password-input'
  ];

  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Sign In")',
    'button:has-text("Login")',
    'button.submit-button',
    'button.login-button'
  ];

// Try to find elements using each selector strategy
let emailInput, passwordInput, submitButton;

// Find email input
for (const selector of emailSelectors) {
try {
console.log(`[Auth] Trying email selector: ${selector}`);
const tempEmailInput = page.locator(selector).first();
const isVisible = await tempEmailInput.isVisible({ timeout: 2000 }).catch(() => false);
if (isVisible) {
console.log(`[Auth] Found visible email input with selector: ${selector}`);
emailInput = tempEmailInput; // Only assign if visible
break;
}
} catch (e) {
console.log(`[Auth] Selector ${selector} failed: ${e.message}`);
}
}

// Find password input
for (const selector of passwordSelectors) {
try {
console.log(`[Auth] Trying password selector: ${selector}`);
const tempPasswordInput = page.locator(selector).first();
const isVisible = await tempPasswordInput.isVisible({ timeout: 2000 }).catch(() => false);
if (isVisible) {
console.log(`[Auth] Found visible password input with selector: ${selector}`);
passwordInput = tempPasswordInput; // Only assign if visible
break;
}
} catch (e) {
console.log(`[Auth] Selector ${selector} failed: ${e.message}`);
}
}

// Find submit button
for (const selector of submitSelectors) {
try {
console.log(`[Auth] Trying submit button selector: ${selector}`);
const tempSubmitButton = page.locator(selector).first();
const isVisible = await tempSubmitButton.isVisible({ timeout: 2000 }).catch(() => false);
if (isVisible) {
console.log(`[Auth] Found visible submit button with selector: ${selector}`);
submitButton = tempSubmitButton; // Only assign if visible
break;
}
} catch (e) {
console.log(`[Auth] Selector ${selector} failed: ${e.message}`);
}
}

// Take screenshot of what we found (or didn't find)
await page.screenshot({ path: 'debug-login-form-elements.png' });
console.log('[Auth] Screenshot saved: debug-login-form-elements.png');

// Check if we found all elements
if (!emailInput || !passwordInput || !submitButton) {
console.error('[Auth] Could not find all login form elements');
throw new Error('Login form elements not found. Check screenshot for details.');
}

try {
// Fill in and submit the login form
console.log('[Auth] Filling email...');
await emailInput.fill(email);
console.log('[Auth] Filling password...');
await passwordInput.fill(password);

console.log('[Auth] Clicking submit button...');
await submitButton.click();
console.log('[Auth] Submit button clicked.');

// Wait for redirect after login
console.log('[Auth] Waiting for redirect to dashboard...');
await page.waitForURL('**/(dashboard|home|tasks|/)**', { timeout: 15000 });
console.log(`[Auth] Authentication successful. Redirected to: ${page.url()}`);

    // Verify we can access protected content
    console.log('[Auth] Verifying access to protected content...');
    await page.goto('/dashboard');

    // Wait briefly for the dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(e => {
      console.log('[Auth] Network idle timeout (expected), continuing verification')
    });
    
    // Take a verification screenshot
    await page.screenshot({ path: 'auth-verification.png' });
    console.log('[Auth] Verification screenshot saved');
  } catch (error) {
    console.error(`[Auth] Authentication action failed: ${error.message}`);
    try {
      await page.screenshot({ path: 'auth-action-failed.png' });
      console.log('[Auth] Failure screenshot saved');
    } catch (screenshotError) {
      console.error(`[Auth] Failed to capture screenshot: ${screenshotError.message}`);
    }
    throw error;
  }
}

export async function bypassLogin(page: Page, options: { verbose?: boolean } = {}): Promise<boolean> {
  const { verbose = false } = options;
  if (verbose) {
    console.log('Attempting to bypass login...');
  }
  try {
    const loginPagePath = '/login'; 
    const expectedPostLoginPath = '/'; 

    if (!page.url().includes(loginPagePath)) {
        if (verbose) console.log(`Currently not on login page (${page.url()}). Assuming bypass can be triggered from current page or login page will be hit.`);
    }
    
    const bypassButtonSelector = 'button#login-bypass-button'; // UPDATE THIS SELECTOR
    
    if (verbose) {
        console.log(`Looking for bypass button: ${bypassButtonSelector}`);
    }
    await page.waitForSelector(bypassButtonSelector, { timeout: 10000 });
    await page.click(bypassButtonSelector);
    if (verbose) {
      console.log('Clicked bypass login button.');
    }

    await page.waitForURL((url) => !url.pathname.includes(loginPagePath) || url.pathname === expectedPostLoginPath, { timeout: 15000 });
    
    if (page.url().includes(expectedPostLoginPath) || !page.url().includes(loginPagePath)) {
      if (verbose) {
        console.log(`✅ Login bypass successful. Current URL: ${page.url()}`);
      }
      return true;
    } else {
      if (verbose) {
        console.error(`Login bypass attempt failed: Still on or redirected back to login page. Current URL: ${page.url()}`);
      }
      return false;
    }
  } catch (error) {
    if (verbose) {
      console.error(`❌ Error during login bypass: ${(error as Error).message}`);
    }
    return false;
  }
}
