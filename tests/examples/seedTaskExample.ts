import { test, expect } from '@playwright/test';
import { seedTestTasks } from '../utils/testDataSeeder';

// This example demonstrates how to use the task seeder in your tests
test.describe('Task Seeding Example', () => {
  
  // Create tasks before the test runs
  test.beforeAll(async () => {
    // Create 3 test tasks
    const tasks = await seedTestTasks(3);
    console.log(`Created ${tasks.length} test tasks for the demo`);
  });

  test('should show seeded tasks in the Tasks page', async ({ page }) => {
    // Go to the tasks page
    await page.goto('/tasks');
    
    // Wait for tasks to load
    await page.waitForSelector('[data-testid="task-list"]');
    
    // Verify we have at least 3 tasks
    const taskElements = await page.locator('[data-testid="task-item"]').all();
    console.log(`Found ${taskElements.length} task elements`);
    
    // At least our 3 seeded tasks should be present
    expect(taskElements.length).toBeGreaterThanOrEqual(3);
    
    // Check for our task prefix to confirm these are test tasks
    const testTaskPrefix = 'Test Task: UI Test';
    const taskTitles = await page.locator('[data-testid="task-title"]').allTextContents();
    const testTasks = taskTitles.filter(title => title.startsWith(testTaskPrefix));
    
    console.log(`Found ${testTasks.length} test tasks in the UI`);
    expect(testTasks.length).toBeGreaterThanOrEqual(3);
  });
});
