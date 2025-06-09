# Test info

- Name: Device-specific views >> Mobile viewport >> mobile layout (sidebar likely collapsed)
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:669:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  111 pixels (ratio 0.01 of all image pixels) are different.

Expected: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts-snapshots/mobile-with-sidebar-open-chromium-darwin.png
Received: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Device-specific-views-M-c1dcc-t-sidebar-likely-collapsed--chromium/mobile-with-sidebar-open-actual.png
    Diff: /Users/freedommarketing/Desktop/effort-flow-planner/screenshots/ui-Device-specific-views-M-c1dcc-t-sidebar-likely-collapsed--chromium/mobile-with-sidebar-open-diff.png

Call log:
  - expect.toHaveScreenshot(mobile-with-sidebar-open.png) with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 111 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 111 pixels (ratio 0.01 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:698:44
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
- button "Menu" [expanded]:
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
- dialog:
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
  - button "Completed Today (24)"
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
  - button "Close":
    - img
    - text: Close
```

# Test source

```ts
  598 |             throw e;
  599 |         }
  600 |     });
  601 | });
  602 |
  603 | // Device-specific tests for responsive views
  604 | test.describe('Device-specific views', () => {
  605 |     // Authentication state for this group
  606 |     authStates['Device-specific views'] = { isAuthenticated: false };
  607 |
  608 |     // Authenticate once before all tests in this group
  609 |     test.beforeAll(async ({ browser }) => {
  610 |         const page = await browser.newPage();
  611 |         await bypassLogin(page);
  612 |         authStates['Device-specific views'].isAuthenticated = true;
  613 |         await page.close();
  614 |     });
  615 |
  616 |     // Desktop view tests
  617 |     test.describe('Desktop viewport', () => {
  618 |         test.use({ viewport: devices.desktop });
  619 |
  620 |         test('desktop sidebar view', async ({ page }, testInfo: TestInfo) => {
  621 |             await navigateToPage(page, '/', testInfo);
  622 |
  623 |             // For desktop, we expect the sidebar to be visible by default
  624 |             // Take full page screenshot that will include the sidebar
  625 |             await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
  626 |         });
  627 |
  628 |         test('desktop dashboard content', async ({
  629 |             page,
  630 |         }, testInfo: TestInfo) => {
  631 |             await navigateToPage(page, '/', testInfo);
  632 |
  633 |             // Screenshot main content area - avoiding precise element selection
  634 |             // Just give the app enough time to fully render
  635 |             await expect(page).toHaveScreenshot(
  636 |                 'desktop-dashboard-content.png'
  637 |             );
  638 |         });
  639 |     });
  640 |
  641 |     // Mobile view tests
  642 |     test.describe('Mobile viewport', () => {
  643 |         test.use({ viewport: devices.mobile });
  644 |
  645 |         // Authentication state for mobile tests
  646 |         authStates['Mobile viewport'] = { isAuthenticated: false };
  647 |
  648 |         // Authenticate once before all tests in this group
  649 |         test.beforeAll(async ({ browser }) => {
  650 |             if (!authStates['Mobile viewport'].isAuthenticated) {
  651 |                 const page = await browser.newPage();
  652 |                 try {
  653 |                     await authenticate(page);
  654 |                     authStates['Mobile viewport'].isAuthenticated = true;
  655 |                 } catch (e) {
  656 |                     console.error('Mobile viewport authentication failed:', e);
  657 |                 } finally {
  658 |                     await page.close();
  659 |                 }
  660 |             }
  661 |         });
  662 |
  663 |         test('mobile layout (sidebar likely collapsed)', async ({
  664 |             page,
  665 |         }, testInfo: TestInfo) => {
  666 |             try {
  667 |                 await navigateToPage(page, '/', testInfo);
  668 |
  669 |                 // On mobile, sidebar may be collapsed by default - this is expected
  670 |                 await expect(page).toHaveScreenshot('mobile-default-view.png');
  671 |
  672 |                 // Try to find and click a hamburger menu or sidebar toggle if it exists
  673 |                 const possibleToggles = [
  674 |                     page.getByRole('button', {
  675 |                         name: /menu|toggle|hamburger|sidebar/i,
  676 |                     }),
  677 |                     page.locator(
  678 |                         '.hamburger, [data-testid="menu-button"], button.menu-toggle'
  679 |                     ),
  680 |                     page.locator('button').filter({ hasText: /☰|≡|menu/i }),
  681 |                 ];
  682 |
  683 |                 // Try each possible toggle selector
  684 |                 let toggleFound = false;
  685 |                 for (const toggle of possibleToggles) {
  686 |                     if (
  687 |                         (await toggle.count()) > 0 &&
  688 |                         (await toggle.isVisible())
  689 |                     ) {
  690 |                         await toggle.click();
  691 |                         await page.waitForTimeout(1000); // Wait for animation
  692 |                         await expect(page).toHaveScreenshot(
  693 |                             'mobile-with-sidebar-open.png'
  694 |                         );
  695 |                         toggleFound = true;
  696 |                         break; // Stop after first successful toggle
  697 |                     }
> 698 |                 }
      |                  ^ Error: expect(page).toHaveScreenshot(expected)
  699 |
  700 |                 if (!toggleFound) {
  701 |                     console.log(
  702 |                         'No visible sidebar toggle found on mobile view'
  703 |                     );
  704 |                 }
  705 |             } catch (e) {
  706 |                 console.error('Mobile layout test failed:', e);
  707 |                 throw e;
  708 |             }
  709 |         });
  710 |     });
  711 | });
  712 |
  713 | // This is a utility to help generate visual tests for all routes efficiently
  714 | test.describe('Automatic route testing', () => {
  715 |     // Test timeout for entire routing tests
  716 |     test.setTimeout(60000); // 1-minute timeout for these tests
  717 |     
  718 |     // Device configurations for testing
  719 |     const deviceConfigs = [
  720 |         {
  721 |             name: 'desktop',
  722 |             width: 1280,
  723 |             height: 720,
  724 |             checkSidebar: true,
  725 |         },
  726 |         {
  727 |             name: 'mobile',
  728 |             width: 375,
  729 |             height: 667,
  730 |             checkSidebar: false,
  731 |         },
  732 |     ];
  733 |
  734 |     // Define key routes to test instead of all routes to avoid timeouts
  735 |     const keyRoutesToTest = ['login', 'dashboard', 'tasks', 'notes'];
  736 |
  737 |     for (const device of deviceConfigs) {
  738 |         test.describe(`${device.name} view`, () => {
  739 |             // Set viewport for this test group
  740 |             test.use({ viewport: { width: device.width, height: device.height } });
  741 |             
  742 |             test(`visual tests for key routes on ${device.name}`, async ({ page }, testInfo) => {
  743 |                 // Only test key routes to avoid timeouts
  744 |                 const routesToTest = keyRoutesToTest.map(routeId => getRouteById(routeId)).filter(Boolean);
  745 |                 try {
  746 |                     console.log(
  747 |                         `Starting route tests for ${device.name} device`
  748 |                     );
  749 |
  750 |                     for (const route of routesToTest) {
  751 |                         try {
  752 |                             if (!route || !route.id) {
  753 |                                 console.warn(
  754 |                                     `Skipping invalid route object: ${JSON.stringify(
  755 |                                         route
  756 |                                     )}`
  757 |                                 );
  758 |                                 continue;
  759 |                             }
  760 |                             
  761 |                             console.log(
  762 |                                 `Testing ${route.id} (${route.title || ''}) on ${
  763 |                                     device.name
  764 |                                 }`
  765 |                             );
  766 |     
  767 |                             // Set per-route timeout and handle navigation safely
  768 |                             const routeTimeout = route.defaultTimeout || 15000;
  769 |                             let navResult;
  770 |                             
  771 |                             try {
  772 |                                 // Set a timeout for navigation
  773 |                                 const navPromise = navigateToPage(page, route.id, testInfo);
  774 |                                 const timeoutPromise = new Promise((_, reject) => {
  775 |                                     setTimeout(() => reject(new Error(`Navigation timeout for ${route.id}`)), routeTimeout);
  776 |                                 });
  777 |                                 
  778 |                                 navResult = await Promise.race([navPromise, timeoutPromise]);
  779 |                                 
  780 |                                 // Skip taking screenshots if navigation failed
  781 |                                 if (!navResult?.success) {
  782 |                                     console.warn(`Navigation to ${route.id} failed: ${navResult?.errorMessage || 'Unknown reason'}`);
  783 |                                     continue;
  784 |                                 }
  785 |                             } catch (navError) {
  786 |                                 console.warn(`Navigation error with ${route.id}: ${navError.message}`);
  787 |                                 continue;
  788 |                             }
  789 |     
  790 |                             // Take a very brief pause to ensure page is stable
  791 |                             await page.waitForTimeout(300);
  792 |                             
  793 |                             // Take screenshot with consistent naming and attach diffs to report
  794 |                             try {
  795 |                                 const screenshotResult = await compareScreenshotAndAttachToReport(
  796 |                                     page, 
  797 |                                     testInfo, 
  798 |                                     `${device.name}-${route.id}-page`,
```