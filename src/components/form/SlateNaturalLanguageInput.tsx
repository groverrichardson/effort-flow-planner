
import React, { useState, useCallback, useMemo, KeyboardEvent, useEffect, useRef } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Node as SlateNode, Range, Text, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';

interface SlateNaturalLanguageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonLabel?: string;
  autoFocus?: boolean;
}

// Define custom leaf rendering styles for different token types
const TOKEN_COLORS = {
  tag: 'rgba(155, 135, 245, 0.3)', // Light purple background
  person: 'rgba(14, 165, 233, 0.3)', // Light blue background
  priority: {
    high: 'rgba(234, 56, 76, 0.3)', // Light red background
    normal: 'rgba(126, 105, 171, 0.3)', // Light purple background
    low: 'rgba(126, 105, 171, 0.3)' // Light purple background
  },
  date: 'rgba(249, 115, 22, 0.3)', // Light orange background
  effort: 'rgba(30, 174, 219, 0.3)' // Light blue background
};

// Define interfaces for our custom types
interface CustomText {
  text: string;
  tag?: boolean;
  person?: boolean;
  priority?: boolean;
  priorityType?: 'high' | 'normal' | 'low';
  date?: boolean;
  effort?: boolean;
}

interface CustomElement {
  type: 'paragraph';
  children: CustomText[];
}

// Define types for custom editor
type CustomEditor = ReactEditor;

// Custom Range type for our decorations
type CustomRange = Range & {
  tag?: boolean;
  person?: boolean;
  priority?: boolean;
  priorityType?: 'high' | 'normal' | 'low';
  date?: boolean;
  effort?: boolean;
}

