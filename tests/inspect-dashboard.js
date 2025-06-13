import { test } from '@playwright/test';

test('Inspect dashboard HTML structure', async ({ page }) => {
  // Navigate to the dashboard
  await page.goto('http://localhost:8080/dashboard');
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'dashboard-screenshot.png' });
  
  // Log the HTML content
  console.log('=== DASHBOARD HTML STRUCTURE ===');
  const html = await page.content();
  console.log(html);
  
  // Look for specific dashboard elements
  console.log('\n=== ELEMENT CHECKS ===');
  
  // Check for Task Summary
  const taskSummaryElement = await page.locator('.dashboard-content, main, .container, .main-content, [role="main"], .card, .card-body, .dashboard-panel').count();
  console.log(`Task Summary elements found: ${taskSummaryElement}`);
  if (taskSummaryElement > 0) {
    console.log('First matching element HTML:');
    const firstElement = await page.locator('.dashboard-content, main, .container, .main-content, [role="main"], .card, .card-body, .dashboard-panel').first().innerHTML();
    console.log(firstElement);
  }
  
  // Check for Dashboard Header
  const dashboardHeaderElement = await page.locator('h1:has-text("Dashboard"), .header h1, .dashboard-header, header h1, main h1').count();
  console.log(`Dashboard Header elements found: ${dashboardHeaderElement}`);
  if (dashboardHeaderElement > 0) {
    console.log('First matching element HTML:');
    const firstHeader = await page.locator('h1:has-text("Dashboard"), .header h1, .dashboard-header, header h1, main h1').first().innerHTML();
    console.log(firstHeader);
  }
  
  // Check for Quick Actions
  const quickActionsElement = await page.locator('.quick-actions, .action-buttons, .dashboard-actions, button, [role="button"]').count();
  console.log(`Quick Actions elements found: ${quickActionsElement}`);
  if (quickActionsElement > 0) {
    console.log('First matching element HTML:');
    const firstAction = await page.locator('.quick-actions, .action-buttons, .dashboard-actions, button, [role="button"]').first().innerHTML();
    console.log(firstAction);
  }
});
