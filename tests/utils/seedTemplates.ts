/**
 * Task seeding templates for use in tests
 * 
 * This utility provides common task creation patterns to use in Playwright tests.
 * Import these helper functions in your test files to seed specific types of tasks.
 */

import { TestTaskTemplate, seedTemplateTask, seedTemplateTasks, cleanupTestTasks } from './testDataSeeder';

/**
 * Seed a test task set with different types of tasks
 * 
 * Creates one of each task template type:
 * - High priority task
 * - Completed task
 * - Task due today
 * - Task due tomorrow
 * - Overdue task
 * - Task with tags
 * - High effort task
 */
export async function seedMixedTaskSet() {
  const tasks: any[] = [];
  
  // Create one of each template type
  tasks.push(await seedTemplateTask(TestTaskTemplate.HIGH_PRIORITY, 'High Priority Task'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.COMPLETED, 'Completed Task'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.DUE_TODAY, 'Due Today Task'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.DUE_TOMORROW, 'Due Tomorrow Task'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.OVERDUE, 'Overdue Task'));
  // Re-enabled tagged task now that schema issue is fixed
  tasks.push(await seedTemplateTask(TestTaskTemplate.WITH_TAGS, 'Tagged Task'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.WITH_EFFORT, 'High Effort Task'));
  
  return tasks;
}

/**
 * Seed tasks for testing task filtering by priority
 * Creates multiple tasks with different priorities
 */
export async function seedPriorityTasks(count = 3) {
  return seedTemplateTasks(TestTaskTemplate.HIGH_PRIORITY, count);
}

/**
 * Seed tasks for testing due date filtering
 * Creates tasks with a mix of due dates (today, tomorrow, overdue)
 */
export async function seedDueDateTasks() {
  const tasks: any[] = [];
  
  tasks.push(await seedTemplateTask(TestTaskTemplate.DUE_TODAY, 'Due Today #1'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.DUE_TODAY, 'Due Today #2'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.DUE_TOMORROW, 'Due Tomorrow #1'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.OVERDUE, 'Overdue #1'));
  
  return tasks;
}

/**
 * Seed tasks for testing tag filtering
 * Creates tasks with various tags
 */
export async function seedTaggedTasks(count = 2) {
  // Now using tagged tasks as schema has been fixed
  return seedTemplateTasks(TestTaskTemplate.WITH_TAGS, count);
}

/**
 * Seed tasks for testing completion status filtering
 * Creates a mix of completed and pending tasks
 */
export async function seedCompletionStatusTasks() {
  const tasks: any[] = [];
  
  tasks.push(await seedTemplateTask(TestTaskTemplate.COMPLETED, 'Completed Task #1'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.COMPLETED, 'Completed Task #2'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.BASIC, 'Pending Task #1'));
  tasks.push(await seedTemplateTask(TestTaskTemplate.BASIC, 'Pending Task #2'));
  
  return tasks;
}

// Re-export for convenience
export { TestTaskTemplate, seedTemplateTask, seedTemplateTasks, cleanupTestTasks };
