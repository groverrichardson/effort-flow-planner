import { test, expect, Page, TestInfo } from '@playwright/test';
import {
    routes, // The array of RouteConfig from routeConfig.ts
    navigateTo,
    bypassLogin,
    navigationReporter,
    NavigationResult,
    // RouteConfig, // Type, already implicitly used by `routes`
} from './utils'; // Barrel import for all necessary utilities

const VIEWPORTS = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
};

/**
 * Helper function for standardized navigation pattern with comprehensive verification.
 * It calls the main `navigateTo` utility, which handles authentication (via bypassLogin)
 * if the route requires it and a redirect to login occurs.
 */
async function navigateAndSnapshot(page: Page, routeId: string, testInfo: TestInfo, viewportName: string): Promise<NavigationResult> {
    const testTitle = testInfo.titlePath.join(' > ');
    console.log(`Attempting navigation for test: "${testTitle}", route ID: "${routeId}", viewport: ${viewportName}`);

    const navigationOptions = {
        testInfo,
        verbose: true,
        screenshotOnFailure: true,
        projectPath: testInfo.project.outputDir,
        verificationOptions: { checkElements: true, timeout: 10000 },
    };
    
    // `navigateTo` will use `bypassLogin` if the route requiresAuth and a redirect to login occurs.
    const result = await navigateTo(page, routeId, bypassLogin, navigationOptions);
    
    const logEntry = {
        ...result,
        testTitle: testInfo.title,
        viewport: viewportName,
        routeIdOrPath: routeId, // Logging the ID used for navigation
    };
    navigationReporter.logNavigation(logEntry, testInfo.title);

    if (!result.success) {
        const errorMessage = `Navigation to route ID "${routeId}" failed for test "${testTitle}" on ${viewportName}: ${result.errorMessage || 'Unknown error'}`;
        console.error(errorMessage);
        if (result.screenshotPath) {
            console.error(`Screenshot saved to: ${result.screenshotPath}`);
            testInfo.attach('failure-screenshot', { path: result.screenshotPath, contentType: 'image/png' });
        }
        throw new Error(errorMessage);
    }
    
    console.log(`Successfully navigated to "${result.targetRoute}" (${result.actualUrl}) for test "${testTitle}" on ${viewportName}`);
    
    // Take screenshot on successful navigation
    const screenshotPath = testInfo.outputPath(`${routeId.replace(/[^a-z0-9]/gi, '_')}-${viewportName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    testInfo.attach('successful-navigation-screenshot', { path: screenshotPath, contentType: 'image/png' });
    
    return result;
}

test.describe('Comprehensive Page Navigation and Visual Test', () => {
    for (const viewportName of Object.keys(VIEWPORTS) as (keyof typeof VIEWPORTS)[]) {
        test.describe(`Viewport: ${viewportName}`, () => {
            test.beforeEach(async ({ page }) => {
                await page.setViewportSize(VIEWPORTS[viewportName]);
            });

            console.log('--- Debugging routes ---');
            console.log('Type of routes:', typeof routes);
            console.log('Is routes an array?', Array.isArray(routes));
            try {
                console.log('Routes object keys (if object):', routes ? Object.keys(routes) : 'routes is null/undefined');
            } catch (e) {
                console.log('Could not get Object.keys(routes):', e);
            }
            console.log('--- End Debugging routes ---');

            const routeArray = Object.values(routes as any); // Convert routes object to array, 'as any' if type is complex
            for (const route of routeArray) {
                // Skip routes that have dynamic parameters in their path, as we don't have example parameters.
                // You can add specific tests for these routes later if needed, providing example params.
                if (route.path.includes(':')) {
                    test.skip(`SKIPPING parameterized route: ${route.title} (ID: ${route.id}, Path: ${route.path})`, () => {
                        console.warn(`Skipping test for parameterized route: ${route.title} (ID: ${route.id}, Path: ${route.path}) as example parameters are not provided. These routes require specific tests with example data.`);
                    });
                    continue;
                }

                test(`should navigate to ${route.title} (ID: ${route.id}) and take screenshot`, async ({ page }, testInfo) => {
                    await navigateAndSnapshot(page, route.id, testInfo, viewportName);
                    // Basic assertion to ensure the test is considered valid
                    expect(page.url()).toBeDefined(); 
                });
            }
        });
    }
});

test.afterAll(async () => {
  await navigationReporter.generateReport(); // Ensure report generation is awaited if async
});
