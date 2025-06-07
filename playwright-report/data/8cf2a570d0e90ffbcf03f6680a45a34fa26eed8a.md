# Test info

- Name: Automatic route testing >> desktop view >> visual tests for all routes on desktop
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:447:13

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  76639 pixels (ratio 0.09 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/desktop-home-page-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Automatic-route-testing-cd631-s-for-all-routes-on-desktop-chromium/desktop-home-page-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Automatic-route-testing-cd631-s-for-all-routes-on-desktop-chromium/desktop-home-page-diff.png

Call log:
  - expect.toHaveScreenshot(desktop-home-page.png) with timeout 10000ms
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

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:469:44
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
  369 |                 // On mobile, sidebar may be collapsed by default - this is expected
  370 |                 await expect(page).toHaveScreenshot('mobile-default-view.png');
  371 |                 
  372 |                 // Try to find and click a hamburger menu or sidebar toggle if it exists
  373 |                 const possibleToggles = [
  374 |                     page.getByRole('button', {
  375 |                         name: /menu|toggle|hamburger|sidebar/i,
  376 |                     }),
  377 |                     page.locator(
  378 |                         '.hamburger, [data-testid="menu-button"], button.menu-toggle'
  379 |                     ),
  380 |                     page.locator('button').filter({ hasText: /☰|≡|menu/i }),
  381 |                 ];
  382 |
  383 |                 // Try each possible toggle selector
  384 |                 let toggleFound = false;
  385 |                 for (const toggle of possibleToggles) {
  386 |                     if ((await toggle.count()) > 0 && (await toggle.isVisible())) {
  387 |                         await toggle.click();
  388 |                         await page.waitForTimeout(1000); // Wait for animation
  389 |                         await expect(page).toHaveScreenshot('mobile-with-sidebar-open.png');
  390 |                         toggleFound = true;
  391 |                         break; // Stop after first successful toggle
  392 |                     }
  393 |                 }
  394 |                 
  395 |                 if (!toggleFound) {
  396 |                     console.log('No visible sidebar toggle found on mobile view');
  397 |                 }
  398 |             } catch (e) {
  399 |                 console.error('Mobile layout test failed:', e);
  400 |                 throw e;
  401 |             }
  402 |         });
  403 |     });
  404 | });
  405 |
  406 | // This is a utility to help generate visual tests for all routes efficiently
  407 | test.describe('Automatic route testing', () => {
  408 |     // Define routes once for reuse
  409 |     const routes = [
  410 |         { path: '/', name: 'home' },
  411 |         { path: '/tasks', name: 'tasks' },
  412 |         { path: '/notes', name: 'notes' },
  413 |         { path: '/login', name: 'login' }
  414 |     ];
  415 |     
  416 |     // Authentication is now handled automatically by navigateToPage
  417 |     // so we don't need manual flags anymore
  418 |     
  419 |     // Run for specified devices
  420 |     const deviceTests = [
  421 |         { name: 'desktop', viewport: devices.desktop, checkSidebar: true },
  422 |         { name: 'mobile', viewport: devices.mobile, checkSidebar: false }
  423 |     ];
  424 |     
  425 |     for (const device of deviceTests) {
  426 |         test.describe(`${device.name} view`, () => {
  427 |             // Set viewport for this test group
  428 |             test.use({ viewport: device.viewport });
  429 |
  430 |             // Single authentication at device group level
  431 |             test.beforeAll(async ({ browser }) => {
  432 |                 // Create a new page just for authentication
  433 |                 const page = await browser.newPage();
  434 |                 try {
  435 |                     await page.setViewportSize(device.viewport);
  436 |                     // This will authenticate once per device type
  437 |                     await authenticate(page);
  438 |                     console.log(`Authenticated for ${device.name} device tests`);
  439 |                 } catch (e) {
  440 |                     console.error(`Authentication failed for ${device.name} device:`, e);
  441 |                 } finally {
  442 |                     await page.close();
  443 |                 }
  444 |             });
  445 |             
  446 |             // Use a single test per device to test all routes efficiently
  447 |             test(`visual tests for all routes on ${device.name}`, async ({ page }) => {
  448 |                 try {
  449 |                     console.log(`Starting route tests for ${device.name} device`);
  450 |                     
  451 |                     // Test each route in sequence
  452 |                     for (const route of routes) {
  453 |                         console.log(`Testing ${route.path} on ${device.name}`);
  454 |                         
  455 |                         // Navigate using our standard helper
  456 |                         await navigateToPage(page, route.path);
  457 |                         
  458 |                         // Verify we reached the correct page
  459 |                         if (!page.url().includes(route.path.replace('/', ''))) {
  460 |                             console.warn(`Expected to be on ${route.path} but got ${page.url()}`);
  461 |                         }
  462 |                         
  463 |                         // Device-specific verifications
  464 |                         if (device.checkSidebar) {
  465 |                             await verifyDesktopSidebar(page, route.path);
  466 |                         }
  467 |                         
  468 |                         // Take screenshot with consistent naming
> 469 |                         await expect(page).toHaveScreenshot(
      |                                            ^ Error: expect(page).toHaveScreenshot(expected)
  470 |                             `${device.name}-${route.name}-page.png`
  471 |                         );
  472 |                     }
  473 |                     
  474 |                     console.log(`Completed all route tests for ${device.name}`);
  475 |                 } catch (e) {
  476 |                     console.error(`Error in ${device.name} route test:`, e);
  477 |                     // Take a diagnostic screenshot of the failure state
  478 |                     await expect(page).toHaveScreenshot(
  479 |                         `${device.name}-route-test-error.png`
  480 |                     );
  481 |                     throw e;
  482 |                 }
  483 |             });
  484 |         });
  485 |     }
  486 | });
  487 |
  488 | // Helper function to verify desktop sidebar state
  489 | async function verifyDesktopSidebar(page, route) {
  490 |     // Check for various sidebar selectors
  491 |     const sidebarSelectors = [
  492 |         '.sidebar',
  493 |         '[data-testid="sidebar"]',
  494 |         'nav.main-nav',
  495 |         '.navigation-sidebar',
  496 |         '#app-sidebar'
  497 |     ];
  498 |     
  499 |     // Try each selector
  500 |     for (const selector of sidebarSelectors) {
  501 |         const sidebar = page.locator(selector).first();
  502 |         const count = await sidebar.count();
  503 |         
  504 |         if (count > 0 && await sidebar.isVisible()) {
  505 |             // Sidebar found, check its dimensions
  506 |             const box = await sidebar.boundingBox();
  507 |             if (box) {
  508 |                 if (box.width < 100) {
  509 |                     console.warn(`Desktop sidebar appears collapsed on ${route}, width: ${box.width}px`);
  510 |                 } else {
  511 |                     // Sidebar is properly expanded
  512 |                     return true;
  513 |                 }
  514 |             }
  515 |             break;
  516 |         }
  517 |     }
  518 |     
  519 |     // If we get here and it's not login page, log a warning
  520 |     if (!route.includes('login')) {
  521 |         console.log(`No visible sidebar found on desktop for ${route}`);
  522 |     }
  523 |     
  524 |     return false;
  525 | }
  526 |
  527 |
```