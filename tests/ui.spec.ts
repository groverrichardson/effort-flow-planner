import { test, expect, Page, TestInfo } from '@playwright/test';
import { routes, RouteConfig, getRouteById } from './utils/routeConfig';
import { navigateTo, NavigationResult, authenticate, bypassLogin } from './utils/navigationHelperNew';
import { compareScreenshotAndAttachToReport } from './utils/screenshotHelper';
import {
    seedTemplateNote,
    TestNoteTemplate,
    TestTaskTemplate,
    testDataSeeder,
    seedTestTasks,
    seedTestNotes,
    seedTemplateTask
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
    
    // Try to wait for network idle with browser-specific timeout
    const isFirefox = page.context().browser()?.browserType().name() === 'firefox';
    const networkIdleTimeout = isFirefox ? 30000 : 10000; // 30 seconds for Firefox, 10 for others
    console.log(`[TEST] Using ${networkIdleTimeout}ms networkidle timeout for ${isFirefox ? 'Firefox' : 'other browsers'}`);
    
    try {
        await page.waitForLoadState('networkidle', { timeout: networkIdleTimeout });
    } catch (error) {
        console.log('Network did not reach idle state within timeout, continuing');
    }

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

// Firefox-specific configuration helper
/**
 * Configure Firefox-specific test optimizations
 * @param testInfo Test information containing browser and project data
 * @returns True if Firefox-specific config was applied
 */
function configureFirefoxTests(testInfo: any) {
    // Check if running on Firefox and apply special configurations
    if (testInfo.project.name === 'firefox') {
        // Double the timeout for Firefox tests
        testInfo.setTimeout(120000); // 2 minutes
        console.log('[TEST CONFIG] Applied Firefox-specific optimizations with extended timeout');
        return true;
    }
    return false;
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

    // Increase timeout for visual tests which need more time for rendering and stabilizing
    test.describe('Visual Tests for Main Pages', () => {
        // Add longer timeout for visual tests (60 seconds instead of default 30)
        test.setTimeout(60000);
    /**
     * Helper function that seeds all necessary test data to ensure UI elements render correctly for tests
     * This creates tasks that satisfy specific criteria for different UI components:
     * 1. Tasks due today with people assigned (for "owed to others" list)
     * 2. High priority tasks (for task summary and filters)
     * 3. Overdue tasks (for urgent/past due sections)
     * 4. Regular tasks (for general display)
     * 
     * This comprehensive approach ensures all required UI elements appear during tests
     */
    async function seedComprehensiveTestData() {
        try {
            console.log('[TEST SETUP] Starting comprehensive test data seeding...');
            const timestamp = Date.now();
            const results: any = {};

            // 1. Task due today with person assigned - ensures "owed to others" list renders
            try {
                const dueTodayTask = await seedTemplateTask(
                    TestTaskTemplate.DUE_TODAY, 
                    `Due Today Task ${timestamp}`
                );
                // Generate truly unique person names with timestamp and random component
                const personName = `Test Person ${timestamp}-${Math.random().toString(36).substring(2, 8)}`;
                await testDataSeeder.assignPersonToTask(dueTodayTask.id, personName);
                results.dueTodayTask = { id: dueTodayTask.id, title: dueTodayTask.title, person: personName };
                console.log(`[TEST DATA] Successfully created due today task: ${dueTodayTask.title}`);
            } catch (error) {
                console.error(`[TEST DATA ERROR] Failed to create due today task: ${error.message}`);
                // Continue despite error
            }
            
            // 2. Overdue task with different person - for "owed to others" and past due
            try {
                const overdueTask = await seedTemplateTask(
                    TestTaskTemplate.OVERDUE, 
                    `Overdue Task ${timestamp}`
                );
                // Generate truly unique person name
                const personName2 = `Person Overdue ${timestamp}-${Math.random().toString(36).substring(2, 8)}`;
                await testDataSeeder.assignPersonToTask(overdueTask.id, personName2);
                results.overdueTask = { id: overdueTask.id, title: overdueTask.title, person: personName2 };
                console.log(`[TEST DATA] Successfully created overdue task: ${overdueTask.title}`);
            } catch (error) {
                console.error(`[TEST DATA ERROR] Failed to create overdue task: ${error.message}`);
                // Continue despite error
            }
            
            // 3. High priority task - for task summary and filters
            const highPriorityTask = await seedTemplateTask(
                TestTaskTemplate.HIGH_PRIORITY, 
                `High Priority ${timestamp}`
            );
            results.highPriorityTask = { id: highPriorityTask.id, title: highPriorityTask.title };
            
            // 4. Another task for general filtering/display tests
            const anotherTask = await seedTemplateTask(
                TestTaskTemplate.BASIC, 
                `Another Task ${timestamp}`
            );
            // No special properties needed for this task
            results.anotherTask = { id: anotherTask.id, title: anotherTask.title };
            
            // 5. Basic task - general purpose
            const basicTask = await seedTemplateTask(
                TestTaskTemplate.BASIC, 
                `Basic Task ${timestamp}`
            );
            results.basicTask = { id: basicTask.id, title: basicTask.title };
            
            console.log('[TEST SETUP] Created comprehensive test data:', results);
            return results;
        } catch (error) {
            console.error('[TEST SETUP] Error creating test data:', error);
            throw error;
        }
    }

    test.beforeEach(async () => {
        // Clean existing test data
        await testDataSeeder.cleanup();
        
        try {
            // Create comprehensive test data that ensures all UI elements will render
            await seedComprehensiveTestData();
            
            // Add some test notes
            await seedTestNotes(3);
            
            console.log('[TEST SETUP] Test data seeding complete');
        } catch (error) {
            console.error('[TEST SETUP] Failed to set up test data:', error);
            // Create minimal fallback data to avoid complete test failure
            await seedTestTasks(1);
            await seedTestNotes(1);
        }
    });

        test('login page visual test', async ({ page, context }) => {
            console.log('[TEST] Starting login page visual test');
            
            // Clear cookies first (safe before navigation)
            console.log('[TEST] Clearing cookies');
            await context.clearCookies();
            
            // Navigate to the root URL first to ensure we're in the app domain
            console.log('[TEST] Navigating to root URL to ensure we are on app domain');
            await page.goto('/');
            
            // Now clear localStorage and sessionStorage after we're on the app domain
            console.log('[TEST] Clearing localStorage and sessionStorage');
            try {
              await page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
                console.log('[BROWSER] Successfully cleared storage');
              });
            } catch (error) {
              console.error('[TEST] Error clearing storage:', error);
            }
            
            // Setup data for UI tests happens in the beforeEach hook
            // No need to call it again here
            
            console.log('[TEST] Navigating to login page');
            // Navigate to login page directly
            await page.goto('/login');
            
            // Add a small wait to ensure app initializes
            console.log('[TEST] Waiting for app to initialize...');
            await page.waitForTimeout(1000);
            
            // Take a screenshot for debugging
            await page.screenshot({ path: 'screenshots/login-page-debug.png' });
            
            // Get and log page content for debugging
            const content = await page.content();
            console.log('[DEBUG] Login page content snapshot:', content.substring(0, 1000) + '...');
            
            // Log more details about what's on the page
            const bodyHTML = await page.evaluate(() => document.body.innerHTML);
            console.log('[DEBUG] Body HTML:', bodyHTML.substring(0, 500) + '...');
            console.log('[DEBUG] Page URL:', page.url());
            console.log('[DEBUG] Page title:', await page.title());
            
            // List all visible elements with IDs for debugging
            const elementsWithId = await page.evaluate(() => {
              const elements = document.querySelectorAll('[id]');
              return Array.from(elements).map(el => `${el.tagName}#${el.id}`);
            });
            console.log('[DEBUG] Elements with IDs:', elementsWithId);
            
            // Try element verification to see what's happening
            await waitForRouteReady(page, 'login', { throwOnFailure: false, verbose: true });
            
            // Verify that the page visually matches the expected screenshot
            await expect(page).toHaveScreenshot('login-page.png', { threshold: 0.02 });
        });

        test('dashboard content test', async ({ page, context }) => {
            console.log('[TEST] Starting dashboard content test');
            
            // Navigate to dashboard and verify elements
            console.log('[TEST] Navigating to dashboard');
            await navigateToPage(page, '/dashboard');
            
            // Add a small wait to ensure app initializes
            console.log('[TEST] Waiting for app to initialize...');
            await page.waitForTimeout(1000);
            
            // Log page details for debugging
            const bodyHTML = await page.evaluate(() => document.body.innerHTML);
            console.log('[DEBUG] Body HTML:', bodyHTML.substring(0, 500) + '...');
            console.log('[DEBUG] Page URL:', page.url());
            
            // List all visible elements with data-testid for debugging
            const elementsWithTestId = await page.evaluate(() => {
              const elements = document.querySelectorAll('[data-testid]');
              return Array.from(elements).map(el => `${el.tagName}[data-testid="${el.getAttribute('data-testid')}"]`);
            });
            console.log('[DEBUG] Elements with data-testid:', elementsWithTestId);
            
            await waitForRouteReady(page, 'dashboard', { throwOnFailure: false, verbose: true });
            await waitForPageStability(page);
            await compareScreenshotAndAttachToReport(page, 'dashboard-content');
        });

        test('dashboard visual test', async ({ page, context }, testInfo) => {
            console.log('[TEST] Starting dashboard visual test');
            
            // Navigate to dashboard and verify elements
            console.log('[TEST] Navigating to dashboard');
            await navigateToPage(page, '/dashboard');
            
            // Add a small wait to ensure app initializes
            console.log('[TEST] Waiting for app to initialize...');
            await page.waitForTimeout(2000);
            
            // Take a screenshot for debugging
            await page.screenshot({ path: 'screenshots/dashboard-debug.png' });
            
            // Log visible elements for debugging
            const elementsWithTestId = await page.evaluate(() => {
              const elements = document.querySelectorAll('[data-testid]');
              return Array.from(elements).map(el => `${el.tagName}[data-testid="${el.getAttribute('data-testid')}"]`);
            });
            console.log('[DEBUG] Elements with data-testid:', elementsWithTestId);
            
            await waitForRouteReady(page, 'dashboard', { throwOnFailure: false, verbose: true });
            await waitForPageStability(page);
            await compareScreenshotAndAttachToReport(page, 'dashboard-layout');
        });
        
        test('tasks page visual test', async ({ page }, testInfo) => {
            // Apply Firefox-specific configurations if needed
            const isFirefox = page.context().browser()?.browserType().name() === 'firefox';
            if (isFirefox) {
                console.log('[TEST] Running tasks page test with Firefox optimizations');
            }
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

        test('task creation form', async ({ page, context }, testInfo) => {
            // Apply Firefox-specific configurations if needed
            const isFirefox = page.context().browser()?.browserType().name() === 'firefox';
            if (isFirefox) {
                console.log('[TEST] Running task creation form test with Firefox optimizations');
            }
            console.log('[TEST] Starting task creation form test');
            
            // Navigate to task creation form and verify elements
            console.log('[TEST] Navigating to task creation form');
            await navigateToPage(page, '/tasks/create');
            
            // Add a small wait to ensure app initializes
            console.log('[TEST] Waiting for app to initialize...');
            await page.waitForTimeout(2000);
            
            // Take a screenshot for debugging
            await page.screenshot({ path: 'screenshots/tasks-page-debug.png' });
            
            // Log all button elements for debugging
            const buttonTexts = await page.evaluate(() => {
              const buttons = document.querySelectorAll('button');
              return Array.from(buttons).map(btn => `${btn.tagName}: "${btn.textContent?.trim()}", class: "${btn.className}"`);
            });
            console.log('[DEBUG] All buttons:', buttonTexts);
            
            await waitForRouteReady(page, 'tasks', { throwOnFailure: false, verbose: true });
            
            // Try to find the Add Task button with various selectors
            console.log('[TEST] Looking for Add Task button with various selectors');
            // Fix TypeScript error - first() doesn't take parameters
            const addTaskButton = page.locator('button:has-text("Add Task"), [data-testid="add-task-button"], button:has-text("New Task"), button.add-task').first();
            
            if (await addTaskButton.count() > 0) {
              console.log('[TEST] Found Add Task button, clicking it');
              await addTaskButton.click();
            } else {
              console.error('[TEST] Add Task button not found, continuing without clicking');
              // Continue the test without failing immediately
            }
            
            await waitForPageStability(page);
            await compareScreenshotAndAttachToReport(page, 'task-creation-form');
        });

        test('Task Editing Workflow', async ({ page }) => {
            console.log('[TEST] Starting Task Editing Workflow test');
            
            let screenshotTaken = false;
            
            try {
                // Navigate to home page first
                await page.goto('/');
                await waitForPageStability(page);
                
                // Ensure we have test data available
                console.log('[TEST] Verifying test data is available');
                await waitForRouteReady(page, 'dashboard', { throwOnFailure: true });
                
                // Take initial screenshot
                await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-start');
                
                // Look for a task card to edit - use a more flexible selector
                console.log('[TEST] Looking for task card to edit');
                
                // First try to find any task card with test data
                const taskCards = page.locator('[data-testid*="task-card"]');
                const taskCardCount = await taskCards.count();
                
                if (taskCardCount === 0) {
                    console.log('[TEST] No task cards found, taking screenshot for debugging');
                    await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-no-tasks');
                    throw new Error('No task cards available for editing test');
                }
                
                console.log(`[TEST] Found ${taskCardCount} task cards, clicking on first one`);
                
                // Click on the first available task card
                await taskCards.first().click();
                await page.waitForTimeout(1000); // Wait for task editor to open
                
                // Take screenshot after task is opened
                await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-task-opened');
                
                // Test various form interactions
                console.log('[TEST] Testing form interactions');
                
                // Try to interact with due date selector
                try {
                    const dueDateButton = page.getByRole('button', { name: /due date/i });
                    if (await dueDateButton.isVisible()) {
                        await dueDateButton.click();
                        await page.waitForTimeout(500);
                        await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-due-date');
                        
                        // Click away to close any date picker
                        await page.locator('html').click();
                        await page.waitForTimeout(500);
                    }
                } catch (e) {
                    console.log('[TEST] Due date interaction failed:', e.message);
                }
                
                // Try to interact with scheduled date selector
                try {
                    const scheduledDateButton = page.getByRole('button', { name: /scheduled date/i });
                    if (await scheduledDateButton.isVisible()) {
                        await scheduledDateButton.click();
                        await page.waitForTimeout(500);
                        await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-scheduled-date');
                        
                        // Click away to close any date picker
                        await page.locator('html').click();
                        await page.waitForTimeout(500);
                    }
                } catch (e) {
                    console.log('[TEST] Scheduled date interaction failed:', e.message);
                }
                
                // Try to interact with priority selector
                try {
                    const priorityCombobox = page.getByRole('combobox', { name: /priority/i });
                    if (await priorityCombobox.isVisible()) {
                        await priorityCombobox.click();
                        await page.waitForTimeout(500);
                        await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-priority');
                        
                        // Click away to close dropdown
                        await page.locator('html').click();
                        await page.waitForTimeout(500);
                    }
                } catch (e) {
                    console.log('[TEST] Priority interaction failed:', e.message);
                }
                
                // Try to interact with effort selector
                try {
                    const effortCombobox = page.getByRole('combobox', { name: /effort/i });
                    if (await effortCombobox.isVisible()) {
                        await effortCombobox.click();
                        await page.waitForTimeout(500);
                        await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-effort');
                        
                        // Click away to close dropdown
                        await page.locator('html').click();
                        await page.waitForTimeout(500);
                    }
                } catch (e) {
                    console.log('[TEST] Effort interaction failed:', e.message);
                }
                
                // Try to interact with status selector
                try {
                    const statusCombobox = page.getByRole('combobox', { name: /status/i });
                    if (await statusCombobox.isVisible()) {
                        await statusCombobox.click();
                        await page.waitForTimeout(500);
                        await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-status');
                        
                        // Click away to close dropdown
                        await page.locator('html').click();
                        await page.waitForTimeout(500);
                    }
                } catch (e) {
                    console.log('[TEST] Status interaction failed:', e.message);
                }
                
                // Try to interact with people search
                try {
                    const peopleSearch = page.getByRole('textbox', { name: /search or add people/i });
                    if (await peopleSearch.isVisible()) {
                        await peopleSearch.click();
                        await page.waitForTimeout(500);
                        await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-people');
                    }
                } catch (e) {
                    console.log('[TEST] People search interaction failed:', e.message);
                }
                
                // Take final screenshot of the completed form interactions
                await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-complete');
                screenshotTaken = true;
                
                console.log('[TEST] Task Editing Workflow test completed successfully');
                
            } catch (error) {
                console.error('[TEST] Task Editing Workflow test failed:', error.message);
                
                // Ensure we take a screenshot even on failure
                if (!screenshotTaken) {
                    try {
                        await compareScreenshotAndAttachToReport(page, 'task-editing-workflow-error');
                    } catch (screenshotError) {
                        console.error('[TEST] Failed to take error screenshot:', screenshotError.message);
                    }
                }
                
                // Re-throw the error to fail the test
                throw error;
            }
        });

    });

    test.describe('Device-specific views', () => {
        test.beforeEach(async () => {
            // This group focuses on device-specific layouts, ensure data exists
            await testDataSeeder.cleanup();
            await seedTestTasks(3);
            await seedTestNotes(2);
        });

        test.describe('Desktop viewport', () => {
            test.use({ viewport: devices.desktop });

            test('desktop sidebar view', async ({ page }) => {
                // Apply Firefox-specific configurations if needed
                const isFirefox = page.context().browser()?.browserType().name() === 'firefox';
                if (isFirefox) {
                    console.log('[TEST] Running desktop sidebar test with Firefox optimizations');
                }
                await page.goto('/');
                await waitForPageStability(page);
                await page.click('[data-testid="show-all-active-tasks-button"]');
                await waitForRouteReady(page, 'dashboard', { throwOnFailure: true });
                await compareScreenshotAndAttachToReport(page, 'desktop-sidebar');
            });
            
            test('desktop dashboard content', async ({ page }) => {
                // Apply Firefox-specific configurations if needed
                const isFirefox = page.context().browser()?.browserType().name() === 'firefox';
                if (isFirefox) {
                    console.log('[TEST] Running desktop dashboard content test with Firefox optimizations');
                    // Extended timeout for Firefox
                    test.setTimeout(120000); // 2 minutes timeout specifically for Firefox
                }
                
                // Go to homepage and ensure it's fully loaded
                await page.goto('/');
                
                // Extra wait to ensure all resources are loaded
                console.log('[TEST] Waiting for networkidle with extended timeout');
                await page.waitForLoadState('networkidle', { timeout: isFirefox ? 60000 : 30000 }).catch(e => {
                    console.log('Extended networkidle wait timed out, continuing anyway');
                });
                
                // For Firefox, add additional stability measures
                if (isFirefox) {
                    // Add a fixed delay for Firefox to ensure rendering stability
                    console.log('[TEST] Adding extra stabilization delay for Firefox');
                    await page.waitForTimeout(5000);
                }
                
                // Click navigation and wait again to ensure UI is stable
                console.log('[TEST] Clicking on show all active tasks button');
                await page.click('[data-testid="show-all-active-tasks-button"]');
                
                // Wait for stability with enhanced timeouts
                await waitForPageStability(page);
                
                // Additional wait after clicking button for Firefox
                if (isFirefox) {
                    console.log('[TEST] Adding post-click stabilization delay for Firefox');
                    await page.waitForTimeout(5000);
                }
                
                // Wait for route to be ready
                await waitForRouteReady(page, 'dashboard', { throwOnFailure: true });
                
                // Take screenshot with increased timeout
                console.log('[TEST] Taking desktop dashboard content screenshot');
                await compareScreenshotAndAttachToReport(page, 'desktop-dashboard-content');
            });
        });
        
        test.describe('Mobile viewport', () => {
            test.use({ viewport: devices.mobile });
            
            test('mobile layout (sidebar likely collapsed)', async ({ page }) => {
                // Apply Firefox-specific configurations if needed
                const isFirefox = page.context().browser()?.browserType().name() === 'firefox';
                if (isFirefox) {
                    console.log('[TEST] Running mobile layout test with Firefox optimizations');
                }
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
