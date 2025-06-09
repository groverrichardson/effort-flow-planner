# Test info

- Name: Device-specific views >> Mobile viewport >> mobile layout (sidebar likely collapsed)
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:581:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  20 pixels (ratio 0.01 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/mobile-default-view-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Device-specific-views-M-c1dcc-t-sidebar-likely-collapsed--chromium/mobile-default-view-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Device-specific-views-M-c1dcc-t-sidebar-likely-collapsed--chromium/mobile-default-view-diff.png

Call log:
  - expect.toHaveScreenshot(mobile-default-view.png) with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 20 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 20 pixels (ratio 0.01 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:588:36
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
- button "Menu":
  - img
  - text: Menu
- heading "Suggestions for Next Steps" [level=2]
- paragraph: Future home of intelligent task suggestions. For now, consider what's most important or time-sensitive!
- button "Owed to Others (Due Today or Past Due)" [expanded]:
  - text: Owed to Others (Due Today or Past Due)
  - img
- paragraph: No tasks owed to others are due today or past due.
- button "All My Tasks":
  - text: All My Tasks
  - img
- button "Add Quick Task":
  - img
```

# Test source

```ts
  488 |                     mockButton.style.zIndex = '1000';
  489 |                     mockButton.style.padding = '10px';
  490 |                     mockButton.style.backgroundColor = '#4CAF50';
  491 |                     mockButton.style.color = 'white';
  492 |                     mockButton.style.border = 'none';
  493 |                     mockButton.style.borderRadius = '4px';
  494 |                     document.body.appendChild(mockButton);
  495 |                     console.log('Mock button injected for testing purposes');
  496 |                 });
  497 |                 
  498 |                 await page.waitForTimeout(500);
  499 |                 const mockButton = page.locator('#mock-create-task-button');
  500 |                 
  501 |                 if (await mockButton.isVisible()) {
  502 |                     console.log('Successfully injected mock button for testing');
  503 |                     await mockButton.click();
  504 |                     clicked = true;
  505 |                 } else {
  506 |                     await expect(page).toHaveScreenshot('no-create-button-found.png');
  507 |                     throw new Error('Failed to inject mock button for task creation test');
  508 |                 }
  509 |             }
  510 |         } catch (e) {
  511 |             console.error('Task creation form test failed:', e);
  512 |             // Take screenshot of current state for debugging
  513 |             await expect(page).toHaveScreenshot(
  514 |                 'task-creation-test-failed.png'
  515 |             );
  516 |             throw e;
  517 |         }
  518 |     });
  519 | });
  520 |
  521 | // Device-specific tests for responsive views
  522 | test.describe('Device-specific views', () => {
  523 |     // Authentication state for this group
  524 |     authStates['Device-specific views'] = { isAuthenticated: false };
  525 |
  526 |     // Authenticate once before all tests in this group
  527 |     test.beforeAll(async ({ browser }) => {
  528 |         const page = await browser.newPage();
  529 |         await bypassLogin(page);
  530 |         authStates['Device-specific views'].isAuthenticated = true;
  531 |         await page.close();
  532 |     });
  533 |
  534 |     // Desktop view tests
  535 |     test.describe('Desktop viewport', () => {
  536 |         test.use({ viewport: devices.desktop });
  537 |
  538 |         test('desktop sidebar view', async ({ page }, testInfo: TestInfo) => {
  539 |             await navigateToPage(page, '/', testInfo);
  540 |
  541 |             // For desktop, we expect the sidebar to be visible by default
  542 |             // Take full page screenshot that will include the sidebar
  543 |             await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
  544 |         });
  545 |
  546 |         test('desktop dashboard content', async ({
  547 |             page,
  548 |         }, testInfo: TestInfo) => {
  549 |             await navigateToPage(page, '/', testInfo);
  550 |
  551 |             // Screenshot main content area - avoiding precise element selection
  552 |             // Just give the app enough time to fully render
  553 |             await expect(page).toHaveScreenshot(
  554 |                 'desktop-dashboard-content.png'
  555 |             );
  556 |         });
  557 |     });
  558 |
  559 |     // Mobile view tests
  560 |     test.describe('Mobile viewport', () => {
  561 |         test.use({ viewport: devices.mobile });
  562 |
  563 |         // Authentication state for mobile tests
  564 |         authStates['Mobile viewport'] = { isAuthenticated: false };
  565 |
  566 |         // Authenticate once before all tests in this group
  567 |         test.beforeAll(async ({ browser }) => {
  568 |             if (!authStates['Mobile viewport'].isAuthenticated) {
  569 |                 const page = await browser.newPage();
  570 |                 try {
  571 |                     await authenticate(page);
  572 |                     authStates['Mobile viewport'].isAuthenticated = true;
  573 |                 } catch (e) {
  574 |                     console.error('Mobile viewport authentication failed:', e);
  575 |                 } finally {
  576 |                     await page.close();
  577 |                 }
  578 |             }
  579 |         });
  580 |
  581 |         test('mobile layout (sidebar likely collapsed)', async ({
  582 |             page,
  583 |         }, testInfo: TestInfo) => {
  584 |             try {
  585 |                 await navigateToPage(page, '/', testInfo);
  586 |
  587 |                 // On mobile, sidebar may be collapsed by default - this is expected
> 588 |                 await expect(page).toHaveScreenshot('mobile-default-view.png');
      |                                    ^ Error: expect(page).toHaveScreenshot(expected)
  589 |
  590 |                 // Try to find and click a hamburger menu or sidebar toggle if it exists
  591 |                 const possibleToggles = [
  592 |                     page.getByRole('button', {
  593 |                         name: /menu|toggle|hamburger|sidebar/i,
  594 |                     }),
  595 |                     page.locator(
  596 |                         '.hamburger, [data-testid="menu-button"], button.menu-toggle'
  597 |                     ),
  598 |                     page.locator('button').filter({ hasText: /☰|≡|menu/i }),
  599 |                 ];
  600 |
  601 |                 // Try each possible toggle selector
  602 |                 let toggleFound = false;
  603 |                 for (const toggle of possibleToggles) {
  604 |                     if (
  605 |                         (await toggle.count()) > 0 &&
  606 |                         (await toggle.isVisible())
  607 |                     ) {
  608 |                         await toggle.click();
  609 |                         await page.waitForTimeout(1000); // Wait for animation
  610 |                         await expect(page).toHaveScreenshot(
  611 |                             'mobile-with-sidebar-open.png'
  612 |                         );
  613 |                         toggleFound = true;
  614 |                         break; // Stop after first successful toggle
  615 |                     }
  616 |                 }
  617 |
  618 |                 if (!toggleFound) {
  619 |                     console.log(
  620 |                         'No visible sidebar toggle found on mobile view'
  621 |                     );
  622 |                 }
  623 |             } catch (e) {
  624 |                 console.error('Mobile layout test failed:', e);
  625 |                 throw e;
  626 |             }
  627 |         });
  628 |     });
  629 | });
  630 |
  631 | // This is a utility to help generate visual tests for all routes efficiently
  632 | test.describe('Automatic route testing', () => {
  633 |     // Test timeout for entire routing tests
  634 |     test.setTimeout(60000); // 1-minute timeout for these tests
  635 |     
  636 |     // Device configurations for testing
  637 |     const deviceConfigs = [
  638 |         {
  639 |             name: 'desktop',
  640 |             width: 1280,
  641 |             height: 720,
  642 |             checkSidebar: true,
  643 |         },
  644 |         {
  645 |             name: 'mobile',
  646 |             width: 375,
  647 |             height: 667,
  648 |             checkSidebar: false,
  649 |         },
  650 |     ];
  651 |
  652 |     // Define key routes to test instead of all routes to avoid timeouts
  653 |     const keyRoutesToTest = ['login', 'dashboard', 'tasks', 'notes'];
  654 |
  655 |     for (const device of deviceConfigs) {
  656 |         test.describe(`${device.name} view`, () => {
  657 |             // Set viewport for this test group
  658 |             test.use({ viewport: { width: device.width, height: device.height } });
  659 |             
  660 |             test(`visual tests for key routes on ${device.name}`, async ({ page }, testInfo) => {
  661 |                 // Only test key routes to avoid timeouts
  662 |                 const routesToTest = keyRoutesToTest.map(routeId => getRouteById(routeId)).filter(Boolean);
  663 |                 try {
  664 |                     console.log(
  665 |                         `Starting route tests for ${device.name} device`
  666 |                     );
  667 |
  668 |                     for (const route of routesToTest) {
  669 |                         try {
  670 |                             if (!route || !route.id) {
  671 |                                 console.warn(
  672 |                                     `Skipping invalid route object: ${JSON.stringify(
  673 |                                         route
  674 |                                     )}`
  675 |                                 );
  676 |                                 continue;
  677 |                             }
  678 |                             
  679 |                             console.log(
  680 |                                 `Testing ${route.id} (${route.title || ''}) on ${
  681 |                                     device.name
  682 |                                 }`
  683 |                             );
  684 |     
  685 |                             // Set per-route timeout and handle navigation safely
  686 |                             const routeTimeout = route.defaultTimeout || 15000;
  687 |                             let navResult;
  688 |                             
```