/**
 * Demonstration script for the enhanced task seeder
 * 
 * This shows how to use the task seeder to create different types of test tasks,
 * and then clean them up afterward.
 * 
 * Run with: npx tsx tests/examples/seedDemo.ts
 */

import { TestDataSeeder, TestTaskTemplate } from '../utils/testDataSeeder';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// If environment variables aren't set, try to use the Playwright auth session
// which is the recommended approach for tests
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.log('Environment variables not found, using Playwright authentication session...');
}

// Self-executing async function
(async () => {
  console.log('🌱 Task Seeder Demo Starting');
  console.log('----------------------------');
  
  // Create a new seeder instance
  const seeder = new TestDataSeeder();
  await seeder.initialize();
  
  try {
    // Clean up any existing test tasks first
    console.log('Cleaning up any existing test tasks...');
    await seeder.cleanupTestTasks();
    
    console.log('\n📋 Creating test tasks using templates...');
    
    // Create basic task
    const basicTask = await seeder.createBasicTask('Simple Test Task');
    console.log(`✓ Created basic task: "${basicTask.title}" (ID: ${basicTask.id})`);
    
    // Create high priority task
    const highPriorityTask = await seeder.createTemplateTask(
      TestTaskTemplate.HIGH_PRIORITY,
      'Critical Priority Task'
    );
    console.log(`✓ Created high priority task: "${highPriorityTask.title}" (ID: ${highPriorityTask.id})`);
    
    // Create completed task
    const completedTask = await seeder.createTemplateTask(
      TestTaskTemplate.COMPLETED,
      'Finished Test Task' 
    );
    console.log(`✓ Created completed task: "${completedTask.title}" (ID: ${completedTask.id})`);
    
    // Create due today task
    const dueTodayTask = await seeder.createTemplateTask(
      TestTaskTemplate.DUE_TODAY,
      'Due Today Test Task'
    );
    console.log(`✓ Created due today task: "${dueTodayTask.title}" (ID: ${dueTodayTask.id})`);
    
    // Create due tomorrow task
    const dueTomorrowTask = await seeder.createTemplateTask(
      TestTaskTemplate.DUE_TOMORROW, 
      'Due Tomorrow Test Task'
    );
    console.log(`✓ Created due tomorrow task: "${dueTomorrowTask.title}" (ID: ${dueTomorrowTask.id})`);
    
    // Create overdue task
    const overdueTask = await seeder.createTemplateTask(
      TestTaskTemplate.OVERDUE,
      'Overdue Test Task'
    );
    console.log(`✓ Created overdue task: "${overdueTask.title}" (ID: ${overdueTask.id})`);
    
    // Create high effort task
    const effortTask = await seeder.createTemplateTask(
      TestTaskTemplate.WITH_EFFORT,
      'High Effort Test Task'
    );
    console.log(`✓ Created high effort task: "${effortTask.title}" (ID: ${effortTask.id})`);
    
    // Create multiple basic tasks (one at a time since no batch method exists)
    console.log('Creating multiple basic tasks...');
    const batchTasks: any[] = [];
    for (let i = 1; i <= 3; i++) {
      const task = await seeder.createBasicTask(`Batch Test Task #${i}`);
      batchTasks.push(task);
    }
    console.log(`✓ Created ${batchTasks.length} basic tasks`);
    
    // Optional: Wait a moment to see tasks in UI
    console.log('\n⏱️ Waiting 5 seconds so you can check the tasks in the UI...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } finally {
    // Clean up all test tasks
    console.log('\n🧹 Cleaning up all test tasks...');
    await seeder.cleanupTestTasks();
    console.log('✓ All test tasks removed from database');
    
    console.log('\n✅ Demo completed successfully!');
  }
})().catch(error => {
  console.error('❌ Error in task seeder demo:', error);
  process.exit(1);
});
