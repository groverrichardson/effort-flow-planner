import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading2, Heading3 } from 'lucide-react'; // Using lucide-react for icons
import { Button } from './button'; // Assuming you have a Button component
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor | null;
  id?: string; // For unique ID if needed
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, id }) => {
  if (!editor) {
    return null;
  }

  const toolbarId = id || 'editor-toolbar';

  return (
    <div id={toolbarId} className="flex items-center space-x-1 border border-input rounded-md p-1 mb-2 bg-background">
      <Button
        type="button"
        id={`${toolbarId}-bold`}
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().toggleBold()}
        className={cn('p-2', editor.isActive('bold') ? 'is-active bg-accent text-accent-foreground' : '')}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        id={`${toolbarId}-italic`}
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().toggleItalic()}
        className={cn('p-2', editor.isActive('italic') ? 'is-active bg-accent text-accent-foreground' : '')}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        id={`${toolbarId}-strike`}
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().toggleStrike()}
        className={cn('p-2', editor.isActive('strike') ? 'is-active bg-accent text-accent-foreground' : '')}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        id={`${toolbarId}-h2`}
        variant="outline"
        size="sm"
        onClick={() => {
          if (!editor) return;
          console.log('[EditorToolbar] H2 button clicked');
          console.log('[EditorToolbar] Can toggleHeading level 2?', editor.can().toggleHeading({ level: 2 }));
          console.log('[EditorToolbar] HTML before toggleHeading:', editor.getHTML());
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          console.log('[EditorToolbar] HTML after toggleHeading:', editor.getHTML());
          console.log('[EditorToolbar] Is heading level 2 active?', editor.isActive('heading', { level: 2 }));
        }}
        className={cn('p-2', editor.isActive('heading', { level: 2 }) ? 'is-active bg-accent text-accent-foreground' : '')}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        id={`${toolbarId}-h3`}
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn('p-2', editor.isActive('heading', { level: 3 }) ? 'is-active bg-accent text-accent-foreground' : '')}
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        id={`${toolbarId}-bulletList`}
        variant="outline"
        size="sm"
        onClick={() => {
          if (!editor) return;
          console.log('[EditorToolbar] BulletList button clicked');
          console.log('[EditorToolbar] Can toggleBulletList?', editor.can().toggleBulletList());
          console.log('[EditorToolbar] HTML before toggleBulletList:', editor.getHTML());
          editor.chain().focus().toggleBulletList().run();
          console.log('[EditorToolbar] HTML after toggleBulletList:', editor.getHTML());
          console.log('[EditorToolbar] Is bulletList active?', editor.isActive('bulletList'));
        }}
        className={cn('p-2', editor.isActive('bulletList') ? 'is-active bg-accent text-accent-foreground' : '')}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        id={`${toolbarId}-orderedList`}
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn('p-2', editor.isActive('orderedList') ? 'is-active bg-accent text-accent-foreground' : '')}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      {/* Add more buttons for other functionalities as needed */}
    </div>
  );
};

export default EditorToolbar;
