# Test info

- Name: Visual Tests for Main Pages >> login page visual test
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:166:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  267 pixels (ratio 0.01 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/login-page-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Visual-Tests-for-Main-Pages-login-page-visual-test-chromium/login-page-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Visual-Tests-for-Main-Pages-login-page-visual-test-chromium/login-page-diff.png

Call log:
  - expect.toHaveScreenshot(login-page.png) with timeout 10000ms
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

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:187:30
```

# Test source

```ts
   87 |         // Extract the route ID from the route config or use the routeIdOrPath string directly
   88 |         const routeId = typeof routeIdOrPath === 'string' ? routeIdOrPath : routeIdOrPath.id;
   89 |         const result = await navigateTo(page, routeId, bypassLogin, {
   90 |             maxRetries: 2,
   91 |             timeout: 15000,
   92 |             throwOnFailure: false,
   93 |             verificationOptions: {
   94 |                 timeout: 10000,
   95 |                 screenshotPath: `route-verification-${(typeof routeIdOrPath === 'string' ? routeIdOrPath : routeIdOrPath.id).replace(
   96 |                     /\//g,
   97 |                     '_'
   98 |                 )}-${Date.now()}.png`,
   99 |                 verbose: true,
  100 |             },
  101 |             verbose: true,
  102 |         });
  103 |
  104 |         if (!result.success) {
  105 |             console.error(
  106 |                 `❌ Navigation to ${routeName} failed: ${result.errorMessage}`
  107 |             );
  108 |             if (result.screenshotPath) {
  109 |                 console.log(`📸 See screenshot: ${result.screenshotPath}`);
  110 |             }
  111 |             throw new Error(
  112 |                 `Navigation to ${routeName} failed: ${result.errorMessage}`
  113 |             );
  114 |         }
  115 |
  116 |         // Reporter handles detailed logging
  117 |         navigationReporter.logNavigation(result, testInfo.title);
  118 |
  119 |         return result;
  120 |     } catch (error) {
  121 |         // This catch block handles errors thrown by navigateToPage itself or if navigateTo throws unexpectedly
  122 |         const routeName =
  123 |             typeof routeIdOrPath === 'string' && routes[routeIdOrPath]
  124 |                 ? routes[routeIdOrPath].title
  125 |                 : routeIdOrPath;
  126 |         const errorMsg = error instanceof Error ? error.message : String(error);
  127 |
  128 |         const failureResult: NavigationResult = {
  129 |             success: false,
  130 |             targetRoute: routeIdOrPath,
  131 |             actualUrl: page ? page.url() : 'unknown',
  132 |             urlVerified: false,
  133 |             elementsVerified: false,
  134 |             errorMessage: `Critical error in navigateToPage for ${routeName}: ${errorMsg}`,
  135 |             timestamp: Date.now(),
  136 |             duration: 0, // Duration calculation might need a startTime at the beginning of navigateToPage
  137 |         };
  138 |         navigationReporter.logNavigation(failureResult, testInfo.title);
  139 |         // console.error(`❌ Critical error during navigation to ${routeName}: ${errorMsg}`); // Reporter logs this
  140 |         throw error; // Re-throw to ensure test fails
  141 |     }
  142 | }
  143 |
  144 | // Test all main pages for visual regressions
  145 | test.describe('Visual Tests for Main Pages', () => {
  146 |     // Configure for desktop viewport by default
  147 |     test.use({ viewport: devices.desktop });
  148 |
  149 |     // Authentication state for this group
  150 |     authStates['Visual Tests for Main Pages'] = { isAuthenticated: false };
  151 |
  152 |     // Authenticate once before all tests in this group
  153 |     test.beforeAll(async ({ browser }) => {
  154 |         const page = await browser.newPage();
  155 |         await bypassLogin(page);
  156 |         authStates['Visual Tests for Main Pages'].isAuthenticated = true;
  157 |         await page.close();
  158 |     });
  159 |
  160 |     // Run before each test
  161 |     test.beforeEach(async ({ page }, testInfo: TestInfo) => {
  162 |         // Set a consistent viewport for all tests
  163 |         await page.setViewportSize({ width: 1280, height: 800 });
  164 |     });
  165 |
  166 |     test('login page visual test', async ({ browser }, testInfo: TestInfo) => {
  167 |         const context = await browser.newContext({ storageState: undefined }); // Use a new context without saved auth
  168 |         const page = await context.newPage();
  169 |         // Navigate to the login page using route ID
  170 |         const route = routes.login; // Ensure we get the full route object
  171 |         const navigationResult = await navigateToPage(page, route, testInfo);
  172 |
  173 |         // Assert navigation was successful
  174 |         expect(navigationResult.success).toBe(true);
  175 |         expect(navigationResult.urlVerified).toBe(true);
  176 |         expect(navigationResult.elementsVerified, `Elements not verified on ${route.title}: ${navigationResult.errorMessage || (navigationResult.elementDetails?.missing ?? []).join(', ') || 'Unknown reasons'}`).toBe(true);
  177 |
  178 |         // Log which elements were found for reporting
  179 |         console.log(
  180 |             `Login page elements found: ${navigationResult.elementDetails?.found.join(
  181 |                 ', '
  182 |             )}`
  183 |         );
  184 |
  185 |         // Take a screenshot and compare it to the baseline
  186 |         try {
> 187 |           await expect(page).toHaveScreenshot('login-page.png');
      |                              ^ Error: expect(page).toHaveScreenshot(expected)
  188 |         } finally {
  189 |             await page.close();
  190 |             await context.close();
  191 |         }
  192 |     });
  193 |
  194 |     test('dashboard visual test', async ({ page }, testInfo: TestInfo) => {
  195 |         // Navigate to the dashboard using route ID instead of path
  196 |         const navigationResult = await navigateToPage(
  197 |             page,
  198 |             'dashboard',
  199 |             testInfo
  200 |         );
  201 |
  202 |         // Assert navigation was successful
  203 |         expect(navigationResult.success).toBe(true);
  204 |         expect(navigationResult.urlVerified).toBe(true);
  205 |         expect(navigationResult.elementsVerified).toBe(true);
  206 |
  207 |         // Log which elements were found for reporting
  208 |         console.log(
  209 |             `Dashboard elements found: ${navigationResult.elementDetails?.found.join(
  210 |                 ', '
  211 |             )}`
  212 |         );
  213 |
  214 |         // Take a screenshot and compare it to the baseline
  215 |         await expect(page).toHaveScreenshot('dashboard-page.png');
  216 |     });
  217 |
  218 |     test('tasks page visual test', async ({ page }, testInfo: TestInfo) => {
  219 |         // Navigate to tasks page using route ID
  220 |         const navigationResult = await navigateToPage(page, 'tasks', testInfo);
  221 |
  222 |         // Assert navigation was successful
  223 |         expect(navigationResult.success).toBe(true);
  224 |         expect(navigationResult.urlVerified).toBe(true);
  225 |         expect(navigationResult.elementsVerified).toBe(true);
  226 |
  227 |         // Log which elements were found for reporting
  228 |         console.log(
  229 |             `Tasks page elements found: ${navigationResult.elementDetails?.found.join(
  230 |                 ', '
  231 |             )}`
  232 |         );
  233 |
  234 |         // Take a screenshot and compare it to the baseline
  235 |         await expect(page).toHaveScreenshot('tasks-page.png');
  236 |     });
  237 |
  238 |     test('notes page visual test', async ({ page }, testInfo: TestInfo) => {
  239 |         // Navigate to notes page using route ID
  240 |         const navigationResult = await navigateToPage(page, 'notes', testInfo);
  241 |
  242 |         // Assert navigation was successful
  243 |         expect(navigationResult.success).toBe(true);
  244 |         expect(navigationResult.urlVerified).toBe(true);
  245 |         expect(navigationResult.elementsVerified).toBe(true);
  246 |
  247 |         // Log which elements were found for reporting
  248 |         console.log(
  249 |             `Notes page elements found: ${navigationResult.elementDetails?.found.join(
  250 |                 ', '
  251 |             )}`
  252 |         );
  253 |
  254 |         // Take a screenshot and compare it to the baseline
  255 |         await expect(page).toHaveScreenshot('notes-page.png');
  256 |     });
  257 |
  258 |     // Component-specific tests
  259 |     test('task creation form', async ({ page }, testInfo: TestInfo) => {
  260 |         // Use our enhanced navigation helper with route ID instead of path
  261 |         console.log('Starting task creation form test');
  262 |
  263 |         const navigationResult = await navigateToPage(page, 'tasks', testInfo);
  264 |
  265 |         // Assert navigation was successful with detailed reporting
  266 |         expect(navigationResult.success).toBe(true);
  267 |         expect(navigationResult.urlVerified).toBe(true);
  268 |         expect(navigationResult.elementsVerified).toBe(true);
  269 |
  270 |         // Log navigation details for reporting
  271 |         console.log(
  272 |             `Navigation to ${
  273 |                 navigationResult.routeConfig?.title || 'tasks page'
  274 |             }: SUCCESS`
  275 |         );
  276 |         console.log(
  277 |             `• URL verification: ${navigationResult.urlVerified ? '✅' : '❌'}`
  278 |         );
  279 |         console.log(
  280 |             `• Elements verification: ${
  281 |                 navigationResult.elementsVerified ? '✅' : '❌'
  282 |             }`
  283 |         );
  284 |         console.log(
  285 |             `• Found elements: ${navigationResult.elementDetails?.found.join(
  286 |                 ', '
  287 |             )}`
```