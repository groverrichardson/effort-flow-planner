import React, { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTaskContext } from '@/context/TaskContext';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapMenuBar from '@/components/TiptapMenuBar';

interface NoteFormProps {
  onSubmit: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
  existingNote?: Note;
  initialTaskId?: string;
  editorRef?: React.MutableRefObject<Editor | null | undefined>; // For test access
}

const NoteForm: React.FC<NoteFormProps> = ({ 
  onSubmit, 
  onCancel, 
  existingNote, 
  initialTaskId, 
  editorRef 
}) => {
  const { tasks } = useTaskContext();
  const [name, setName] = useState('');
  const [body, setBody] = useState(existingNote?.body || ''); // Initial body for editor
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: body, // Use initial body state here
    onUpdate: ({ editor: currentEditor }) => {
      setBody(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[150px] border-x border-b border-input rounded-b-md p-2',
        id: 'note-body-tiptap-editor',
        'aria-label': 'Note Body',
      },
    },
  });

  // Effect to assign editor instance to the ref when editor is ready
  useEffect(() => {
    if (editor && editorRef) {
      editorRef.current = editor;
    }
    // Cleanup ref on editor destroy or component unmount if editorRef was set
    return () => {
      if (editorRef && editorRef.current === editor) {
        // editorRef.current = null; // Or undefined, depending on desired state
      }
    };
  }, [editor, editorRef]);

  // Effect to update editor content when existingNote changes
  useEffect(() => {
    if (existingNote) {
      setName(existingNote.name);
      // Only update editor if its content is different from existingNote.body
      if (editor && editor.getHTML() !== (existingNote.body || '')) {
        editor.commands.setContent(existingNote.body || '');
      }
      // Populate selectedTasks based on existingNote.taggedTaskIds
      if (existingNote.taggedTaskIds && tasks.length > 0) {
        const preSelectedTasks = tasks.filter(task => 
          existingNote.taggedTaskIds.includes(task.id)
        );
        setSelectedTasks(preSelectedTasks);
      }
    } else if (initialTaskId && tasks.length > 0) {
      const taskToPreselect = tasks.find(task => task.id === initialTaskId);
      if (taskToPreselect) {
        setName('');
        if (editor) editor.commands.setContent('');
        setSelectedTasks([taskToPreselect]);
      } else {
        setSelectedTasks([]);
      }
    } else {
      setName('');
      if (editor) editor.commands.setContent('');
      setSelectedTasks([]);
    }
  }, [existingNote, tasks, initialTaskId, editor]); // Added editor to dependency array

  // Search logic for tasks (remains the same)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(lowerSearchTerm) && 
      !selectedTasks.some(selected => selected.id === task.id)
    );
    setSearchResults(filtered);
  }, [searchTerm, tasks, selectedTasks]);

  const handleSelectTask = (task: Task) => {
    if (!selectedTasks.some(selected => selected.id === task.id)) {
      setSelectedTasks(prev => [...prev, task]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveSelectedTask = (taskId: string) => {
    setSelectedTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Note name is required.');
      return;
    }
    const finalTaggedTaskIds = selectedTasks.map(task => task.id);
    onSubmit({
      name,
      body, // body state is updated by editor's onUpdate
      taggedTaskIds: finalTaggedTaskIds,
      userId: 'placeholder-user-id', // TODO: Replace with actual user ID from auth
    });
    setName('');
    editor?.commands.setContent('');
    setSelectedTasks([]);
    setSearchTerm('');
  };

  // Ensure editor is destroyed on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <form onSubmit={handleSubmit} id="note-form" className="space-y-4">
      <div>
        <Label htmlFor="note-name-input" className="text-sm font-medium">
          Note Name <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="note-name-input" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter note name or title"
          required 
        />
      </div>
      <div>
        <Label htmlFor="note-body-tiptap-editor" className="text-sm font-medium">Note Body</Label>
        <TiptapMenuBar editor={editor} idPrefix={`note-form-tiptap-menu-${existingNote?.id || 'new'}`} />
        <EditorContent editor={editor} id="note-body-tiptap-editor-content-wrapper" />
      </div>
      
      {/* Task Tagging UI */}
      <div id="note-task-tagging-section" className="space-y-2">
        <Label htmlFor="task-search-input" className="text-sm font-medium">Tag Tasks (Optional)</Label>
        <Input 
          id="task-search-input"
          type="text"
          placeholder="Search for tasks to tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
        {/* Display Selected Tasks as Badges */}
        {selectedTasks.length > 0 && (
          <div id="selected-tasks-badges" className="flex flex-wrap gap-2 mb-2">
            {selectedTasks.map(task => (
              <Badge key={task.id} variant="secondary" className="flex items-center gap-1 text-xs group">
                {task.title}
                <button 
                  type="button" 
                  onClick={() => handleRemoveSelectedTask(task.id)}
                  className="ml-1 p-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-700 opacity-50 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${task.title} tag`}
                >
                  &#x2715; {/* Cross icon */}
                </button>
              </Badge>
            ))}
          </div>
        )}
        {/* Display Search Results */}
        {searchTerm.trim() && searchResults.length > 0 && (
          <div id="task-search-results-list" className="border rounded-md max-h-40 overflow-y-auto">
            {searchResults.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleSelectTask(task)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectTask(task)}
                id={`search-result-task-${task.id}`}
              >
                {task.title}
              </div>
            ))}
          </div>
        )}
        {searchTerm.trim() && !searchResults.length && tasks.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">No tasks found matching "{searchTerm}".</p>
        )}
      </div>

      {/* Submit button will likely be in DialogFooter, but can be here too */}
      {/* <Button type="submit">{existingNote ? 'Save Changes' : 'Create Note'}</Button> */}
    </form>
  );
};

export default NoteForm;
