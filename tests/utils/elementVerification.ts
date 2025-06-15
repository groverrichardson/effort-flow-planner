/**
 * Element verification utilities for UI tests
 * 
 * This module provides helper functions to verify that required elements
 * are present on a page according to route configuration.
 */

import { Page } from '@playwright/test';
import { RouteConfig } from './routeConfig';

/**
 * Default timeout for element verification
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Verify that all required elements defined in the route configuration 
 * are present on the page
 * 
 * @param page Playwright page object
 * @param route Route configuration from routeConfig
 * @returns Promise that resolves to boolean indicating if all required elements were found
 */
export async function verifyRouteElements(
  page: Page,
  route: RouteConfig
): Promise<boolean> {
  // Use route-specific timeout if defined, otherwise default
  const timeout = route.defaultTimeout || DEFAULT_TIMEOUT;
  
  if (!route.elements || route.elements.length === 0) {
    console.log(`No elements defined for route ${route.id}, skipping verification`);
    return true;
  }
  
  console.log(`Verifying ${route.elements.length} elements for route ${route.id}`);
  
  let allFound = true;
  
  // Check each defined element
  for (const element of route.elements) {
    if (!element.required) {
      console.log(`Skipping optional element: ${element.id}`);
      continue;
    }
    
    try {
      const locator = element.selector(page);
      console.log(`Waiting for element ${element.id} (${element.name})...`);
      
      // Wait for element to be visible
      await locator.waitFor({ 
        state: 'visible', 
        timeout: timeout
      });
      
      console.log(`✓ Element ${element.id} (${element.name}) found`);
    } catch (error) {
      console.error(`✗ Element ${element.id} (${element.name}) not found: ${error}`);
      allFound = false;
      
      // Take a screenshot for debugging
      await page.screenshot({ path: `test-results/${route.id}-${element.id}-not-found.png` });
    }
  }
  
  if (allFound) {
    console.log(`All required elements verified for route ${route.id}`);
  } else {
    console.error(`Not all required elements were found for route ${route.id}`);
  }
  
  return allFound;
}
