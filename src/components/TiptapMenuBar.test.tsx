/// <reference types="vitest/globals" />

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, Mock } from 'vitest'; // Import Mock type
import TiptapMenuBar from './TiptapMenuBar'; // Adjust path as necessary
import { Editor } from '@tiptap/react';

// Helper to create a more complete mock editor instance for testing
const createMockEditor = () => {
  const editorMock = {
    chain: vi.fn().mockReturnThis(),
    focus: vi.fn().mockReturnThis(),
    run: vi.fn(() => true),
    isActive: vi.fn(() => false),
    // Individual command methods for editor.chain().focus().<command>().run()
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleCode: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    setParagraph: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    toggleBlockquote: vi.fn().mockReturnThis(),
    setHorizontalRule: vi.fn().mockReturnThis(),
    setHardBreak: vi.fn().mockReturnThis(),
    undo: vi.fn().mockReturnThis(),
    redo: vi.fn().mockReturnThis(),
    // Mock for editor.can()
    can: vi.fn(),
  };

  // Setup for editor.can().chain().focus().<command>().run()
  const canChainFocusRun = (canRun: boolean) => ({
    run: vi.fn(() => canRun),
  });
  const canChainFocus = (canRun: boolean) => ({
    focus: vi.fn().mockReturnThis(), // Keep focus chainable
    toggleBold: vi.fn(() => canChainFocusRun(canRun)),
    toggleItalic: vi.fn(() => canChainFocusRun(canRun)),
    toggleStrike: vi.fn(() => canChainFocusRun(canRun)),
    toggleCode: vi.fn(() => canChainFocusRun(canRun)),
    toggleHeading: vi.fn(() => canChainFocusRun(canRun)),
    setParagraph: vi.fn(() => canChainFocusRun(canRun)),
    toggleBulletList: vi.fn(() => canChainFocusRun(canRun)),
    toggleOrderedList: vi.fn(() => canChainFocusRun(canRun)),
    toggleBlockquote: vi.fn(() => canChainFocusRun(canRun)),
    setHorizontalRule: vi.fn(() => canChainFocusRun(canRun)),
    setHardBreak: vi.fn(() => canChainFocusRun(canRun)),
    undo: vi.fn(() => canChainFocusRun(canRun)),
    redo: vi.fn(() => canChainFocusRun(canRun)),
  });
  const canChain = (canRun: boolean) => ({
    chain: vi.fn(() => canChainFocus(canRun)),
  });
  // Default editor.can() to return a chain that says commands *can* run
  vi.mocked(editorMock.can).mockImplementation(() => canChain(true) as any);

  // The editorMock is cast to Editor. Methods like .focus() or .run() are directly on this mock
  // for easier chain testing (e.g. editor.chain().focus().run()).
  // TypeScript might flag these as not directly on the Editor type, which is expected with this mock strategy.
  return editorMock as unknown as Editor;
};

