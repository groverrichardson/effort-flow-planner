/**
 * Task Seeder Helper
 * 
 * This utility provides ready-to-use testing functions that combine
 * the test data seeder with common test patterns.
 */

import { Page } from '@playwright/test';
import { TestDataSeeder, Task } from './testDataSeeder';
import * as templates from './seedTemplates';

/**
 * TaskSeederHelper provides a simplified interface for test data seeding
 * with built-in setup, teardown, and common testing patterns
 */
export class TaskSeederHelper {
  private seeder: TestDataSeeder;
  private initialized = false;
  private createdTasks: Task[] = [];

  /**
   * Creates a new TaskSeederHelper instance
   */
  constructor() {
    this.seeder = new TestDataSeeder();
  }

  /**
   * Initialize the seeder
   * Call this in your test.beforeAll() hook
   */
  async setup(): Promise<void> {
    if (!this.initialized) {
      await this.seeder.initialize();
      await this.seeder.cleanupTestTasks();
      this.initialized = true;
    }
  }

  /**
   * Clean up all test tasks
   * Call this in your test.afterAll() hook
   */
  async cleanup(): Promise<void> {
    if (this.initialized) {
      await this.seeder.cleanupTestTasks();
      this.createdTasks = [];
    }
  }

  /**
   * Create a mixed set of tasks and navigate to tasks page
   * Perfect for visual testing of the task list
   */
  async setupTasksAndNavigate(page: Page): Promise<Task[]> {
    await this.setup();
    this.createdTasks = await templates.seedMixedTaskSet();
    // Make sure we go to the base URL rather than a relative path
    await page.goto('http://localhost:8080/tasks');
    // Wait longer to ensure everything is loaded
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    return this.createdTasks;
  }

  /**
   * Create tasks with different priorities and navigate to tasks page
   */
  async setupPriorityTasksAndNavigate(page: Page, count = 3): Promise<Task[]> {
    await this.setup();
    this.createdTasks = await templates.seedPriorityTasks(count);
    await page.goto('http://localhost:8080/tasks');
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    return this.createdTasks;
  }

  /**
   * Create tasks with different due dates and navigate to tasks page
   */
  async setupDueDateTasksAndNavigate(page: Page): Promise<Task[]> {
    await this.setup();
    this.createdTasks = await templates.seedDueDateTasks();
    await page.goto('http://localhost:8080/tasks');
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    return this.createdTasks;
  }

  /**
   * Create tasks with tags and navigate to tasks page
   */
  async setupTaggedTasksAndNavigate(page: Page, count = 2): Promise<Task[]> {
    await this.setup();
    this.createdTasks = await templates.seedTaggedTasks(count);
    await page.goto('http://localhost:8080/tasks');
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    return this.createdTasks;
  }

  /**
   * Create tasks with different completion statuses and navigate to tasks page
   */
  async setupCompletionTasksAndNavigate(page: Page): Promise<Task[]> {
    await this.setup();
    this.createdTasks = await templates.seedCompletionStatusTasks();
    await page.goto('http://localhost:8080/tasks');
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    return this.createdTasks;
  }

  /**
   * Get the raw seeder instance for advanced usage
   */
  getSeeder(): TestDataSeeder {
    return this.seeder;
  }
}
