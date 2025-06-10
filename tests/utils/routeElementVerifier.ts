/**
 * Route Element Verification Utilities
 * 
 * This file provides utilities for verifying UI elements on specific routes
 * using the route configuration objects from routeConfig.ts
 */

import { Page } from '@playwright/test';
import { RouteConfig, routes, getRouteById, getRouteByPath } from './routeConfig';

/**
 * Result of the element verification process
 */
export interface ElementVerificationResult {
  /** Whether the verification was successful */
  success: boolean;
  /** Details about verified elements */
  details: {
    /** Names of elements that were found */
    found: string[];
    /** Names of elements that were not found but not required */
    notFound: string[];
    /** Names of elements that were required but not found (failure case) */
    missing: string[];
  };
  /** Screenshot path if one was taken */
  screenshotPath?: string;
}

/**
 * Options for element verification
 */
export interface ElementVerificationOptions {
  /** Maximum time to wait for required elements in milliseconds */
  timeout?: number;
  /** Path to save a screenshot if verification fails */
  screenshotPath?: string;
  /** Whether to log detailed verification steps */
  verbose?: boolean;
  /** Whether to throw an error if verification fails */
  throwOnFailure?: boolean;
}

/**
 * Verify all required elements for a route are present
 * 
 * @param page Playwright page object
 * @param routeId ID of the route to verify
 * @param options Verification options
 * @returns Element verification result
 */
export async function verifyRouteElementsById(
  page: Page, 
  routeId: string,
  options: ElementVerificationOptions = {}
): Promise<ElementVerificationResult> {
  const route = getRouteById(routeId);
  return verifyRouteElements(page, route, options);
}

/**
 * Verify all required elements for a route are present using a path
 * 
 * @param page Playwright page object
 * @param path URL path to verify
 * @param options Verification options
 * @returns Element verification result
 */
export async function verifyRouteElementsByPath(
  page: Page, 
  path: string,
  options: ElementVerificationOptions = {}
): Promise<ElementVerificationResult> {
  const route = getRouteByPath(path);
  return verifyRouteElements(page, route, options);
}

/**
 * Verify all required elements for a route are present
 * 
 * @param page Playwright page object
 * @param route Route configuration object
 * @param options Verification options 
 * @returns Element verification result
 */
