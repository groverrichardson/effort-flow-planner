# Test info

- Name: Note seeder demonstration >> should create basic and template notes for testing
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/examples/noteSeedingExample.spec.ts:25:3

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="notes-container"]') to be visible

    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/examples/noteSeedingExample.spec.ts:62:16
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- banner:
  - heading "All Notes" [level=1]:
    - img
    - text: All Notes
  - paragraph: Browse and manage all your notes.
  - link "Back to Home":
    - /url: /
    - img
    - text: Back to Home
- checkbox "Select all notes"
- text: Select All (0 / 7 selected)
- 'checkbox "Test Note: UI Test #3 Edit note Test Note: UI Test #3 Delete note Test Note: UI Test #3"'
- 'heading "Test Note: UI Test #3 Edit note Test Note: UI Test #3 Delete note Test Note: UI Test #3" [level=3]':
  - text: "Test Note: UI Test #3"
  - 'link "Edit note Test Note: UI Test #3"':
    - /url: /notes/d49431c0-071a-4fbd-80bc-44478f7d081d/edit
    - img
    - text: "Edit note Test Note: UI Test #3"
  - 'button "Delete note Test Note: UI Test #3"':
    - img
    - text: "Delete note Test Note: UI Test #3"
- paragraph: "Created: 6/9/2025"
- paragraph: This is a test note body created by the test data seeder.
- 'checkbox "Test Note: UI Test #2 Edit note Test Note: UI Test #2 Delete note Test Note: UI Test #2"'
- 'heading "Test Note: UI Test #2 Edit note Test Note: UI Test #2 Delete note Test Note: UI Test #2" [level=3]':
  - text: "Test Note: UI Test #2"
  - 'link "Edit note Test Note: UI Test #2"':
    - /url: /notes/95daa4ae-adc1-4eed-a82f-07d4dbb31b81/edit
    - img
    - text: "Edit note Test Note: UI Test #2"
  - 'button "Delete note Test Note: UI Test #2"':
    - img
    - text: "Delete note Test Note: UI Test #2"
- paragraph: "Created: 6/9/2025"
- paragraph: This is a test note body created by the test data seeder.
- 'checkbox "Test Note: UI Test #1 Edit note Test Note: UI Test #1 Delete note Test Note: UI Test #1"'
- 'heading "Test Note: UI Test #1 Edit note Test Note: UI Test #1 Delete note Test Note: UI Test #1" [level=3]':
  - text: "Test Note: UI Test #1"
  - 'link "Edit note Test Note: UI Test #1"':
    - /url: /notes/e47a2961-44fd-4107-8ff6-7d15e2ec5769/edit
    - img
    - text: "Edit note Test Note: UI Test #1"
  - 'button "Delete note Test Note: UI Test #1"':
    - img
    - text: "Delete note Test Note: UI Test #1"
- paragraph: "Created: 6/9/2025"
- paragraph: This is a test note body created by the test data seeder.
- 'checkbox "Test Note: With Tasks 2025-06-09T21:09:13 Edit note Test Note: With Tasks 2025-06-09T21:09:13 Delete note Test Note: With Tasks 2025-06-09T21:09:13"'
- 'heading "Test Note: With Tasks 2025-06-09T21:09:13 Edit note Test Note: With Tasks 2025-06-09T21:09:13 Delete note Test Note: With Tasks 2025-06-09T21:09:13" [level=3]':
  - text: "Test Note: With Tasks 2025-06-09T21:09:13"
  - 'link "Edit note Test Note: With Tasks 2025-06-09T21:09:13"':
    - /url: /notes/c5197e9a-4a11-4816-8e45-2ebd8cab7704/edit
    - img
    - text: "Edit note Test Note: With Tasks 2025-06-09T21:09:13"
  - 'button "Delete note Test Note: With Tasks 2025-06-09T21:09:13"':
    - img
    - text: "Delete note Test Note: With Tasks 2025-06-09T21:09:13"
- paragraph: "Created: 6/9/2025"
- paragraph: "This note is linked to task ID: de8a0d86-1d25-451b-91cf-0aa5e0914898"
- 'checkbox "Test Note: Markdown 2025-06-09T21:09:13 Edit note Test Note: Markdown 2025-06-09T21:09:13 Delete note Test Note: Markdown 2025-06-09T21:09:13"'
- 'heading "Test Note: Markdown 2025-06-09T21:09:13 Edit note Test Note: Markdown 2025-06-09T21:09:13 Delete note Test Note: Markdown 2025-06-09T21:09:13" [level=3]':
  - text: "Test Note: Markdown 2025-06-09T21:09:13"
  - 'link "Edit note Test Note: Markdown 2025-06-09T21:09:13"':
    - /url: /notes/91ff4a7f-2703-47a6-8149-bfc4d5559240/edit
    - img
    - text: "Edit note Test Note: Markdown 2025-06-09T21:09:13"
  - 'button "Delete note Test Note: Markdown 2025-06-09T21:09:13"':
    - img
    - text: "Delete note Test Note: Markdown 2025-06-09T21:09:13"
