import { test, expect } from '@playwright/test';
import { 
  seedMixedTaskSet,
  seedPriorityTasks, 
  seedDueDateTasks, 
  cleanupTestTasks 
} from '../utils/seedTemplates';

test.describe('Task seeding examples', () => {
  // Clear any test tasks before and after all tests
  test.beforeAll(async () => await cleanupTestTasks());
  test.afterAll(async () => await cleanupTestTasks());

  test('should display tasks created using templates', async ({ page }) => {
    // Create a mixed set of tasks
    const tasks = await seedMixedTaskSet();
    console.log(`Created ${tasks.length} test tasks with various templates`);
    
    // Navigate to the tasks page
    await page.goto('/tasks');
    
    // Verify at least one task is visible (basic check)
    await expect(page.getByText('Test Task:')).toBeVisible();
    
    // Check that our high priority task has a priority indicator
    await expect(page.getByText('High Priority Task').first()).toBeVisible();
  });
  
  test('should filter tasks by priority correctly', async ({ page }) => {
    // Create high priority tasks
    const priorityTasks = await seedPriorityTasks(2);
    console.log(`Created ${priorityTasks.length} high priority test tasks`);
    
    // Navigate to tasks page
    await page.goto('/tasks');
    
    // This is an example - adjust selectors based on your actual UI
    // Assuming there's some priority filter UI
    await page.getByText('Filter').click();
    await page.getByText('Priority').click();
    await page.getByText('High').click();
    await page.getByText('Apply').click();
    
    // Verify our high priority tasks are still visible
    for (const task of priorityTasks) {
      await expect(page.getByText(task.title)).toBeVisible();
    }
  });
  
  test('should filter tasks by due date correctly', async ({ page }) => {
    // Create tasks with different due dates
    const dueTasks = await seedDueDateTasks();
    console.log(`Created ${dueTasks.length} tasks with various due dates`);
    
    // Navigate to tasks page
    await page.goto('/tasks');
    
    // Filter for today's tasks
    // This is an example - adjust selectors based on your actual UI
    await page.getByText('Filter').click();
    await page.getByText('Due date').click();
    await page.getByText('Today').click();
    await page.getByText('Apply').click();
    
    // Due Today tasks should be visible, others not
    await expect(page.getByText('Due Today #1')).toBeVisible();
    await expect(page.getByText('Due Today #2')).toBeVisible();
    
    // These should not be visible in the filtered view
    await expect(page.getByText('Due Tomorrow #1')).not.toBeVisible();
    await expect(page.getByText('Overdue #1')).not.toBeVisible();
  });
});
