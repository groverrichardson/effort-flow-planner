/**
 * Task Filtering Example Tests
 * 
 * This file demonstrates how to integrate the task seeder into your tests
 * to create realistic data scenarios and verify filtering functionality.
 */

import { test, expect } from '@playwright/test';
import { TestDataSeeder } from '../utils/testDataSeeder';
import { seedPriorityTasks, seedTaggedTasks, seedDueDateTasks } from '../utils/seedTemplates';

test.describe('Task Filtering Examples', () => {
  // Create a seeder instance for all tests in this group
  const seeder = new TestDataSeeder();
  
  // Set up once before all tests
  test.beforeAll(async () => {
    await seeder.initialize();
    console.log('Task seeder initialized for test group');
    
    // Optional: Clean up any existing test tasks
    await seeder.cleanupTestTasks();
  });
  
  // Clean up after all tests
  test.afterAll(async () => {
    await seeder.cleanupTestTasks();
    console.log('All test tasks cleaned up');
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Create test tasks with different priorities
    const tasks = await seedPriorityTasks(3);
    console.log(`Created ${tasks.length} priority tasks for testing`);
    
    // Navigate to the tasks page
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Click on the filter button
    await page.getByText('Filter').click();
    
    // Select high priority filter
    await page.getByText('High Priority').click();
    
    // Verify that high priority tasks are displayed
    await expect(page.locator('.task-item')).toBeVisible();
    
    // Take a screenshot of filtered results
    await page.screenshot({ path: './test-results/priority-filter-test.png' });
  });

  test('should filter tasks by due date', async ({ page }) => {
    // Create test tasks with various due dates
    const tasks = await seedDueDateTasks();
    console.log(`Created ${tasks.length} due date tasks for testing`);
    
    // Navigate to the tasks page
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Click on the filter button
    await page.getByText('Filter').click();
    
    // Select due today filter
    await page.getByText('Due Today').click();
    
    // Verify that due today tasks are displayed
    await expect(page.locator('.task-item')).toBeVisible();
    
    // Take a screenshot of filtered results
    await page.screenshot({ path: './test-results/due-today-filter-test.png' });
  });

  test('should filter tasks by tags', async ({ page }) => {
    // Create test tasks with tags
    const tasks = await seedTaggedTasks(2);
    console.log(`Created ${tasks.length} tagged tasks for testing`);
    
    // Navigate to the tasks page
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Click on the filter button
    await page.getByText('Filter').click();
    
    // Select tag filter (assuming there's a tag filter option)
    await page.getByText('Tags').click();
    
    // Verify that tagged tasks are displayed
    await expect(page.locator('.task-item')).toBeVisible();
    
    // Take a screenshot of filtered results
    await page.screenshot({ path: './test-results/tag-filter-test.png' });
  });
});
