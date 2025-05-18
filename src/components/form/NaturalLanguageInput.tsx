
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
  const [tokens, setTokens] = useState<Token[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  
  // Process tokens when value changes
  useEffect(() => {
    processTokens();
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setSuggestions({ type: '', items: [] });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Process the input text into tokens
  const processTokens = () => {
    if (!value) {
      setTokens([]);
      return;
    }

    const newTokens: Token[] = [];
    
    // Match tags (#tag)
    const tagRegex = /#(\w+)/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(value)) !== null) {
      newTokens.push({
        type: 'tag',
        value: tagMatch[1],
        original: tagMatch[0],
        start: tagMatch.index,
        end: tagMatch.index + tagMatch[0].length,
        color: 'rgba(155, 135, 245, 0.3)' // Light purple background
      });
    }
    
    // Match people (@person)
    const personRegex = /@(\w+)/g;
    let personMatch;
    while ((personMatch = personRegex.exec(value)) !== null) {
      newTokens.push({
        type: 'person',
        value: personMatch[1],
        original: personMatch[0],
        start: personMatch.index,
        end: personMatch.index + personMatch[0].length,
        color: 'rgba(14, 165, 233, 0.3)' // Light blue background
      });
    }
    
    // Match priority keywords with no overlap
    const priorityRegex = /\b(high priority|low priority|urgent|important)\b/gi;
    let priorityMatch;
    while ((priorityMatch = priorityRegex.exec(value)) !== null) {
      const start = priorityMatch.index;
      const end = start + priorityMatch[0].length;
      
      // Check if this match overlaps with any existing token
      const overlaps = newTokens.some(token => 
        (start >= token.start && start < token.end) || 
        (end > token.start && end <= token.end)
      );
      
      if (!overlaps) {
        newTokens.push({
          type: 'priority',
          value: priorityMatch[1].toLowerCase(),
          original: priorityMatch[0],
          start,
          end,
          color: priorityMatch[0].toLowerCase().includes('high') || priorityMatch[0].toLowerCase().includes('urgent') 
            ? 'rgba(234, 56, 76, 0.3)' // Light red background
            : 'rgba(126, 105, 171, 0.3)' // Light purple background
        });
      }
    }
    
    // Match date keywords with no overlap
    const dateRegex = /\b(tomorrow|today|due tomorrow|due today|due (on )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi;
    let dateMatch;
    while ((dateMatch = dateRegex.exec(value)) !== null) {
      const start = dateMatch.index;
      const end = start + dateMatch[0].length;
      
      // Check if this match overlaps with any existing token
      const overlaps = newTokens.some(token => 
        (start >= token.start && start < token.end) || 
        (end > token.start && end <= token.end)
      );
      
      if (!overlaps) {
        newTokens.push({
          type: 'date',
          value: dateMatch[0].toLowerCase(),
          original: dateMatch[0],
          start,
          end,
          color: 'rgba(249, 115, 22, 0.3)' // Light orange background
        });
      }
    }
    
    // Match effort keywords with no overlap
    const effortRegex = /\b(5 minutes|15 minutes|30 minutes|half hour|couple hours|few hours|all day|one day|full day|this week|several days|couple weeks|few weeks|month|long term|big project)\b/gi;
    let effortMatch;
    while ((effortMatch = effortRegex.exec(value)) !== null) {
      const start = effortMatch.index;
      const end = start + effortMatch[0].length;
      
      // Check if this match overlaps with any existing token
      const overlaps = newTokens.some(token => 
        (start >= token.start && start < token.end) || 
        (end > token.start && end <= token.end)
      );
      
      if (!overlaps) {
        newTokens.push({
          type: 'effort',
          value: effortMatch[0].toLowerCase(),
          original: effortMatch[0],
          start,
          end,
          color: 'rgba(30, 174, 219, 0.3)' // Light blue background
        });
      }
    }
    
    setTokens(newTokens);
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
      } else if (currentWord === '#') {
        // Show all tags when just the # is typed
        setSuggestions({ type: 'tag', items: tags });
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
      } else if (currentWord === '@') {
        // Show all people when just the @ is typed
        setSuggestions({ type: 'person', items: people });
      }
      return;
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

  // Create highlighted content with spans
  const renderHighlightedContent = () => {
    if (!value) return null;
    
    // Sort tokens by start position to process them in order
    const sortedTokens = [...tokens].sort((a, b) => a.start - b.start);
    
    let result = [];
    let lastIndex = 0;
    
    for (const token of sortedTokens) {
      // Add text before the token
      if (token.start > lastIndex) {
        result.push(
          <span key={`text-${lastIndex}`}>
            {value.substring(lastIndex, token.start)}
          </span>
        );
      }
      
      // Add the highlighted token
      result.push(
        <span 
          key={`token-${token.start}`} 
          style={{ 
            backgroundColor: token.color,
            borderRadius: '2px',
          }}
        >
          {value.substring(token.start, token.end)}
        </span>
      );
      
      lastIndex = token.end;
    }
    
    // Add remaining text after last token
    if (lastIndex < value.length) {
      result.push(
        <span key={`text-end`}>
          {value.substring(lastIndex)}
        </span>
      );
    }
    
    // Always add a space at the end to ensure proper cursor positioning
    result.push(
      <span key="space-at-end">&nbsp;</span>
    );
    
    return result;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div className="relative">
          {/* Background highlighting layer */}
          <div 
            ref={highlightRef}
            className="absolute inset-0 p-2.5 whitespace-pre-wrap break-words pointer-events-none"
            style={{ 
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: '1.5rem'
            }}
          >
            {renderHighlightedContent()}
          </div>
          
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="min-h-[60px] text-sm resize-none bg-transparent text-transparent caret-black"
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            onSelect={handleCursorPositionChange}
            onClick={handleCursorPositionChange}
            style={{ caretColor: 'black' }}
          />
        </div>
        
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
              {suggestions.type === 'tag' ? 'Tag Suggestions' : 'People Suggestions'}
            </div>
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
