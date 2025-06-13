/**
 * Task Seeding Demo
 * 
 * This script creates test tasks using our seeder with the existing Playwright authentication.
 * Run it with: npx tsx tests/seedTaskDemo.ts
 */
import 'dotenv/config'; // Load environment variables from .env file
import { seedTestTasks } from './utils/testDataSeeder';

async function runDemo() {
  try {
    console.log('Creating test tasks...');
    const tasks = await seedTestTasks(5);
    
    console.log(`✅ Successfully created ${tasks.length} test tasks:`);
    tasks.forEach((task, index) => {
      console.log(`  ${index + 1}. "${task.title}" (ID: ${task.id})`);
    });
    
    console.log('\nThese tasks should now be visible in your app\'s task list.');
  } catch (error) {
    console.error('❌ Failed to seed test tasks:', error);
  }
}

// Run the demo
runDemo();
