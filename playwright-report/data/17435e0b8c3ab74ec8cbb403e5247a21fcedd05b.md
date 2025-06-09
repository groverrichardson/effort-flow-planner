# Test info

- Name: Task Filtering Examples >> should filter tasks by due date
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/examples/taskFilteringExample.spec.ts:53:3

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Filter')

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/examples/taskFilteringExample.spec.ts:63:36
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- heading "404" [level=1]
- paragraph: Oops! Page not found
- link "Return to Home":
  - /url: /
```

# Test source

```ts
   1 | /**
   2 |  * Task Filtering Example Tests
   3 |  * 
   4 |  * This file demonstrates how to integrate the task seeder into your tests
   5 |  * to create realistic data scenarios and verify filtering functionality.
   6 |  */
   7 |
   8 | import { test, expect } from '@playwright/test';
   9 | import { TestDataSeeder } from '../utils/testDataSeeder';
  10 | import { seedPriorityTasks, seedTaggedTasks, seedDueDateTasks } from '../utils/seedTemplates';
  11 |
  12 | test.describe('Task Filtering Examples', () => {
  13 |   // Create a seeder instance for all tests in this group
  14 |   const seeder = new TestDataSeeder();
  15 |   
  16 |   // Set up once before all tests
  17 |   test.beforeAll(async () => {
  18 |     await seeder.initialize();
  19 |     console.log('Task seeder initialized for test group');
  20 |     
  21 |     // Optional: Clean up any existing test tasks
  22 |     await seeder.cleanupTestTasks();
  23 |   });
  24 |   
  25 |   // Clean up after all tests
  26 |   test.afterAll(async () => {
  27 |     await seeder.cleanupTestTasks();
  28 |     console.log('All test tasks cleaned up');
  29 |   });
  30 |
  31 |   test('should filter tasks by priority', async ({ page }) => {
  32 |     // Create test tasks with different priorities
  33 |     const tasks = await seedPriorityTasks(3);
  34 |     console.log(`Created ${tasks.length} priority tasks for testing`);
  35 |     
  36 |     // Navigate to the tasks page
  37 |     await page.goto('/tasks');
  38 |     await page.waitForLoadState('networkidle');
  39 |     
  40 |     // Click on the filter button
  41 |     await page.getByText('Filter').click();
  42 |     
  43 |     // Select high priority filter
  44 |     await page.getByText('High Priority').click();
  45 |     
  46 |     // Verify that high priority tasks are displayed
  47 |     await expect(page.locator('.task-item')).toBeVisible();
  48 |     
  49 |     // Take a screenshot of filtered results
  50 |     await page.screenshot({ path: './test-results/priority-filter-test.png' });
  51 |   });
  52 |
  53 |   test('should filter tasks by due date', async ({ page }) => {
  54 |     // Create test tasks with various due dates
  55 |     const tasks = await seedDueDateTasks();
  56 |     console.log(`Created ${tasks.length} due date tasks for testing`);
  57 |     
  58 |     // Navigate to the tasks page
  59 |     await page.goto('/tasks');
  60 |     await page.waitForLoadState('networkidle');
  61 |     
  62 |     // Click on the filter button
> 63 |     await page.getByText('Filter').click();
     |                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  64 |     
  65 |     // Select due today filter
  66 |     await page.getByText('Due Today').click();
  67 |     
  68 |     // Verify that due today tasks are displayed
  69 |     await expect(page.locator('.task-item')).toBeVisible();
  70 |     
  71 |     // Take a screenshot of filtered results
  72 |     await page.screenshot({ path: './test-results/due-today-filter-test.png' });
  73 |   });
  74 |
  75 |   test('should filter tasks by tags', async ({ page }) => {
  76 |     // Create test tasks with tags
  77 |     const tasks = await seedTaggedTasks(2);
  78 |     console.log(`Created ${tasks.length} tagged tasks for testing`);
  79 |     
  80 |     // Navigate to the tasks page
  81 |     await page.goto('/tasks');
  82 |     await page.waitForLoadState('networkidle');
  83 |     
  84 |     // Click on the filter button
  85 |     await page.getByText('Filter').click();
  86 |     
  87 |     // Select tag filter (assuming there's a tag filter option)
  88 |     await page.getByText('Tags').click();
  89 |     
  90 |     // Verify that tagged tasks are displayed
  91 |     await expect(page.locator('.task-item')).toBeVisible();
  92 |     
  93 |     // Take a screenshot of filtered results
  94 |     await page.screenshot({ path: './test-results/tag-filter-test.png' });
  95 |   });
  96 | });
  97 |
```