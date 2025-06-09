/**
 * Simplified Task Seeding Example
 * 
 * This demonstrates the simplest way to use the task seeder helper
 * in your tests with minimal setup code.
 */

import { test, expect } from '@playwright/test';
import { TaskSeederHelper } from '../utils/taskSeederHelper';

test.describe('Task Display Tests', () => {
  // Create a helper for the entire test group
  const helper = new TaskSeederHelper();
  
  // Simple setup/teardown
  test.beforeAll(async () => await helper.setup());
  test.afterAll(async () => await helper.cleanup());

  test('should display mixed tasks correctly', async ({ page }) => {
    // One line creates all test tasks and navigates to the page
    const tasks = await helper.setupTasksAndNavigate(page);
    
    // Verify tasks are visible
    await expect(page.locator('.task-item')).toBeVisible();
    
    // Take a screenshot for visual testing
    await page.screenshot({ path: './test-results/mixed-tasks.png' });
  });

  test('should show high priority tasks', async ({ page }) => {
    // Create priority tasks and navigate
    await helper.setupPriorityTasksAndNavigate(page);
    
    // Locate high priority tasks
    const highPriorityTasks = page.locator('.high-priority');
    
    // Verify high priority tasks are visible
    await expect(highPriorityTasks).toBeVisible();
  });

  test('should display tasks with due dates', async ({ page }) => {
    // Create due date tasks and navigate
    await helper.setupDueDateTasksAndNavigate(page);
    
    // Verify due date indicators are visible
    await expect(page.locator('.due-date')).toBeVisible();
  });
});
