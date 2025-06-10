# Test info

- Name: Device-specific views >> Desktop viewport >> desktop dashboard content
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:703:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  65 pixels (ratio 0.01 of all image pixels) are different.

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
  - 65 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 65 pixels (ratio 0.01 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:710:32
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
  610 |                 if (dialogVisible) {
  611 |                     console.log('Task creation dialog successfully opened');
  612 |                     await expect(page).toHaveScreenshot(
  613 |                         'task-create-form-page.png'
  614 |                     );
  615 |                 } else {
  616 |                     console.error(
  617 |                         'Button was clicked but dialog did not appear'
  618 |                     );
  619 |                     await expect(page).toHaveScreenshot(
  620 |                         'task-dialog-not-visible.png'
  621 |                     );
  622 |                     throw new Error(
  623 |                         'Task form dialog not found after clicking create button'
  624 |                     );
  625 |                 }
  626 |             } else {
  627 |                 console.log(
  628 |                     'No viable task creation button found, injecting a mock button for testing'
  629 |                 );
  630 |
  631 |                 // Inject a test button if none exists - this allows the test to continue
  632 |                 await page.evaluate(() => {
  633 |                     const mockButton = document.createElement('button');
  634 |                     mockButton.id = 'mock-create-task-button';
  635 |                     mockButton.textContent = '+ Create Task';
  636 |                     mockButton.style.position = 'fixed';
  637 |                     mockButton.style.bottom = '20px';
  638 |                     mockButton.style.right = '20px';
  639 |                     mockButton.style.zIndex = '1000';
  640 |                     mockButton.style.padding = '10px';
  641 |                     mockButton.style.backgroundColor = '#4CAF50';
  642 |                     mockButton.style.color = 'white';
  643 |                     mockButton.style.border = 'none';
  644 |                     mockButton.style.borderRadius = '4px';
  645 |                     document.body.appendChild(mockButton);
  646 |                     console.log('Mock button injected for testing purposes');
  647 |                 });
  648 |
  649 |                 await page.waitForTimeout(500);
  650 |                 const mockButton = page.locator('#mock-create-task-button');
  651 |
  652 |                 if (await mockButton.isVisible()) {
  653 |                     console.log(
  654 |                         'Successfully injected mock button for testing'
  655 |                     );
  656 |                     await mockButton.click();
  657 |                     clicked = true;
  658 |                 } else {
  659 |                     await expect(page).toHaveScreenshot(
  660 |                         'no-create-button-found.png'
  661 |                     );
  662 |                     throw new Error(
  663 |                         'Failed to inject mock button for task creation test'
  664 |                     );
  665 |                 }
  666 |             }
  667 |         } catch (e) {
  668 |             console.error('Task creation form test failed:', e);
  669 |             // Take screenshot of current state for debugging
  670 |             await expect(page).toHaveScreenshot(
  671 |                 'task-creation-test-failed.png'
  672 |             );
  673 |             throw e;
  674 |         }
  675 |     });
  676 | });
  677 |
  678 | // Device-specific tests for responsive views
  679 | test.describe('Device-specific views', () => {
  680 |     // Authentication state for this group
  681 |     authStates['Device-specific views'] = { isAuthenticated: false };
  682 |
  683 |     // Authenticate once before all tests in this group
  684 |     test.beforeAll(async ({ browser }) => {
  685 |         const page = await browser.newPage();
  686 |         await bypassLogin(page);
  687 |         authStates['Device-specific views'].isAuthenticated = true;
  688 |         await page.close();
  689 |     });
  690 |
  691 |     // Desktop view tests
  692 |     test.describe('Desktop viewport', () => {
  693 |         test.use({ viewport: devices.desktop });
  694 |
  695 |         test('desktop sidebar view', async ({ page }, testInfo: TestInfo) => {
  696 |             await navigateToPage(page, '/', testInfo);
  697 |
  698 |             // For desktop, we expect the sidebar to be visible by default
  699 |             // Take full page screenshot that will include the sidebar
  700 |             await expect(page).toHaveScreenshot('desktop-with-sidebar.png');
  701 |         });
  702 |
  703 |         test('desktop dashboard content', async ({
  704 |             page,
  705 |         }, testInfo: TestInfo) => {
  706 |             await navigateToPage(page, '/', testInfo);
  707 |
  708 |             // Screenshot main content area - avoiding precise element selection
  709 |             // Just give the app enough time to fully render
> 710 |             await expect(page).toHaveScreenshot(
      |                                ^ Error: expect(page).toHaveScreenshot(expected)
  711 |                 'desktop-dashboard-content.png'
  712 |             );
  713 |         });
  714 |     });
  715 |
  716 |     // Mobile view tests
  717 |     test.describe('Mobile viewport', () => {
  718 |         test.use({ viewport: devices.mobile });
  719 |
  720 |         // Authentication state for mobile tests
  721 |         authStates['Mobile viewport'] = { isAuthenticated: false };
  722 |
  723 |         // Authenticate once before all tests in this group
  724 |         test.beforeAll(async ({ browser }) => {
  725 |             if (!authStates['Mobile viewport'].isAuthenticated) {
  726 |                 const page = await browser.newPage();
  727 |                 try {
  728 |                     await authenticate(page);
  729 |                     authStates['Mobile viewport'].isAuthenticated = true;
  730 |                 } catch (e) {
  731 |                     console.error('Mobile viewport authentication failed:', e);
  732 |                 } finally {
  733 |                     await page.close();
  734 |                 }
  735 |             }
  736 |         });
  737 |
  738 |         test('mobile layout (sidebar likely collapsed)', async ({
  739 |             page,
  740 |         }, testInfo: TestInfo) => {
  741 |             try {
  742 |                 await navigateToPage(page, '/', testInfo);
  743 |
  744 |                 // On mobile, sidebar may be collapsed by default - this is expected
  745 |                 await expect(page).toHaveScreenshot('mobile-default-view.png');
  746 |
  747 |                 // Try to find and click a hamburger menu or sidebar toggle if it exists
  748 |                 const possibleToggles = [
  749 |                     page.getByRole('button', {
  750 |                         name: /menu|toggle|hamburger|sidebar/i,
  751 |                     }),
  752 |                     page.locator(
  753 |                         '.hamburger, [data-testid="menu-button"], button.menu-toggle'
  754 |                     ),
  755 |                     page.locator('button').filter({ hasText: /☰|≡|menu/i }),
  756 |                 ];
  757 |
  758 |                 // Try each possible toggle selector
  759 |                 let toggleFound = false;
  760 |                 for (const toggle of possibleToggles) {
  761 |                     if (
  762 |                         (await toggle.count()) > 0 &&
  763 |                         (await toggle.isVisible())
  764 |                     ) {
  765 |                         await toggle.click();
  766 |                         await page.waitForTimeout(1000); // Wait for animation
  767 |                         await expect(page).toHaveScreenshot(
  768 |                             'mobile-with-sidebar-open.png'
  769 |                         );
  770 |                         toggleFound = true;
  771 |                         break; // Stop after first successful toggle
  772 |                     }
  773 |                 }
  774 |
  775 |                 if (!toggleFound) {
  776 |                     console.log(
  777 |                         'No visible sidebar toggle found on mobile view'
  778 |                     );
  779 |                 }
  780 |             } catch (e) {
  781 |                 console.error('Mobile layout test failed:', e);
  782 |                 throw e;
  783 |             }
  784 |         });
  785 |     });
  786 | });
  787 |
  788 | // This is a utility to help generate visual tests for all routes efficiently
  789 | test.describe('Automatic route testing', () => {
  790 |     // Test timeout for entire routing tests
  791 |     test.setTimeout(60000); // 1-minute timeout for these tests
  792 |
  793 |     // Device configurations for testing
  794 |     const deviceConfigs = [
  795 |         {
  796 |             name: 'desktop',
  797 |             width: 1280,
  798 |             height: 720,
  799 |             checkSidebar: true,
  800 |         },
  801 |         {
  802 |             name: 'mobile',
  803 |             width: 375,
  804 |             height: 667,
  805 |             checkSidebar: false,
  806 |         },
  807 |     ];
  808 |
  809 |     // Define key routes to test instead of all routes to avoid timeouts
  810 |     const keyRoutesToTest = ['login', 'dashboard', 'tasks', 'notes'];
```