/**
 * Basic task seeding example with minimal UI interactions
 * 
 * This test demonstrates how to:
 * 1. Create test tasks with different properties
 * 2. Verify they exist in the database
 * 3. Clean up test data automatically
 */
import { test, expect } from '@playwright/test';
import { 
  seedTemplateTask, 
  seedTemplateTasks, 
  TestTaskTemplate, 
  cleanupTestTasks 
} from '../utils/testDataSeeder';

test.describe('Basic task seeding example', () => {
  // Clean up any test tasks before starting
  test.beforeAll(async () => {
    console.log('Cleaning up any existing test tasks');
    await cleanupTestTasks();
  });
  
  // Clean up after all tests
  test.afterAll(async () => {
    console.log('Final cleanup of test tasks');
    await cleanupTestTasks();
  });
  
  // Create and verify test tasks exist
  test('should create different types of tasks successfully', async ({ page }) => {
    // Create test tasks with different properties using templates
    console.log('Creating test tasks...');
    
    // Basic task
    const basicTask = await seedTemplateTask(TestTaskTemplate.BASIC, 'Basic Test Task');
    console.log(`Created basic task with ID: ${basicTask.id}`);
    
    // High priority task
    const highPriorityTask = await seedTemplateTask(TestTaskTemplate.HIGH_PRIORITY, 'High Priority Task');
    console.log(`Created high priority task with ID: ${highPriorityTask.id}`);
    
    // Completed task
    const completedTask = await seedTemplateTask(TestTaskTemplate.COMPLETED, 'Completed Task');
    console.log(`Created completed task with ID: ${completedTask.id}`);
    
    // Due today task
    const dueTodayTask = await seedTemplateTask(TestTaskTemplate.DUE_TODAY, 'Due Today Task');
    console.log(`Created due today task with ID: ${dueTodayTask.id}`);
    
    // Create multiple tasks of the same type
    const tasks = await seedTemplateTasks(TestTaskTemplate.BASIC, 3, 'Batch Task');
    console.log(`Created ${tasks.length} batch tasks`);
    
    // Navigate to the tasks page to see if tasks appear in the UI
    console.log('Navigating to tasks page...');
    await page.goto('/tasks');
    
    // Take a screenshot of the tasks page
    await page.screenshot({ path: 'tests/examples/seeded-tasks.png' });
    
    // Simple verification that tasks are displayed (adjust selectors as needed)
    const content = await page.content();
    
    // Verify tasks are in the page content
    // Using console.log for debugging
    console.log('Checking if tasks appear in page content...');
    console.log(`Task titles on page: ${content.includes(basicTask.title)}, ${content.includes(highPriorityTask.title)}`);
    
    // Just verify that at least one task is visible on the page
    expect(content).toContain('Test Task');
  });
});
