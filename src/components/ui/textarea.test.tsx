import {
    render,
    screen,
    fireEvent,
    act,
    waitFor,
} from '@testing-library/react';

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
