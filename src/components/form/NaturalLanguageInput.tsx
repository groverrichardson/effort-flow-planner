
import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import { Badge } from '@/components/ui/badge';

interface NaturalLanguageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonLabel?: string;
  autoFocus?: boolean;
}

interface Token {
  type: 'text' | 'tag' | 'person' | 'priority' | 'date' | 'effort';
  value: string;
  original: string;
  start: number;
  end: number;
  color?: string;
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
  const [suggestions, setSuggestions] = useState<{ type: string, items: { id: string, name: string }[] }>({ type: '', items: [] });
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  // Process text for highlighting when value changes
  useEffect(() => {
    if (!value) {
      setHighlighted('');
      return;
    }
    
    let highlightedText = value;
    
    // Match tags (#tag)
    highlightedText = highlightedText.replace(
      /#(\w+)/g, 
      '<span class="bg-purple-100 text-purple-800 rounded-sm px-0.5">$&</span>'
    );
    
    // Match people (@person)
    highlightedText = highlightedText.replace(
      /@(\w+)/g, 
      '<span class="bg-blue-100 text-blue-800 rounded-sm px-0.5">$&</span>'
    );
    
    // Match priority keywords
    const priorityRegex = /\b(high priority|low priority|urgent|important)\b/gi;
    highlightedText = highlightedText.replace(
      priorityRegex,
      (match) => {
        const color = match.toLowerCase().includes('high') || match.toLowerCase().includes('urgent') 
          ? 'bg-red-100 text-red-800' 
          : 'bg-purple-100 text-purple-800';
        return `<span class="${color} rounded-sm px-0.5">${match}</span>`;
      }
    );
    
    // Match date keywords
    const dateRegex = /\b(tomorrow|today|due tomorrow|due today|due (on )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi;
    highlightedText = highlightedText.replace(
      dateRegex,
      '<span class="bg-orange-100 text-orange-800 rounded-sm px-0.5">$&</span>'
    );
    
    // Match effort keywords
    const effortRegex = /\b(5 minutes|15 minutes|30 minutes|half hour|couple hours|few hours|all day|one day|full day|this week|several days|couple weeks|few weeks|month|long term|big project)\b/gi;
    highlightedText = highlightedText.replace(
      effortRegex,
      '<span class="bg-blue-100 text-blue-800 rounded-sm px-0.5">$&</span>'
    );
    
    setHighlighted(highlightedText);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setSuggestions({ type: '', items: [] });
        setPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check for potential auto-completion suggestions
  const checkForSuggestions = () => {
    if (!value || cursorPosition === 0) {
      setSuggestions({ type: '', items: [] });
      setPopoverOpen(false);
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
        setPopoverOpen(true);
      } else if (currentWord === '#') {
        // Show all tags when just the # is typed
        setSuggestions({ type: 'tag', items: tags });
        setPopoverOpen(true);
      }
      return;
    }

    // Check for people suggestions
    if (currentWord.startsWith('@')) {
      const personQuery = currentWord.substring(1).toLowerCase();
      if (personQuery.length > 0) {
        const matchingPeople = people.filter(
          person => person.name.toLowerCase().includes(personQuery)
        );
        setSuggestions({ type: 'person', items: matchingPeople });
        setPopoverOpen(true);
      } else if (currentWord === '@') {
        // Show all people when just the @ is typed
        setSuggestions({ type: 'person', items: people });
        setPopoverOpen(true);
      }
      return;
    }

    // No suggestions
    setSuggestions({ type: '', items: [] });
    setPopoverOpen(false);
  };

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
      setPopoverOpen(false);
      return;
    }

    // Handle tab key to accept suggestion
    if (e.key === 'Tab' && suggestions.items.length > 0) {
      e.preventDefault();
      if (suggestions.items.length > 0) {
        applySuggestion(suggestions.items[0]);
      }
      return;
    }

    // Handle arrow keys for suggestion navigation
    if (suggestions.items.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        // Navigation logic would go here if we implement selection within suggestions
        return;
      }
    }
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
    setPopoverOpen(false);
  };

  // Track cursor position for suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCursorPosition(e.target.selectionStart || 0);
    checkForSuggestions();
  };

  // Update suggestions when cursor position changes
  const handleCursorPositionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition((e.target as HTMLTextAreaElement).selectionStart || 0);
    checkForSuggestions();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Regular textarea for input */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="min-h-[60px] text-sm resize-none"
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          onSelect={handleCursorPositionChange}
          onClick={handleCursorPositionChange}
        />
        
        {/* Highlighted preview - non-interactive */}
        {highlighted && (
          <div 
            className="pointer-events-none absolute inset-0 p-3 text-sm opacity-0"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        )}
        
        {/* Display suggestions as a dropdown */}
        {popoverOpen && suggestions.items.length > 0 && (
          <div 
            ref={suggestionRef}
            className="absolute z-50 bg-popover border rounded-md shadow-lg mt-1 w-60 max-h-[200px] overflow-y-auto"
            style={{
              top: 'calc(100% + 5px)',
              left: '10px',
            }}
          >
            <div className="px-3 py-2 border-b text-sm font-medium">
              {suggestions.type === 'tag' ? 'Tag Suggestions' : 'People Suggestions'}
            </div>
            <div className="p-2 max-h-[150px] overflow-y-auto">
              {suggestions.items.length === 0 ? (
                <div className="px-3 py-2.5 text-sm text-muted-foreground">
                  No {suggestions.type === 'tag' ? 'tags' : 'people'} found
                </div>
              ) : (
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