// Add custom types to Slate's type system
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const SlateNaturalLanguageInput: React.FC<SlateNaturalLanguageInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "What would you like to get done today?",
  buttonLabel = "Create Task",
  autoFocus = false
}) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withReact(createEditor()), []);
  
  const { tags, people } = useTaskContext();
  const [suggestions, setSuggestions] = useState<{ type: string, items: { id: string, name: string }[] }>({ type: '', items: [] });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Define our initial value based on props
  const initialValue: Descendant[] = useMemo(() => {
    return [
      {
        type: 'paragraph',
        children: value ? [{ text: value }] : [{ text: '' }]
      }
    ];
  }, [value]);

  // Keep track of editor value in local state
  const [editorValue, setEditorValue] = useState<Descendant[]>(initialValue);
  
  // Handle changes to the editor content
  const handleEditorChange = useCallback((newValue: Descendant[]) => {
    setEditorValue(newValue);
    
    // Extract plain text
    const plainText = newValue
      .map(n => SlateNode.string(n))
      .join('\n');
    
    onChange(plainText);
    
    // Check for suggestions based on cursor position
    checkForSuggestions();
  }, [onChange]);

  // Convert the slate nodes to plain text
  const serializeNodes = useCallback((nodes: Descendant[]): string => {
    return nodes.map(n => SlateNode.string(n)).join('\n');
  }, []);

  // Effect to update editor value when value prop changes
  useEffect(() => {
    const currentText = serializeNodes(editorValue);
    if (value !== currentText) {
      setEditorValue([
        {
          type: 'paragraph',
          children: value ? [{ text: value }] : [{ text: '' }]
        }
      ]);
    }
  }, [value, serializeNodes, editorValue]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setSuggestions({ type: '', items: [] });
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    // Submit task with Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
      return;
    }

    // Handle backspace/delete key
    if (e.key === 'Backspace' || e.key === 'Delete') {
      // Default behavior is fine - slate will handle deletion
      return;
    }
    
    // Close suggestions with Escape
    if (e.key === 'Escape' && suggestions.items.length > 0) {
      e.preventDefault();
      setSuggestions({ type: '', items: [] });
      setSearchQuery('');
      return;
    }
  }, [onSubmit, suggestions.items.length]);

  // Check for potential auto-completion suggestions
  const checkForSuggestions = useCallback(() => {
    const { selection } = editor;
    
    if (!selection || !Range.isCollapsed(selection)) {
      setSuggestions({ type: '', items: [] });
      setSearchQuery('');
      return;
    }

    const [start] = Range.edges(selection);
    const wordBefore = Editor.before(editor, start, { unit: 'word' });
    
    if (!wordBefore) return;
    
    const before = Editor.before(editor, wordBefore);
    const beforeRange = before ? { anchor: before, focus: wordBefore } : null;
    const beforeText = beforeRange ? Editor.string(editor, beforeRange) : '';
    
    const wordRange = { anchor: wordBefore, focus: start };
    const word = Editor.string(editor, wordRange);
    
    // Check for tag suggestions
    if (word.startsWith('#')) {
      const tagQuery = word.substring(1).toLowerCase();
      setSearchQuery(tagQuery);
      
      // Filter tags based on search query
      const filteredTags = tags.filter(tag => 
        tag.name.toLowerCase().includes(tagQuery.toLowerCase())
      );
      
      setSuggestions({ 
        type: 'tag', 
        items: filteredTags
      });
      return;
    }

    // Check for people suggestions
    if (word.startsWith('@')) {
      const personQuery = word.substring(1).toLowerCase();
      setSearchQuery(personQuery);
      
      // Filter people based on search query
      const filteredPeople = people.filter(person => 
        person.name.toLowerCase().includes(personQuery.toLowerCase())
      );
      
      setSuggestions({ 
        type: 'person', 
        items: filteredPeople
      });
      return;
    }

    // No suggestions
    setSuggestions({ type: '', items: [] });
    setSearchQuery('');
  }, [editor, people, tags]);

  // Apply a suggestion when clicked
  const applySuggestion = useCallback((suggestion: { id: string, name: string }) => {
    const { selection } = editor;
    if (!selection) return;

    // Get the word at current selection
    const [start] = Range.edges(selection);
    const wordBefore = Editor.before(editor, start, { unit: 'word' });
    
    if (!wordBefore) return;
    
    const wordRange = { anchor: wordBefore, focus: start };
    const word = Editor.string(editor, wordRange);
    
    // Determine the prefix
    const prefix = word.startsWith('#') ? '#' : '@';
    
    // Select the range, delete it, then insert the new text
    Transforms.select(editor, wordRange);
    Transforms.delete(editor);
    Transforms.insertText(editor, `${prefix}${suggestion.name} `);
    
    setSuggestions({ type: '', items: [] });
    setSearchQuery('');
  }, [editor]);
  
  // Decorate the editor content to highlight tokens
  const decorate = useCallback(([node, path]) => {
    const ranges: CustomRange[] = [];
    
    if (!Text.isText(node)) {
      return ranges;
    }
    
    const text = node.text;
    
    // Match tags (#tag) - Updated to support multi-word tags with spaces
    const tagRegex = /#([^\s#@]+(?:\s+[^\s#@]+)*)/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: tagMatch.index },
        focus: { path, offset: tagMatch.index + tagMatch[0].length },
        tag: true,
      } as CustomRange);
    }
    
    // Match people (@person) - Updated to support multi-word names with spaces
    const personRegex = /@([^\s#@]+(?:\s+[^\s#@]+)*)/g;
    let personMatch;
    while ((personMatch = personRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: personMatch.index },
        focus: { path, offset: personMatch.index + personMatch[0].length },
        person: true,
      } as CustomRange);
    }
    
    // Match priority keywords
    const highPriorityRegex = /\b(high priority|urgent|important)\b/gi;
    const lowPriorityRegex = /\b(low priority|not urgent|when you have time)\b/gi;
    
    let priorityMatch;
    while ((priorityMatch = highPriorityRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: priorityMatch.index },
        focus: { path, offset: priorityMatch.index + priorityMatch[0].length },
        priority: true,
        priorityType: 'high',
      } as CustomRange);
    }
    
    while ((priorityMatch = lowPriorityRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: priorityMatch.index },
        focus: { path, offset: priorityMatch.index + priorityMatch[0].length },
        priority: true,
        priorityType: 'low',
      } as CustomRange);
    }
    
    // Match date keywords
    const dateRegex = /\b(tomorrow|today|due tomorrow|due today|due (on )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi;
    let dateMatch;
    while ((dateMatch = dateRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: dateMatch.index },
        focus: { path, offset: dateMatch.index + dateMatch[0].length },
        date: true,
      } as CustomRange);
    }
    
    // Match effort keywords
    const effortRegex = /\b(5 minutes|15 minutes|30 minutes|half hour|couple hours|few hours|all day|one day|full day|this week|several days|couple weeks|few weeks|month|long term|big project)\b/gi;
    let effortMatch;
    while ((effortMatch = effortRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: effortMatch.index },
        focus: { path, offset: effortMatch.index + effortMatch[0].length },
        effort: true,
      } as CustomRange);
    }
    
    return ranges;
  }, []);
  
  // Render highlighted tokens in the editor
  const renderLeaf = useCallback(({ attributes, children, leaf }: { attributes: any, children: React.ReactNode, leaf: any }) => {
    let style: React.CSSProperties = {};
    
    if (leaf.tag) {
      style.backgroundColor = TOKEN_COLORS.tag;
      style.borderRadius = '2px';
    }
    
    if (leaf.person) {
      style.backgroundColor = TOKEN_COLORS.person;
      style.borderRadius = '2px';
    }
    
    if (leaf.priority) {
      const priorityColor = leaf.priorityType === 'high' ? 
        TOKEN_COLORS.priority.high : 
        TOKEN_COLORS.priority.normal;
      style.backgroundColor = priorityColor;
      style.borderRadius = '2px';
    }
    
    if (leaf.date) {
      style.backgroundColor = TOKEN_COLORS.date;
      style.borderRadius = '2px';
    }
    
    if (leaf.effort) {
      style.backgroundColor = TOKEN_COLORS.effort;
      style.borderRadius = '2px';
    }
    
    return <span {...attributes} style={style}>{children}</span>;
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Slate
          editor={editor}
          initialValue={editorValue}
          onChange={handleEditorChange}
        >
          <Editable
            className="min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            decorate={decorate}
            renderLeaf={renderLeaf}
          />
        </Slate>
        
        {/* Display suggestions as a popup modal if available */}
        {suggestions.items.length > 0 && (
          <div 
            ref={suggestionRef}
            className="absolute z-50 bg-popover border rounded-md shadow-lg mt-1 w-60 max-h-[200px] overflow-y-auto"
            style={{
              top: 'calc(100% + 5px)',
              left: '10px',
            }}
          >
            <div className="px-3 py-2 border-b text-sm font-medium">
              {suggestions.type === 'tag' ? `Tag Suggestions${searchQuery ? `: "${searchQuery}"` : ''}` : `People Suggestions${searchQuery ? `: "${searchQuery}"` : ''}`}
            </div>
            <div className="p-2 max-h-[150px] overflow-y-auto">
              {suggestions.items.length > 0 ? (
                suggestions.items.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-2.5 hover:bg-accent cursor-pointer text-sm flex items-center border-b last:border-b-0"
                    onClick={() => applySuggestion(item)}
                  >
                    <span className="mr-2">{suggestions.type === 'tag' ? '#' : '@'}</span>
                    {item.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No {suggestions.type === 'tag' ? 'tags' : 'people'} found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button 
          type="button" 
          size="sm"
          onClick={onSubmit}
          className="gap-1 w-full"
          disabled={!serializeNodes(editorValue).trim()}
        >
          <Send size={16} />
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};

export default SlateNaturalLanguageInput;
