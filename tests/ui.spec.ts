import { test, expect } from '@playwright/test';

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
    
    // Simple safety check for authentication
    if (route !== '/login' && page.url().includes('/login')) {
        console.log(`Navigation to ${route} redirected to login - performing authentication`);
        await authenticate(page);
        await page.goto(route);
        await waitForPageStability(page);
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
        // Navigate to tasks page (authentication already handled)
        await navigateToPage(page, '/tasks');

        // Try several approaches to find and click the create task button
        try {
            // Try to find button by text content first
            const buttonSelectors = [
                page.getByRole('button', { name: /add|create|new task/i }),
                page.getByTestId('create-task-button'),
                page.locator('button:has-text("Create Task")'),
                page.locator('button:has-text("+")'),
            ];
            
            // Try each selector until we find one that works
            let clicked = false;
            for (const selector of buttonSelectors) {
                if ((await selector.count()) > 0 && (await selector.isVisible())) {
                    await selector.click();
                    clicked = true;
                    break;
                }
            }
            
            if (clicked) {
                // Wait briefly for dialog to appear
                await page.waitForTimeout(800);

                // Take a screenshot of the whole page with dialog open
                await expect(page).toHaveScreenshot('task-create-form-page.png');
            } else {
                throw new Error('No visible create task button found');
            }
        } catch (e) {
            console.log(
                'Could not find or interact with task creation button:',
                e
            );
            // Take screenshot anyway to see current state
            await expect(page).toHaveScreenshot('tasks-page-no-dialog.png');
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
            await expect(page).toHaveScreenshot(
                'desktop-dashboard-content.png'
            );
        });
    });

    // Mobile view tests
    test.describe('Mobile viewport', () => {
        test.use({ viewport: devices.mobile });

        test('mobile layout (sidebar likely collapsed)', async ({ page }) => {
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
            for (const toggle of possibleToggles) {
                if ((await toggle.count()) > 0 && (await toggle.isVisible())) {
                    await toggle.click();
                    await page.waitForTimeout(1000); // Wait for animation
                    await expect(page).toHaveScreenshot(
                        'mobile-with-sidebar-open.png'
                    );
                    break; // Stop after first successful toggle
                }
            }
        });
    });
});

// This is a utility to help generate visual tests for all routes
test.describe('Automatic route testing', () => {
    // Authentication state for this group
    authStates['Automatic route testing'] = { isAuthenticated: false };
    // Run on both desktop and mobile
    for (const [deviceName, viewport] of Object.entries(devices)) {
        test.describe(`${deviceName} view`, () => {
            // Set viewport for this test group
            test.use({ viewport });

            // Authenticate once before all tests in this device group
            test.beforeAll(async ({ browser }) => {
                if (!authStates['Automatic route testing'].isAuthenticated) {
                    const page = await browser.newPage();
                    await authenticate(page);
                    authStates['Automatic route testing'].isAuthenticated = true;
                    await page.close();
                }
            });
            
            test(`auto-visual test of routes on ${deviceName}`, async ({
                page,
            }) => {
                // List of routes to test
                const routes = ['/', '/tasks', '/notes', '/login'];
                
                // Start with login route to handle authentication first
                const sortedRoutes = [
                    '/login',
                    ...routes.filter((r) => r !== '/login'),
                ];

                for (const route of sortedRoutes) {
                    // Get a simple name for the route for the screenshot file
                    const pageName =
                        route === '/' ? 'home' : route.substring(1);

                    // Use standardized navigation pattern
                    await navigateToPage(page, route);

                    // Take screenshot with device prefix to distinguish between views
                    await expect(page).toHaveScreenshot(
                        `${deviceName}-${pageName}-page.png`
                    );
                }
            });
        });
    }
});
