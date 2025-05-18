
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
  
  // Process tokens when value changes
  useEffect(() => {
    processTokens();
  }, [value]);

  // Process the input text into tokens
  const processTokens = () => {
    if (!value) {
      setTokens([]);
      return;
    }

    // Start with a simple word-by-word analysis
    const words = value.split(/\s+/);
    const newTokens: Token[] = [];
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check for tags
      if (word.startsWith('#')) {
        if (currentText) {
          newTokens.push({ type: 'text', value: currentText, original: currentText });
          currentText = '';
        }
        newTokens.push({ 
          type: 'tag', 
          value: word.substring(1), 
          original: word,
          color: '#9b87f5'  // Purple
        });
        continue;
      }
      
      // Check for people
      if (word.startsWith('@')) {
        if (currentText) {
          newTokens.push({ type: 'text', value: currentText, original: currentText });
          currentText = '';
        }
        newTokens.push({ 
          type: 'person', 
          value: word.substring(1), 
          original: word,
          color: '#0EA5E9'  // Ocean blue
        });
        continue;
      }

      // Check for priority keywords
      if (i < words.length - 1 && 
          ((word.toLowerCase() === 'high' && words[i+1].toLowerCase() === 'priority') || 
           (word.toLowerCase() === 'low' && words[i+1].toLowerCase() === 'priority'))) {
        if (currentText) {
          newTokens.push({ type: 'text', value: currentText, original: currentText });
          currentText = '';
        }
        
        const priority = word.toLowerCase();
        newTokens.push({ 
          type: 'priority', 
          value: `${priority} priority`, 
          original: `${priority} priority`,
          color: priority === 'high' ? '#ea384c' : '#7E69AB'  // Red for high, Purple for low
        });
        i++; // Skip the "priority" word
        continue;
      }
      
      // Check for date keywords
      if (['tomorrow', 'today'].includes(word.toLowerCase())) {
        if (currentText) {
          newTokens.push({ type: 'text', value: currentText, original: currentText });
          currentText = '';
        }
        newTokens.push({ 
          type: 'date', 
          value: word.toLowerCase(), 
          original: word,
          color: '#F97316'  // Bright orange
        });
        continue;
      }
      
      if (word.toLowerCase() === 'due' && i < words.length - 1) {
        const nextWord = words[i+1].toLowerCase();
        if (['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(nextWord)) {
          if (currentText) {
            newTokens.push({ type: 'text', value: currentText, original: currentText });
            currentText = '';
          }
          newTokens.push({ 
            type: 'date', 
            value: `due ${nextWord}`, 
            original: `due ${words[i]} ${words[i+1]}`,
            color: '#F97316'  // Bright orange
          });
          i++; // Skip the day word
          continue;
        }
      }

      // Time effort indicators
      if (['quick', 'few minutes', '5 minutes', '30 minutes', 'half hour', 'short', 'couple hours', 'few hours',
           'all day', 'one day', 'full day', 'this week', 'several days', 'couple weeks', 'few weeks',
           'month', 'long term', 'big project'].some(phrase => word.toLowerCase().includes(phrase))) {
        if (currentText) {
          newTokens.push({ type: 'text', value: currentText, original: currentText });
          currentText = '';
        }
        newTokens.push({ 
          type: 'effort', 
          value: word, 
          original: word,
          color: '#1EAEDB'  // Bright blue
        });
        continue;
      }

      // If nothing special, add to current text buffer
      currentText += (currentText ? ' ' : '') + word;
    }
    
    // Add any remaining text
    if (currentText) {
      newTokens.push({ type: 'text', value: currentText, original: currentText });
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
        
        {/* Visualization of parsed tokens with improved styling */}
        {tokens.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-2.5 flex flex-wrap gap-0 items-start overflow-hidden">
            <div className="inline whitespace-normal break-words">
              {tokens.map((token, index) => (
                token.type === 'text' ? (
                  <span key={index} className="text-transparent inline">
                    {token.value}
                  </span>
                ) : (
                  <span 
                    key={index} 
                    className="inline-block rounded-md px-1.5 py-0 text-xs font-medium text-white leading-tight"
                    style={{ 
                      backgroundColor: token.color,
                      height: '1rem', // Make pills same as text height
                      lineHeight: '1rem',
                      margin: '0 1px',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    {token.value}
                  </span>
                )
              ))}
            </div>
          </div>
        )}
        
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
