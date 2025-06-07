# Test info

- Name: Device-specific views >> Desktop viewport >> desktop sidebar view
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:225:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  76647 pixels (ratio 0.09 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/desktop-with-sidebar-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Device-specific-views-D-31e3d-ewport-desktop-sidebar-view-chromium/desktop-with-sidebar-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Device-specific-views-D-31e3d-ewport-desktop-sidebar-view-chromium/desktop-with-sidebar-diff.png

Call log:
  - expect.toHaveScreenshot(desktop-with-sidebar.png) with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 76647 pixels (ratio 0.09 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 76647 pixels (ratio 0.09 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:230:32
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- img "DoNext Logo"
- button "Switch to dark mode":
  - img
- img "Flame icon"
- text: "0"
- paragraph
- button "Create Task" [disabled]:
  - img
  - text: Create Task
- text: "Pro tip: Use #tag for tags, @person for people, \"high priority\" or dates like \"due tomorrow\""
- heading "Suggestions for Next Steps" [level=2]
- paragraph: Future home of intelligent task suggestions. For now, consider what's most important or time-sensitive!
- button "Owed to Others (Due Today or Past Due)" [expanded]:
  - text: Owed to Others (Due Today or Past Due)
  - img
- paragraph: No tasks owed to others are due today or past due.
- button "All My Tasks":
  - text: All My Tasks
  - img
- button "Toggle sidebar":
  - img
  - text: Toggle sidebar
- heading "Controls" [level=3]
- img
- textbox "Search tasks..."
- button "New Task":
  - img
  - text: New Task
- button "New Note":
  - img
  - text: New Note
- heading "View Options" [level=4]
- button "All Active"
- button "Completed Today (0)"
- button "Archived (0)"
- heading "Filters" [level=4]
- button "Filter Tasks":
  - img
  - text: Filter Tasks
- button "Bulk Edit":
  - img
  - text: Bulk Edit
- button "Manage Tags":
  - img
  - text: Manage Tags
- button "Manage People":
  - img
  - text: Manage People
- button "Import CSV":
  - img
  - text: Import CSV
- link "All Notes":
  - /url: /notes
  - img
  - text: All Notes
```

# Test source

```ts
  130 |
  131 |     test('login page visual test', async ({ page }) => {
  132 |         // Navigate to the login page with standard pattern
  133 |         await navigateToPage(page, '/login');
  134 |
  135 |         // Take a screenshot and compare it to the baseline
  136 |         await expect(page).toHaveScreenshot('login-page.png');
  137 |     });
  138 |
  139 |     test('dashboard visual test', async ({ page }) => {
  140 |         // Navigate to the dashboard with standard pattern
  141 |         await navigateToPage(page, '/');
  142 |         
  143 |         // Take a screenshot and compare it to the baseline
  144 |         await expect(page).toHaveScreenshot('dashboard-page.png');
  145 |     });
  146 |
  147 |     test('tasks page visual test', async ({ page }) => {
  148 |         // Navigate to tasks page with standard pattern
  149 |         await navigateToPage(page, '/tasks');
  150 |         
  151 |         // Take a screenshot and compare it to the baseline
  152 |         await expect(page).toHaveScreenshot('tasks-page.png');
  153 |     });
  154 |
  155 |     test('notes page visual test', async ({ page }) => {
  156 |         // Navigate to notes page with standard pattern
  157 |         await navigateToPage(page, '/notes');
  158 |         
  159 |         // Take a screenshot and compare it to the baseline
  160 |         await expect(page).toHaveScreenshot('notes-page.png');
  161 |     });
  162 |
  163 |     // Component-specific tests
  164 |     test('task creation form', async ({ page }) => {
  165 |         // Navigate to tasks page (authentication already handled)
  166 |         await navigateToPage(page, '/tasks');
  167 |
  168 |         // Try several approaches to find and click the create task button
  169 |         try {
  170 |             // Try to find button by text content first
  171 |             const buttonSelectors = [
  172 |                 page.getByRole('button', { name: /add|create|new task/i }),
  173 |                 page.getByTestId('create-task-button'),
  174 |                 page.locator('button:has-text("Create Task")'),
  175 |                 page.locator('button:has-text("+")'),
  176 |             ];
  177 |             
  178 |             // Try each selector until we find one that works
  179 |             let clicked = false;
  180 |             for (const selector of buttonSelectors) {
  181 |                 if ((await selector.count()) > 0 && (await selector.isVisible())) {
  182 |                     await selector.click();
  183 |                     clicked = true;
  184 |                     break;
  185 |                 }
  186 |             }
  187 |             
  188 |             if (clicked) {
  189 |                 // Wait briefly for dialog to appear
  190 |                 await page.waitForTimeout(800);
  191 |
  192 |                 // Take a screenshot of the whole page with dialog open
  193 |                 await expect(page).toHaveScreenshot('task-create-form-page.png');
  194 |             } else {
  195 |                 throw new Error('No visible create task button found');
  196 |             }
  197 |         } catch (e) {
  198 |             console.log(
  199 |                 'Could not find or interact with task creation button:',
  200 |                 e
  201 |             );
  202 |             // Take screenshot anyway to see current state
  203 |             await expect(page).toHaveScreenshot('tasks-page-no-dialog.png');
  204 |         }
  205 |     });
  206 | });
  207 |
  208 | // Device-specific tests for responsive views
  209 | test.describe('Device-specific views', () => {
  210 |     // Authentication state for this group
  211 |     authStates['Device-specific views'] = { isAuthenticated: false };
  212 |     
  213 |     // Authenticate once before all tests in this group
  214 |     test.beforeAll(async ({ browser }) => {
  215 |         const page = await browser.newPage();
  216 |         await authenticate(page);
  217 |         authStates['Device-specific views'].isAuthenticated = true;
  218 |         await page.close();
  219 |     });
  220 |     
  221 |     // Desktop view tests
  222 |     test.describe('Desktop viewport', () => {
  223 |         test.use({ viewport: devices.desktop });
  224 |
  225 |         test('desktop sidebar view', async ({ page }) => {
  226 |             await navigateToPage(page, '/');
  227 |
  228 |             // For desktop, we expect the sidebar to be visible by default
  229 |             // Take full page screenshot that will include the sidebar
> 230 |             await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
      |                                ^ Error: expect(page).toHaveScreenshot(expected)
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
  321 |                     await expect(page).toHaveScreenshot(
  322 |                         `${deviceName}-${pageName}-page.png`
  323 |                     );
  324 |                 }
  325 |             });
  326 |         });
  327 |     }
  328 | });
  329 |
```