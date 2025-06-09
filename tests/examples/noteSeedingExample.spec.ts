import { test, expect } from '@playwright/test';
import {
  testDataSeeder,
  seedBasicNote,
  seedRichNote,
  seedTemplateNote,
  seedTestNotes,
  TestNoteTemplate,
} from '../utils/testDataSeeder';

test.describe('Note seeder demonstration', () => {
  // Create seeder before tests and clean up any old test data
  test.beforeAll(async () => {
    await testDataSeeder.initialize();
    await testDataSeeder.cleanupTestTasks(); // This also cleans up notes
    console.log('Test environment ready - old test data cleaned up');
  });
  
  // Clean up after all tests
  test.afterAll(async () => {
    await testDataSeeder.cleanupTestTasks(); // This also cleans up notes
    console.log('Final cleanup complete - all test data removed');
  });

  test('should create basic and template notes for testing', async ({ page }) => {
    // Create a basic note
    const basicNote = await seedBasicNote('Test Note: Basic Example');
    expect(basicNote.id).toBeDefined();
    expect(basicNote.name).toBe('Test Note: Basic Example');
    
    // Create notes with different templates
    const richTextNote = await seedTemplateNote(TestNoteTemplate.RICH_TEXT);
    const markdownNote = await seedTemplateNote(TestNoteTemplate.WITH_MARKDOWN);
    const archivedNote = await seedTemplateNote(TestNoteTemplate.ARCHIVED);
    
    // Create a note linked to a task
    const noteWithTask = await seedTemplateNote(TestNoteTemplate.WITH_TASKS);
    
    // Verify note creation
    expect(richTextNote.id).toBeDefined();
    expect(richTextNote.body).toContain('<h1>Rich Text Note</h1>');
    
    expect(markdownNote.id).toBeDefined();
    expect(markdownNote.body).toContain('# Markdown Note');
    
    expect(archivedNote.id).toBeDefined();
    expect(archivedNote.is_archived).toBe(true);
    
    expect(noteWithTask.id).toBeDefined();
    expect(noteWithTask.taggedTaskIds.length).toBe(1);
    
    // Create multiple notes at once
    const multipleNotes = await seedTestNotes(3);
    expect(multipleNotes.length).toBe(3);
    
    // Navigate to the app and verify we're logged in
    await page.goto('/');
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Navigate to notes page
    await page.getByRole('link', { name: /notes/i }).click();
    await page.waitForSelector('[data-testid="notes-container"]');
    
    // Take a screenshot to see what page we landed on with our seeded notes
    await page.screenshot({ path: './test-results/note-seeder-demo.png' });
    
    // Basic verification that we can see notes
    // Note: Non-archived notes should be visible, archived notes should not be
    await expect(page.getByText(basicNote.name)).toBeVisible();
    await expect(page.getByText(richTextNote.name)).toBeVisible();
    await expect(page.getByText(markdownNote.name)).toBeVisible();
    
    // Archived note should not be visible in the default view
    await expect(page.getByText(archivedNote.name)).not.toBeVisible();
  });
});
