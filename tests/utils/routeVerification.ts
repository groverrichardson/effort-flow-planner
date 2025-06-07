/**
 * Route Verification Utilities
 * 
 * These utilities provide element-based verification for specific routes,
 * ensuring that navigation has fully completed and the page is ready for interaction.
 */

import { Page } from '@playwright/test';

/**
 * Represents a unique element identifier for route verification
 */
interface RouteElement {
  /** Name of the element for logging */
  name: string;
  /** Function that returns a selector for the element */
  selector: (page: Page) => any;
  /** Optional custom verification function */
  customVerify?: (page: Page) => Promise<boolean>;
  /** Whether this element is required for verification (default: true) */
  required?: boolean;
}

/**
 * Route definitions containing unique identifiable elements for each route
 */
export const routeDefinitions = {
  // Root/Dashboard route identifiers
  '/': [
    {
      name: 'Dashboard Title',
      selector: (page: Page) => page.getByRole('heading', { name: /dashboard|home|welcome/i }),
      required: true
    },
    {
      name: 'Tasks Overview',
      selector: (page: Page) => page.locator('[data-testid="dashboard-tasks"], .dashboard-tasks, .task-overview'),
      required: true
    },
    {
      name: 'Date Display',
      selector: (page: Page) => page.locator('.date-display, [data-testid="current-date"]'),
      required: false
    },
    {
      name: 'Quick Add Button',
      selector: (page: Page) => page.getByRole('button', { name: /add|create|new/i }).filter({ hasText: /task|note/i }),
      required: false
    }
  ],

  // Tasks route identifiers
  '/tasks': [
    {
      name: 'Tasks Title',
      selector: (page: Page) => page.getByRole('heading', { name: /tasks|todo|todo list/i }),
      required: true
    },
    {
      name: 'Task List',
      selector: (page: Page) => page.locator('[data-testid="task-list"], .task-list, .tasks-container'),
      required: true
    },
    {
      name: 'Add Task Button',
      selector: (page: Page) => page.getByRole('button', { name: /add|create|new/i }).filter({ hasText: /task/i }),
      required: false
    },
    {
      name: 'Task Filter',
      selector: (page: Page) => page.locator('[data-testid="task-filter"], .task-filter, .filter-options'),
      required: false
    }
  ],

  // Notes route identifiers
  '/notes': [
    {
      name: 'Notes Title',
      selector: (page: Page) => page.getByRole('heading', { name: /notes|notebook/i }),
      required: true
    },
    {
      name: 'Notes List',
      selector: (page: Page) => page.locator('[data-testid="notes-list"], .notes-list, .notes-container'),
      required: true
    },
    {
      name: 'Add Note Button',
      selector: (page: Page) => page.getByRole('button', { name: /add|create|new/i }).filter({ hasText: /note/i }),
      required: false
    },
    {
      name: 'Search Notes',
      selector: (page: Page) => page.locator('[placeholder*="Search"], input[type="search"]'),
      required: false
    }
  ],

  // Login route identifiers
  '/login': [
    {
      name: 'Login Form',
      selector: (page: Page) => page.locator('form'),
      required: true
    },
    {
      name: 'Email Input',
      selector: (page: Page) => page.getByLabel(/email/i),
      required: true
    },
    {
      name: 'Password Input',
      selector: (page: Page) => page.getByLabel(/password/i),
      required: true
    },
    {
      name: 'Login Button',
      selector: (page: Page) => page.getByRole('button', { name: /log[ -]?in|sign[ -]?in/i }),
      required: true
    }
  ],
};

/**
 * Configuration options for route element verification
 */
export interface RouteVerificationOptions {
  /** Timeout for waiting for route elements in milliseconds */
  timeout?: number;
  /** Whether to throw an error if verification fails */
  throwOnFailure?: boolean;
  /** Whether to take a screenshot if verification fails */
  screenshotOnFailure?: boolean;
  /** File path for screenshot if verification fails */
  screenshotPath?: string;
  /** Whether to log details of each element verification */
  verbose?: boolean;
}

/**
 * Result of a route element verification
 */
export interface RouteVerificationResult {
  /** Whether all required elements were found */
  success: boolean;
  /** Details of which elements were found and not found */
  details: {
    found: string[];
    notFound: string[];
  };
  /** Error message if verification failed */
  errorMessage?: string;
}

/**
 * Verify that the current page contains the expected elements for a specific route
 * 
 * @param page - Playwright page object
 * @param route - The route to verify elements for
 * @param options - Configuration options for verification
 * @returns Promise resolving to verification result
 */
