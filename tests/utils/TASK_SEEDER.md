# Task Seeder Utility

## Overview

The Task Seeder utility allows Playwright tests to create test tasks in the database with various properties. This helps test the application with realistic data without manual setup.

## Quick Start

```typescript
import { test, expect } from '@playwright/test';
import { TestDataSeeder, TestTaskTemplate } from '../utils/testDataSeeder';

test.describe('Task management tests', () => {
  let seeder: TestDataSeeder;
  
  test.beforeAll(async () => {
    seeder = new TestDataSeeder();
    await seeder.initialize();
    await seeder.cleanupTestTasks(); // Start with a clean slate
  });
  
  test.afterAll(async () => {
    await seeder.cleanupTestTasks(); // Clean up after tests
  });

  test('should show high priority tasks', async ({ page }) => {
    // Create a test task with high priority
    await seeder.createTemplateTask(TestTaskTemplate.HIGH_PRIORITY);
    
    // Navigate to the app and verify task appears
    await page.goto('/tasks');
    await expect(page.locator('.high-priority-task')).toBeVisible();
  });
});
```

## Available Templates

The seeder provides predefined templates for common testing scenarios:

| Template | Description |
|----------|-------------|
| `BASIC` | Simple task with default values |
| `HIGH_PRIORITY` | Task with high priority |
| `COMPLETED` | Task marked as completed |
| `DUE_TODAY` | Task with due date set to today |
| `DUE_TOMORROW` | Task with due date set to tomorrow |
| `OVERDUE` | Task with due date in the past |
| `WITH_TAGS` | Task with predefined tags |
| `WITH_EFFORT` | Task with high effort level |

## Helper Functions

For common testing patterns, use the helper functions in `seedTemplates.ts`:

| Function | Description |
|----------|-------------|
| `seedMixedTaskSet()` | Creates one task of each template type |
| `seedPriorityTasks()` | Creates multiple tasks with different priorities |
| `seedDueDateTasks()` | Creates tasks with various due dates |
| `seedTaggedTasks()` | Creates tasks with tags |
| `seedCompletionStatusTasks()` | Creates both completed and pending tasks |

## Clean Up

Always include cleanup in your tests to prevent test data accumulation:

```typescript
test.afterAll(async () => {
  await seeder.cleanupTestTasks();
});
```

## Advanced Usage

For more control over task creation, use the `createRichTask()` method:

```typescript
await seeder.createRichTask({
  title: 'Custom Task',
  description: 'This is a custom task',
  priority: Priority.HIGH,
  dueDate: new Date(),
  dueDateType: DueDateType.SPECIFIC,
  tags: ['important', 'test']
});
```
