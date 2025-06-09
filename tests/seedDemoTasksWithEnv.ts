/**
 * Task Seeding Demonstration with explicit env file
 * 
 * This script loads the .env.test file and then seeds test tasks.
 * Run with: npx tsx tests/seedDemoTasksWithEnv.ts
 */
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test file
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Now import the seeder after env vars are loaded
import { testDataSeeder } from './utils/testDataSeeder';

async function seedDemoTasks() {
  try {
    console.log('Environment variables loaded from .env.test');
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    // Don't log the full key for security, just check if it exists
    console.log('Supabase Key exists:', !!process.env.SUPABASE_ANON_KEY);
    console.log('Test User Email:', process.env.PLAYWRIGHT_TEST_USER_EMAIL);
    console.log('Test User Password exists:', !!process.env.PLAYWRIGHT_TEST_USER_PASSWORD);
    
    console.log('\nInitializing test data seeder...');
    await testDataSeeder.initialize();
    
    console.log('\nCreating test task...');
    const task = await testDataSeeder.createBasicTask('Test Task: UI Test Demo Task');
    console.log(`Created task with ID: ${task.id}`);
    console.log('Title:', task.title);
    console.log('Status:', task.status);

    console.log('\nTask seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding test tasks:', error);
  }
}

// Execute the demo
seedDemoTasks();
