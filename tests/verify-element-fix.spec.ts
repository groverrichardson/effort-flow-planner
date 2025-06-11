import { test, expect } from '@playwright/test';
import { routes } from './utils/routeConfig';
import {
    verifyRouteElements,
    ElementVerificationOptions,
} from './utils/routeElementVerifier';
import {
    testDataSeeder,
    TestTaskTemplate,
    seedTemplateTask,
} from './utils/testDataSeeder';
import { navigateTo } from './utils/navigationHelperNew';
import {
    navigateTo,
    navigateWithVerification,
    NavigationOptions,
} from './utils/navigationHelperNew';

test.describe('Element Verification Tests', () => {
    test.beforeEach(async () => {
        // Clean up existing data
        await testDataSeeder.cleanup();
    });

    test('should verify task list element on tasks page', async ({ page }) => {
        // Create tasks that will satisfy the "owed to others" criteria
        const timestamp = Date.now();

        // Create a task due today with person assigned (will show in "owed to others")
        const dueTodayTask = await seedTemplateTask(
            TestTaskTemplate.DUE_TODAY,
            `Test Task Due Today ${timestamp}`
        );
        const personName = `Test Person ${timestamp}`;
        await testDataSeeder.assignPersonToTask(dueTodayTask.id, personName);

        console.log('========== TEST DATA ==========');
        console.log(`Created task: ${dueTodayTask.id} - ${dueTodayTask.title}`);
        console.log(`Assigned to person "${personName}"`);
        console.log('==============================');

        // Add screenshot before navigation
        await page.screenshot({
            path: `screenshots/before-tasks-nav-${timestamp}.png`,
        });

        // Navigate to the tasks page with debug info
        console.log('Navigating to tasks page...');
        const result = await navigateTo(page, '/tasks', {
            verbose: true,
            timeout: 30000,
            retry: true,
            maxRetries: 3,
        });

        // Log the verification result for debugging
        console.log('Navigation result:', {
            success: result.success,
            foundElements: result.foundElements,
            missingElements: result.missingElements,
            optionalElementsNotFound: result.optionalElementsNotFound,
        });

        // Take screenshot after navigation
        await page.screenshot({
            path: `screenshots/after-tasks-nav-${timestamp}.png`,
        });

        // Log page content for debugging
        console.log('Page content:', await page.content());
    });

    test('should verify task summary element on dashboard page', async ({
        page,
    }) => {
        // Create tasks with different criteria to ensure dashboard elements render
        const timestamp = Date.now();

        // Create tasks with various templates
        const highPriorityTask = await seedTemplateTask(
            TestTaskTemplate.HIGH_PRIORITY,
            `High Priority ${timestamp}`
        );
        const todayTask = await seedTemplateTask(
            TestTaskTemplate.DUE_TODAY,
            `Due Today ${timestamp}`
        );
        const assignedTask = await seedTemplateTask(
            TestTaskTemplate.BASIC,
            `Basic Task ${timestamp}`
        );

        // Assign a person to one task
        await testDataSeeder.assignPersonToTask(
            assignedTask.id,
            `Someone ${timestamp}`
        );

        console.log('========== TEST DATA ==========');
        console.log('Created tasks:', {
            highPriority: highPriorityTask.id,
            dueToday: todayTask.id,
            assigned: assignedTask.id,
        });
        console.log('==============================');

        // Add screenshot before navigation
        await page.screenshot({
            path: `screenshots/before-dashboard-nav-${timestamp}.png`,
        });

        // Navigate to dashboard with debug info
        console.log('Navigating to dashboard page...');
        const result = await navigateWithVerification(page, routes.dashboard);

        // Log the verification result for debugging
        console.log('Navigation result:', {
            success: result.success,
            foundElements: result.foundElements,
            missingElements: result.missingElements,
            optionalElementsNotFound: result.optionalElementsNotFound,
        });

        // Take screenshot after navigation
        await page.screenshot({
            path: `screenshots/after-dashboard-nav-${timestamp}.png`,
        });
    });
});
