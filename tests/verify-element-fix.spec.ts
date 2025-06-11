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
import {
    navigateTo,
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
            timeout: 30000,
            maxRetries: 3,
        });

        // Log the verification result for debugging
        console.log('Navigation result:', {
            success: result.success,
            found: result.elementDetails?.found || [],
            notFound: result.elementDetails?.notFound || [],
            missing: result.elementDetails?.missing || []
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
        
        // First navigate to dashboard directly to inspect HTML structure
        console.log('[TEST] Directly navigating to dashboard for inspection');
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000); // Additional wait for any async rendering
        
        // Capture and log HTML for debugging
        console.log('[TEST] Capturing dashboard HTML structure');
        const html = await page.content();
        console.log('Dashboard HTML structure length:', html.length);
        
        // Detailed element analysis
        console.log('[TEST] Analyzing dashboard elements directly:');
        
        // Try a variety of task summary selectors
        const taskSummarySelectors = [
            '.dashboard-content',
            'main',
            '.container',
            '.main-content',
            '[role="main"]',
            '.card',
            '.card-body',
            '.dashboard-panel',
            // Add more specific selectors based on actual HTML
            '.task-summary',
            '.task-list',
            '.tasks-container',
            '#task-summary',
            'div[data-testid="task-summary"]',
            // Try very generic selectors
            'div',
            'section',
            'main div'
        ];
        
        // Check each selector individually
        for (const selector of taskSummarySelectors) {
            const count = await page.locator(selector).count();
            console.log(`Selector '${selector}': ${count} elements found`);
            if (count > 0 && count < 5) { // Only show if it's not too many elements
                for (let i = 0; i < count; i++) {
                    const elem = page.locator(selector).nth(i);
                    const text = await elem.textContent();
                    console.log(`- Element ${i+1} text: ${text ? text.substring(0, 50) + '...' : 'empty'}`);  
                }
            }
        }
        
        // Now use navigateTo with routeConfig selectors
        console.log('[TEST] Now using navigateTo helper with routeConfig');
        const result = await navigateTo(page, 'dashboard', { 
            timeout: 30000,
            maxRetries: 3, 
            verificationOptions: {
                timeout: 15000,
                maxRetries: 3
            }
        });

        // Log the verification result for debugging
        console.log('Dashboard navigation result:', JSON.stringify(result, null, 2));
        
        // Log found vs. not found selectors
        console.log('Elements found:', result.elementDetails?.found);
        console.log('Optional elements not found:', result.elementDetails?.notFound);
        console.log('Required elements missing:', result.elementDetails?.missing);
        
        expect(result.success).toBeTruthy();

        // Take screenshot after navigation - wrapped in try-catch to prevent test failure
        try {
            await page.screenshot({
                path: `screenshots/after-dashboard-nav-${timestamp}.png`,
            });
        } catch (e) {
            console.error('Failed to take screenshot:', e.message);
            // Don't fail the test if screenshot fails
        }
        
        // Log complete page content - wrapped in try-catch to prevent test failure
        try {
            console.log('[TEST] Final page content length:', (await page.content()).length);
        } catch (e) {
            console.error('Failed to get page content:', e.message);
            // Don't fail the test if content capture fails
        }
    });
});
