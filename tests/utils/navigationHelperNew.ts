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
  
  /** Whether to log detailed navigation steps */
  verbose?: boolean;
}

/**
 * Get a route configuration from ID or path
 * 
 * @param routeIdOrPath Route ID or URL path
 * @returns Route configuration object
 */
function getRouteConfig(routeIdOrPath: string): RouteConfig {
  try {
    // Try to get route by ID first
    return getRouteById(routeIdOrPath);
  } catch (error) {
    // If that fails, try by path
    try {
      return getRouteByPath(routeIdOrPath);
    } catch (innerError) {
      throw new Error(`Could not find route configuration for '${routeIdOrPath}'. It is neither a valid route ID nor path.`);
    }
  }
}

/**
 * Navigate to a route with comprehensive verification
 * 
 * @param page Playwright page object
 * @param routeIdOrPath Route ID or path to navigate to
 * @param options Navigation options
 * @returns Navigation result
 */
export async function navigateWithVerification(
  page: Page,
  routeIdOrPath: string,
  options: NavigationOptions = {}
): Promise<NavigationResult> {
  const startTime = Date.now();
  
  // Extract options with defaults
  const {
    maxRetries = 1,
    timeout = 30000,
    throwOnFailure = true,
    verificationOptions = {},
    verbose = false
  } = options;
  
  // Get route configuration
  let routeConfig: RouteConfig;
  try {
    routeConfig = getRouteConfig(routeIdOrPath);
    if (verbose) {
      console.log(`🚀 Navigating to route: ${routeConfig.title} (${routeConfig.path})`);
    }
  } catch (error) {
    // If we can't find route configuration, assume it's a direct URL
    if (verbose) {
      console.log(`🚀 Navigating to URL: ${routeIdOrPath} (no route configuration found)`);
    }
    
    // Go to the URL directly
    await page.goto(routeIdOrPath, { timeout });
    
    // Create a minimal navigation result
    const result: NavigationResult = {
      success: true,
      targetRoute: routeIdOrPath,
      actualUrl: page.url(),
      urlVerified: true,
      elementsVerified: false,
      timestamp: Date.now(),
      duration: Date.now() - startTime
    };
    
    return result;
  }

  // Initialize retry counter
  let retryCount = 0;
  let lastError: Error | null = null;
  
  // Try navigation with retries
  while (retryCount <= maxRetries) {
    try {
      if (retryCount > 0 && verbose) {
        console.log(`🔄 Retry ${retryCount}/${maxRetries} for navigation to ${routeConfig.title}`);
      }
      
      // Navigate to the route
      await page.goto(routeConfig.path, { timeout });
      const currentUrl = page.url();
      
      // Verify URL matches route
      const urlVerified = verifyUrl(currentUrl, routeConfig.path);
      if (!urlVerified) {
        if (verbose) {
          console.warn(`⚠️ URL verification failed. Expected ${routeConfig.path}, got ${currentUrl}`);
        }
        
        // Try one more time with URL match waiting (5 second timeout)
        await waitForUrlMatch(page, routeConfig.path).catch(() => {});
      }
      
      // Verify route elements
      let elementResult: ElementVerificationResult | null = null;
      let elementsVerified = false;
      
      try {
        // Create screenshot path if needed
        let screenshotPath: string | undefined = undefined;
        if (verificationOptions.screenshotPath) {
          screenshotPath = verificationOptions.screenshotPath;
        } else {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          screenshotPath = `route-verification-${routeConfig.id}-${timestamp}.png`;
        }
        
        // Verify route elements
        elementResult = await verifyRouteElements(page, routeConfig, {
          ...verificationOptions,
          screenshotPath,
          throwOnFailure: false, // Handle failures ourselves
          verbose
        });
        
        elementsVerified = elementResult.success;
        
        if (!elementsVerified && verbose) {
          console.warn(`⚠️ Element verification failed for ${routeConfig.title}`);
          if (elementResult.details.missing && elementResult.details.missing.length > 0) {
            console.warn(`Missing required elements: ${elementResult.details.missing.join(', ')}`);
          }
        }
      } catch (error) {
        if (verbose) {
          console.error(`❌ Element verification error: ${error.message}`);
        }
        lastError = error;
      }
      
      // Determine overall success
      const success = urlVerified && (elementsVerified || !verificationOptions.throwOnFailure);
      
      // Create result object
      const result: NavigationResult = {
        success,
        targetRoute: routeIdOrPath,
        routeConfig,
        actualUrl: page.url(),
        urlVerified,
        elementsVerified,
        elementDetails: elementResult ? elementResult.details : undefined,
        screenshotPath: elementResult ? elementResult.screenshotPath : undefined,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
      
      // If success or we've reached max retries, return the result
      if (success || retryCount >= maxRetries) {
        if (!success && throwOnFailure) {
          const errorMessage = `Navigation to ${routeConfig.title} (${routeConfig.path}) failed: URL verification ${urlVerified ? 'succeeded' : 'failed'}, element verification ${elementsVerified ? 'succeeded' : 'failed'}`;
          result.errorMessage = errorMessage;
          
          if (verbose) {
            console.error(`❌ ${errorMessage}`);
            if (result.screenshotPath) {
              console.log(`📸 See screenshot: ${result.screenshotPath}`);
            }
          }
          
          throw new Error(errorMessage);
        }
        
        // Log success
        if (success && verbose) {
          console.log(`✅ Successfully navigated to ${routeConfig.title} (${routeConfig.path})`);
        }
        
        return result;
      }
      
      // If we're here, retry
      retryCount++;
      
      // Wait before retry with exponential backoff
      const backoff = Math.min(1000 * Math.pow(1.5, retryCount), 5000);
      if (verbose) {
        console.log(`⏱️ Waiting ${backoff}ms before retrying...`);
      }
      await page.waitForTimeout(backoff);
      
    } catch (error) {
      lastError = error;
      retryCount++;
      
      if (verbose) {
        console.error(`❌ Navigation attempt ${retryCount} failed: ${error.message}`);
      }
      
      // If we've reached max retries, throw or return failure
      if (retryCount > maxRetries) {
        const errorMessage = `Navigation to ${routeConfig.title} (${routeConfig.path}) failed after ${maxRetries} retries: ${error.message}`;
        
        // Take a failure screenshot
        let screenshotPath: string | undefined = undefined;
        try {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          screenshotPath = `navigation-failure-${routeConfig.id}-${timestamp}.png`;
          await page.screenshot({ path: screenshotPath });
          
          if (verbose) {
            console.log(`📸 Saved failure screenshot: ${screenshotPath}`);
          }
        } catch (screenshotError) {
          if (verbose) {
            console.error(`Failed to save screenshot: ${screenshotError.message}`);
          }
        }
        
        if (throwOnFailure) {
          throw new Error(errorMessage);
        }
        
        return {
          success: false,
          targetRoute: routeIdOrPath,
          routeConfig,
          actualUrl: page.url(),
          urlVerified: false,
          elementsVerified: false,
          errorMessage,
          screenshotPath,
          timestamp: Date.now(),
          duration: Date.now() - startTime
        };
      }
      
      // Wait before retry with exponential backoff
      const backoff = Math.min(1000 * Math.pow(1.5, retryCount), 5000);
      if (verbose) {
        console.log(`⏱️ Waiting ${backoff}ms before retrying...`);
      }
      await page.waitForTimeout(backoff);
    }
  }
  
  // This should not be reached due to the logic above, but TypeScript needs it
  const errorMessage = lastError ? lastError.message : 'Unknown navigation error';
  return {
    success: false,
    targetRoute: routeIdOrPath,
    routeConfig,
    actualUrl: page.url(),
    urlVerified: false,
    elementsVerified: false,
    errorMessage,
    timestamp: Date.now(),
    duration: Date.now() - startTime
  };
}

/**
 * Handle authentication when redirected to login
 * 
 * @param page Playwright page object
 * @param options Navigation options
 * @returns Whether authentication was successful
 */
export async function handleAuthentication(
  page: Page, 
  authenticateFunction: (page: Page) => Promise<void>,
  options: NavigationOptions = {}
): Promise<boolean> {
  const { verbose = false } = options;
  
  try {
    // Get login route configuration
    const loginRoute = getRouteById('login');
    
    // Check if we're on login page
    const currentUrl = page.url();
    const isLoginPage = verifyUrl(currentUrl, loginRoute.path);
    
    if (isLoginPage) {
      if (verbose) {
        console.log('🔐 Detected redirection to login page, performing authentication');
      }
      
      // Execute authentication function
      await authenticateFunction(page);
      
      // Wait for navigation after login
      await page.waitForNavigation({ timeout: options.timeout || 30000 });
      
      // Verify authentication successful
      const postLoginUrl = page.url();
      const stillOnLogin = verifyUrl(postLoginUrl, loginRoute.path);
      
      if (stillOnLogin) {
        if (verbose) {
          console.error('❌ Authentication failed - still on login page');
        }
        return false;
      }
      
      if (verbose) {
        console.log('✅ Authentication successful');
      }
      return true;
    }
    
    return false;
  } catch (error) {
    if (verbose) {
      console.error(`❌ Authentication error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Navigate to a route with authentication handling
 * 
 * @param page Playwright page object
 * @param routeIdOrPath Route ID or path to navigate to
 * @param authenticateFunction Function to handle authentication
 * @param options Navigation options
 * @returns Navigation result
 */
export async function navigateTo(
  page: Page,
  routeIdOrPath: string,
  authenticateFunction: (page: Page) => Promise<void>,
  options: NavigationOptions = {}
): Promise<NavigationResult> {
  const { verbose = false } = options;
  
  // Initial navigation
  const result = await navigateWithVerification(page, routeIdOrPath, {
    ...options,
    throwOnFailure: false
  });
  
  // Check if we need authentication
  const routeConfig = result.routeConfig;
  const loginRoute = getRouteById('login');
  
  // If we need authentication and were redirected to login
  if (routeConfig && routeConfig.requiresAuth && verifyUrl(result.actualUrl, loginRoute.path)) {
    if (verbose) {
      console.log(`🔐 Route ${routeConfig.title} requires authentication and was redirected to login`);
    }
    
    // Handle authentication
    const authSuccess = await handleAuthentication(page, authenticateFunction, options);
    
    if (!authSuccess) {
      if (verbose) {
        console.error('❌ Authentication failed');
      }
      
      result.success = false;
      result.errorMessage = 'Authentication failed';
      
      if (options.throwOnFailure) {
        throw new Error(`Navigation to ${routeConfig.title} failed: Authentication failed`);
      }
      
      return result;
    }
    
    // Try navigation again after authentication
    return navigateWithVerification(page, routeIdOrPath, options);
  }
  
  // Either no authentication needed or already on the right page
  return result;
}
