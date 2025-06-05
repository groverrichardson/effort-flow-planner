import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColumnMapping from './ColumnMapping';
import { vi } from 'vitest';

// Mock FIELD_OPTIONS from the actual component to ensure test stays in sync
const FIELD_OPTIONS = [
  { value: 'ignore', label: 'Ignore' },
  { value: 'title', label: 'Title (required)' },
  { value: 'description', label: 'Description' },
  { value: 'priority', label: 'Priority' },
  { value: 'targetDeadline', label: 'Scheduled Date' },
  { value: 'effortLevel', label: 'Effort Level' },
  { value: 'completed', label: 'Completed' },
  { value: 'completedDate', label: 'Completed Date' },
  { value: 'scheduledDateType', label: 'Scheduled Date Type' },
  { value: 'goLiveDate', label: 'Go Live Date' },
  { value: 'people', label: 'People' },
  { value: 'tags', label: 'Tags' },
];

describe('ColumnMapping Component', () => {
  const mockHeaders = ['CSV Header 1', 'CSV Header 2'];
  const mockPreviewRows = [
    ['Data1A', 'Data1B'],
    ['Data2A', 'Data2B'],
  ];
  const mockColumnMap = {
    'CSV Header 1': 'title',
    'CSV Header 2': 'ignore',
  };
  const mockOnColumnMapChange = vi.fn();

  beforeEach(() => {
    mockOnColumnMapChange.mockClear();
  });

  it('should render all field options in the select dropdown for each header', async () => {
    render(
      <ColumnMapping
        headers={mockHeaders}
        previewRows={mockPreviewRows}
        columnMap={mockColumnMap}
        onColumnMapChange={mockOnColumnMapChange}
      />
    );

    const selectTriggers = screen.getAllByRole('combobox');
    expect(selectTriggers).toHaveLength(mockHeaders.length);

    for (const trigger of selectTriggers) {
      await userEvent.click(trigger);
      // Radix Select renders items in a portal, use waitFor to ensure items are available
      const listbox = await screen.findByRole('listbox'); // Ensure listbox is present
      for (const option of FIELD_OPTIONS) {
        // Use waitFor with findByText for each option to handle potential async rendering of items
        await expect(within(listbox).findByText(option.label)).resolves.toBeInTheDocument();
      }
      // Press Escape to close the dropdown before moving to the next one
      await userEvent.keyboard('{Escape}');
    }
  });

  it('should call onColumnMapChange with the correct mapping when a field is selected', async () => {
    render(
      <ColumnMapping
        headers={mockHeaders}
        previewRows={mockPreviewRows}
        columnMap={mockColumnMap}
        onColumnMapChange={mockOnColumnMapChange}
      />
    );

    const selectTriggers = screen.getAllByRole('combobox');
    await userEvent.click(selectTriggers[0]); // Open the first dropdown

    const listbox = screen.getByRole('listbox');
    await userEvent.click(within(listbox).getByText('Description')); // Select 'Description'

    expect(mockOnColumnMapChange).toHaveBeenCalledTimes(1);
    expect(mockOnColumnMapChange).toHaveBeenCalledWith({
      ...mockColumnMap,
      [mockHeaders[0]]: 'description',
    });
  });

  it('should clear existing mapping for a field if it is re-assigned to another header', async () => {
    const initialMap = {
      'CSV Header 1': 'title',
      'CSV Header 2': 'description',
    };
    render(
      <ColumnMapping
        headers={mockHeaders}
        previewRows={mockPreviewRows}
        columnMap={initialMap}
        onColumnMapChange={mockOnColumnMapChange}
      />
    );

    const selectTriggers = screen.getAllByRole('combobox');
    // Change 'CSV Header 1' from 'title' to 'description'
    // This should cause 'CSV Header 2' (which was 'description') to become 'ignore'
    await userEvent.click(selectTriggers[0]);
    let listbox = screen.getByRole('listbox');
    await userEvent.click(within(listbox).getByText('Description'));

    expect(mockOnColumnMapChange).toHaveBeenCalledWith({
      'CSV Header 1': 'description', // Newly assigned
      'CSV Header 2': 'ignore',      // Old 'description' mapping cleared
    });
  });
});
