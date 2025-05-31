import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll } from 'vitest';
import PageHeader from './PageHeader'; // Assuming PageHeader.tsx is in the same directory
import { ThemeProvider } from '../../context/ThemeContext';
import '@testing-library/jest-dom';

// Mock functions for the props PageHeader expects
const mockOnCreateTaskClick = vi.fn();
const mockOnManageTagsClick = vi.fn();
const mockOnManagePeopleClick = vi.fn();
const mockOnBulkImportClick = vi.fn();
const mockFilterProps = {}; // Provide a basic mock for filterProps
const mockOnToggleBulkEdit = vi.fn();

describe('PageHeader', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false, // Default to desktop view for tests
                media: query,
                onchange: null,
                addListener: vi.fn(), // Deprecated
                removeListener: vi.fn(), // Deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });
    const defaultProps = {
        onCreateTaskClick: mockOnCreateTaskClick,
        onManageTagsClick: mockOnManageTagsClick,
        onManagePeopleClick: mockOnManagePeopleClick,
        onBulkImportClick: mockOnBulkImportClick,
        filterProps: mockFilterProps,
        isBulkEditing: false,
        onToggleBulkEdit: mockOnToggleBulkEdit,
    };

    it('renders the flame counter icon and initial count', () => {
        render(
      <ThemeProvider>
        <PageHeader {...defaultProps} />
      </ThemeProvider>
    );

        // Check for the flame icon by its alt text or ID
        const flameIcon = screen.getByAltText('Flame icon'); // Or screen.getByRole('img', { name: /flame icon/i });
        expect(flameIcon).toBeInTheDocument();
        expect(flameIcon).toHaveAttribute('src', '/green-flame.png');
        expect(flameIcon).toHaveAttribute('id', 'flame-icon');


        // Check for the flame count value by its ID and initial text content
        const flameCountValue = screen.getByText('0'); // Check for the default '0'
        expect(flameCountValue).toBeInTheDocument();
        expect(flameCountValue).toHaveAttribute('id', 'flame-count-value');
    });

    // We can add more tests here later, for example,
    // when the flameCount prop is implemented and passed.
});
