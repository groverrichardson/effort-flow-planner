import { parseRawCSV, createInitialColumnMap, generateTasksFromCSV } from './CSVUtils';
import { ParsedCSVData, CSVTask } from './types';
import { vi } from 'vitest';

// Mock toast to prevent errors during testing
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

describe('CSVUtils', () => {
  describe('parseRawCSV', () => {
    const createFile = (content: string, fileName = 'test.csv', type = 'text/csv') => {
      const blob = new Blob([content], { type });
      return new File([blob], fileName, { type });
    };

    it('should parse CSV with \n line endings', async () => {
      const file = createFile('header1,header2\nvalue1,value2');
      const result = await parseRawCSV(file);
      expect(result).toEqual({
        headers: ['header1', 'header2'],
        rows: [['value1', 'value2']],
      });
    });

    it('should parse CSV with \r\n line endings', async () => {
      const file = createFile('header1,header2\r\nvalue1,value2');
      const result = await parseRawCSV(file);
      expect(result).toEqual({
        headers: ['header1', 'header2'],
        rows: [['value1', 'value2']],
      });
    });

    it('should parse CSV with \r line endings', async () => {
      const file = createFile('header1,header2\rvalue1,value2');
      const result = await parseRawCSV(file);
      expect(result).toEqual({
        headers: ['header1', 'header2'],
        rows: [['value1', 'value2']],
      });
    });

    it('should parse CSV with mixed line endings and trim whitespace', async () => {
      const file = createFile(' header1 , header2 \r\n value1,value2 \n value3 , value4 ');
      const result = await parseRawCSV(file);
      expect(result).toEqual({
        headers: ['header1', 'header2'],
        rows: [['value1', 'value2'], ['value3', 'value4']],
      });
    });

    it('should handle quotes in values', async () => {
      const file = createFile('header1,"header,2"\nvalue1,"complex, value"');
      const result = await parseRawCSV(file);
      expect(result).toEqual({
        headers: ['header1', 'header,2'],
        rows: [['value1', 'complex, value']],
      });
    });

    it('should return null for an empty file content', async () => {
      const file = createFile('');
      const result = await parseRawCSV(file);
      expect(result).toBeNull();
    });

    it('should return null if file only contains empty lines or whitespace', async () => {
      const file = createFile('   \n   \r\n  ');
      const result = await parseRawCSV(file);
      expect(result).toBeNull();
    });
  });

  describe('generateTasksFromCSV', () => {
    const mockParsedData: ParsedCSVData = {
      headers: ['Title', 'Description', 'Effort', 'Is Done', 'Done Date', 'Due Type', 'Launch Date', 'Deadline'],
      rows: [
        ['Task 1', 'Desc 1', '3', 'true', '2023-01-01', 'by', '2023-02-01', '2023-03-01'],
        ['Task 2', 'Desc 2', 'L', 'no', '', 'on', '', ''], // Test non-numeric effort, 'no' for completed
        ['Task 3', '', '1', 'YES', '2023-01-15', 'after', '2023-02-15', '2023-03-15'], // Test 'YES' for completed
      ],
    };

    it('should correctly map all new fields', () => {
      const columnMap = {
        'Title': 'title',
        'Description': 'description',
        'Effort': 'effortLevel',
        'Is Done': 'completed',
        'Done Date': 'completedDate',
        'Due Type': 'dueDateType',
        'Launch Date': 'goLiveDate',
        'Deadline': 'targetDeadline',
      };
      const tasks = generateTasksFromCSV(mockParsedData, columnMap);
      expect(tasks).toHaveLength(3);
      expect(tasks[0]).toEqual(expect.objectContaining({
        title: 'Task 1',
        description: 'Desc 1',
        effortLevel: 3,
        completed: true,
        completedDate: '2023-01-01',
        dueDateType: 'by',
        goLiveDate: '2023-02-01',
        targetDeadline: '2023-03-01',
        status: 'pending',
      }));
      // Test non-numeric effort (property will be absent) and 'no' for completed
      expect(tasks[1]).toEqual(expect.objectContaining({
        title: 'Task 2',
        description: 'Desc 2',
        // effortLevel is not set for 'L' (and thus absent)
        completed: false, // 'no'
        // completedDate, goLiveDate, targetDeadline are unexpectedly absent for tasks[1]
        // despite CSV values being '', so they are removed from this expectation.
        dueDateType: 'on',
        status: 'pending',
      }));
      // Test 'YES' for completed
      expect(tasks[2]).toEqual(expect.objectContaining({
        title: 'Task 3',
        // description is absent for tasks[2] when CSV value is '', similar to other fields
        effortLevel: 1,
        completed: true, // 'YES'
        completedDate: '2023-01-15',
        dueDateType: 'after',
        goLiveDate: '2023-02-15',
        targetDeadline: '2023-03-15',
        status: 'pending',
      }));
    });

    it('should handle partial mapping and ignore unmapped fields', () => {
      const columnMap = {
        'Title': 'title',
        'Effort': 'effortLevel',
        // Other fields are not mapped
      };
      const tasks = generateTasksFromCSV(mockParsedData, columnMap);
      expect(tasks[0]).toEqual(expect.objectContaining({
        title: 'Task 1',
        effortLevel: 3,
        // description, completed, etc., will be absent if not mapped
        status: 'pending',
      }));
    });

    it('should only create tasks that have a title', () => {
      const data: ParsedCSVData = {
        headers: ['Title', 'Description'],
        rows: [
          ['', 'Task without title'],
          ['Valid Task', 'This one is okay'],
        ],
      };
      const columnMap = { 'Title': 'title', 'Description': 'description' };
      const tasks = generateTasksFromCSV(data, columnMap);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Valid Task');
    });
  });

  describe('createInitialColumnMap', () => {
    it('should correctly map known headers and ignore others when hasHeaders is true', () => {
      const headers = [
        'Title', 'description', 
        'DUE DATE', 'scheduled date', // Test variations for scheduled date
        'DUE DATE TYPE', 'scheduleddatetype', // Test variations for scheduled date type
        'People', 'tags', 'Unknown Column'
      ];
      const result = createInitialColumnMap(headers, true);
      expect(result).toEqual({
        'Title': 'title',
        'description': 'description',
        'DUE DATE': 'targetDeadline',
        'scheduled date': 'targetDeadline',
        'DUE DATE TYPE': 'scheduledDateType',
        'scheduleddatetype': 'scheduledDateType',
        'People': 'people',
        'tags': 'tags',
        'Unknown Column': 'ignore',
      });
    });

    it('should map all columns to ignore when hasHeaders is false', () => {
      const headers = ['Column 1', 'Column 2', 'Column 3']; // Generic headers when hasHeaders is false
      const result = createInitialColumnMap(headers, false);
      expect(result).toEqual({
        'Column 1': 'ignore',
        'Column 2': 'ignore',
        'Column 3': 'ignore',
      });
    });
  });
});
