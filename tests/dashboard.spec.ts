import { test, expect } from '@playwright/test';

// This test uses global authentication from playwright.config.ts
// The setup happens in global.setup.ts and auth state is stored in playwright/.auth/user.json
test('dashboard visual test', async ({ page }, testInfo) => {
    console.log('Starting dashboard test with authenticated user');

    // Go directly to the dashboard (or home page)
    // This should work because we're using the authenticated state
    await page.goto('/');
    console.log('Navigated to dashboard');
    console.log(`Current URL: ${page.url()}`);

    // Wait for the page to fully load and stabilize
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('Page network activity stabilized');

    // Check if we're on the login page (if redirect happened)
    let currentUrl = page.url();
let currentUrl = page.url();
// Fail-fast when we land on the login page – the authenticated context is invalid.
await expect(currentUrl.includes('/login')).toBeFalsy();

if (currentUrl.includes('/login')) {   // executes only locally when the above expect is removed/ignored
    console.log('Redirected to login page. Global auth might not be working correctly.');
        );

        // Take a screenshot to see the login page
        const loginScreenshotPath = testInfo.outputPath('login-redirect.png');
        await page.screenshot({ fullPage: true, path: loginScreenshotPath });
        await testInfo.attach('login-redirect', { path: loginScreenshotPath });

        // Try explicit navigation to dashboard
        console.log('Trying to navigate explicitly to /dashboard');
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log(
            `New URL after explicit dashboard navigation: ${page.url()}`
        );
    }

    // Take screenshot of the dashboard
    const dashboardScreenshotPath = testInfo.outputPath('dashboard-page.png');
    await page.screenshot({ fullPage: true, path: dashboardScreenshotPath });
    await testInfo.attach('dashboard-page', { path: dashboardScreenshotPath });

    // Compare with baseline if needed
    try {
        // Using Playwright's built-in screenshot comparison
await expect(page).toHaveScreenshot('dashboard-main-view.png', {
    threshold: 0.2,
    fullPage: true
});
console.log('Screenshot compared with baseline');
    }

    // Get current URL to display in logs
    console.log(`URL before verification: ${page.url()}`);

    // Print the page HTML for debugging
    const html = await page.content();
    console.log(
        `Page HTML structure (first 500 chars): ${html.substring(0, 500)}...`
    );

    // Log all top-level elements for debugging
    const bodyElements = await page.evaluate(() => {
        const elements = Array.from(document.body.children);
        return elements.map((el) => ({
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            textContent: el.textContent?.substring(0, 50) || '[empty]',
        }));
    });
    console.log('Top-level elements in body:', JSON.stringify(bodyElements));

    // Verify URL pattern is one of the expected dashboard URLs
    currentUrl = page.url();
    console.log(`Checking if URL matches dashboard pattern: ${currentUrl}`);
    if (!currentUrl.match(/.*\/dashboard|.*\/$/)) {
        console.log(
            `WARNING: URL ${currentUrl} doesn't match expected dashboard patterns`
        );
    }

    // Use more flexible selectors with visible: true option to locate dashboard content
    // Based on the element selector best practices from memory - more robust selectors
    console.log('Attempting to find dashboard content with various selectors');

    // Try finding any visible container element that's likely to be part of the dashboard
    const possibleDashboardElements = [
        'main',
        '[data-testid="dashboard"]',
        '.dashboard',
        '.main-content',
        '.app-container',
        '.content-wrapper',
        '#root > div',
        'body > div',
    ];

    // Try each selector and report which one worked
    let foundDashboardContent = false;
    for (const selector of possibleDashboardElements) {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) {
            console.log(`Found dashboard content using selector: ${selector}`);
            foundDashboardContent = true;
            break;
        }
    }

    expect(foundDashboardContent).toBeTruthy(); // fail if nothing visible was detected

    // Take another screenshot at the end to capture any dynamic loading
    const finalScreenshotPath = testInfo.outputPath('dashboard-final.png');
    await page.screenshot({ fullPage: true, path: finalScreenshotPath });
    await testInfo.attach('dashboard-final', { path: finalScreenshotPath });
});
