import { TestDataSeeder } from '../../tests/utils/testDataSeeder';
import { Task } from '../types';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';

// Create mock task objects
const MOCK_USER_ID = 'mock-user-id';
const MOCK_TASK = { 
  id: 'mock-task-id', 
  title: 'Test Task: Basic Task Test',
  status: 'PENDING' 
};

// Create mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: MOCK_USER_ID } }, 
      error: null 
    }),
    setSession: vi.fn().mockResolvedValue({ data: {}, error: null })
  },
  from: vi.fn().mockImplementation(() => ({
    insert: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockImplementation(() => ({
        single: vi.fn().mockResolvedValue({ data: MOCK_TASK, error: null })
      }))
    })),
    delete: vi.fn().mockImplementation(() => ({
      like: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  }))
} as unknown as SupabaseClient;

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  readFileSync: vi.fn().mockReturnValue(JSON.stringify({
    origins: [{
      origin: 'mock.supabase.co',
      localStorage: [{
        name: 'sb-mock-auth-token',
        value: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token'
        })
      }]
    }]
  }))
}));

describe('Test Data Seeder', () => {
  let seeder: TestDataSeeder;
  
  beforeEach(() => {
    // Create fresh instance of seeder with mock client for each test
    seeder = new TestDataSeeder(mockSupabaseClient);
    
    // Reset mock call history
    vi.clearAllMocks();
  });
  
  it('should initialize successfully', async () => {
    await expect(seeder.initialize()).resolves.not.toThrow();
    expect(mockSupabaseClient.auth.setSession).toHaveBeenCalled();
    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
  });
  
  it('should create a basic task', async () => {
    await seeder.initialize(); // Make sure we're initialized first
    const task = await seeder.createBasicTask('Test Task: Basic Task Test');
    
    expect(task).toBeDefined();
    expect(task.id).toBe('mock-task-id');
    expect(task.title).toBe('Test Task: Basic Task Test');
    expect(task.status).toBe('PENDING');
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('tasks');
  });
  
  it('should clean up test tasks', async () => {
    await seeder.initialize();
    await seeder.cleanupTestTasks();
    
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('tasks');
    // Check that delete and like were called
    const fromMock = mockSupabaseClient.from as any;
    const deleteMock = fromMock.mock.results[0].value.delete;
    expect(deleteMock).toHaveBeenCalled();
  });
});
