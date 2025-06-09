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
