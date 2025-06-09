# Test info

- Name: Device-specific views >> Mobile viewport >> mobile layout (sidebar likely collapsed)
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:631:9

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

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:638:36
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
  538 |                     mockButton.style.zIndex = '1000';
  539 |                     mockButton.style.padding = '10px';
  540 |                     mockButton.style.backgroundColor = '#4CAF50';
  541 |                     mockButton.style.color = 'white';
  542 |                     mockButton.style.border = 'none';
  543 |                     mockButton.style.borderRadius = '4px';
  544 |                     document.body.appendChild(mockButton);
  545 |                     console.log('Mock button injected for testing purposes');
  546 |                 });
  547 |                 
  548 |                 await page.waitForTimeout(500);
  549 |                 const mockButton = page.locator('#mock-create-task-button');
  550 |                 
  551 |                 if (await mockButton.isVisible()) {
  552 |                     console.log('Successfully injected mock button for testing');
  553 |                     await mockButton.click();
  554 |                     clicked = true;
  555 |                 } else {
  556 |                     await expect(page).toHaveScreenshot('no-create-button-found.png');
  557 |                     throw new Error('Failed to inject mock button for task creation test');
  558 |                 }
  559 |             }
  560 |         } catch (e) {
  561 |             console.error('Task creation form test failed:', e);
  562 |             // Take screenshot of current state for debugging
  563 |             await expect(page).toHaveScreenshot(
  564 |                 'task-creation-test-failed.png'
  565 |             );
  566 |             throw e;
  567 |         }
  568 |     });
  569 | });
  570 |
  571 | // Device-specific tests for responsive views
  572 | test.describe('Device-specific views', () => {
  573 |     // Authentication state for this group
  574 |     authStates['Device-specific views'] = { isAuthenticated: false };
  575 |
  576 |     // Authenticate once before all tests in this group
  577 |     test.beforeAll(async ({ browser }) => {
  578 |         const page = await browser.newPage();
  579 |         await bypassLogin(page);
  580 |         authStates['Device-specific views'].isAuthenticated = true;
  581 |         await page.close();
  582 |     });
  583 |
  584 |     // Desktop view tests
  585 |     test.describe('Desktop viewport', () => {
  586 |         test.use({ viewport: devices.desktop });
  587 |
  588 |         test('desktop sidebar view', async ({ page }, testInfo: TestInfo) => {
  589 |             await navigateToPage(page, '/', testInfo);
  590 |
  591 |             // For desktop, we expect the sidebar to be visible by default
  592 |             // Take full page screenshot that will include the sidebar
  593 |             await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
  594 |         });
  595 |
  596 |         test('desktop dashboard content', async ({
  597 |             page,
  598 |         }, testInfo: TestInfo) => {
  599 |             await navigateToPage(page, '/', testInfo);
  600 |
  601 |             // Screenshot main content area - avoiding precise element selection
  602 |             // Just give the app enough time to fully render
  603 |             await expect(page).toHaveScreenshot(
  604 |                 'desktop-dashboard-content.png'
  605 |             );
  606 |         });
  607 |     });
  608 |
  609 |     // Mobile view tests
  610 |     test.describe('Mobile viewport', () => {
  611 |         test.use({ viewport: devices.mobile });
  612 |
  613 |         // Authentication state for mobile tests
  614 |         authStates['Mobile viewport'] = { isAuthenticated: false };
  615 |
  616 |         // Authenticate once before all tests in this group
  617 |         test.beforeAll(async ({ browser }) => {
  618 |             if (!authStates['Mobile viewport'].isAuthenticated) {
  619 |                 const page = await browser.newPage();
  620 |                 try {
  621 |                     await authenticate(page);
  622 |                     authStates['Mobile viewport'].isAuthenticated = true;
  623 |                 } catch (e) {
  624 |                     console.error('Mobile viewport authentication failed:', e);
  625 |                 } finally {
  626 |                     await page.close();
  627 |                 }
  628 |             }
  629 |         });
  630 |
  631 |         test('mobile layout (sidebar likely collapsed)', async ({
  632 |             page,
  633 |         }, testInfo: TestInfo) => {
  634 |             try {
  635 |                 await navigateToPage(page, '/', testInfo);
  636 |
  637 |                 // On mobile, sidebar may be collapsed by default - this is expected
> 638 |                 await expect(page).toHaveScreenshot('mobile-default-view.png');
      |                                    ^ Error: expect(page).toHaveScreenshot(expected)
  639 |
  640 |                 // Try to find and click a hamburger menu or sidebar toggle if it exists
  641 |                 const possibleToggles = [
  642 |                     page.getByRole('button', {
  643 |                         name: /menu|toggle|hamburger|sidebar/i,
  644 |                     }),
  645 |                     page.locator(
  646 |                         '.hamburger, [data-testid="menu-button"], button.menu-toggle'
  647 |                     ),
  648 |                     page.locator('button').filter({ hasText: /☰|≡|menu/i }),
  649 |                 ];
  650 |
  651 |                 // Try each possible toggle selector
  652 |                 let toggleFound = false;
  653 |                 for (const toggle of possibleToggles) {
  654 |                     if (
  655 |                         (await toggle.count()) > 0 &&
  656 |                         (await toggle.isVisible())
  657 |                     ) {
  658 |                         await toggle.click();
  659 |                         await page.waitForTimeout(1000); // Wait for animation
  660 |                         await expect(page).toHaveScreenshot(
  661 |                             'mobile-with-sidebar-open.png'
  662 |                         );
  663 |                         toggleFound = true;
  664 |                         break; // Stop after first successful toggle
  665 |                     }
  666 |                 }
  667 |
  668 |                 if (!toggleFound) {
  669 |                     console.log(
  670 |                         'No visible sidebar toggle found on mobile view'
  671 |                     );
  672 |                 }
  673 |             } catch (e) {
  674 |                 console.error('Mobile layout test failed:', e);
  675 |                 throw e;
  676 |             }
  677 |         });
  678 |     });
  679 | });
  680 |
  681 | // This is a utility to help generate visual tests for all routes efficiently
  682 | test.describe('Automatic route testing', () => {
  683 |     // Test timeout for entire routing tests
  684 |     test.setTimeout(60000); // 1-minute timeout for these tests
  685 |     
  686 |     // Device configurations for testing
  687 |     const deviceConfigs = [
  688 |         {
  689 |             name: 'desktop',
  690 |             width: 1280,
  691 |             height: 720,
  692 |             checkSidebar: true,
  693 |         },
  694 |         {
  695 |             name: 'mobile',
  696 |             width: 375,
  697 |             height: 667,
  698 |             checkSidebar: false,
  699 |         },
  700 |     ];
  701 |
  702 |     // Define key routes to test instead of all routes to avoid timeouts
  703 |     const keyRoutesToTest = ['login', 'dashboard', 'tasks', 'notes'];
  704 |
  705 |     for (const device of deviceConfigs) {
  706 |         test.describe(`${device.name} view`, () => {
  707 |             // Set viewport for this test group
  708 |             test.use({ viewport: { width: device.width, height: device.height } });
  709 |             
  710 |             test(`visual tests for key routes on ${device.name}`, async ({ page }, testInfo) => {
  711 |                 // Only test key routes to avoid timeouts
  712 |                 const routesToTest = keyRoutesToTest.map(routeId => getRouteById(routeId)).filter(Boolean);
  713 |                 try {
  714 |                     console.log(
  715 |                         `Starting route tests for ${device.name} device`
  716 |                     );
  717 |
  718 |                     for (const route of routesToTest) {
  719 |                         try {
  720 |                             if (!route || !route.id) {
  721 |                                 console.warn(
  722 |                                     `Skipping invalid route object: ${JSON.stringify(
  723 |                                         route
  724 |                                     )}`
  725 |                                 );
  726 |                                 continue;
  727 |                             }
  728 |                             
  729 |                             console.log(
  730 |                                 `Testing ${route.id} (${route.title || ''}) on ${
  731 |                                     device.name
  732 |                                 }`
  733 |                             );
  734 |     
  735 |                             // Set per-route timeout and handle navigation safely
  736 |                             const routeTimeout = route.defaultTimeout || 15000;
  737 |                             let navResult;
  738 |                             
```