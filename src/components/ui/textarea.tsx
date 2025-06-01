import * as React from 'react';
import { EditorView } from '@tiptap/pm/view';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import EditorToolbar from './EditorToolbar'; // Import the toolbar

export interface TextareaProps
    extends Omit<
        React.HTMLAttributes<HTMLDivElement>,
        'onChange' | 'onKeyDown'
    > {
    id?: string;
    value: string;
    onChange: (html: string) => void;
    className?: string;
    placeholder?: string;
    showToolbar?: boolean;
    autoFocus?: boolean;
    'data-testid'?: string; // Added data-testid prop
    'aria-label'?: string; // Added aria-label for accessibility
    onTiptapKeyDown?: (
        view: EditorView,
        event: KeyboardEvent
    ) => boolean | void; // Renamed and type adjusted
    // We might not need a traditional ref for the editor content itself,
    // as TipTap's editor instance provides control.
    // If a ref to the outer div is needed, forwardRef can be adjusted.
}

const Textarea = React.forwardRef<
    HTMLDivElement, // Forwarding ref to the outer div
    TextareaProps
>(
    (
        {
            id,
            value,
            onChange,
            className,
            placeholder,
            showToolbar = true,
            autoFocus = false,
            'data-testid': dataTestId,
            'aria-label': ariaLabel,
            onTiptapKeyDown,
            ...props
        },
        ref
    ) => {
        const editor = useEditor({
            extensions: [
                StarterKit.configure({
                    bulletList: false,
                    orderedList: false,
                    blockquote: false,
                    codeBlock: false,
                    heading: false,
                    horizontalRule: false,
                    // You can configure StarterKit options here if needed
                    // For example, to disable some default extensions from StarterKit:
                    // heading: false, // Disables headings
                    // bulletList: { keepMarks: true, keepAttributes: true }, // Configure bullet lists
                }),
                Placeholder.configure({
                    placeholder: placeholder ?? 'Enter your text here...',
                }),
            ],
            content: value,
            autofocus: autoFocus,
            onUpdate: ({ editor: currentEditor }: { editor: Editor }) => {
                onChange(currentEditor.getHTML());
            },
            editorProps: {
                handleKeyDown: (
                    view: EditorView,
                    event: KeyboardEvent
                ): boolean | void => {
                    // Spacebar logging logic
                    if (event.key === ' ') {
                        console.log(
                            'Tiptap editorProps.handleKeyDown - Spacebar pressed:',
                            {
                                key: event.key,
                                code: event.code,
                                defaultPrevented: event.defaultPrevented,
                                isComposing: event.isComposing,
                            }
                        );
                        Promise.resolve().then(() => {
                            console.log(
                                'Tiptap editorProps.handleKeyDown - Spacebar (after microtask) defaultPrevented:',
                                event.defaultPrevented
                            );
                        });
                    }

                    // Call original onTiptapKeyDown if it exists
                    if (onTiptapKeyDown) {
                        return onTiptapKeyDown(view, event); // Directly return the result
                    }

                    return false; // Default behavior if onTiptapKeyDown is not provided or doesn't return explicitly
                },
                attributes: {
                    'data-testid': dataTestId, // Pass data-testid here
                    'aria-label': ariaLabel, // Pass aria-label here
                    class: cn(
                        'max-w-none focus:outline-none w-full min-h-[80px] rounded-md border border-input bg-background pl-3 pr-0 py-2 text-sm ring-offset-background',
                        // Removed placeholder:text-muted-foreground as TipTap's Placeholder extension handles this
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        className // Apply className prop for additional styling
                    ),
                    // The 'id' prop is applied to the wrapper div, not directly to the editor's input area.
                },
            },
        });

        // Set placeholder using TipTap's placeholder extension if not already in StarterKit
        // Or handle it via CSS if the `placeholder` prop is intended for the visual cue
        // For now, relying on CSS might be simpler if StarterKit doesn't handle it directly
        // with the `placeholder` prop on the Textarea component.
        // TipTap's Placeholder extension is more robust: `import Placeholder from '@tiptap/extension-placeholder'`
        // and add `Placeholder.configure({ placeholder })` to extensions.

        React.useEffect(() => {
            if (editor) {
                const editorText = editor.getText();
                if (value !== editorText) {
                    try {
                        console.log(
                            `Textarea useEffect: value prop ("${value}") !== editor.getText() ("${editorText}"). Calling setContent.`
                        );
                        editor.commands.setContent(value, false); // `false` to avoid triggering onUpdate again
                    } catch (e) {
                        console.error(
                            'Textarea: Error in useEffect during setContent:',
                            e
                        );
                    }
                } else {
                    // console.log(`Textarea useEffect: value prop ("${value}") === editor.getText() ("${editorText}"). Skipping setContent.`);
                }
            }
        }, [value, editor]);

        if (!editor) {
            return null;
        }

        const toolbarId = id ? `${id}-toolbar` : undefined;

        return (
            <div
                ref={ref}
                className={cn(
                    'tiptap-editor-container flex flex-col',
                    className?.includes('min-h-') ? '' : 'min-h-[120px]'
                )}>
                {showToolbar && (
                    <EditorToolbar editor={editor} id={toolbarId} />
                )}
                {/* The EditorContent itself will take styling from editorProps.attributes.class */}
                {/* The id prop is now primarily for the toolbar and overall wrapper if needed */}
                <div id={id} className="tiptap-wrapper flex-grow">
                    <EditorContent
                        editor={editor}
                        className="prose dark:prose-invert max-w-none px-0 prose-p:my-2"
                        {...props}
                    />
                </div>
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea };
