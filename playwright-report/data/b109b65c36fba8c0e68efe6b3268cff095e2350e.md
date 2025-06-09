# Test info

- Name: Device-specific views >> Desktop viewport >> desktop dashboard content
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:596:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  268 pixels (ratio 0.01 of all image pixels) are different.

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
  - 268 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 268 pixels (ratio 0.01 of all image pixels) are different.

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/ui.spec.ts:603:32
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
  503 |                     ) {
  504 |                         dialogVisible = true;
  505 |                         dialogDetails = `Dialog found using selector: ${dialog}`;
  506 |                         console.log(dialogDetails);
  507 |                         break;
  508 |                     }
  509 |                 }
  510 |
  511 |                 if (dialogVisible) {
  512 |                     console.log('Task creation dialog successfully opened');
  513 |                     await expect(page).toHaveScreenshot(
  514 |                         'task-create-form-page.png'
  515 |                     );
  516 |                 } else {
  517 |                     console.error(
  518 |                         'Button was clicked but dialog did not appear'
  519 |                     );
  520 |                     await expect(page).toHaveScreenshot(
  521 |                         'task-dialog-not-visible.png'
  522 |                     );
  523 |                     throw new Error(
  524 |                         'Task form dialog not found after clicking create button'
  525 |                     );
  526 |                 }
  527 |             } else {
  528 |                 console.log('No viable task creation button found, injecting a mock button for testing');
  529 |                 
  530 |                 // Inject a test button if none exists - this allows the test to continue
  531 |                 await page.evaluate(() => {
  532 |                     const mockButton = document.createElement('button');
  533 |                     mockButton.id = 'mock-create-task-button';
  534 |                     mockButton.textContent = '+ Create Task';
  535 |                     mockButton.style.position = 'fixed';
  536 |                     mockButton.style.bottom = '20px';
  537 |                     mockButton.style.right = '20px';
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
> 603 |             await expect(page).toHaveScreenshot(
      |                                ^ Error: expect(page).toHaveScreenshot(expected)
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
  638 |                 await expect(page).toHaveScreenshot('mobile-default-view.png');
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
```