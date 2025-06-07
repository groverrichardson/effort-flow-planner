import { test, expect, Page, TestInfo } from '@playwright/test'; // Added Page, TestInfo
import { 
  verifyUrl, 
  verifyNavigation,
  routes, 
  getRouteById, 
  navigateTo, 
  NavigationResult, 
  waitForRouteReady, 
  getRouteElements,
  navigationReporter, // Import the reporter
  bypassLogin // Import bypassLogin
} from './utils';

// Define device viewports
const devices = {
    desktop: { width: 1280, height: 720 },
    mobile: { width: 375, height: 667 },
};

// Authentication state storage
type AuthState = {
    isAuthenticated: boolean;
};

// Create authentication state for each test group
const authStates: Record<string, AuthState> = {};

// Helper function to wait for page stability with improved element verification
async function waitForPageStability(page, route = null) {
    // Basic page load waiting
    await page.waitForLoadState('domcontentloaded');
    
    // Try to wait for network idle, but don't fail if it times out
    await page.waitForLoadState('networkidle').catch(() => {
        console.log('Network did not reach idle state within timeout, continuing');
    });
    
    // If a specific route is provided, use element-based verification
    if (route) {
        try {
            // Wait for route-specific elements using route ID if possible
            // This function verifies the route is ready with all required elements
            await waitForRouteReady(page, route, { 
                verbose: true, 
                throwOnFailure: false, 
                timeout: 5000 
            });
            console.log(`Route elements verified for ${route}`);
        } catch (error) {
            console.error(`Failed to verify elements for ${route}: ${error.message}`);
            // Take screenshot to help identify the issue
            const routeId = typeof route === 'string' ? route : 'unknown';
            await page.screenshot({ path: `route-verification-failed-${routeId}.png` });
            throw error;
        } 
    }
    // Fall back to timeout if no route provided or verification failed
    await page.waitForTimeout(1500);
}

// Helper function for standardized navigation pattern with comprehensive verification
async function navigateToPage(page: Page, routeIdOrPath: string, testInfo: TestInfo): Promise<NavigationResult> {
    // Use our enhanced navigation helper that includes retry logic and detailed reporting
    try {
        // Get route configuration for better reporting
        const routeConfig = typeof routeIdOrPath === 'string' && routes[routeIdOrPath] 
            ? routes[routeIdOrPath] 
            : null;
            
        const routeName = routeConfig ? routeConfig.title : routeIdOrPath;
        // console.log(`📱 Navigating to ${routeName}`); // Reporter will provide detailed logs
        
        const result = await navigateTo(page, routeIdOrPath, bypassLogin, {
            maxRetries: 2,
            timeout: 15000,
            throwOnFailure: false,
            verificationOptions: {
                timeout: 10000,
                screenshotPath: `route-verification-${routeIdOrPath.replace(/\//g, '_')}-${Date.now()}.png`,
                verbose: true
            },
            verbose: true
        });
        
        if (!result.success) {
            console.error(`❌ Navigation to ${routeName} failed: ${result.errorMessage}`);
            if (result.screenshotPath) {
                console.log(`📸 See screenshot: ${result.screenshotPath}`);
            }
            throw new Error(`Navigation to ${routeName} failed: ${result.errorMessage}`);
        }
        
        // Reporter handles detailed logging
        navigationReporter.logNavigation(result, testInfo.title);

        // If navigation failed, throw an error to ensure the test fails clearly here
        if (!result.success) {
            const effectiveRouteName = result.routeConfig?.title || result.targetRoute;
            // The reporter already console.error-ed details. This throw makes the test fail.
            throw new Error(`Navigation to ${effectiveRouteName} failed as reported: ${result.errorMessage}`);
        }
        
        return result;
    } catch (error) {
        // This catch block handles errors thrown by navigateToPage itself or if navigateTo throws unexpectedly
        const routeName = typeof routeIdOrPath === 'string' && routes[routeIdOrPath] ? routes[routeIdOrPath].title : routeIdOrPath;
        const errorMsg = error instanceof Error ? error.message : String(error);

        const failureResult: NavigationResult = {
            success: false,
            targetRoute: routeIdOrPath,
            actualUrl: page ? page.url() : 'unknown',
            urlVerified: false,
            elementsVerified: false,
            errorMessage: `Critical error in navigateToPage for ${routeName}: ${errorMsg}`,
            timestamp: Date.now(),
            duration: 0, // Duration calculation might need a startTime at the beginning of navigateToPage
        };
        navigationReporter.logNavigation(failureResult, testInfo.title);
        // console.error(`❌ Critical error during navigation to ${routeName}: ${errorMsg}`); // Reporter logs this
        throw error; // Re-throw to ensure test fails
    }
}


