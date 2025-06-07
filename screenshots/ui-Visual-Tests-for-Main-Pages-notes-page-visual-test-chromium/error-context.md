# Test info

- Name: Visual Tests for Main Pages >> notes page visual test
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:155:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  36385 pixels (ratio 0.04 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/notes-page-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Visual-Tests-for-Main-Pages-notes-page-visual-test-chromium/notes-page-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Visual-Tests-for-Main-Pages-notes-page-visual-test-chromium/notes-page-diff.png

Call log:
  - expect.toHaveScreenshot(notes-page.png) with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 36386 pixels (ratio 0.04 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 36385 pixels (ratio 0.04 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:160:28
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- banner:
  - heading "All Notes" [level=1]:
    - img
    - text: All Notes
  - paragraph: Browse and manage all your notes.
  - link "Back to Home":
    - /url: /
    - img
    - text: Back to Home
- checkbox "Select all notes"
- text: Select All (0 / 12 selected)
- checkbox "blah Edit note blah Delete note blah"
- heading "blah Edit note blah Delete note blah" [level=3]:
  - text: blah
  - link "Edit note blah":
    - /url: /notes/8183848c-9ba5-470a-b8e0-765a549be3e3/edit
    - img
    - text: Edit note blah
  - button "Delete note blah":
    - img
    - text: Delete note blah
- paragraph: "Created: 5/27/2025"
- paragraph: <ul><li><p>blah</p></li></ul>
- checkbox "another test note but for real Edit note another test note but for real Delete note another test note but for real"
- heading "another test note but for real Edit note another test note but for real Delete note another test note but for real" [level=3]:
  - text: another test note but for real
  - link "Edit note another test note but for real":
    - /url: /notes/ef42cfe8-b614-4208-85fd-5e41c8599434/edit
    - img
    - text: Edit note another test note but for real
  - button "Delete note another test note but for real":
    - img
    - text: Delete note another test note but for real
- paragraph: "Created: 5/27/2025"
- paragraph: <p>i love this so much</p>
- checkbox "test a note Edit note test a note Delete note test a note"
- heading "test a note Edit note test a note Delete note test a note" [level=3]:
  - text: test a note
  - link "Edit note test a note":
    - /url: /notes/2b265eb0-1a5d-4170-997c-dc2117e64ebc/edit
    - img
    - text: Edit note test a note
  - button "Delete note test a note":
    - img
    - text: Delete note test a note
- paragraph: "Created: 5/27/2025"
- paragraph: testing
- checkbox "unique note Edit note unique note Delete note unique note"
- heading "unique note Edit note unique note Delete note unique note" [level=3]:
  - text: unique note
  - link "Edit note unique note":
    - /url: /notes/d0347017-255c-431e-9fb4-726f33c981fd/edit
    - img
    - text: Edit note unique note
  - button "Delete note unique note":
    - img
    - text: Delete note unique note
- paragraph: "Created: 5/27/2025"
- paragraph: note body
- checkbox "testing of note Edit note testing of note Delete note testing of note"
- heading "testing of note Edit note testing of note Delete note testing of note" [level=3]:
  - text: testing of note
  - link "Edit note testing of note":
    - /url: /notes/bb7ee080-d7fb-4217-82db-6d1d43470cea/edit
    - img
    - text: Edit note testing of note
  - button "Delete note testing of note":
    - img
    - text: Delete note testing of note
- paragraph: "Created: 5/27/2025"
- paragraph: note body
- checkbox "another note Edit note another note Delete note another note"
- heading "another note Edit note another note Delete note another note" [level=3]:
  - text: another note
  - link "Edit note another note":
    - /url: /notes/8aa49654-97f7-4ec9-b8a3-e71f533acbab/edit
    - img
    - text: Edit note another note
  - button "Delete note another note":
    - img
    - text: Delete note another note
- paragraph: "Created: 5/27/2025"
- paragraph: "yes"
- checkbox "work out test Edit note work out test Delete note work out test"
- heading "work out test Edit note work out test Delete note work out test" [level=3]:
  - text: work out test
  - link "Edit note work out test":
    - /url: /notes/c3817b2f-c065-4e45-a044-5aefd94297ee/edit
    - img
    - text: Edit note work out test
  - button "Delete note work out test":
    - img
    - text: Delete note work out test
- paragraph: "Created: 5/26/2025"
- paragraph: testing
- checkbox "test Edit note test Delete note test"
- heading "test Edit note test Delete note test" [level=3]:
  - text: test
  - link "Edit note test":
    - /url: /notes/d45280ed-ad27-4cb9-b0b1-1b0ba7d54f01/edit
    - img
    - text: Edit note test
  - button "Delete note test":
    - img
    - text: Delete note test
- paragraph: "Created: 5/26/2025"
- paragraph: <p></p>
- checkbox "test Edit note test Delete note test"
- heading "test Edit note test Delete note test" [level=3]:
  - text: test
  - link "Edit note test":
    - /url: /notes/1bee22ad-92fb-4822-ada9-74618aedb99e/edit
    - img
    - text: Edit note test
  - button "Delete note test":
    - img
    - text: Delete note test
- paragraph: "Created: 5/26/2025"
- paragraph: testing
- checkbox "test Edit note test Delete note test"
- heading "test Edit note test Delete note test" [level=3]:
  - text: test
  - link "Edit note test":
    - /url: /notes/cfe0ab77-be31-48e6-aad4-eef76dea2afe/edit
    - img
    - text: Edit note test
  - button "Delete note test":
    - img
    - text: Delete note test
- paragraph: "Created: 5/26/2025"
- paragraph: testing
- checkbox "test Edit note test Delete note test"
- heading "test Edit note test Delete note test" [level=3]:
  - text: test
  - link "Edit note test":
    - /url: /notes/40c4018c-ec1d-459b-ac84-92d4f9040b6f/edit
    - img
    - text: Edit note test
  - button "Delete note test":
    - img
    - text: Delete note test
- paragraph: "Created: 5/26/2025"
- paragraph: testing
- checkbox "test Edit note test Delete note test"
- heading "test Edit note test Delete note test" [level=3]:
  - text: test
  - link "Edit note test":
    - /url: /notes/08c999cf-dcf2-4163-9811-7c787cd8821a/edit
    - img
    - text: Edit note test
  - button "Delete note test":
    - img
    - text: Delete note test
- paragraph: "Created: 5/26/2025"
- paragraph: another
```

# Test source

```ts
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
> 160 |         await expect(page).toHaveScreenshot('notes-page.png');
      |                            ^ Error: expect(page).toHaveScreenshot(expected)
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
```