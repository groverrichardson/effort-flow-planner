/**
 * Demo script for seeding rich test tasks using templates
 * 
 * This example demonstrates creating different types of tasks with varied
 * priorities, statuses, due dates, and tags using the enhanced TestDataSeeder.
 * 
 * Run with: node tests/examples/richTaskSeedDemo.mjs
 */

import { cleanupTestTasks, seedTemplateTask, TestTaskTemplate, seedTemplateTasks, testDataSeeder } from '../utils/testDataSeeder.js';
import 'dotenv/config';
import { Priority, TaskStatus } from '../../src/types/index.js';
import { setTimeout } from 'timers/promises';

async function main() {
  console.log('🌱 Rich Task Seed Demo');
  console.log('====================');

  try {
    // Initialize the seeder
    await testDataSeeder.initialize();
    console.log('✅ Seeder initialized successfully');

    console.log('\n📋 Creating one task of each template type...');
    
    // Create one of each template type
    const highPriorityTask = await seedTemplateTask(TestTaskTemplate.HIGH_PRIORITY);
    console.log(`✅ Created high priority task: "${highPriorityTask.title}" with priority ${highPriorityTask.priority}`);
    
    const completedTask = await seedTemplateTask(TestTaskTemplate.COMPLETED);
    console.log(`✅ Created completed task: "${completedTask.title}" with status ${completedTask.status}`);
    
    const dueTodayTask = await seedTemplateTask(TestTaskTemplate.DUE_TODAY);
    console.log(`✅ Created due today task: "${dueTodayTask.title}" due on ${dueTodayTask.dueDate?.toLocaleDateString()}`);
    
    const dueTomorrowTask = await seedTemplateTask(TestTaskTemplate.DUE_TOMORROW);
    console.log(`✅ Created due tomorrow task: "${dueTomorrowTask.title}" due on ${dueTomorrowTask.dueDate?.toLocaleDateString()}`);
    
    const overdueTask = await seedTemplateTask(TestTaskTemplate.OVERDUE);
    console.log(`✅ Created overdue task: "${overdueTask.title}" due on ${overdueTask.dueDate?.toLocaleDateString()}`);

    // Create multiple tasks with tags
    console.log('\n📋 Creating multiple tasks with tags...');
    const tasksWithTags = await seedTemplateTasks(TestTaskTemplate.WITH_TAGS, 2);
    console.log(`✅ Created ${tasksWithTags.length} tasks with tags`);

    // Create multiple tasks with high effort
    console.log('\n📋 Creating multiple tasks with high effort...');
    const highEffortTasks = await seedTemplateTasks(TestTaskTemplate.WITH_EFFORT, 3);
    console.log(`✅ Created ${highEffortTasks.length} high effort tasks`);

    // Wait a moment to allow viewing tasks in UI if needed
    console.log('\n⏳ Waiting 5 seconds before cleanup...');
    await setTimeout(5000);
    
    // Clean up the test tasks
    console.log('\n🧹 Cleaning up test tasks...');
    await cleanupTestTasks();
    console.log('✅ All test tasks cleaned up');

  } catch (error) {
    console.error('❌ Error in demo script:', error);
  }
}

// Run the demo
main().catch(console.error);