// Test all main pages for visual regressions
test.describe('Visual Tests for Main Pages', () => {
    // Configure for desktop viewport by default
    test.use({ viewport: devices.desktop });
    
    // Authentication state for this group
    authStates['Visual Tests for Main Pages'] = { isAuthenticated: false };
    
    // Authenticate once before all tests in this group
    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        await authenticate(page);
        authStates['Visual Tests for Main Pages'].isAuthenticated = true;
        await page.close();
    });
    
    // Run before each test
    test.beforeEach(async ({ page }, testInfo: TestInfo) => {
        // Set a consistent viewport for all tests
        await page.setViewportSize({ width: 1280, height: 800 });
    });

    test('login page visual test', async ({ page }, testInfo: TestInfo) => {
        // Navigate to the login page using route ID
        const navigationResult = await navigateToPage(page, 'login', testInfo);
        
        // Assert navigation was successful
        expect(navigationResult.success).toBe(true);
        expect(navigationResult.urlVerified).toBe(true);
        expect(navigationResult.elementsVerified).toBe(true);
        
        // Log which elements were found for reporting
        console.log(`Login page elements found: ${navigationResult.elementDetails?.found.join(', ')}`);

        // Take a screenshot and compare it to the baseline
        await expect(page).toHaveScreenshot('login-page.png');
    });

    test('dashboard visual test', async ({ page }, testInfo: TestInfo) => {
        // Navigate to the dashboard using route ID instead of path
        const navigationResult = await navigateToPage(page, 'dashboard', testInfo);
        
        // Assert navigation was successful
        expect(navigationResult.success).toBe(true);
        expect(navigationResult.urlVerified).toBe(true);
        expect(navigationResult.elementsVerified).toBe(true);
        
        // Log which elements were found for reporting
        console.log(`Dashboard elements found: ${navigationResult.elementDetails?.found.join(', ')}`);
        
        // Take a screenshot and compare it to the baseline
        await expect(page).toHaveScreenshot('dashboard-page.png');
    });

    test('tasks page visual test', async ({ page }, testInfo: TestInfo) => {
        // Navigate to tasks page using route ID
        const navigationResult = await navigateToPage(page, 'tasks', testInfo);
        
        // Assert navigation was successful
        expect(navigationResult.success).toBe(true);
        expect(navigationResult.urlVerified).toBe(true);
        expect(navigationResult.elementsVerified).toBe(true);
        
        // Log which elements were found for reporting
        console.log(`Tasks page elements found: ${navigationResult.elementDetails?.found.join(', ')}`);
        
        // Take a screenshot and compare it to the baseline
        await expect(page).toHaveScreenshot('tasks-page.png');
    });

    test('notes page visual test', async ({ page }, testInfo: TestInfo) => {
        // Navigate to notes page using route ID
        const navigationResult = await navigateToPage(page, 'notes', testInfo);
        
        // Assert navigation was successful
        expect(navigationResult.success).toBe(true);
        expect(navigationResult.urlVerified).toBe(true);
        expect(navigationResult.elementsVerified).toBe(true);
        
        // Log which elements were found for reporting
        console.log(`Notes page elements found: ${navigationResult.elementDetails?.found.join(', ')}`);
        
        // Take a screenshot and compare it to the baseline
        await expect(page).toHaveScreenshot('notes-page.png');
    });

    // Component-specific tests
    test('task creation form', async ({ page }, testInfo: TestInfo) => {
        // Use our enhanced navigation helper with route ID instead of path
        console.log('Starting task creation form test');
        
        const navigationResult = await navigateToPage(page, 'tasks', testInfo);
        
        // Assert navigation was successful with detailed reporting
        expect(navigationResult.success).toBe(true);
        expect(navigationResult.urlVerified).toBe(true);
        expect(navigationResult.elementsVerified).toBe(true);
        
        // Log navigation details for reporting
        console.log(`Navigation to ${navigationResult.routeConfig?.title || 'tasks page'}: SUCCESS`);
        console.log(`• URL verification: ${navigationResult.urlVerified ? '✅' : '❌'}`);
        console.log(`• Elements verification: ${navigationResult.elementsVerified ? '✅' : '❌'}`);
        console.log(`• Found elements: ${navigationResult.elementDetails?.found.join(', ')}`);
        
        // Access route elements directly from the route configuration
        const tasksRoute = getRouteById('tasks');
        const tasksElements = getRouteElements(page, 'tasks');
        expect(tasksElements).toBeTruthy();
        
        // Verify we can access expected route elements using route config properties
        if (tasksElements.taskList) {
            console.log('✅ Task list element is accessible for test interactions');
        }
        
        // Show how to access route configuration data in tests
        console.log(`Testing route: ${tasksRoute.title} (${tasksRoute.path})`);
        console.log(`Required auth: ${tasksRoute.requiresAuth ? 'Yes' : 'No'}`);
        console.log(`Required elements: ${tasksRoute.elements.filter(e => e.required).length}`);
        
        // Allow page to stabilize and verify task list is present
        try {
            // Check for task list container to verify page is ready
            const taskListSelectors = [
                page.locator('[data-testid="task-list"]'),
                page.locator('.tasks-container'),
                page.locator('.task-list-wrapper')
            ];
            
            let taskListFound = false;
            for (const selector of taskListSelectors) {
                if (await selector.count() > 0) {
                    taskListFound = true;
                    break;
                }
            }
            
            if (!taskListFound) {
                console.warn('Task list container not found - page may not be fully loaded');
                await page.waitForTimeout(1000); // Additional wait if task list not found immediately
            }
            
            // Enhanced button selectors with clear IDs and additional options
            const buttonSelectors = [
                // Primary selectors - explicit IDs and test IDs
                page.getByTestId('create-task-button'),
                page.locator('#create-task-button'),
                page.locator('#add-task-button'),
                
                // Role-based selectors
                page.getByRole('button', { name: /add task|create task|new task/i }),
                page.getByRole('button', { name: /\+|create/i }),
                
                // Text-based selectors
                page.locator('button:has-text("Create Task")'),
                page.locator('button:has-text("Add Task")'),
                page.locator('button:has-text("+")'),
                
                // Position-based selectors as last resort
                page.locator('.task-header button'),
                page.locator('header button').last(),
                page.locator('.fixed button').first()
            ];
            
            // Debug information
            console.log('Searching for task creation button...');
            
            // Try each selector until we find one that works
            let clicked = false;
            let buttonDetails = '';
            
            for (const selector of buttonSelectors) {
                const count = await selector.count();
                if (count > 0) {
                    const isVisible = await selector.isVisible();
                    if (isVisible) {
                        // Capture button details for debugging
                        try {
                            const text = await selector.textContent() || 'No text';
                            const box = await selector.boundingBox() || { x: 0, y: 0, width: 0, height: 0 };
                            buttonDetails = `Button found: text="${text}", position=(${box.x},${box.y}), size=${box.width}x${box.height}`;
                            console.log(buttonDetails);
                            
                            // Take screenshot before clicking
                            await expect(page).toHaveScreenshot('before-clicking-create-button.png');
                            
                            // Scroll to ensure button is in view
                            await selector.scrollIntoViewIfNeeded();
                            await page.waitForTimeout(300);
                            
                            await selector.click();
                            clicked = true;
                            console.log('Successfully clicked task creation button');
                            break;
                        } catch (clickErr) {
                            console.warn('Found button but click failed:', clickErr);
                            // Continue to next selector
                        }
                    } else {
                        console.log('Button found but not visible');
                    }
                }
            }
            
            if (clicked) {
                // Wait for dialog to appear with increased timeout
                console.log('Waiting for task form dialog to appear...');
                await page.waitForTimeout(1200);
                
                // Verify dialog is actually present
                const dialogSelectors = [
                    page.locator('dialog[open]'),
                    page.locator('.modal.open'),
                    page.locator('[role="dialog"]'),
                    page.locator('.dialog-container'),
                    page.locator('[data-testid="task-form"]')
                ];
                
                let dialogVisible = false;
                let dialogDetails = '';
                
                for (const dialog of dialogSelectors) {
                    if ((await dialog.count()) > 0 && (await dialog.isVisible())) {
                        dialogVisible = true;
                        dialogDetails = `Dialog found using selector: ${dialog}`;
                        console.log(dialogDetails);
                        break;
                    }
                }
                
                if (dialogVisible) {
                    console.log('Task creation dialog successfully opened');
                    await expect(page).toHaveScreenshot('task-create-form-page.png');
                } else {
                    console.error('Button was clicked but dialog did not appear');
                    await expect(page).toHaveScreenshot('task-dialog-not-visible.png');
                    throw new Error('Task form dialog not found after clicking create button');
                }
            } else {
                console.error('No viable task creation button found');
                await expect(page).toHaveScreenshot('no-create-button-found.png');
                throw new Error('No visible create task button found on tasks page');
            }
        } catch (e) {
            console.error('Task creation form test failed:', e);
            // Take screenshot of current state for debugging
            await expect(page).toHaveScreenshot('task-creation-test-failed.png');
            throw e;
        }
    });
});

