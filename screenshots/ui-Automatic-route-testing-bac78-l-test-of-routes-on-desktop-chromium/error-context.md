# Test info

- Name: Automatic route testing >> desktop view >> auto-visual test of routes on desktop
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:300:13

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  267 pixels (ratio 0.01 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/desktop-login-page-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Automatic-route-testing-bac78-l-test-of-routes-on-desktop-chromium/desktop-login-page-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Automatic-route-testing-bac78-l-test-of-routes-on-desktop-chromium/desktop-login-page-diff.png

Call log:
  - expect.toHaveScreenshot(desktop-login-page.png) with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 267 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 267 pixels (ratio 0.01 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:321:40
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- img "Do Next Logo"
- paragraph: Sign in or create an account to manage your tasks
- tablist:
  - tab "Sign In" [selected]
  - tab "Create Account"
- tabpanel "Sign In":
  - text: Email
  - img
  - textbox "Email"
  - text: Password
  - img
  - textbox "Password"
  - button "Sign In":
    - img
    - text: Sign In
- text: Or continue with
- button "Google":
  - img
  - text: Google
- button "Quick Access (Bypass Login)":
  - img
  - text: Quick Access (Bypass Login)
- paragraph:
  - text: Don't have an account?
  - button "Sign up"
```

# Test source

```ts
  221 |     // Desktop view tests
  222 |     test.describe('Desktop viewport', () => {
  223 |         test.use({ viewport: devices.desktop });
  224 |
  225 |         test('desktop sidebar view', async ({ page }) => {
  226 |             await navigateToPage(page, '/');
  227 |
  228 |             // For desktop, we expect the sidebar to be visible by default
  229 |             // Take full page screenshot that will include the sidebar
  230 |             await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
  231 |         });
  232 |
  233 |         test('desktop dashboard content', async ({ page }) => {
  234 |             await navigateToPage(page, '/');
  235 |
  236 |             // Screenshot main content area - avoiding precise element selection
  237 |             // Just give the app enough time to fully render
  238 |             await expect(page).toHaveScreenshot(
  239 |                 'desktop-dashboard-content.png'
  240 |             );
  241 |         });
  242 |     });
  243 |
  244 |     // Mobile view tests
  245 |     test.describe('Mobile viewport', () => {
  246 |         test.use({ viewport: devices.mobile });
  247 |
  248 |         test('mobile layout (sidebar likely collapsed)', async ({ page }) => {
  249 |             await navigateToPage(page, '/');
  250 |             
  251 |             // On mobile, sidebar may be collapsed by default - this is expected
  252 |             await expect(page).toHaveScreenshot('mobile-default-view.png');
  253 |             
  254 |             // Try to find and click a hamburger menu or sidebar toggle if it exists
  255 |             const possibleToggles = [
  256 |                 page.getByRole('button', {
  257 |                     name: /menu|toggle|hamburger|sidebar/i,
  258 |                 }),
  259 |                 page.locator(
  260 |                     '.hamburger, [data-testid="menu-button"], button.menu-toggle'
  261 |                 ),
  262 |                 page.locator('button').filter({ hasText: /☰|≡|menu/i }),
  263 |             ];
  264 |
  265 |             // Try each possible toggle selector
  266 |             for (const toggle of possibleToggles) {
  267 |                 if ((await toggle.count()) > 0 && (await toggle.isVisible())) {
  268 |                     await toggle.click();
  269 |                     await page.waitForTimeout(1000); // Wait for animation
  270 |                     await expect(page).toHaveScreenshot(
  271 |                         'mobile-with-sidebar-open.png'
  272 |                     );
  273 |                     break; // Stop after first successful toggle
  274 |                 }
  275 |             }
  276 |         });
  277 |     });
  278 | });
  279 |
  280 | // This is a utility to help generate visual tests for all routes
  281 | test.describe('Automatic route testing', () => {
  282 |     // Authentication state for this group
  283 |     authStates['Automatic route testing'] = { isAuthenticated: false };
  284 |     // Run on both desktop and mobile
  285 |     for (const [deviceName, viewport] of Object.entries(devices)) {
  286 |         test.describe(`${deviceName} view`, () => {
  287 |             // Set viewport for this test group
  288 |             test.use({ viewport });
  289 |
  290 |             // Authenticate once before all tests in this device group
  291 |             test.beforeAll(async ({ browser }) => {
  292 |                 if (!authStates['Automatic route testing'].isAuthenticated) {
  293 |                     const page = await browser.newPage();
  294 |                     await authenticate(page);
  295 |                     authStates['Automatic route testing'].isAuthenticated = true;
  296 |                     await page.close();
  297 |                 }
  298 |             });
  299 |             
  300 |             test(`auto-visual test of routes on ${deviceName}`, async ({
  301 |                 page,
  302 |             }) => {
  303 |                 // List of routes to test
  304 |                 const routes = ['/', '/tasks', '/notes', '/login'];
  305 |                 
  306 |                 // Start with login route to handle authentication first
  307 |                 const sortedRoutes = [
  308 |                     '/login',
  309 |                     ...routes.filter((r) => r !== '/login'),
  310 |                 ];
  311 |
  312 |                 for (const route of sortedRoutes) {
  313 |                     // Get a simple name for the route for the screenshot file
  314 |                     const pageName =
  315 |                         route === '/' ? 'home' : route.substring(1);
  316 |
  317 |                     // Use standardized navigation pattern
  318 |                     await navigateToPage(page, route);
  319 |
  320 |                     // Take screenshot with device prefix to distinguish between views
> 321 |                     await expect(page).toHaveScreenshot(
      |                                        ^ Error: expect(page).toHaveScreenshot(expected)
  322 |                         `${deviceName}-${pageName}-page.png`
  323 |                     );
  324 |                 }
  325 |             });
  326 |         });
  327 |     }
  328 | });
  329 |
```