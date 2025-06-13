import { test, expect } from '@playwright/test';
import { TestDataSeeder, TestTaskTemplate } from '../utils/testDataSeeder';

test.describe('Task seeder integration demo', () => {
  let seeder: TestDataSeeder;
  
  // Create seeder before tests and clean up any old test tasks
  test.beforeAll(async () => {
    seeder = new TestDataSeeder();
    await seeder.initialize();
    await seeder.cleanupTestTasks();
    console.log('Test environment ready - old test tasks cleaned up');
  });
  
  // Clean up after all tests
  test.afterAll(async () => {
    await seeder.cleanupTestTasks();
    console.log('Final cleanup complete - all test tasks removed');
  });

  test('should create and verify different types of task templates', async ({ page }) => {
    // Create different types of tasks
    console.log('Creating test tasks with various templates...');
    
    const highPriorityTask = await seeder.createTemplateTask(
      TestTaskTemplate.HIGH_PRIORITY,
      'High Priority Demo Task'
    );
    
    const completedTask = await seeder.createTemplateTask(
      TestTaskTemplate.COMPLETED,
      'Completed Demo Task'
    );
    
    const dueTodayTask = await seeder.createTemplateTask(
      TestTaskTemplate.DUE_TODAY,
      'Due Today Demo Task'
    );
    
    const overdueTask = await seeder.createTemplateTask(
      TestTaskTemplate.OVERDUE,
      'Overdue Demo Task'
    );
    
    // Log created tasks
    console.log(`Created ${4} tasks with different templates`);
    
    // Navigate to the app and verify we're logged in
    await page.goto('/');
    
    // Take a screenshot to see what page we landed on
    await page.screenshot({ path: './test-results/task-seeder-demo.png' });
    
    // Simple check that we've successfully created the tasks
    expect(highPriorityTask.id).toBeDefined();
    expect(completedTask.id).toBeDefined();
    expect(dueTodayTask.id).toBeDefined();
    expect(overdueTask.id).toBeDefined();
  });
});
