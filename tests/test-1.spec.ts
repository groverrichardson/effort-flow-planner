import { test, expect } from '@playwright/test';

test.describe('Recorded Test with Secure Authentication', () => {
    // Use the same authentication state as the main test suite
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('test', async ({ page }) => {
        // Navigate directly to the home page (authentication handled by storageState)
        await page.goto('http://localhost:8081/');
        
        // Wait for page to load and authenticate
        await page.waitForLoadState('domcontentloaded');
        
        // Continue with the rest of the test workflow
        await page
            .getByTestId('task-card-29ddb385-2f76-47e9-afb4-67ab6b4974cb')
            .locator('div')
            .filter({ hasText: 'Test Task with People:' })
            .first()
            .click();
        await page
            .getByRole('button', { name: 'Select a due date for this' })
            .click();
        
        // Assert that the due date calendar popover is visible and open
        await expect(page.locator('#task-form-due-date-popover[data-state="open"]')).toBeVisible();
        
        await page
            .getByRole('button', { name: 'Select a scheduled date for' })
            .click();
        
        // Assert that the scheduled date calendar popover is visible and open
        await expect(page.locator('#task-form-scheduled-date-popover[data-state="open"]')).toBeVisible();
        
        await page.getByTestId('recurrence-frequency-select-trigger').click();
        await page.locator('html').click();
        await page.getByRole('combobox', { name: 'Priority' }).click();
        await page.locator('html').click();
        await page.getByRole('combobox', { name: 'Effort' }).click();
        await page.locator('html').click();
        await page.locator('html').click();
        await page.locator('html').click();
        await page.locator('html').click();
        await page.locator('html').click();
        await page.locator('html').click();
        await page.locator('html').click();
        await page.getByRole('option', { name: '64' }).click();
        await page.getByRole('combobox', { name: 'Status' }).click();
        await page.locator('html').click();
        await page
            .getByRole('textbox', { name: 'Search or add people...' })
            .click();
    });
});
