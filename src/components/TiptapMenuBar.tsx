import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered, Quote, Minus, WrapText, Redo, Undo
} from 'lucide-react';

interface TiptapMenuBarProps {
  editor: Editor | null;
  idPrefix?: string; // Optional prefix for button IDs
}

const TiptapMenuBar: React.FC<TiptapMenuBarProps> = ({ editor, idPrefix = 'tiptap-menu' }) => {
  if (!editor) {
    return null;
  }

  const menuItems = [
    { id: `${idPrefix}-bold-button`, icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), label: 'Bold', disabled: !editor.can().chain().focus().toggleBold().run() },
    { id: `${idPrefix}-italic-button`, icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), label: 'Italic', disabled: !editor.can().chain().focus().toggleItalic().run() },
    { id: `${idPrefix}-strike-button`, icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), label: 'Strikethrough', disabled: !editor.can().chain().focus().toggleStrike().run() },
    { id: `${idPrefix}-code-button`, icon: Code, action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code'), label: 'Code', disabled: !editor.can().chain().focus().toggleCode().run() },
    { id: `${idPrefix}-h1-button`, icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), label: 'Heading 1', disabled: !editor.can().chain().focus().toggleHeading({ level: 1 }).run() },
    { id: `${idPrefix}-h2-button`, icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), label: 'Heading 2', disabled: !editor.can().chain().focus().toggleHeading({ level: 2 }).run() },
    { id: `${idPrefix}-h3-button`, icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }), label: 'Heading 3', disabled: !editor.can().chain().focus().toggleHeading({ level: 3 }).run() },
    { id: `${idPrefix}-paragraph-button`, icon: Pilcrow, action: () => editor.chain().focus().setParagraph().run(), isActive: editor.isActive('paragraph'), label: 'Paragraph', disabled: !editor.can().chain().focus().setParagraph().run() },
    { id: `${idPrefix}-bulletlist-button`, icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), label: 'Bullet List', disabled: !editor.can().chain().focus().toggleBulletList().run() },
    { id: `${idPrefix}-orderedlist-button`, icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), label: 'Ordered List', disabled: !editor.can().chain().focus().toggleOrderedList().run() },
    { id: `${idPrefix}-blockquote-button`, icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote'), label: 'Blockquote', disabled: !editor.can().chain().focus().toggleBlockquote().run() },
    { id: `${idPrefix}-hr-button`, icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), label: 'Horizontal Rule', disabled: !editor.can().chain().focus().setHorizontalRule().run() },
    { id: `${idPrefix}-hardbreak-button`, icon: WrapText, action: () => editor.chain().focus().setHardBreak().run(), label: 'Hard Break', disabled: !editor.can().chain().focus().setHardBreak().run() },
    { id: `${idPrefix}-undo-button`, icon: Undo, action: () => editor.chain().focus().undo().run(), label: 'Undo', disabled: !editor.can().chain().focus().undo().run() },
    { id: `${idPrefix}-redo-button`, icon: Redo, action: () => editor.chain().focus().redo().run(), label: 'Redo', disabled: !editor.can().chain().focus().redo().run() },
  ];

  return (
    <div id={`${idPrefix}-menubar`} className="flex flex-wrap gap-1 p-2 border border-input rounded-t-md bg-background">
      {menuItems.map(item => (
        <Button
          key={item.id}
          id={item.id}
          type="button" // Prevent form submission
          variant={item.isActive ? 'secondary' : 'ghost'}
          size="icon"
          onClick={item.action}
          disabled={item.disabled}
          aria-label={item.label}
          title={item.label}
          className="h-8 w-8 p-1.5"
        >
          <item.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
};

export default TiptapMenuBar;
