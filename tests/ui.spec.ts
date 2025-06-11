import { test, expect, Page, TestInfo } from '@playwright/test';
import { routes, RouteConfig, getRouteById } from './utils/routeConfig';
import { navigateTo, NavigationResult, authenticate, bypassLogin } from './utils/navigationHelperNew';
import { compareScreenshotAndAttachToReport } from './utils/screenshotHelper';
import {
    seedTemplateNote,
    TestNoteTemplate,
    testDataSeeder,
    seedTestTasks,
    seedTestNotes
} from './utils/testDataSeeder';
import { waitForRouteReady } from './utils/routeElementVerifier';
import { navigationReporter } from './utils/navigationReporter';

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
        console.log(
            'Network did not reach idle state within timeout, continuing'
        );
    });

    // If a specific route is provided, use element-based verification
    if (route) {
        try {
            // Wait for route-specific elements using route ID if possible
            // This function verifies the route is ready with all required elements
            await waitForRouteReady(page, route, {
                verbose: true,
                throwOnFailure: false,
                timeout: 5000,
            });
            console.log(`Route elements verified for ${route}`);
        } catch (error) {
            console.error(
                `Failed to verify elements for route ${route}:`,
                error.message
            );
        }
    }
}

// Helper function to navigate and verify page content
async function navigateToPage(
    page: Page,
    routeName: string,
    options: { route?: string; params?: Record<string, string> } = {}
) {
    const routeId = options.route || routeName;
    const result = await navigateTo(page, routeId, options.params);

    // Use the navigation reporter
    navigationReporter.logNavigation(result, routeName);

    if (!result.success) {
        console.error(`Navigation to ${routeName} failed: ${result.errorMessage}`);
        if (result.screenshotPath) {
            console.log(`📸 See screenshot: ${result.screenshotPath}`);
        }
        throw new Error(
            `Navigation to ${routeName} failed: ${result.errorMessage}`
        );
    }

    return result;
}

// Main test suite
test.describe('Playwright UI Tests', () => {
    // All tests will use the authentication state created by global-setup.ts
    test.use({ storageState: 'playwright/.auth/user.json' });
    
    // Seed test data before all tests
    test.beforeAll(async () => {
        console.log('[TEST] Using authenticated state from playwright/.auth/user.json');
        
        try {
            // Create test tasks for UI tests to ensure Task Summary and Task List have content
            console.log('[TEST] Seeding test data for UI tests...');
            await seedTestTasks(5); // Create 5 test tasks
            console.log('[TEST] Test tasks created successfully');
        } catch (error) {
            console.error(`[TEST] Failed to seed test data: ${error.message}`);
            // Continue tests even if seeding fails - we'll see the specific errors in test failures
        }
    });

    test.describe('Visual Tests for Main Pages', () => {
        test.beforeEach(async () => {
            // Seeding test data
            await testDataSeeder.cleanup();
            await seedTestTasks(5);
            await seedTestNotes(3);
        });

        test('login page visual test', async ({ page }) => {
            await navigateToPage(page, 'login');
            await waitForRouteReady(page, 'login', { throwOnFailure: true });
            await compareScreenshotAndAttachToReport(page, 'login-page');
        });

        test('dashboard content test', async ({ page }) => {
            await navigateToPage(page, 'dashboard');
            await waitForRouteReady(page, 'dashboard', { throwOnFailure: true });
            await compareScreenshotAndAttachToReport(page, 'dashboard-content');
        });

        test('dashboard visual test', async ({ page }) => {
            await page.goto('/');
            await waitForPageStability(page);
            await page.click('[data-testid="show-all-active-tasks-button"]');
            await waitForRouteReady(page, 'dashboard', { throwOnFailure: true });
            await compareScreenshotAndAttachToReport(page, 'dashboard-view');
        });

        test('tasks page visual test', async ({ page }) => {
            await page.goto('/tasks');
            await waitForPageStability(page);
            
            // Add debug logging to see what data is available
            console.log('[DEBUG] Adding console log observer for owedToOthersTasks debugging');
            page.on('console', msg => {
                if (msg.text().includes('owedToOthersTasks')) {
                    console.log(`[PLAYWRIGHT CONSOLE] ${msg.text()}`);
                }
            });
            
            // Take screenshot of current state
            await page.screenshot({ path: './screenshots/debug-before-action.png' });
            
            // Print the HTML content of the page for debugging
            const content = await page.content();
            console.log('[DEBUG] Page content snapshot:', content.substring(0, 500) + '...');
            
            // Try to evaluate task data directly in the page
            try {
                const taskData = await page.evaluate(() => {
                    // @ts-ignore - accessing window variables
                    return window.__DEBUG_TASKS__ ? window.__DEBUG_TASKS__ : 'No debug tasks found';
                });
                console.log('[DEBUG] Task data from page:', taskData);
            } catch (err) {
                console.log('[DEBUG] Error getting task data:', err);
            }
            
            // Continue with the test
            await page.click('[data-testid="show-all-active-tasks-button"]');
            
            // Take another screenshot after the click
            await page.screenshot({ path: './screenshots/debug-after-click.png' });
            
            await waitForRouteReady(page, 'tasks', { throwOnFailure: true });
            await compareScreenshotAndAttachToReport(page, 'tasks-page');
        });

        test('task creation form', async ({ page }) => {
            await page.goto('/tasks');
            await waitForPageStability(page);
            await page.click('[data-testid="show-all-active-tasks-button"]');
            await waitForRouteReady(page, 'tasks', { throwOnFailure: true });
            await page.click('button:has-text("Add Task")');
            await waitForPageStability(page);
            await compareScreenshotAndAttachToReport(page, 'task-creation-form');
        });
    });

    // Group for device-specific views
    test.describe('Device-specific views', () => {
        test.beforeEach(async () => {
            // This group focuses on device-specific layouts, ensure data exists
            await testDataSeeder.cleanup();
            await seedTestTasks(3, { prefix: 'DeviceTest' });
            await seedTestNotes(2, { prefix: 'DeviceNote' });
        });

        test.describe('Desktop viewport', () => {
            test.use({ viewport: devices.desktop });

            test('desktop sidebar view', async ({ page }) => {
                await page.goto('/');
                await waitForPageStability(page);
                await page.click('[data-testid="show-all-active-tasks-button"]');
                await waitForRouteReady(page, 'dashboard', { throwOnFailure: true });
                await compareScreenshotAndAttachToReport(page, 'desktop-sidebar');
            });

            test('desktop dashboard content', async ({ page }) => {
                await page.goto('/');
                await waitForPageStability(page);
                await page.click('[data-testid="show-all-active-tasks-button"]');
                await waitForRouteReady(page, 'dashboard', { throwOnFailure: true });
                await compareScreenshotAndAttachToReport(page, 'desktop-dashboard-content');
            });
        });

        test.describe('Mobile viewport', () => {
            test.use({ viewport: devices.mobile });

            test('mobile layout (sidebar likely collapsed)', async ({ page }) => {
                await page.goto('/');
                await waitForPageStability(page);
                await page.click('[data-testid="show-all-active-tasks-button"]');
                await waitForRouteReady(page, 'dashboard', { throwOnFailure: true });
                await compareScreenshotAndAttachToReport(page, 'mobile-layout');
            });
        });
    });
});

// After all tests in this file, generate the navigation report
test.afterAll(async () => {
    navigationReporter.generateReport();
});