describe('TiptapMenuBar', () => {
  let mockEditor: Editor;

  beforeEach(() => {
    mockEditor = createMockEditor();
    // Reset mocks before each test if they are stateful across `chain()` calls
    vi.clearAllMocks(); 
    // Re-spy on 'can' as clearAllMocks might remove it, or re-initialize mockEditor fully
    mockEditor = createMockEditor(); 
  });

  it('renders null if no editor is provided', () => {
    const { container } = render(<TiptapMenuBar editor={null} />);
    expect(container.firstChild).toBeNull();
  });

  const menuButtonTests = [
    { label: 'Bold', command: 'toggleBold', idSuffix: 'bold-button' },
    { label: 'Italic', command: 'toggleItalic', idSuffix: 'italic-button' },
    { label: 'Strikethrough', command: 'toggleStrike', idSuffix: 'strike-button' },
    { label: 'Code', command: 'toggleCode', idSuffix: 'code-button' },
    { label: 'Heading 1', command: 'toggleHeading', args: { level: 1 }, idSuffix: 'h1-button' },
    { label: 'Heading 2', command: 'toggleHeading', args: { level: 2 }, idSuffix: 'h2-button' },
    { label: 'Heading 3', command: 'toggleHeading', args: { level: 3 }, idSuffix: 'h3-button' },
    { label: 'Paragraph', command: 'setParagraph', idSuffix: 'paragraph-button' },
    { label: 'Bullet List', command: 'toggleBulletList', idSuffix: 'bulletlist-button' },
    { label: 'Ordered List', command: 'toggleOrderedList', idSuffix: 'orderedlist-button' },
    { label: 'Blockquote', command: 'toggleBlockquote', idSuffix: 'blockquote-button' },
    { label: 'Horizontal Rule', command: 'setHorizontalRule', idSuffix: 'hr-button' },
    { label: 'Hard Break', command: 'setHardBreak', idSuffix: 'hardbreak-button' },
    { label: 'Undo', command: 'undo', idSuffix: 'undo-button' },
    { label: 'Redo', command: 'redo', idSuffix: 'redo-button' },
  ];

  menuButtonTests.forEach(({ label, command, args, idSuffix }) => {
    it(`renders the ${label} button and calls editor.${command} on click`, () => {
      render(<TiptapMenuBar editor={mockEditor} idPrefix="test-menu" />);
      const button = screen.getByRole('button', { name: label });
      expect(button).toBeInTheDocument();
      expect(button.id).toBe(`test-menu-${idSuffix}`);

      fireEvent.click(button);

      expect(mockEditor.chain).toHaveBeenCalled();
      expect(mockEditor.focus).toHaveBeenCalled();
      const commandMock = mockEditor[command as keyof Editor] as Mock;
      if (args) {
        expect(commandMock).toHaveBeenCalledWith(args);
      } else {
        expect(commandMock).toHaveBeenCalled();
      }
      expect(mockEditor.run).toHaveBeenCalled();
    });

    it(`correctly reflects active state for ${label} button`, () => {
      vi.mocked(mockEditor.isActive).mockImplementation(((nameFromComponentCall: string, argsFromComponentCall?: Record<string, any>) => {
        let expectedActiveName = '';
        let isHeadingCommand = false;

        // Map test command to the name used in editor.isActive() by the component
        if (command === 'toggleBold') expectedActiveName = 'bold';
        else if (command === 'toggleItalic') expectedActiveName = 'italic';
        else if (command === 'toggleStrike') expectedActiveName = 'strike';
        else if (command === 'toggleCode') expectedActiveName = 'code';
        else if (command === 'toggleHeading') {
          expectedActiveName = 'heading';
          isHeadingCommand = true;
        }
        else if (command === 'setParagraph') expectedActiveName = 'paragraph';
        else if (command === 'toggleBulletList') expectedActiveName = 'bulletList';
        else if (command === 'toggleOrderedList') expectedActiveName = 'orderedList';
        else if (command === 'toggleBlockquote') expectedActiveName = 'blockquote';
        // 'setHorizontalRule', 'setHardBreak', 'undo', 'redo' don't use isActive for variant in TiptapMenuBar

        if (!expectedActiveName) return false; // If no mapping, it's not an actively styled button

        if (isHeadingCommand) {
          // 'args' are the test arguments like { level: 1 }
          // 'argsFromComponentCall' are from editor.isActive('heading', {level:X})
          return nameFromComponentCall === expectedActiveName && 
                 JSON.stringify(argsFromComponentCall || {}) === JSON.stringify(args || {});
        }
        return nameFromComponentCall === expectedActiveName;
      }) as any);

      render(<TiptapMenuBar editor={mockEditor} />);
      const button = screen.getByRole('button', { name: label });

      const commandsWithoutActiveVariant = ['setHorizontalRule', 'setHardBreak', 'undo', 'redo'];
      if (commandsWithoutActiveVariant.includes(command)) {
        expect(button).not.toHaveClass('bg-secondary');
        // Optionally, verify it has the default 'ghost' variant classes if they are consistent and known
        // For now, not having 'bg-secondary' is a good indicator.
      } else {
        expect(button).toHaveClass('bg-secondary');
      }
      
      vi.mocked(mockEditor.isActive).mockClear(); // Clear mock for next iteration
    });

    it(`disables the ${label} button if editor.can().chain().focus().${command}().run() is false`, () => {
      // Define the chained structure for .can() that returns false for .run()
      const canChainFocusRunFalse = { run: vi.fn(() => false) };
      const canChainFocusFalse = {
        focus: vi.fn().mockReturnThis(),
        // Add all commands here, specific to the one being tested for canChain(false)
        [command]: vi.fn(() => canChainFocusRunFalse) 
      };
      Object.keys(mockEditor).forEach(key => {
        if (typeof (mockEditor as any)[key] === 'function' && !canChainFocusFalse.hasOwnProperty(key)) {
          (canChainFocusFalse as any)[key] = vi.fn(() => ({ run: vi.fn(() => true) })); // Default other commands to true
        }
      });

      const canChainFalse = { chain: vi.fn(() => canChainFocusFalse) }; 

      vi.mocked(mockEditor.can).mockImplementation(() => canChainFalse as any);
      
      render(<TiptapMenuBar editor={mockEditor} />);
      const button = screen.getByRole('button', { name: label });
      expect(button).toBeDisabled();

      // Reset editor.can() mock to default (all true) for subsequent tests in this loop or rely on beforeEach
      const canChainFocusRunTrue = { run: vi.fn(() => true) };
      const canChainFocusTrue = { focus: vi.fn().mockReturnThis() };
      Object.keys(mockEditor).forEach(key => {
        if (typeof (mockEditor as any)[key] === 'function' && !canChainFocusTrue.hasOwnProperty(key)) {
         (canChainFocusTrue as any)[key] = vi.fn(() => canChainFocusRunTrue);
        }
      });
      const canChainTrue = { chain: vi.fn(() => canChainFocusTrue) };
      vi.mocked(mockEditor.can).mockImplementation(() => canChainTrue as any);
    });
  });

  it('uses default idPrefix if none is provided', () => {
    render(<TiptapMenuBar editor={mockEditor} />);
    const boldButton = screen.getByRole('button', { name: 'Bold' });
    expect(boldButton.id).toBe('tiptap-menu-bold-button'); // Default prefix is 'tiptap-menu'
  });

});
