
import { useState, KeyboardEvent, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';

interface NaturalLanguageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonLabel?: string;
  autoFocus?: boolean;
}

const NaturalLanguageInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "What would you like to get done today?", 
  buttonLabel = "Create Task",
  autoFocus = false
}: NaturalLanguageInputProps) => {
  const { tags, people } = useTaskContext();
  const [highlightedText, setHighlightedText] = useState<string>(value);
  const [suggestions, setSuggestions] = useState<{ type: string, items: { id: string, name: string }[] }>({ type: '', items: [] });
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow creating task with Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
      return;
    }
    
    // Handle escape key to close suggestions
    if (e.key === 'Escape' && suggestions.items.length > 0) {
      e.preventDefault();
      setSuggestions({ type: '', items: [] });
      return;
    }
  };

  // Process text for highlighting and suggestions
  useEffect(() => {
    highlightInputText();
    checkForSuggestions();
  }, [value, cursorPosition]);

  // Highlight special syntax in the input
  const highlightInputText = () => {
    if (!value) {
      setHighlightedText('');
      return;
    }

    // This would be implemented in a real app
    // For now, we'll use the input as is
    setHighlightedText(value);
  };

  // Check for potential auto-completion suggestions
  const checkForSuggestions = () => {
    if (!value || cursorPosition === 0) {
      setSuggestions({ type: '', items: [] });
      return;
    }

    // Get the word being typed
    const textBeforeCursor = value.substring(0, cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];

    // Check for tag suggestions
    if (currentWord.startsWith('#')) {
      const tagQuery = currentWord.substring(1).toLowerCase();
      if (tagQuery.length > 0) {
        const matchingTags = tags.filter(
          tag => tag.name.toLowerCase().includes(tagQuery)
        );
        setSuggestions({ type: 'tag', items: matchingTags });
        return;
      }
    }

    // Check for people suggestions
    if (currentWord.startsWith('@')) {
      const personQuery = currentWord.substring(1).toLowerCase();
      if (personQuery.length > 0) {
        const matchingPeople = people.filter(
          person => person.name.toLowerCase().includes(personQuery)
        );
        setSuggestions({ type: 'person', items: matchingPeople });
        return;
      }
    }

    // No suggestions
    setSuggestions({ type: '', items: [] });
  };

  // Apply a suggestion
  const applySuggestion = (suggestion: { id: string, name: string }) => {
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    const words = beforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];
    const prefix = lastWord.startsWith('#') ? '#' : '@';
    
    // Replace the current word with the suggestion
    const newText = beforeCursor.substring(0, beforeCursor.length - lastWord.length) + 
                     prefix + suggestion.name + ' ' + 
                     afterCursor;
    
    onChange(newText);
    setSuggestions({ type: '', items: [] });
  };

  // Track cursor position for suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="min-h-[60px] text-sm resize-none"
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart || 0)}
        />
        
        {/* Display suggestions if available */}
        {suggestions.items.length > 0 && (
          <div className="absolute z-10 bg-background border rounded-md shadow-md mt-1 w-full max-h-[150px] overflow-y-auto">
            {suggestions.items.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 hover:bg-accent cursor-pointer text-sm flex items-center"
                onClick={() => applySuggestion(item)}
              >
                {suggestions.type === 'tag' ? '#' : '@'}{item.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button 
          type="button" 
          size="sm"
          onClick={onSubmit}
          className="gap-1 w-full md:w-auto"
          disabled={!value.trim()}
        >
          <Send size={16} />
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};

export default NaturalLanguageInput;
