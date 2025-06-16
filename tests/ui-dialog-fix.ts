// This file contains the improved dialog handling logic for the UI tests
// To be incorporated into the ui.spec.ts file

// Function to check if a dialog is visible using multiple detection methods
export async function isDialogVisible(page) {
    // Check using multiple detection methods
    const overlayCount = await page
        .locator('div[data-state="open"][aria-hidden="true"]')
        .count();
    const dialogCount = await page
        .locator('div[role="dialog"][aria-modal="true"]')
        .count();
    const fixedOverlayCount = await page.locator('.fixed.inset-0').count();
    const modalCount = await page
        .locator('.modal, [data-modal="true"]')
        .count();

    console.log('[DEBUG] Dialog detection results:', {
        overlayCount,
        dialogCount,
        fixedOverlayCount,
        modalCount,
    });

    // Take a screenshot for debugging
    await page.screenshot({ path: 'screenshots/dialog-detection-debug.png' });

    return (
        overlayCount > 0 ||
        dialogCount > 0 ||
        fixedOverlayCount > 0 ||
        modalCount > 0
    );
}

// Function to attempt to close a dialog with multiple strategies and retries
interface CloseDialogOptions {
    maxAttempts?: number;
    timeout?: number;
}
export async function closeDialog(
    page: Page,
    options: CloseDialogOptions = { maxAttempts: 3, timeout: 1500 }
) {
    console.log('[TEST] Dialog detected, attempting to close it');

    // Take screenshot before attempting to close
    await page.screenshot({
        path: 'screenshots/before-dialog-close-attempt.png',
    });

    // Make multiple attempts to close the dialog
    let closed = false;
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        console.log(
            `[TEST] Close dialog attempt ${attempt} of ${options.maxAttempts}`
        );

        // Try to click any close button in the dialog
        const closeButtons = [
            'button[aria-label="Close"], button.close, button:has-text("Close")',
            '[data-state="open"] button',
            'div[role="dialog"] button',
            '.fixed button',
            // Add more specific selectors for this particular dialog
            '.fixed.inset-0 button',
            'div[data-state="open"] button',
            // For radix-ui dialogs
            '[data-radix-dialog-overlay] button',
            // Last resort - try any button in a dialog or overlay
            'div[role="dialog"] button, .modal button, .overlay button',
        ];

        // Log all button elements for debugging
        const buttonTexts = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).map(
                (btn) =>
                    `${btn.tagName}: "${btn.textContent?.trim()}", class: "${
                        btn.className
                    }"`
            );
        });
        console.log('[DEBUG] All buttons:', buttonTexts);

        let buttonFound = false;
        for (const selector of closeButtons) {
            const buttonCount = await page.locator(selector).count();
            if (buttonCount > 0) {
                console.log(
                    `[TEST] Found ${buttonCount} close button(s) with selector: ${selector}`
                );
                try {
                    // Try to get more info about the buttons before clicking
                    const buttonInfo = await page
                        .locator(selector)
                        .evaluateAll((buttons) => {
                            return buttons.map((btn) => ({
                                text: btn.textContent?.trim() || '',
                                classes: btn.className,
                                visible:
                                    btn.offsetHeight > 0 && btn.offsetWidth > 0,
                                disabled: btn.disabled,
                            }));
                        });
                    console.log(
                        `[DEBUG] Button details for ${selector}:`,
                        buttonInfo
                    );

                    await page
                        .locator(selector)
                        .first()
                        .click({ timeout: 1000, force: true });
                    buttonFound = true;
                    console.log(
                        `[TEST] Clicked button with selector: ${selector}`
                    );
                    break;
                } catch (e) {
                    console.log(
                        `[TEST] Failed to click button with selector ${selector}: ${e.message}`
                    );
                }
            }
        }

        if (!buttonFound) {
            console.log('[TEST] No close buttons found, trying Escape key');
            await page.keyboard.press('Escape');
        }

        // Take a screenshot after close attempt
        await page.screenshot({
            path: `screenshots/after-dialog-close-attempt-${attempt}.png`,
        });

        // Wait a bit for any animations to complete
        await page.waitForTimeout(options.timeout);

        // Check if dialog is still visible
        const stillVisible = await isDialogVisible(page);
        console.log(
            `[TEST] After close attempt ${attempt}, dialog still visible: ${stillVisible}`
        );

        if (!stillVisible) {
            closed = true;
            console.log('[TEST] Successfully closed dialog');
            break;
        }
    }

    if (!closed) {
        console.warn('[TEST] Failed to close dialog after multiple attempts');
        // As a last resort, try JavaScript click on close buttons
        try {
            await page.evaluate(() => {
                // Try to find and click any close buttons via JavaScript
                const closeButtons = document.querySelectorAll(
                    'button.close, button[aria-label="Close"], [role="dialog"] button'
                );
                if (closeButtons.length > 0) {
                    (closeButtons[0] as HTMLElement).click();
                    return true;
                }
                return false;
            });
            console.log('[TEST] Attempted JS-based dialog close');
        } catch (e) {
            console.error('[TEST] JS-based dialog close failed:', e.message);
        }
    }

    // Final check
    const finallyVisible = await isDialogVisible(page);
    console.log(`[TEST] Final dialog visibility check: ${finallyVisible}`);

    return !finallyVisible;
}

// Usage in test:
// if (await isDialogVisible(page)) {
//   await closeDialog(page);
// }