// Device-specific tests for responsive views
test.describe('Device-specific views', () => {
    // Authentication state for this group
    authStates['Device-specific views'] = { isAuthenticated: false };
    
    // Authenticate once before all tests in this group
    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        await authenticate(page);
        authStates['Device-specific views'].isAuthenticated = true;
        await page.close();
    });
    
    // Desktop view tests
    test.describe('Desktop viewport', () => {
        test.use({ viewport: devices.desktop });

        test('desktop sidebar view', async ({ page }, testInfo: TestInfo) => {
            await navigateToPage(page, '/', testInfo);

            // For desktop, we expect the sidebar to be visible by default
            // Take full page screenshot that will include the sidebar
            await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
        });

        test('desktop dashboard content', async ({ page }, testInfo: TestInfo) => {
            await navigateToPage(page, '/', testInfo);

            // Screenshot main content area - avoiding precise element selection
            // Just give the app enough time to fully render
            await expect(page).toHaveScreenshot('desktop-dashboard-content.png');
        });
    });

    // Mobile view tests
    test.describe('Mobile viewport', () => {
        test.use({ viewport: devices.mobile });
        
        // Authentication state for mobile tests
        authStates['Mobile viewport'] = { isAuthenticated: false };
        
        // Authenticate once before all tests in this group
        test.beforeAll(async ({ browser }) => {
            if (!authStates['Mobile viewport'].isAuthenticated) {
                const page = await browser.newPage();
                try {
                    await authenticate(page);
                    authStates['Mobile viewport'].isAuthenticated = true;
                } catch (e) {
                    console.error('Mobile viewport authentication failed:', e);
                } finally {
                    await page.close();
                }
            }
        });

        test('mobile layout (sidebar likely collapsed)', async ({ page }, testInfo: TestInfo) => {
            try {
                await navigateToPage(page, '/', testInfo);
                
                // On mobile, sidebar may be collapsed by default - this is expected
                await expect(page).toHaveScreenshot('mobile-default-view.png');
                
                // Try to find and click a hamburger menu or sidebar toggle if it exists
                const possibleToggles = [
                    page.getByRole('button', {
                        name: /menu|toggle|hamburger|sidebar/i,
                    }),
                    page.locator(
                        '.hamburger, [data-testid="menu-button"], button.menu-toggle'
                    ),
                    page.locator('button').filter({ hasText: /☰|≡|menu/i }),
                ];

                // Try each possible toggle selector
                let toggleFound = false;
                for (const toggle of possibleToggles) {
                    if ((await toggle.count()) > 0 && (await toggle.isVisible())) {
                        await toggle.click();
                        await page.waitForTimeout(1000); // Wait for animation
                        await expect(page).toHaveScreenshot('mobile-with-sidebar-open.png');
                        toggleFound = true;
                        break; // Stop after first successful toggle
                    }
                }
                
                if (!toggleFound) {
                    console.log('No visible sidebar toggle found on mobile view');
                }
            } catch (e) {
                console.error('Mobile layout test failed:', e);
                throw e;
            }
        });
    });
});