export async function verifyRouteElements(
  page: Page,
  route: RouteConfig,
  options: ElementVerificationOptions = {}
): Promise<ElementVerificationResult> {
  const {
    timeout = route.defaultTimeout || 10000,
    screenshotPath,
    verbose = false,
    throwOnFailure = true
  } = options;

  if (verbose) {
    console.log(`🔍 Verifying elements for route: ${route.title} (${route.path})`);
  }

  const found: string[] = [];
  const notFound: string[] = [];
  const missing: string[] = [];

  // Check each element in the route configuration
  await Promise.all(route.elements.map(async (element) => {
    const { id, name, selector, required = true, customVerify } = element;
    if (verbose) console.log(`🔎 Checking element: ID='${id}', Name='${name}', Required=${required}`);
    
    try {
      const elementSelector = selector(page);
      
      if (customVerify) {
        // Use custom verification if provided
        const isVisible = await customVerify(page);
        if (isVisible) {
          if (verbose) console.log(`✅ Found element: ${name} (custom verification)`);
          found.push(name);
        } else {
          if (required) {
            if (verbose) console.error(`❌ Required element not found: ${name} (custom verification)`);
            missing.push(name);
          } else {
            if (verbose) console.log(`⚠️ Optional element not found: ${name} (custom verification)`);
            notFound.push(name);
          }
        }
      } else {
        // Default verification
        if (verbose) console.log(`  Attempting to find selector for '${name}'...`);
        await elementSelector.waitFor({ state: 'visible', timeout });
        if (verbose) console.log(`  ✅ Selector for '${name}' resolved and element is visible.`);
        if (verbose) console.log(`✅ Found element: ${name}`);
        found.push(name);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message.split('\n')[0] : String(error);
      if (verbose) console.error(`  ❗ Error for element '${name}': ${errorMessage}`);
      if (required) {
        if (verbose) console.error(`❌ Required element not found: ${name}`);
        missing.push(name);
      } else {
        if (verbose) console.log(`⚠️ Optional element not found: ${name}`);
        notFound.push(name);
      }
    }
  }));

  // Determine success and capture screenshot if verification failed
  const success = missing.length === 0;
  let capturedScreenshotPath: string | undefined = undefined;

  if (!success && screenshotPath) {
    try {
      await page.screenshot({ path: screenshotPath });
      capturedScreenshotPath = screenshotPath;
      if (verbose) {
        console.log(`📸 Saved verification failure screenshot: ${screenshotPath}`);
      }
    } catch (error) {
      console.error(`Failed to save screenshot: ${error}`);
    }
  }

  // Create verification result
  const result: ElementVerificationResult = {
    success,
    details: { found, notFound, missing },
    screenshotPath: capturedScreenshotPath
  };

  // Log summary if verbose
  if (verbose) {
    console.log(`📊 Element verification results for ${route.title}:`);
    console.log(`   Found: ${found.length} elements`);
    console.log(`   Not found (optional): ${notFound.length} elements`);
    console.log(`   Missing (required): ${missing.length} elements`);
    console.log(`   Overall result: ${success ? '✅ PASS' : '❌ FAIL'}`);
  }

  // Throw error if verification failed and throwOnFailure is true
  if (!success && throwOnFailure) {
    const errorMessage = `Route element verification failed for ${route.title} (${route.path}). Missing required elements: ${missing.join(', ')}`;
    if (capturedScreenshotPath) {
      console.error(`${errorMessage}. Screenshot saved to: ${capturedScreenshotPath}`);
    }
    throw new Error(errorMessage);
  }

  // Enhanced debug logging for element verification
  console.log(`[verifyRouteElements DEBUG] Route: ${route?.id || route?.title || 'UNKNOWN'} (${route?.path || 'no-path'})`);
  console.log(`[verifyRouteElements DEBUG] Success: ${success}`);
  console.log(`[verifyRouteElements DEBUG] Found elements: ${found.join(', ')}`);
  
  if (missing.length > 0) {
    console.log(`[verifyRouteElements DEBUG] ❌ MISSING REQUIRED elements: ${missing.join(', ')}`);
    
    // For each missing element, log the selector used to try to find it
    for (const elementId of missing) {
      const element = route.elements.find(e => e.id === elementId || e.name === elementId);
      if (element) {
        console.log(`[verifyRouteElements DEBUG] Missing element "${elementId}" used selector: ${element.selector.toString()}`);
      }
    }
  } else {
    console.log(`[verifyRouteElements DEBUG] ✅ All required elements found`);
  }
  
  if (notFound.length > 0) {
    console.log(`[verifyRouteElements DEBUG] Optional elements not found: ${notFound.join(', ')}`);
  }
  
  console.log(`[verifyRouteElements DEBUG] Full route object: ${JSON.stringify(route, null, 2)}`);
  return result;
}

/**
 * Wait for a route to be ready by verifying its required elements
 * 
 * @param page Playwright page object
 * @param routeIdOrPath Route ID or URL path
 * @param options Verification options
 * @returns Element verification result
 */
export async function waitForRouteReady(
  page: Page,
  routeIdOrPath: string,
  options: ElementVerificationOptions = {}
): Promise<ElementVerificationResult> {
  // Determine if we're dealing with a route ID or path
  let route: RouteConfig;
  
  try {
    // Try to get route by ID first
    route = getRouteById(routeIdOrPath);
  } catch (error) {
    // If that fails, try by path
    try {
      route = getRouteByPath(routeIdOrPath);
    } catch (innerError) {
      throw new Error(`Could not find route configuration for '${routeIdOrPath}'. It is neither a valid route ID nor path.`);
    }
  }
  
  return verifyRouteElements(page, route, options);
}

/**
 * Get route elements for a route for direct test interaction
 * 
 * @param page Playwright page object
 * @param routeIdOrPath Route ID or URL path
 * @returns Object mapping element IDs to their Playwright locators
 */
export function getRouteElements(page: Page, routeIdOrPath: string): Record<string, any> {
  // Determine if we're dealing with a route ID or path
  let route: RouteConfig;
  
  try {
    // Try to get route by ID first
    route = getRouteById(routeIdOrPath);
  } catch (error) {
    // If that fails, try by path
    try {
      route = getRouteByPath(routeIdOrPath);
    } catch (innerError) {
      throw new Error(`Could not find route configuration for '${routeIdOrPath}'. It is neither a valid route ID nor path.`);
    }
  }

  // Create an object with all element selectors for this route
  const elements: Record<string, any> = {};
  
  route.elements.forEach(element => {
    // Convert from element.id (like 'task_list') to camelCase property (like 'taskList')
    const propertyName = element.id.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    elements[propertyName] = element.selector(page);
  });
  
  return elements;
}