export async function verifyRouteElements(
  page: Page,
  route: string,
  options: RouteVerificationOptions = {}
): Promise<RouteVerificationResult> {
  const {
    timeout = 10000,
    throwOnFailure = true,
    screenshotOnFailure = true,
    screenshotPath = `route-verification-failed-${Date.now()}.png`,
    verbose = true
  } = options;

  // Get the element definitions for this route
  const routeElements = routeDefinitions[route];
  if (!routeElements || routeElements.length === 0) {
    const errorMessage = `No route elements defined for route: ${route}`;
    console.error(errorMessage);
    
    if (throwOnFailure) {
      throw new Error(errorMessage);
    }
    
    return {
      success: false,
      details: { found: [], notFound: [] },
      errorMessage
    };
  }

  const result: RouteVerificationResult = {
    success: true,
    details: {
      found: [],
      notFound: []
    }
  };

  if (verbose) {
    console.log(`Verifying elements for route: ${route}`);
  }

  // Check each element
  for (const element of routeElements) {
    const { name, selector, customVerify, required = true } = element;
    let elementFound = false;

    try {
      // Use either the custom verify function or check if the selector exists
      if (customVerify) {
        elementFound = await customVerify(page);
      } else {
        const selectorObj = selector(page);
        
        // Wait for the element with timeout
        try {
          // Try to wait for the element to be visible
          await selectorObj.waitFor({ state: 'visible', timeout });
          elementFound = true;
        } catch (waitError) {
          // If waiting for visibility fails, check if it exists at all
          try {
            elementFound = await selectorObj.count() > 0;
          } catch (countError) {
            elementFound = false;
          }
        }
      }

      // Track result
      if (elementFound) {
        result.details.found.push(name);
        if (verbose) {
          console.log(`✅ Found ${name}`);
        }
      } else {
        result.details.notFound.push(name);
        if (verbose) {
          console.log(`❌ Not found: ${name}`);
        }
        
        // If this is a required element, mark verification as failed
        if (required) {
          result.success = false;
        }
      }
    } catch (error) {
      result.details.notFound.push(name);
      if (verbose) {
        console.log(`❌ Error finding ${name}: ${error.message}`);
      }
      
      // If this is a required element, mark verification as failed
      if (required) {
        result.success = false;
      }
    }
  }

  // Handle verification failure
  if (!result.success) {
    const errorMessage = `Route verification failed for ${route}. Missing required elements: ${result.details.notFound.filter(name => 
      routeElements.find(el => el.name === name)?.required
    ).join(', ')}`;
    
    result.errorMessage = errorMessage;
    console.error(errorMessage);
    
    if (screenshotOnFailure) {
      try {
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved to ${screenshotPath}`);
      } catch (screenshotError) {
        console.error(`Failed to take screenshot: ${screenshotError.message}`);
      }
    }
    
    if (throwOnFailure) {
      throw new Error(errorMessage);
    }
  } else if (verbose) {
    console.log(`✅ All required elements verified for route: ${route}`);
  }

  return result;
}

/**
 * Wait for navigation to complete and verify route-specific elements
 * 
 * @param page - Playwright page object
 * @param route - The route to navigate to and verify
 * @param options - Configuration options for verification
 * @returns Promise resolving when navigation and verification are complete
 */
export async function waitForRouteReady(
  page: Page,
  route: string,
  options: RouteVerificationOptions = {}
): Promise<RouteVerificationResult> {
  // Wait for basic page load states first
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: options.timeout || 10000 }).catch(() => {
    console.log('Network did not reach idle state within timeout, continuing with element verification');
  });
  
  // Then verify route-specific elements
  return await verifyRouteElements(page, route, options);
}

/**
 * Get specific route elements for a page
 * This is useful for tests that need direct access to important page elements
 * 
 * @param page - Playwright page object
 * @param route - The route to get elements for
 * @returns Object containing selectors for important route elements
 */
export function getRouteElements(page: Page, route: string) {
  const routeElements = routeDefinitions[route];
  if (!routeElements) {
    throw new Error(`No route elements defined for route: ${route}`);
  }

  const elements: Record<string, any> = {};
  
  for (const element of routeElements) {
    // Convert element name to camelCase for object property
    const propertyName = element.name
      .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/^(.)/, (_, c) => c.toLowerCase());
    
    elements[propertyName] = element.selector(page);
  }

  return elements;
}
