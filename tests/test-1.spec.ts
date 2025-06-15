import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:8081/login');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page
        .getByRole('textbox', { name: 'Email' })
        .fill('hitch91739@yahoo.com');
    await page.getByRole('textbox', { name: 'Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page
        .getByRole('textbox', { name: 'Password' })
        .fill('0%@13%ZX9eE0SQcR');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page
        .getByTestId('task-card-29ddb385-2f76-47e9-afb4-67ab6b4974cb')
        .locator('div')
        .filter({ hasText: 'Test Task with People:' })
        .first()
        .click();
    await page
        .getByRole('button', { name: 'Select a due date for this' })
        .click();
    await page
        .getByRole('button', { name: 'Select a scheduled date for' })
        .click();
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
