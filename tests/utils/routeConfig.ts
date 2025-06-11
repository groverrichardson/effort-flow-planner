/**
 * Route Configuration Definitions
 * 
 * This file contains structured route objects used by tests for navigation and verification.
 * Adding a new route only requires updating these configurations.
 */

import { Page } from '@playwright/test';

/**
 * Route element definition - represents a unique element identifier for route verification
 */
export interface RouteElement {
  /** Name of the element for logging */
  id: string;
  /** Human-readable name of the element for logging */
  name: string;
  /** Function that returns a selector for the element */
  selector: (page: Page) => any;
  /** Optional custom verification function */
  customVerify?: (page: Page) => Promise<boolean>;
  /** Whether this element is required for verification (default: true) */
  required?: boolean;
}

/**
 * Route configuration object - defines properties and verification settings for a route
 */
export interface RouteConfig {
  /** Unique identifier for the route */
  id: string;
  /** URL path for the route */
  path: string;
  /** Human-readable title of the route */
  title: string;
  /** Description of the route purpose */
  description?: string;
  /** Expected page title (used for additional verification) */
  pageTitle?: string;
  /** Expected elements that should be present on this route */
  elements: RouteElement[];
  /** Whether this route requires authentication */
  requiresAuth: boolean;
  /** Authentication scope if required (useful for role-based testing) */
  authScope?: string;
  /** Custom verification function for the route */
  customVerification?: (page: Page) => Promise<boolean>;
  /** Default timeout for this route in milliseconds */
  defaultTimeout?: number;
  /** Special navigation options for this route */
  navigationOptions?: {
    /** Whether to wait for network idle before verification */
    waitForNetworkIdle?: boolean;
    /** Maximum retry attempts for this specific route */
    maxRetries?: number;
    /** Special query parameters to add during navigation */
    queryParams?: Record<string, string | number>;
  };
}

/**
 * Route definitions for the application
 */
export const routes: Record<string, RouteConfig> = {
  login: {
    id: 'login',
    path: '/login',
    title: 'Login',
    description: 'User login page',
    pageTitle: 'Login | DoNext',
    requiresAuth: false,
    elements: [
      { id: 'login_title', name: 'Login Title', required: true, selector: (page) => page.locator('h1:has-text("Login")') },
      { id: 'email_input', name: 'Email Input', required: true, selector: (page) => page.locator('input[type="email"]') },
      { id: 'password_input', name: 'Password Input', required: true, selector: (page) => page.locator('input[type="password"]') },
      { id: 'submit_button', name: 'Submit Button', required: true, selector: (page) => page.locator('button[type="submit"]') },
    ],
  },
  dashboard: {
    id: 'dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Main user dashboard',
    pageTitle: 'Dashboard | DoNext',
    requiresAuth: true,
    elements: [
      { id: 'dashboard_header', name: 'Dashboard Header', required: false, selector: (page) => page.locator('h1:has-text("Dashboard")') },
      { id: 'task_summary', name: 'Task Summary', required: true, selector: (page) => page.locator('[data-testid="task-summary"]') },
      { id: 'quick_actions', name: 'Quick Actions', required: false, selector: (page) => page.locator('[data-testid="quick-actions"]') },
    ],
  },
  tasks: {
    id: 'tasks',
    path: '/tasks',
    title: 'Tasks',
    description: 'Task list page showing all tasks with filtering options',
    pageTitle: 'Tasks | DoNext',
    requiresAuth: true,
    elements: [
      { id: 'tasks_title', name: 'Tasks Title', required: false, selector: (page) => page.locator('h1:has-text("Tasks")') },
      { id: 'task_list', name: 'Task List', required: true, selector: (page) => page.locator('[data-testid="task-list"]') },
      { id: 'add_task_button', name: 'Add Task Button', required: false, selector: (page) => page.locator('button:has-text("Add Task")') },
      { id: 'task_filter', name: 'Task Filter', required: false, selector: (page) => page.locator('[data-testid="task-filter"]') },
    ],
    defaultTimeout: 12000,
  },
  notes: {
    id: 'notes',
    path: '/notes',
    title: 'Notes',
    description: 'Notes listing page showing all user notes',
    pageTitle: 'Notes | DoNext',
    requiresAuth: true,
    elements: [
      { id: 'notes_title', name: 'Notes Title', required: false, selector: (page) => page.locator('h1:has-text("Notes")') },
      { id: 'notes_list', name: 'Notes List', required: true, selector: (page) => page.locator('[data-testid="notes-list"]') },
      { id: 'add_note_button', name: 'Add Note Button', required: false, selector: (page) => page.locator('button:has-text("Add Note")') },
      { id: 'search_notes', name: 'Search Notes', required: false, selector: (page) => page.locator('input[placeholder*="Search"]') },
    ],
    defaultTimeout: 10000,
  },
  settings: {
    id: 'settings',
    path: '/settings',
    title: 'Settings',
    description: 'User settings page',
    pageTitle: 'Settings | DoNext',
    requiresAuth: true,
    elements: [
      { id: 'settings_header', name: 'Settings Header', required: true, selector: (page) => page.locator('h1:has-text("Settings")') },
      { id: 'profile_section', name: 'Profile Section', required: true, selector: (page) => page.locator('[data-testid="profile-settings"]') },
      { id: 'theme_selector', name: 'Theme Selector', required: false, selector: (page) => page.locator('[data-testid="theme-selector"]') },
    ],
  },
};