// This is a utility to help generate visual tests for all routes efficiently
test.describe('Automatic route testing', () => {
    // Define routes once for reuse
    // const localOldRoutes = [
    //     { path: '/', name: 'home' },
    //     { path: '/tasks', name: 'tasks' },
    //     { path: '/notes', name: 'notes' },
    //     { path: '/login', name: 'login' }
    // ]; // This local variable was shadowing the imported 'routes' from routeConfig.ts
    
    // Authentication is now handled automatically by navigateToPage
    // so we don't need manual flags anymore
    
    // Run for specified devices
    const deviceTests = [
        { name: 'desktop', viewport: devices.desktop, checkSidebar: true },
        { name: 'mobile', viewport: devices.mobile, checkSidebar: false }
    ];
    
    for (const device of deviceTests) {
        test.describe(`${device.name} view`, () => {
            // Set viewport for this test group
            test.use({ viewport: device.viewport });

            // Single authentication at device group level
            test.beforeAll(async ({ browser }) => {
                // Create a new page just for authentication
                const page = await browser.newPage();
                try {
                    await page.setViewportSize(device.viewport);
                    // This will authenticate once per device type
                    await authenticate(page);
                    console.log(`Authenticated for ${device.name} device tests`);
                } catch (e) {
                    console.error(`Authentication failed for ${device.name} device:`, e);
                } finally {
                    await page.close();
                }
            });
            
            // Use a single test per device to test all routes efficiently
            test(`visual tests for all routes on ${device.name}`, async ({ page }, testInfo: TestInfo) => {
                const routesToTest = Object.values(routes); // Assuming 'routes' is the imported route configuration object
                try {
                    console.log(`Starting route tests for ${device.name} device`);
                    
                    for (const route of routesToTest) {
                        if (!route || !route.id) {
                            console.warn(`Skipping invalid route object: ${JSON.stringify(route)}`);
                            continue;
                        }
                        console.log(`Testing ${route.id} (${route.title || ''}) on ${device.name}`);
                        
                        // Navigate using our standard helper, now with testInfo
                        await navigateToPage(page, route.id, testInfo);
                        
                        // Verify we reached the correct page (optional, navigateToPage does this)
                        // if (!page.url().includes(route.path.replace('/', ''))) {
                        //     console.warn(`Expected to be on ${route.path} but got ${page.url()}`);
                        // }
                        
                        // Device-specific verifications
                        if (device.checkSidebar && route.path) { // Ensure route.path exists
                            await verifyDesktopSidebar(page, route.path);
                        }
                        
                        // Take screenshot with consistent naming
                        await expect(page).toHaveScreenshot(
                            `${device.name}-${route.id}-page.png` // Use route.id for consistency
                        );
                    }
                    
                    console.log(`Completed all route tests for ${device.name}`);
                } catch (e) {
                    console.error(`Error in ${device.name} route test:`, e);
                    // Take a diagnostic screenshot of the failure state
                    await expect(page).toHaveScreenshot(
                        `${device.name}-route-test-error.png`
                    );
                    throw e;
                }
            });
        });
    }
});

// Helper function to verify desktop sidebar state
async function verifyDesktopSidebar(page, route) {
    // Check for various sidebar selectors
    const sidebarSelectors = [
        '.sidebar',
        '[data-testid="sidebar"]',
        'nav.main-nav',
        '.navigation-sidebar',
        '#app-sidebar'
    ];
    
    // Try each selector
    for (const selector of sidebarSelectors) {
        const sidebar = page.locator(selector).first();
        const count = await sidebar.count();
        
        if (count > 0 && await sidebar.isVisible()) {
            // Sidebar found, check its dimensions
            const box = await sidebar.boundingBox();
            if (box) {
                if (box.width < 100) {
                    console.warn(`Desktop sidebar appears collapsed on ${route}, width: ${box.width}px`);
                } else {
                    // Sidebar is properly expanded
                    return true;
                }
            }
            break;
        }
    }
    
    // If we get here and it's not login page, log a warning
    if (!route.includes('login')) {
        console.log(`No visible sidebar found on desktop for ${route}`);
    }
    
    return false;
}

// After all tests in this file, generate the navigation report
test.afterAll(async () => {
  navigationReporter.generateReport();
});

