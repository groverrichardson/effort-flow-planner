/**
 * Test state setup utility
 * 
 * This module provides functions to set up the test environment state
 * including authentication and any required test data.
 */

import { cleanupTestTasks, seedMixedTaskSet } from './seedTemplates';

/**
 * Sets up the test environment state
 * - Ensures authentication is in place
 * - Seeds any necessary test data
 */
export async function setupTestState() {
  // The auth file is handled by the global setup
  // So we just need to set up any test data here
  
  // Clean up any existing test tasks to start fresh
  await cleanupTestTasks();
  
  // Seed mixed tasks for testing
  await seedMixedTaskSet();
  
  console.log('Test state setup complete');
}

/**
 * Tears down the test environment state
 * - Cleans up any test data created during tests
 */
export async function teardownTestState() {
  await cleanupTestTasks();
  console.log('Test state teardown complete');
}
