/**
 * Example Playwright test demonstrating enhanced task seeding capabilities
 * 
 * This shows how to use various task templates to seed different types of tasks
 * before running UI tests, and verifying their presence in the app.
 * 
 * Run with: npx playwright test tests/examples/seedRichTasksExample.ts
 */
import { test, expect } from '@playwright/test';
import {
  seedTemplateTask,
  seedTemplateTasks,
  TestTaskTemplate,
  cleanupTestTasks
} from '../utils/testDataSeeder';

// Run tests serially to avoid conflicting task operations
test.describe.serial('Enhanced task seeding examples', () => {
  // Clean up any lingering test tasks before starting
  test.beforeAll(async () => {
    await cleanupTestTasks();
  });

  // Clean up after all tests
  test.afterAll(async () => {
    await cleanupTestTasks();
  });

  test('should create and display tasks with different priorities', async ({ page }) => {
    // Create a high priority task
    const highPriorityTask = await seedTemplateTask(TestTaskTemplate.HIGH_PRIORITY);
    
    // Navigate to the tasks page
    await page.goto('/tasks');
    await expect(page).toHaveTitle(/Tasks/);
    
    // Verify the task is visible
    await expect(page.getByText(highPriorityTask.title)).toBeVisible();
    
    // It should have high priority indicator (this depends on your UI implementation)
    // This is just a placeholder - adjust according to your actual UI indicators
    await expect(page.getByText(highPriorityTask.title)
      .locator('..')
      .locator('..') // Navigate up to container
      .getByText('high', { exact: false })).toBeVisible();
  });

  test('should create and display tasks with different statuses', async ({ page }) => {
    // Create a completed task
    const completedTask = await seedTemplateTask(TestTaskTemplate.COMPLETED);
    
    // Navigate to the tasks page
    await page.goto('/tasks');
    await expect(page).toHaveTitle(/Tasks/);
    
    // Task might be in a completed section or have a completed indicator
    // Assuming completed tasks have some visual indicator like a checked checkbox
    await expect(page.getByText(completedTask.title)).toBeVisible();
    
    // This is just a placeholder assertion - adjust based on your UI
    // Check for COMPLETED status indicator or checkbox
    const taskRow = page.getByText(completedTask.title).locator('..');
    await expect(taskRow.getByRole('checkbox')).toBeChecked();
  });

  test('should create and display tasks with different due dates', async ({ page }) => {
    // Create tasks with various due dates
    const dueTodayTask = await seedTemplateTask(TestTaskTemplate.DUE_TODAY);
    const dueTomorrowTask = await seedTemplateTask(TestTaskTemplate.DUE_TOMORROW);
    const overdueTask = await seedTemplateTask(TestTaskTemplate.OVERDUE);
    
    // Navigate to the tasks page
    await page.goto('/tasks');
    await expect(page).toHaveTitle(/Tasks/);
    
    // Verify all tasks are visible
    await expect(page.getByText(dueTodayTask.title)).toBeVisible();
    await expect(page.getByText(dueTomorrowTask.title)).toBeVisible();
    await expect(page.getByText(overdueTask.title)).toBeVisible();
    
    // Verify due date indicators (adjust based on your UI)
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Look for date indicators near task titles
    // These assertions need to be adjusted based on your actual UI
    await expect(page.getByText(dueTodayTask.title)
      .locator('..').getByText(todayStr, { exact: false })).toBeVisible();
      
    // Overdue tasks might have a special indicator
    await expect(page.getByText(overdueTask.title)
      .locator('..')).toContainText(/overdue|late|past|missed/i);
  });
  
  test('should create and display tasks with tags', async ({ page }) => {
    // Create tasks with tags
    const taggedTasks = await seedTemplateTasks(TestTaskTemplate.WITH_TAGS, 2);
    
    // Navigate to the tasks page
    await page.goto('/tasks');
    await expect(page).toHaveTitle(/Tasks/);
    
    // Verify tasks are visible
    for (const task of taggedTasks) {
      await expect(page.getByText(task.title)).toBeVisible();
      
      // Verify tag indicators (adjust based on your UI)
      // Assuming tags are displayed as labels or chips near the task
      const taskRow = page.getByText(task.title).locator('..');
      // Example: check for tag names like 'test-tag-1'
      await expect(taskRow.getByText(/test-tag/i)).toBeVisible();
    }
  });
});
