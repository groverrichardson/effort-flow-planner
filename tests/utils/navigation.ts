/**
 * Navigation utilities for Playwright tests
 * 
 * This module provides helper functions for navigating to pages
 * and ensuring the correct elements are loaded.
 */

import { Page } from '@playwright/test';
import { routes, RouteConfig } from './routeConfig';
import { verifyRouteElements } from './elementVerification';

// Use dynamic port detection if possible, or fallback to common ports
const BASE_URL = process.env.APP_URL || 'http://localhost:8082';
const HASH_BASE = '#';

/**
 * Navigate to a route specified in the routeConfig
 * 
 * @param page Playwright page object
 * @param route Route configuration from routeConfig
 * @param params Optional route parameters (e.g., taskId for task detail)
 * @param verifyElements Whether to verify required elements are present
 * @returns Promise that resolves when navigation is complete
 */
export async function navigateTo(
  page: Page,
  route: RouteConfig,
  params: Record<string, string> = {},
  verifyElements = true
): Promise<void> {
  // Build the URL by replacing route parameters
  let url = route.path;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, value);
  }
  
  // Navigate to the route
  const fullUrl = `${HASH_BASE}${url}`;
  await page.goto(`${BASE_URL}/${fullUrl}`);
  
  // Wait for route to be fully loaded
  console.log(`Navigating to ${route.id}: ${fullUrl}`);
  await page.waitForLoadState('networkidle');
  
  // If verification is enabled, check that required elements are present
  if (verifyElements) {
    console.log(`Verifying elements for route ${route.id}`);
    const elementsVerified = await verifyRouteElements(page, route);
    if (!elementsVerified) {
      console.error(`Failed to verify elements for route ${route.id}`);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: `test-results/${route.id}-failed-verification.png` });
    }
  }
}

/**
 * Navigate to a route by ID from the routes configuration
 * 
 * @param page Playwright page object
 * @param routeId Route ID from the routes configuration
 * @param params Optional route parameters
 * @param verifyElements Whether to verify required elements are present
 * @returns Promise that resolves when navigation is complete
 */
export async function navigateToRouteById(
  page: Page,
  routeId: string,
  params: Record<string, string> = {},
  verifyElements = true
): Promise<void> {
  const route = routes[routeId];
  if (!route) {
    throw new Error(`Route ${routeId} not found in routes configuration`);
  }
  
  await navigateTo(page, route, params, verifyElements);
}
