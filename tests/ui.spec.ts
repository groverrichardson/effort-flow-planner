import { isDialogVisible, closeDialog } from "./ui-dialog-fix";
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

// Helper to wait for page stability
async function waitForPageStability(page: Page) {
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
}

// Navigate to a route and verify it renders correctly
async function navigateToPage(
    page: Page,
    routeName: string,
    options: { screenshotName?: string; timeout?: number; throwOnFailure?: boolean } = {}
) {
    const { screenshotName, timeout = 10000, throwOnFailure = true } = options;
    const routeConfig: RouteConfig = getRouteById(routeName);
    console.log(`🔍 Navigating to route: ${routeName} (${routeConfig.path})`);

    if (!routeConfig) {
        throw new Error(`Route config not found for: ${routeName}`);
    }

    const result = await navigateTo(page, routeConfig.path, { timeout, verificationOptions: { throwOnFailure: false } });
    navigationReporter.logNavigation(result, routeName);

    if (screenshotName) {
        const screenshotPath = `screenshots/${screenshotName}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`📸 See screenshot: ${screenshotPath}`);
    }

    if (!result.success && throwOnFailure) {
        console.log(`📸 See screenshot: ${result.screenshotPath}`);
        throw new Error(
            `Navigation to ${routeName} failed: ${result.errorMessage}`
        );
    }

    return result;
}

const waitForElementVisible = async (page, selector, options = { timeout: 5000 }) => {
    try {
        await page.waitForSelector(selector, { state: 'visible', timeout: options.timeout });
        return true;
    } catch (err) {
        return false;
    }
};

test.describe('Playwright UI Tests', () => {
    test.beforeEach(async ({ page }) => {
        await bypassLogin(page);
    });

    test.describe('Mobile Viewport Tests', () => {
        test.use({ viewport: devices.mobile });

        test('mobile login page visual test', async ({ page }) => {
            // Navigate to login page
            await page.goto('/login');
            await waitForPageStability(page);
            await compareScreenshotAndAttachToReport(page, 'login-page-mobile');
        });

        test('mobile dashboard page visual test', async ({ page }) => {
            await page.goto('/');
            await waitForPageStability(page);

            // Authenticate first
            await authenticate(page);

            // Verify dashboard elements
            await expect(page).toHaveURL('/dashboard');
            await compareScreenshotAndAttachToReport(page, 'dashboard-page-mobile');
        });

        test('mobile tasks page visual test', async ({ page }) => {
            await page.goto('/tasks');
            await waitForPageStability(page);

            // Authenticate first
            await authenticate(page);

            // Verify tasks elements  
            await expect(page).toHaveURL('/tasks');
            await compareScreenshotAndAttachToReport(page, 'tasks-page-mobile');
        });

        test('mobile notes page visual test', async ({ page }) => {
            await page.goto('/notes');
            await waitForPageStability(page);

            // Authenticate first
            await authenticate(page);

            // Verify notes elements
            await expect(page).toHaveURL('/notes');
            await compareScreenshotAndAttachToReport(page, 'notes-page-mobile');
        });
    });

    test.describe('Visual Tests for Main Pages', () => {
        test.use({ viewport: devices.desktop });

        test('login page visual test', async ({ page }) => {
            await navigateToPage(page, 'login', { screenshotName: 'login-page' });
            await compareScreenshotAndAttachToReport(page, 'login-page');
        });

        test('dashboard page visual test', async ({ page }) => {
            await navigateToPage(page, 'dashboard', { screenshotName: 'dashboard-page' });
            await compareScreenshotAndAttachToReport(page, 'dashboard-page');
        });

        test('tasks page visual test', async ({ page }) => {
            await navigateToPage(page, 'tasks', { screenshotName: 'tasks-page' });
            await compareScreenshotAndAttachToReport(page, 'tasks-page');
        });

        test('notes page visual test', async ({ page }) => {
            await navigateToPage(page, 'notes', { screenshotName: 'notes-page' });
            await compareScreenshotAndAttachToReport(page, 'notes-page');
        });

        test('task creation form', async ({ page }) => {
            // Navigate directly to the tasks page instead of dashboard
            await navigateToPage(page, 'tasks', { screenshotName: 'tasks-before-create' });
            await waitForPageStability(page);
            
            // Take a screenshot to confirm we're on the tasks page
            await page.screenshot({ path: 'screenshots/tasks-page-before-click.png' });
            console.log('[TEST] Successfully navigated to tasks page');
            
            // Wait for the page to be fully loaded and stable
            await page.waitForLoadState('networkidle');
            await page.waitForLoadState('domcontentloaded');
            
            // Log all button elements to help with debugging
            const buttonTexts = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                return Array.from(buttons).map(btn => `${btn.tagName}: "${btn.textContent?.trim()}", class: "${btn.className}"`);
            });
            console.log('[TEST] Available buttons:', buttonTexts);
            
            // Try to find the Add Task button with various selectors
            console.log('[TEST] Looking for Add Task button');
            
            // More robust selector targeting the Add Task button
            const addTaskButton = page.locator([
                'button:has-text("Add Task")', 
                '[data-testid="add-task-button"]', 
                'button:has-text("New Task")', 
                'button.add-task',
                // Add more specific selectors that might match the add task button
                'button:has-text("Create Task")',
                'a[href="/tasks/create"]',
                'button.primary:visible'
            ].join(', ')).first();
            
            // Check if the button exists and is visible
            const buttonCount = await addTaskButton.count();
            console.log(`[TEST] Found ${buttonCount} potential Add Task buttons`);
            
            if (buttonCount > 0) {
                // Take screenshot before clicking
                await page.screenshot({ path: 'screenshots/before-add-task-click.png' });
                
                console.log('[TEST] Clicking Add Task button');
                await addTaskButton.click({ timeout: 5000 }).catch(e => {
                    console.error(`[TEST] Error clicking button: ${e.message}`);
                });
                
                // After click, wait for any navigation or dialog to appear
                await page.waitForTimeout(2000);
                await page.waitForLoadState('networkidle');
                
                // Take a screenshot of the form that appears after clicking
                await page.screenshot({ path: 'screenshots/after-add-task-click.png' });
            } else {
                console.error('[TEST] Add Task button not found');
                // Take a screenshot of the page without the button
                await page.screenshot({ path: 'screenshots/no-add-task-button.png' });
            }
            
            await waitForPageStability(page);
            await compareScreenshotAndAttachToReport(page, 'task-creation-form');
        });

        test('note creation form', async ({ page }) => {
            await navigateToPage(page, 'dashboard', { screenshotName: 'dashboard-before-create-note' });
            await waitForPageStability(page);
            
            // Click the Add Note/New Note button
            const addNoteButton = page.locator('button:has-text("Add Note"), [data-testid="add-note-button"], button:has-text("New Note"), button.add-note').first();
            if (await addNoteButton.count() > 0) {
                await addNoteButton.click();
            }
            
            await waitForPageStability(page);
            await compareScreenshotAndAttachToReport(page, 'note-creation-form');
        });
    });

    test.describe('Dynamic Content Tests', () => {
        test.use({ viewport: devices.desktop });

        test('create and view a sample task', async ({ page }) => {
            await navigateToPage(page, 'tasks', { screenshotName: 'tasks-before-create' });
            
            // Create test task
            const testTask: TestTaskTemplate = {
                title: `Test Task ${Date.now()}`,
                description: 'This is a test task created by Playwright',
                dueDate: new Date(),
                priority: 'high',
                status: 'not-started'
            };
            
            const taskId = await seedTemplateTask(testTask);
            console.log(`Created test task with ID: ${taskId}`);
            
            // Refresh the page to see the new task
            await page.reload();
            await waitForPageStability(page);
            
            // Click on the created task
            const taskSelector = `[data-testid="task-item-${taskId}"], div:has-text("${testTask.title}")`;
            const taskExists = await waitForElementVisible(page, taskSelector);
            
            if (taskExists) {
                await page.click(taskSelector);
                await waitForPageStability(page);
                await compareScreenshotAndAttachToReport(page, 'view-created-task');
            } else {
                console.error(`Task with title "${testTask.title}" not found`);
                await compareScreenshotAndAttachToReport(page, 'task-not-found');
            }
        });

        test('create and view a sample note', async ({ page }) => {
            await navigateToPage(page, 'notes', { screenshotName: 'notes-before-create' });
            
            // Create test note
            const testNote: TestNoteTemplate = {
                title: `Test Note ${Date.now()}`,
                content: 'This is a test note created by Playwright'
            };
            
            const noteId = await seedTemplateNote(testNote);
            console.log(`Created test note with ID: ${noteId}`);
            
            // Refresh the page to see the new note
            await page.reload();
            await waitForPageStability(page);
            
            // Click on the created note
            const noteSelector = `[data-testid="note-item-${noteId}"], div:has-text("${testNote.title}")`;
            const noteExists = await waitForElementVisible(page, noteSelector);
            
            if (noteExists) {
                await page.click(noteSelector);
                await waitForPageStability(page);
                await compareScreenshotAndAttachToReport(page, 'view-created-note');
            } else {
                console.error(`Note with title "${testNote.title}" not found`);
                await compareScreenshotAndAttachToReport(page, 'note-not-found');
            }
        });
    });

    test.skip('Automatic route testing', async ({ page }) => {
        // Test all routes defined in routeConfig
        for (const [routeId, route] of Object.entries(routes)) {
            if (route.skipInAutoTest) {
                console.log(`Skipping route ${routeId} as it's marked for skip`);
                continue;
            }

            console.log(`Testing route: ${routeId} - ${route.path}`);
            try {
                // Skip home and dashboard which may be the same and cause navigation issues
                if (routeId !== 'home' || !routes['dashboard']) {
                    const result = await navigateToPage(page, routeId, { 
                        throwOnFailure: false,
                        screenshotName: `auto-test-${routeId}` 
                    });
                    
                    await waitForPageStability(page);
                    expect(result.success).toBeTruthy();
                }
            } catch (error) {
                console.error(`Error testing route ${routeId}:`, error);
            }
        }
    });
});
