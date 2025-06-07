# Test info

- Name: Visual Tests for Main Pages >> dashboard visual test
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:139:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  76259 pixels (ratio 0.08 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/dashboard-page-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Visual-Tests-for-Main-Pages-dashboard-visual-test-chromium/dashboard-page-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Visual-Tests-for-Main-Pages-dashboard-visual-test-chromium/dashboard-page-diff.png

Call log:
  - expect.toHaveScreenshot(dashboard-page.png) with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 76259 pixels (ratio 0.08 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 76259 pixels (ratio 0.08 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:144:28
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
   44 | // Helper function to handle authentication
   45 | async function authenticate(page) {
   46 |     // Check if we're already on a login page
   47 |     const currentUrl = page.url();
   48 |     if (currentUrl.includes('/login')) {
   49 |         // We're already on login page
   50 |     } else if (currentUrl.includes('auth') || currentUrl.includes('signin')) {
   51 |         // We're already on some auth page
   52 |     } else {
   53 |         // Go to login page first
   54 |         await page.goto('/login');
   55 |         await waitForPageStability(page);
   56 |     }
   57 |
   58 |     // First priority: try to find and click the bypass login button
   59 |     const bypassSelectors = [
   60 |         page.getByRole('button', { name: /quick access|bypass login/i }),
   61 |         page.getByText(/quick access|bypass login|skip login/i),
   62 |         page.locator('button:has-text("Quick Access")'),
   63 |         page.locator('button:has-text("Bypass")')
   64 |     ];
   65 |     
   66 |     for (const selector of bypassSelectors) {
   67 |         try {
   68 |             if ((await selector.count()) > 0 && await selector.isVisible()) {
   69 |                 console.log('Using bypass login button');
   70 |                 await selector.click();
   71 |                 await waitForPageStability(page);
   72 |                 return; // Successfully used bypass button, exit function
   73 |             }
   74 |         } catch (e) {
   75 |             console.log('Error trying bypass selector:', e);
   76 |         }
   77 |     }
   78 |     
   79 |     // If bypass didn't work, try traditional form login
   80 |     const emailInput = page.getByLabel(/email/i);
   81 |     const passwordInput = page.getByLabel(/password/i);
   82 |     const loginButton = page.getByRole('button', { name: /log[ -]?in|sign[ -]?in/i });
   83 |
   84 |     if (
   85 |         (await emailInput.count()) > 0 &&
   86 |         (await passwordInput.count()) > 0 &&
   87 |         (await loginButton.count()) > 0
   88 |     ) {
   89 |         const { TEST_EMAIL, TEST_PASSWORD } = process.env;
   90 |
   91 |         // Check if env variables exist
   92 |         if (!TEST_EMAIL || !TEST_PASSWORD) {
   93 |             console.log('Using default test credentials - set TEST_EMAIL and TEST_PASSWORD for custom values');
   94 |             // Use default test credentials
   95 |             await emailInput.fill('test@example.com');
   96 |             await passwordInput.fill('password123');
   97 |         } else {
   98 |             // Use provided test credentials from env variables
   99 |             await emailInput.fill(TEST_EMAIL);
  100 |             await passwordInput.fill(TEST_PASSWORD);
  101 |         }
  102 |         
  103 |         // Click login button and wait
  104 |         await loginButton.first().click();
  105 |         await waitForPageStability(page);
  106 |     }
  107 | }
  108 |
  109 | // Test all main pages for visual regressions
  110 | test.describe('Visual Tests for Main Pages', () => {
  111 |     // Configure for desktop viewport by default
  112 |     test.use({ viewport: devices.desktop });
  113 |     
  114 |     // Authentication state for this group
  115 |     authStates['Visual Tests for Main Pages'] = { isAuthenticated: false };
  116 |     
  117 |     // Authenticate once before all tests in this group
  118 |     test.beforeAll(async ({ browser }) => {
  119 |         const page = await browser.newPage();
  120 |         await authenticate(page);
  121 |         authStates['Visual Tests for Main Pages'].isAuthenticated = true;
  122 |         await page.close();
  123 |     });
  124 |     
  125 |     // Run before each test
  126 |     test.beforeEach(async ({ page }) => {
  127 |         // Set a consistent viewport for all tests
  128 |         await page.setViewportSize({ width: 1280, height: 800 });
  129 |     });
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
> 144 |         await expect(page).toHaveScreenshot('dashboard-page.png');
      |                            ^ Error: expect(page).toHaveScreenshot(expected)
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
  238 |             await expect(page).toHaveScreenshot(
  239 |                 'desktop-dashboard-content.png'
  240 |             );
  241 |         });
  242 |     });
  243 |
  244 |     // Mobile view tests
```