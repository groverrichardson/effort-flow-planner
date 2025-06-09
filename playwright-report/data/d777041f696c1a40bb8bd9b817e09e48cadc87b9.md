# Test info

- Name: Visual Tests for Main Pages >> notes page visual test
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:325:5

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('[data-testid="notes-container"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('[data-testid="notes-container"]')

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:338:38
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
- text: Select All (0 / 6 selected)
- 'checkbox "Test Note: With Tasks 2025-06-09T21:13:07 Edit note Test Note: With Tasks 2025-06-09T21:13:07 Delete note Test Note: With Tasks 2025-06-09T21:13:07"'
- 'heading "Test Note: With Tasks 2025-06-09T21:13:07 Edit note Test Note: With Tasks 2025-06-09T21:13:07 Delete note Test Note: With Tasks 2025-06-09T21:13:07" [level=3]':
  - text: "Test Note: With Tasks 2025-06-09T21:13:07"
  - 'link "Edit note Test Note: With Tasks 2025-06-09T21:13:07"':
    - /url: /notes/91e6710e-e996-4644-811b-d53711f79314/edit
    - img
    - text: "Edit note Test Note: With Tasks 2025-06-09T21:13:07"
  - 'button "Delete note Test Note: With Tasks 2025-06-09T21:13:07"':
    - img
    - text: "Delete note Test Note: With Tasks 2025-06-09T21:13:07"
- paragraph: "Created: 6/9/2025"
- paragraph: "This note is linked to task ID: bee29981-b973-495a-af97-83ea948b6ee4"
- 'checkbox "Test Note: Markdown 2025-06-09T21:13:07 Edit note Test Note: Markdown 2025-06-09T21:13:07 Delete note Test Note: Markdown 2025-06-09T21:13:07"'
- 'heading "Test Note: Markdown 2025-06-09T21:13:07 Edit note Test Note: Markdown 2025-06-09T21:13:07 Delete note Test Note: Markdown 2025-06-09T21:13:07" [level=3]':
  - text: "Test Note: Markdown 2025-06-09T21:13:07"
  - 'link "Edit note Test Note: Markdown 2025-06-09T21:13:07"':
    - /url: /notes/e87284c4-168c-4de1-902d-d6d9ceecab97/edit
    - img
    - text: "Edit note Test Note: Markdown 2025-06-09T21:13:07"
  - 'button "Delete note Test Note: Markdown 2025-06-09T21:13:07"':
    - img
    - text: "Delete note Test Note: Markdown 2025-06-09T21:13:07"
- paragraph: "Created: 6/9/2025"
- paragraph: "# Markdown Note This is a **markdown** formatted note. - Item 1 - Item 2 ``` code block ```"
- 'checkbox "Test Note: Rich Text 2025-06-09T21:13:07 Edit note Test Note: Rich Text 2025-06-09T21:13:07 Delete note Test Note: Rich Text 2025-06-09T21:13:07"'
- 'heading "Test Note: Rich Text 2025-06-09T21:13:07 Edit note Test Note: Rich Text 2025-06-09T21:13:07 Delete note Test Note: Rich Text 2025-06-09T21:13:07" [level=3]':
  - text: "Test Note: Rich Text 2025-06-09T21:13:07"
  - 'link "Edit note Test Note: Rich Text 2025-06-09T21:13:07"':
    - /url: /notes/f1c0932c-79e5-4418-9cb3-240a63978a22/edit
    - img
    - text: "Edit note Test Note: Rich Text 2025-06-09T21:13:07"
  - 'button "Delete note Test Note: Rich Text 2025-06-09T21:13:07"':
    - img
    - text: "Delete note Test Note: Rich Text 2025-06-09T21:13:07"
- paragraph: "Created: 6/9/2025"
- paragraph: <h1>Rich Text Note</h1><p>This note contains <strong>rich text</strong> with <em>formatting</em>.</p><ul><li>List item 1</li><li>List item 2</li></ul>
- 'checkbox "Test Note: UI Test #3 Edit note Test Note: UI Test #3 Delete note Test Note: UI Test #3"'
- 'heading "Test Note: UI Test #3 Edit note Test Note: UI Test #3 Delete note Test Note: UI Test #3" [level=3]':
  - text: "Test Note: UI Test #3"
  - 'link "Edit note Test Note: UI Test #3"':
    - /url: /notes/3ddf51c7-d55a-4d7a-b72a-d05ab6c17279/edit
    - img
    - text: "Edit note Test Note: UI Test #3"
  - 'button "Delete note Test Note: UI Test #3"':
    - img
    - text: "Delete note Test Note: UI Test #3"
- paragraph: "Created: 6/9/2025"
- paragraph: This is a test note body created by the test data seeder.
- 'checkbox "Test Note: UI Test #2 Edit note Test Note: UI Test #2 Delete note Test Note: UI Test #2"'
- 'heading "Test Note: UI Test #2 Edit note Test Note: UI Test #2 Delete note Test Note: UI Test #2" [level=3]':
  - text: "Test Note: UI Test #2"
  - 'link "Edit note Test Note: UI Test #2"':
    - /url: /notes/5f0bd1e7-bb08-4963-9e39-d14841aedde0/edit
    - img
    - text: "Edit note Test Note: UI Test #2"
  - 'button "Delete note Test Note: UI Test #2"':
    - img
    - text: "Delete note Test Note: UI Test #2"
- paragraph: "Created: 6/9/2025"
- paragraph: This is a test note body created by the test data seeder.
- 'checkbox "Test Note: UI Test #1 Edit note Test Note: UI Test #1 Delete note Test Note: UI Test #1"'
- 'heading "Test Note: UI Test #1 Edit note Test Note: UI Test #1 Delete note Test Note: UI Test #1" [level=3]':
  - text: "Test Note: UI Test #1"
  - 'link "Edit note Test Note: UI Test #1"':
    - /url: /notes/eb2b6c41-6f35-4e54-b551-188ad685cf25/edit
    - img
    - text: "Edit note Test Note: UI Test #1"
  - 'button "Delete note Test Note: UI Test #1"':
    - img
    - text: "Delete note Test Note: UI Test #1"
- paragraph: "Created: 6/9/2025"
- paragraph: This is a test note body created by the test data seeder.
```

# Test source

```ts
  238 |         );
  239 |
  240 |         // Assert navigation was successful
  241 |         expect(navigationResult.success).toBe(true);
  242 |         
  243 |         // Allow page to fully stabilize
  244 |         await waitForPageStability(page);
  245 |         
  246 |         // Wait for all-tasks-section to be visible
  247 |         await page.waitForSelector('#all-tasks-section', { state: 'visible', timeout: 10000 });
  248 |         console.log('Found all-tasks-section, checking for collapsed sections');
  249 |         
  250 |         // Check for the all-tasks toggle button and expand if collapsed
  251 |         const allTasksButton = page.locator('#all-tasks-header-button');
  252 |         if (await allTasksButton.isVisible()) {
  253 |             const isExpanded = await allTasksButton.getAttribute('aria-expanded') === 'true';
  254 |             if (!isExpanded) {
  255 |                 console.log('All tasks section is collapsed, expanding it');
  256 |                 await allTasksButton.click();
  257 |                 await page.waitForTimeout(300); // Wait for animation
  258 |             } else {
  259 |                 console.log('All tasks section is already expanded');
  260 |             }
  261 |         }
  262 |         
  263 |         // Check for the owed-to-others toggle button and expand if collapsed
  264 |         const owedToOthersButton = page.locator('#owed-to-others-header-button');
  265 |         if (await owedToOthersButton.isVisible()) {
  266 |             const isExpanded = await owedToOthersButton.getAttribute('aria-expanded') === 'true';
  267 |             if (!isExpanded) {
  268 |                 console.log('Owed to others section is collapsed, expanding it');
  269 |                 await owedToOthersButton.click();
  270 |                 await page.waitForTimeout(300); // Wait for animation
  271 |             } else {
  272 |                 console.log('Owed to others section is already expanded');
  273 |             }
  274 |         }
  275 |         
  276 |         // Wait for task lists to be visible after expansion
  277 |         await page.waitForTimeout(1000); // Give time for content to render
  278 |         
  279 |         // Check for task items using data-testid attributes
  280 |         const taskLists = [
  281 |             page.locator('[data-testid="all-my-tasks-list"]'),
  282 |             page.locator('[data-testid="owed-to-others-task-list"]')
  283 |         ];
  284 |         
  285 |         for (const list of taskLists) {
  286 |             if (await list.count() > 0) {
  287 |                 console.log(`Found task list: ${await list.getAttribute('data-testid')}`);
  288 |             }
  289 |         }
  290 |         
  291 |         // Log what elements were found for debugging
  292 |         console.log(
  293 |             `Task page elements found: ${navigationResult.elementDetails?.found.join(
  294 |                 ', '
  295 |             )}`
  296 |         );
  297 |
  298 |         // Take a screenshot and compare it to the baseline with diff reporting
  299 |         const screenshotResult = await compareScreenshotAndAttachToReport(page, testInfo, 'tasks-view');
  300 |         if (!screenshotResult.success) {
  301 |             console.warn(`Screenshot comparison failed: ${screenshotResult.message}`);
  302 |         }
  303 |     });
  304 |
  305 |     test.beforeEach(async () => {
  306 |         // Clean up any existing test data
  307 |         await testDataSeeder.cleanupTestTasks();
  308 |         
  309 |         // Seed standard test notes for consistent testing
  310 |         await seedTestNotes(3);
  311 |         
  312 |         // Add one of each template type for comprehensive coverage
  313 |         await seedTemplateNote(TestNoteTemplate.RICH_TEXT);
  314 |         await seedTemplateNote(TestNoteTemplate.WITH_MARKDOWN);
  315 |         await seedTemplateNote(TestNoteTemplate.WITH_TASKS);
  316 |         
  317 |         // Add an archived note - should not be visible in default view
  318 |         await seedTemplateNote(TestNoteTemplate.ARCHIVED);
  319 |     });
  320 |     
  321 |     // Clean up all test data after tests
  322 |     test.afterEach(async () => {
  323 |         await testDataSeeder.cleanupTestTasks();
  324 |     });
  325 |     test('notes page visual test', async ({ page }, testInfo: TestInfo) => {
  326 |         // Navigate directly to notes page with auth
  327 |         await page.goto('/notes');
  328 |         await page.waitForLoadState('networkidle');
  329 |         
  330 |         // Verify we're on the notes page
  331 |         const notesTitle = page.locator('h1:has-text("Notes"), h2:has-text("Notes"), [data-testid="notes-header"]');
  332 |         await expect(notesTitle).toBeVisible();
  333 |         
  334 |         console.log('Successfully navigated to notes page');
  335 |         
  336 |         // Verify there are notes in the notes container
  337 |         const notesContainer = page.locator('[data-testid="notes-container"]');
> 338 |         await expect(notesContainer).toBeVisible();
      |                                      ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  339 |         
  340 |         // Wait for notes to be loaded
  341 |         await page.waitForTimeout(1000); 
  342 |         
  343 |         // Verify we have the expected number of notes based on our seeding
  344 |         // Note: You might need to adjust the selector based on your actual component structure
  345 |         const noteItems = page.locator('.note-item, [data-testid="note-item"], .note-card');
  346 |         
  347 |         // Verify we have some notes (at least 3 from our basic seeding)
  348 |         await expect(noteItems).toHaveCount(3, { timeout: 10000 });
  349 |         
  350 |         // Look for the test prefix in at least one note
  351 |         await expect(page.getByText(/Test Note:/)).toBeVisible({ timeout: 5000 });
  352 |
  353 |         // Take a screenshot and compare it to the baseline with diff reporting
  354 |         const screenshotResult = await compareScreenshotAndAttachToReport(page, testInfo, 'notes-page');
  355 |         if (!screenshotResult.success) {
  356 |             console.warn(`Screenshot comparison failed: ${screenshotResult.message}`);
  357 |         }
  358 |     });
  359 |
  360 |     // Component-specific tests
  361 |     test('task creation form', async ({ page }, testInfo: TestInfo) => {
  362 |         // Use our enhanced navigation helper with route ID instead of path
  363 |         console.log('Starting task creation form test');
  364 |
  365 |         const navigationResult = await navigateToPage(page, 'tasks', testInfo);
  366 |
  367 |         // Assert navigation was successful with detailed reporting
  368 |         expect(navigationResult.success).toBe(true);
  369 |         expect(navigationResult.urlVerified).toBe(true);
  370 |         expect(navigationResult.elementsVerified).toBe(true);
  371 |
  372 |         // Log navigation details for reporting
  373 |         console.log(
  374 |             `Navigation to ${
  375 |                 navigationResult.routeConfig?.title || 'tasks page'
  376 |             }: SUCCESS`
  377 |         );
  378 |         console.log(
  379 |             `• URL verification: ${navigationResult.urlVerified ? '✅' : '❌'}`
  380 |         );
  381 |         console.log(
  382 |             `• Elements verification: ${
  383 |                 navigationResult.elementsVerified ? '✅' : '❌'
  384 |             }`
  385 |         );
  386 |         console.log(
  387 |             `• Found elements: ${navigationResult.elementDetails?.found.join(
  388 |                 ', '
  389 |             )}`
  390 |         );
  391 |
  392 |         // Access route elements directly from the route configuration
  393 |         const tasksRoute = getRouteById('tasks');
  394 |         const tasksElements = getRouteElements(page, 'tasks');
  395 |         expect(tasksElements).toBeTruthy();
  396 |
  397 |         // Verify we can access expected route elements using route config properties
  398 |         if (tasksElements.taskList) {
  399 |             console.log(
  400 |                 '✅ Task list element is accessible for test interactions'
  401 |             );
  402 |         }
  403 |
  404 |         // Show how to access route configuration data in tests
  405 |         console.log(`Testing route: ${tasksRoute.title} (${tasksRoute.path})`);
  406 |         console.log(`Required auth: ${tasksRoute.requiresAuth ? 'Yes' : 'No'}`);
  407 |         console.log(
  408 |             `Required elements: ${
  409 |                 tasksRoute.elements.filter((e) => e.required).length
  410 |             }`
  411 |         );
  412 |
  413 |         // Allow page to stabilize and verify task list is present
  414 |         try {
  415 |             // Check for task list container to verify page is ready
  416 |             const taskListSelectors = [
  417 |                 page.locator('[data-testid="task-list"]'),
  418 |                 page.locator('.tasks-container'),
  419 |                 page.locator('.task-list-wrapper'),
  420 |             ];
  421 |
  422 |             let taskListFound = false;
  423 |             for (const selector of taskListSelectors) {
  424 |                 if ((await selector.count()) > 0) {
  425 |                     taskListFound = true;
  426 |                     break;
  427 |                 }
  428 |             }
  429 |
  430 |             if (!taskListFound) {
  431 |                 console.warn(
  432 |                     'Task list container not found - page may not be fully loaded'
  433 |                 );
  434 |                 await page.waitForTimeout(1000); // Additional wait if task list not found immediately
  435 |             }
  436 |
  437 |             // Enhanced button selectors with clear IDs and additional options
  438 |             const buttonSelectors = [
```