/**
 * Get a route configuration by its ID.
 *
 * @param routeId The ID of the route to retrieve.
 * @returns The route configuration object, or undefined if not found.
 */
export function getRouteById(routeId: string): RouteConfig | undefined {
  if (routeId === '/') {
    return routes['dashboard'];
  }
  const route = routes[routeId];
  if (!route) {
    // Return a fallback route configuration for dynamic paths
    return {
      id: routeId,
      path: routeId, // Assume path is the same as ID if not found
      title: `Dynamic Route: ${routeId}`,
      elements: [],
      requiresAuth: true, // Default to requiring auth for unknown routes
    };
  }
  return route;
}

/**
 * Get a route configuration by its path.
 *
 * @param path The path of the route to retrieve.
 * @returns The route configuration object, or undefined if not found.
 */
export function getRouteByPath(path: string): RouteConfig | undefined {
  return Object.values(routes).find((route) => route.path === path);
}

/**
 * Get all defined routes.
 *
 * @returns An array of all route configuration objects.
 */
export function getAllRoutes(): RouteConfig[] {
  return Object.values(routes);
}

/**
 * Checks if a URL path matches a route pattern (handling parameters)
 * 
 * @param routePath The route pattern (e.g. "/tasks/:taskId")
 * @param urlPath The actual URL path to test (e.g. "/tasks/123")
 * @returns Whether the URL path matches the route pattern
 */
export function matchesRoutePath(routePath: string, urlPath: string): boolean {
  // Convert route pattern to regex
  // :paramName becomes a capture group ([^/]+)
  const pattern = routePath
    .replace(/:[^/]+/g, '([^/]+)')
    .replace(/\//g, '\\/');
  
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(urlPath);
}

/**
 * Get route parameters from a URL path based on a route pattern
 * 
 * @param routePath The route pattern (e.g. "/tasks/:taskId")
 * @param urlPath The actual URL path (e.g. "/tasks/123")
 * @returns Record of parameter names and values, or null if no match
 */
export function extractRouteParams(
  routePath: string, 
  urlPath: string
): Record<string, string> | null {
  // Extract param names from route pattern
  const paramNames: string[] = [];
  const routeRegex = routePath.replace(/:([^/]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });
  
  // Create regex with capture groups for params
  const pattern = new RegExp(`^${routeRegex.replace(/\//g, '\\/')}$`);
  const match = urlPath.match(pattern);
  
  if (!match) {
    return null;
  }
  
  // Create object with param names and values
  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });
  
  return params;
}

/**
 * Get a concrete route path by substituting parameters
 * 
 * @param routePath The route pattern (e.g. "/tasks/:taskId") 
 * @param params The parameters to substitute
 * @returns The concrete route path with substituted parameters
 */
export function getConcreteRoutePath(
  routePath: string,
  params: Record<string, string>
): string {
  let path = routePath;
  
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  
  return path;
}
