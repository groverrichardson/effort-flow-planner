// Mock for document.createRange().getClientRects and getBoundingClientRect
if (typeof window !== 'undefined' && window.document && !window.document.createRange) {
  window.document.createRange = () => {
    const range = new Range();
    // @ts-ignore
    range.getBoundingClientRect = vi.fn(() => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, toJSON: () => ({}) }));
    // @ts-ignore
    range.getClientRects = vi.fn(() => ({ item: () => null, length: 0, [Symbol.iterator]: vi.fn(), toJSON: () => [] }));
    return range;
  };
}
// More specific fix if createRange exists but methods are missing
if (typeof window !== 'undefined' && window.document && typeof window.document.createRange === 'function') {
  const originalCreateRange = window.document.createRange.bind(window.document);
  window.document.createRange = () => {
    const range = originalCreateRange();
    // @ts-ignore
    if (typeof range.getBoundingClientRect !== 'function') {
      // @ts-ignore
      range.getBoundingClientRect = vi.fn(() => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, toJSON: () => ({}) }));
    }
    // @ts-ignore
    if (typeof range.getClientRects !== 'function') {
      // @ts-ignore
      range.getClientRects = vi.fn(() => ({ item: () => null, length: 0, [Symbol.iterator]: vi.fn(), toJSON: () => [] }));
    }
    return range;
  };
}

// Mock for document.elementFromPoint
// @ts-ignore
if (typeof document !== 'undefined' && typeof document.elementFromPoint !== 'function') {
  // @ts-ignore
  document.elementFromPoint = vi.fn(() => null);
}

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Textarea } from './textarea'; // Adjust path as necessary

describe('Textarea Component', () => {
    it('should render the Tiptap editor', () => {
        render(
            <Textarea
                value=""
                onChange={() => {}}
                data-testid="tiptap-editor"
            />
        );
        const editorElement = screen.getByTestId('tiptap-editor');
        expect(editorElement).toBeInTheDocument();
    });

    it('should call onChange with HTML content when text is typed', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(
            <Textarea
                value=""
                onChange={handleChange}
                data-testid="tiptap-editor"
            />
        );
        const editorElement = screen.getByTestId('tiptap-editor');

        // userEvent.type directly on the contentEditable div
        await user.type(editorElement, 'Hello World');

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith('<p>Hello World</p>');
        });
    });

    it('should call onTiptapKeyDown when a key is pressed', () => {
        const handleKeyDown = vi.fn();
        render(
            <Textarea
                value=""
                onChange={() => {}}
                onTiptapKeyDown={handleKeyDown}
                data-testid="tiptap-editor"
            />
        );
        const editorElement = screen.getByTestId('tiptap-editor');

        fireEvent.keyDown(editorElement, { key: 'a', code: 'KeyA' });
        expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('should update editor content when value prop changes (testing useEffect sync)', () => {
        const { rerender } = render(
            <Textarea
                value="<p>Initial</p>"
                onChange={() => {}}
                data-testid="tiptap-editor"
            />
        );
        const editorElement = screen.getByTestId('tiptap-editor');
        expect(editorElement).toContainHTML('<p>Initial</p>');

        rerender(
            <Textarea
                value="<p>Updated</p>"
                onChange={() => {}}
                data-testid="tiptap-editor"
            />
        );
        expect(editorElement).toContainHTML('<p>Updated</p>');
    });

    it('should correctly handle spacebar input and update content', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(
            <Textarea
                value=""
                onChange={handleChange}
                data-testid="tiptap-editor"
            />
        );
        const editorElement = screen.getByTestId('tiptap-editor');

        await user.type(editorElement, 'test space');

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith('<p>test space</p>');
        });
    });
});