- paragraph: "Created: 6/9/2025"
- paragraph: "# Markdown Note This is a **markdown** formatted note. - Item 1 - Item 2 ``` code block ```"
- 'checkbox "Test Note: Rich Text 2025-06-09T21:09:12 Edit note Test Note: Rich Text 2025-06-09T21:09:12 Delete note Test Note: Rich Text 2025-06-09T21:09:12"'
- 'heading "Test Note: Rich Text 2025-06-09T21:09:12 Edit note Test Note: Rich Text 2025-06-09T21:09:12 Delete note Test Note: Rich Text 2025-06-09T21:09:12" [level=3]':
  - text: "Test Note: Rich Text 2025-06-09T21:09:12"
  - 'link "Edit note Test Note: Rich Text 2025-06-09T21:09:12"':
    - /url: /notes/8814b834-dbe8-4e88-ab18-fc2d676b653b/edit
    - img
    - text: "Edit note Test Note: Rich Text 2025-06-09T21:09:12"
  - 'button "Delete note Test Note: Rich Text 2025-06-09T21:09:12"':
    - img
    - text: "Delete note Test Note: Rich Text 2025-06-09T21:09:12"
- paragraph: "Created: 6/9/2025"
- paragraph: <h1>Rich Text Note</h1><p>This note contains <strong>rich text</strong> with <em>formatting</em>.</p><ul><li>List item 1</li><li>List item 2</li></ul>
- 'checkbox "Test Note: Basic Example Edit note Test Note: Basic Example Delete note Test Note: Basic Example"'
- 'heading "Test Note: Basic Example Edit note Test Note: Basic Example Delete note Test Note: Basic Example" [level=3]':
  - text: "Test Note: Basic Example"
  - 'link "Edit note Test Note: Basic Example"':
    - /url: /notes/ab904acb-85e6-49a9-ba70-077caac09c80/edit
    - img
    - text: "Edit note Test Note: Basic Example"
  - 'button "Delete note Test Note: Basic Example"':
    - img
    - text: "Delete note Test Note: Basic Example"
- paragraph: "Created: 6/9/2025"
- paragraph: This is a test note body created by the test data seeder.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import {
   3 |   testDataSeeder,
   4 |   seedBasicNote,
   5 |   seedRichNote,
   6 |   seedTemplateNote,
   7 |   seedTestNotes,
   8 |   TestNoteTemplate,
   9 | } from '../utils/testDataSeeder';
  10 |
  11 | test.describe('Note seeder demonstration', () => {
  12 |   // Create seeder before tests and clean up any old test data
  13 |   test.beforeAll(async () => {
  14 |     await testDataSeeder.initialize();
  15 |     await testDataSeeder.cleanupTestTasks(); // This also cleans up notes
  16 |     console.log('Test environment ready - old test data cleaned up');
  17 |   });
  18 |   
  19 |   // Clean up after all tests
  20 |   test.afterAll(async () => {
  21 |     await testDataSeeder.cleanupTestTasks(); // This also cleans up notes
  22 |     console.log('Final cleanup complete - all test data removed');
  23 |   });
  24 |
  25 |   test('should create basic and template notes for testing', async ({ page }) => {
  26 |     // Create a basic note
  27 |     const basicNote = await seedBasicNote('Test Note: Basic Example');
  28 |     expect(basicNote.id).toBeDefined();
  29 |     expect(basicNote.name).toBe('Test Note: Basic Example');
  30 |     
  31 |     // Create notes with different templates
  32 |     const richTextNote = await seedTemplateNote(TestNoteTemplate.RICH_TEXT);
  33 |     const markdownNote = await seedTemplateNote(TestNoteTemplate.WITH_MARKDOWN);
  34 |     const archivedNote = await seedTemplateNote(TestNoteTemplate.ARCHIVED);
  35 |     
  36 |     // Create a note linked to a task
  37 |     const noteWithTask = await seedTemplateNote(TestNoteTemplate.WITH_TASKS);
  38 |     
  39 |     // Verify note creation
  40 |     expect(richTextNote.id).toBeDefined();
  41 |     expect(richTextNote.body).toContain('<h1>Rich Text Note</h1>');
  42 |     
  43 |     expect(markdownNote.id).toBeDefined();
  44 |     expect(markdownNote.body).toContain('# Markdown Note');
  45 |     
  46 |     expect(archivedNote.id).toBeDefined();
  47 |     expect(archivedNote.is_archived).toBe(true);
  48 |     
  49 |     expect(noteWithTask.id).toBeDefined();
  50 |     expect(noteWithTask.taggedTaskIds.length).toBe(1);
  51 |     
  52 |     // Create multiple notes at once
  53 |     const multipleNotes = await seedTestNotes(3);
  54 |     expect(multipleNotes.length).toBe(3);
  55 |     
  56 |     // Navigate to the app and verify we're logged in
  57 |     await page.goto('/');
  58 |     await page.waitForSelector('body', { timeout: 10000 });
  59 |     
  60 |     // Navigate to notes page
  61 |     await page.getByRole('link', { name: /notes/i }).click();
> 62 |     await page.waitForSelector('[data-testid="notes-container"]');
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  63 |     
  64 |     // Take a screenshot to see what page we landed on with our seeded notes
  65 |     await page.screenshot({ path: './test-results/note-seeder-demo.png' });
  66 |     
  67 |     // Basic verification that we can see notes
  68 |     // Note: Non-archived notes should be visible, archived notes should not be
  69 |     await expect(page.getByText(basicNote.name)).toBeVisible();
  70 |     await expect(page.getByText(richTextNote.name)).toBeVisible();
  71 |     await expect(page.getByText(markdownNote.name)).toBeVisible();
  72 |     
  73 |     // Archived note should not be visible in the default view
  74 |     await expect(page.getByText(archivedNote.name)).not.toBeVisible();
  75 |   });
  76 | });
  77 |
```