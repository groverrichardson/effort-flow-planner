# Test info

- Name: Device-specific views >> Desktop viewport >> desktop dashboard content
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:233:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  76639 pixels (ratio 0.09 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/desktop-dashboard-content-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Device-specific-views-D-26d4b-t-desktop-dashboard-content-chromium/desktop-dashboard-content-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Device-specific-views-D-26d4b-t-desktop-dashboard-content-chromium/desktop-dashboard-content-diff.png

Call log:
  - expect.toHaveScreenshot(desktop-dashboard-content.png) with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 76639 pixels (ratio 0.09 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 76639 pixels (ratio 0.09 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:238:32
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
  230 |             await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
  231 |         });
  232 |
  233 |         test('desktop dashboard content', async ({ page }) => {
  234 |             await navigateToPage(page, '/');
  235 |
  236 |             // Screenshot main content area - avoiding precise element selection
  237 |             // Just give the app enough time to fully render
> 238 |             await expect(page).toHaveScreenshot('desktop-dashboard-content.png');
      |                                ^ Error: expect(page).toHaveScreenshot(expected)
  239 |         });
  240 |     });
  241 |
  242 |     // Mobile view tests
  243 |     test.describe('Mobile viewport', () => {
  244 |         test.use({ viewport: devices.mobile });
  245 |         
  246 |         // Authentication state for mobile tests
  247 |         authStates['Mobile viewport'] = { isAuthenticated: false };
  248 |         
  249 |         // Authenticate once before all tests in this group
  250 |         test.beforeAll(async ({ browser }) => {
  251 |             if (!authStates['Mobile viewport'].isAuthenticated) {
  252 |                 const page = await browser.newPage();
  253 |                 try {
  254 |                     await authenticate(page);
  255 |                     authStates['Mobile viewport'].isAuthenticated = true;
  256 |                 } catch (e) {
  257 |                     console.error('Mobile viewport authentication failed:', e);
  258 |                 } finally {
  259 |                     await page.close();
  260 |                 }
  261 |             }
  262 |         });
  263 |
  264 |         test('mobile layout (sidebar likely collapsed)', async ({ page }) => {
  265 |             try {
  266 |                 await navigateToPage(page, '/');
  267 |                 
  268 |                 // On mobile, sidebar may be collapsed by default - this is expected
  269 |                 await expect(page).toHaveScreenshot('mobile-default-view.png');
  270 |                 
  271 |                 // Try to find and click a hamburger menu or sidebar toggle if it exists
  272 |                 const possibleToggles = [
  273 |                     page.getByRole('button', {
  274 |                         name: /menu|toggle|hamburger|sidebar/i,
  275 |                     }),
  276 |                     page.locator(
  277 |                         '.hamburger, [data-testid="menu-button"], button.menu-toggle'
  278 |                     ),
  279 |                     page.locator('button').filter({ hasText: /☰|≡|menu/i }),
  280 |                 ];
  281 |
  282 |                 // Try each possible toggle selector
  283 |                 let toggleFound = false;
  284 |                 for (const toggle of possibleToggles) {
  285 |                     if ((await toggle.count()) > 0 && (await toggle.isVisible())) {
  286 |                         await toggle.click();
  287 |                         await page.waitForTimeout(1000); // Wait for animation
  288 |                         await expect(page).toHaveScreenshot('mobile-with-sidebar-open.png');
  289 |                         toggleFound = true;
  290 |                         break; // Stop after first successful toggle
  291 |                     }
  292 |                 }
  293 |                 
  294 |                 if (!toggleFound) {
  295 |                     console.log('No visible sidebar toggle found on mobile view');
  296 |                 }
  297 |             } catch (e) {
  298 |                 console.error('Mobile layout test failed:', e);
  299 |                 throw e;
  300 |             }
  301 |         });
  302 |     });
  303 | });
  304 |
  305 | // This is a utility to help generate visual tests for all routes
  306 | test.describe('Automatic route testing', () => {
  307 |     // Authentication state for this group
  308 |     authStates['Automatic route testing'] = { isAuthenticated: false };
  309 |     
  310 |     // Run on both desktop and mobile
  311 |     for (const [deviceName, viewport] of Object.entries(devices)) {
  312 |         test.describe(`${deviceName} view`, () => {
  313 |             // Set viewport for this test group
  314 |             test.use({ viewport });
  315 |
  316 |             // Authenticate once before all tests in this device group
  317 |             test.beforeAll(async ({ browser }) => {
  318 |                 if (!authStates['Automatic route testing'].isAuthenticated) {
  319 |                     const page = await browser.newPage();
  320 |                     await authenticate(page);
  321 |                     authStates['Automatic route testing'].isAuthenticated = true;
  322 |                     await page.close();
  323 |                 }
  324 |             });
  325 |             
  326 |             test(`auto-visual test of routes on ${deviceName}`, async ({ page }) => {
  327 |                 try {
  328 |                     // List of routes to test
  329 |                     const routes = ['/', '/tasks', '/notes', '/login'];
  330 |                     
  331 |                     // Start with login route to handle authentication first
  332 |                     const sortedRoutes = [
  333 |                         '/login',
  334 |                         ...routes.filter((r) => r !== '/login'),
  335 |                     ];
  336 |
  337 |                     for (const route of sortedRoutes) {
  338 |                         // Get a simple name for the route for the screenshot file
```