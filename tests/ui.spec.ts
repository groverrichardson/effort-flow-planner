import { test, expect } from '@playwright/test';
import { verifyUrl, verifyNavigation } from './utils/urlVerification';

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

// Helper function to wait for page stability
async function waitForPageStability(page) {
    // Basic page load waiting
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Wait for any animations or transitions to complete
    await page.waitForTimeout(1500);
}

// Helper function for standardized navigation pattern
async function navigateToPage(page, route) {
    // Navigate to the specified route
    await page.goto(route);
    
    // Wait for page stability
    await waitForPageStability(page);
    
    // Enhanced safety check for authentication using our URL verification utility
    const currentUrl = page.url();
    const isOnLoginPage = verifyUrl(currentUrl, '/login', { exactMatch: false });
    
    if (route !== '/login' && isOnLoginPage) {
        console.log(`Navigation to ${route} redirected to login - performing authentication`);
        await authenticate(page);
        await page.goto(route);
        await waitForPageStability(page);
        
        // Verify successful navigation after authentication
        await verifyNavigation(page, route);
    } else {
        // Verify we landed on the correct page
        await verifyNavigation(page, route);
    }
}

// Helper function to handle authentication
async function authenticate(page) {
    // Check if we're already on a login page
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
        // We're already on login page
    } else if (currentUrl.includes('auth') || currentUrl.includes('signin')) {
        // We're already on some auth page
    } else {
        // Go to login page first
        await page.goto('/login');
        await waitForPageStability(page);
    }

    // First priority: try to find and click the bypass login button
    const bypassSelectors = [
        page.getByRole('button', { name: /quick access|bypass login/i }),
        page.getByText(/quick access|bypass login|skip login/i),
        page.locator('button:has-text("Quick Access")'),
        page.locator('button:has-text("Bypass")')
    ];
    
    for (const selector of bypassSelectors) {
        try {
            if ((await selector.count()) > 0 && await selector.isVisible()) {
                console.log('Using bypass login button');
                await selector.click();
                await waitForPageStability(page);
                return; // Successfully used bypass button, exit function
            }
        } catch (e) {
            console.log('Error trying bypass selector:', e);
        }
    }
    
    // If bypass didn't work, try traditional form login
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const loginButton = page.getByRole('button', { name: /log[ -]?in|sign[ -]?in/i });

    if (
        (await emailInput.count()) > 0 &&
        (await passwordInput.count()) > 0 &&
        (await loginButton.count()) > 0
    ) {
        const { TEST_EMAIL, TEST_PASSWORD } = process.env;

        // Check if env variables exist
        if (!TEST_EMAIL || !TEST_PASSWORD) {
            console.log('Using default test credentials - set TEST_EMAIL and TEST_PASSWORD for custom values');
            // Use default test credentials
            await emailInput.fill('test@example.com');
            await passwordInput.fill('password123');
        } else {
            // Use provided test credentials from env variables
            await emailInput.fill(TEST_EMAIL);
            await passwordInput.fill(TEST_PASSWORD);
        }
        
        // Click login button and wait
        await loginButton.first().click();
        await waitForPageStability(page);
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
    test.beforeEach(async ({ page }) => {
        // Set a consistent viewport for all tests
        await page.setViewportSize({ width: 1280, height: 800 });
    });

    test('login page visual test', async ({ page }) => {
        // Navigate to the login page with standard pattern
        await navigateToPage(page, '/login');

        // Take a screenshot and compare it to the baseline
        await expect(page).toHaveScreenshot('login-page.png');
    });

    test('dashboard visual test', async ({ page }) => {
        // Navigate to the dashboard with standard pattern
        await navigateToPage(page, '/');
        
        // Take a screenshot and compare it to the baseline
        await expect(page).toHaveScreenshot('dashboard-page.png');
    });

    test('tasks page visual test', async ({ page }) => {
        // Navigate to tasks page with standard pattern
        await navigateToPage(page, '/tasks');
        
        // Take a screenshot and compare it to the baseline
        await expect(page).toHaveScreenshot('tasks-page.png');
    });

    test('notes page visual test', async ({ page }) => {
        // Navigate to notes page with standard pattern
        await navigateToPage(page, '/notes');
        
        // Take a screenshot and compare it to the baseline
        await expect(page).toHaveScreenshot('notes-page.png');
    });

    // Component-specific tests
    test('task creation form', async ({ page }) => {
        // Use the standardized navigation pattern to ensure authenticated access to tasks page
        console.log('Starting task creation form test');
        await navigateToPage(page, '/tasks');

        // Verify we're on the tasks page before proceeding using our robust URL verification utility
        try {
            await verifyNavigation(page, '/tasks');
        } catch (error) {
            console.error(error.message);
            await expect(page).toHaveScreenshot('navigation-failed-tasks-page.png');
            throw error;
        }
        
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

        test('desktop sidebar view', async ({ page }) => {
            await navigateToPage(page, '/');

            // For desktop, we expect the sidebar to be visible by default
            // Take full page screenshot that will include the sidebar
            await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
        });

        test('desktop dashboard content', async ({ page }) => {
            await navigateToPage(page, '/');

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

        test('mobile layout (sidebar likely collapsed)', async ({ page }) => {
            try {
                await navigateToPage(page, '/');
                
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
    const routes = [
        { path: '/', name: 'home' },
        { path: '/tasks', name: 'tasks' },
        { path: '/notes', name: 'notes' },
        { path: '/login', name: 'login' }
    ];
    
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
            test(`visual tests for all routes on ${device.name}`, async ({ page }) => {
                try {
                    console.log(`Starting route tests for ${device.name} device`);
                    
                    // Test each route in sequence
                    for (const route of routes) {
                        console.log(`Testing ${route.path} on ${device.name}`);
                        
                        // Navigate using our standard helper
                        await navigateToPage(page, route.path);
                        
                        // Verify we reached the correct page
                        if (!page.url().includes(route.path.replace('/', ''))) {
                            console.warn(`Expected to be on ${route.path} but got ${page.url()}`);
                        }
                        
                        // Device-specific verifications
                        if (device.checkSidebar) {
                            await verifyDesktopSidebar(page, route.path);
                        }
                        
                        // Take screenshot with consistent naming
                        await expect(page).toHaveScreenshot(
                            `${device.name}-${route.name}-page.png`
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

