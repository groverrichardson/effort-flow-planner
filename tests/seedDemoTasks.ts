/**
 * Task Seeding Demonstration
 * 
 * This script demonstrates seeding test tasks directly into the database.
 * Run with: npx tsx tests/seedDemoTasks.ts
 * 
 * Note: Requires environment variables from .env file
 */
import { testDataSeeder } from './utils/testDataSeeder';
import { TaskStatus, Priority, EffortLevel } from '../src/types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function seedDemoTasks() {
  try {
    console.log('Initializing test data seeder...');
    await testDataSeeder.initialize();
    
    console.log('Creating test tasks...');
    const task1 = await testDataSeeder.createBasicTask('Test Task: UI Test Demo Task 1');
    console.log(`Created task with ID: ${task1.id}`);
    
    // In future phases, we'll add more complex task seeding here
    // This will include tasks with tags, varying priorities, and different statuses
    
    console.log('Task seeding demonstration completed successfully');
  } catch (error) {
    console.error('Error seeding test tasks:', error);
  }
}

// Execute the demo
seedDemoTasks();
