/**
 * IMPORTANT: THIS IS A JEST/VITEST STYLE TEST FILE
 * =============================================
 * This file uses Jest/Vitest test syntax (describe, it, expect) and is meant to be run with:
 * npm run test       - Run tests with Vitest
 * npm run test:unit  - Run tests in watch mode
 * 
 * DO NOT run this file with Playwright test runner as it uses a different test format.
 * For Playwright tests, use .spec.ts files instead.
 */

import { testDataSeeder, seedBasicTask } from './utils/testDataSeeder';
import { Task } from '../src/types';

describe('Test Data Seeder', () => {
  let createdTaskId: string | undefined;

  // Clean up after all tests
  afterAll(async () => {
    await testDataSeeder.cleanupTestTasks();
  });

  it('should initialize with test user credentials', async () => {
    await expect(testDataSeeder.initialize()).resolves.not.toThrow();
  });

  it('should create a basic task', async () => {
    const task = await seedBasicTask('Test Task: Basic Task Test');
    createdTaskId = task.id;
    
    expect(task).toBeDefined();
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test Task: Basic Task Test');
    expect(task.status).toBe('PENDING');
  });
});
