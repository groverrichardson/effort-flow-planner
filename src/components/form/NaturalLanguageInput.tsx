
import { useState, KeyboardEvent, useEffect, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Wand2 } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/integrations/supabase/client";
import { debounce } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

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

interface GeminiResponse {
  success: boolean;
  people: string[];
  tags: string[];
  priority: string | null;
  dueDate: string | null;
  effort: string | null;
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
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isGeminiProcessing, setIsGeminiProcessing] = useState(false);
  const [geminiEntities, setGeminiEntities] = useState<{people: string[], tags: string[]}>({people: [], tags: []});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  
  // Process text for tokenization and highlighting when value changes
  useEffect(() => {
    if (!value) {
      setTokens([]);
      return;
    }
    
    // Combine both regex highlighting and Gemini entities for best results
    const newTokens: Token[] = regexHighlighting(value, geminiEntities);
    setTokens(newTokens);
  }, [value, geminiEntities]);

  // Function to perform regex-based highlighting
  const regexHighlighting = (text: string, geminiEntities: {people: string[], tags: string[]}) => {
    const newTokens: Token[] = [];
    let currentPosition = 0;
    let remainingText = text;
    
    // First, handle Gemini entities for more accurate highlighting
    if (geminiEntities.people && geminiEntities.people.length > 0) {
      for (const personName of geminiEntities.people) {
        const personPattern = new RegExp(`@${personName}\\b`, 'i');
        const match = text.match(personPattern);
        
        if (match && match.index !== undefined) {
          const start = match.index;
          const end = start + match[0].length;
          
          // Add text before the entity if needed
          if (start > currentPosition) {
            newTokens.push({
              type: 'text',
              value: text.substring(currentPosition, start),
              original: text.substring(currentPosition, start),
              start: currentPosition,
              end: start
            });
          }
          
          // Add the entity token
          newTokens.push({
            type: 'person',
            value: match[0],
            original: match[0],
            start: start,
            end: end
          });
          
          currentPosition = end;
        }
      }
    }
    
    if (geminiEntities.tags && geminiEntities.tags.length > 0) {
      for (const tagName of geminiEntities.tags) {
        const tagPattern = new RegExp(`#${tagName}\\b`, 'i');
        const match = text.match(tagPattern);
        
        if (match && match.index !== undefined) {
          const start = match.index;
          const end = start + match[0].length;
          
          // Add text before the entity if needed
          if (start > currentPosition) {
            newTokens.push({
              type: 'text',
              value: text.substring(currentPosition, start),
              original: text.substring(currentPosition, start),
              start: currentPosition,
              end: start
            });
          }
          
          // Add the entity token
          newTokens.push({
            type: 'tag',
            value: match[0],
            original: match[0],
            start: start,
            end: end
          });
          
          currentPosition = end;
        }
      }
    }

    // Then match all other tokens with regex for the rest of the text
    const tokenPatterns = [
      // Tags (#tag)
      { 
        regex: /#([^\s#@]+)/g, 
        type: 'tag' 
      },
      // People (@person - improved to handle full names better)
      { 
        regex: /@([^\s#@]+(?:\s+[^\s#@]+)*)/g,
        type: 'person' 
      },
      // Priority keywords
      { 
        regex: /\b(high priority|normal priority|medium priority|low priority|lowest priority|urgent|important|not urgent|when you have time|whenever)\b/gi, 
        type: 'priority' 
      },
      // Date keywords
      { 
        regex: /\b(tomorrow|today|next week|next month|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}(st|nd|rd|th)?|\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?|due (tomorrow|today|next week|on|by|this) ?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)?|(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi, 
        type: 'date' 
      },
      // Effort keywords
      { 
        regex: /\b(5 minutes|15 minutes|30 minutes|half hour|couple hours|few hours|all day|one day|full day|this week|several days|couple weeks|few weeks|month|long term|big project)\b/gi, 
        type: 'effort' 
      }
    ];
    
    // Handle remaining text with regex patterns
    if (currentPosition < text.length) {
      const remainingText = text.substring(currentPosition);
      const remainingTokens = processTextWithRegex(remainingText, currentPosition, tokenPatterns);
      newTokens.push(...remainingTokens);
    }
    
    return newTokens;
  };
  
  // Helper function to process text with regex patterns
  const processTextWithRegex = (text: string, startOffset: number, patterns: {regex: RegExp, type: string}[]) => {
    const tokens: Token[] = [];
    const matches: {start: number, end: number, text: string, type: string}[] = [];
    
    // Find all matches for all patterns
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex);
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index + startOffset,
          end: match.index + match[0].length + startOffset,
          text: match[0],
          type: pattern.type
        });
      }
    });
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);
    
    // Process matches in order
    let lastEnd = startOffset;
    matches.forEach(match => {
      if (match.start > lastEnd) {
        // Add regular text token for text between matches
        tokens.push({
          type: 'text',
          value: text.substring(lastEnd - startOffset, match.start - startOffset),
          original: text.substring(lastEnd - startOffset, match.start - startOffset),
          start: lastEnd,
          end: match.start
        });
      }
      
      // Add the token
      tokens.push({
        type: match.type as Token['type'],
        value: match.text,
        original: match.text,
        start: match.start,
        end: match.end
      });
      
      lastEnd = match.end;
    });
    
    // Add any remaining text
    if (lastEnd < text.length + startOffset) {
      tokens.push({
        type: 'text',
        value: text.substring(lastEnd - startOffset),
        original: text.substring(lastEnd - startOffset),
        start: lastEnd,
        end: text.length + startOffset
      });
    }
    
    return tokens;
  };

  // Create a debounced version of the Gemini call
  const debouncedGeminiCall = useCallback(
    debounce(async (inputText: string) => {
      if (!inputText || inputText.length < 3) {
        return;
      }
      
      // If no @ or # symbols, don't bother calling Gemini during live typing
      if (!inputText.includes('@') && !inputText.includes('#')) {
        return;
      }
      
      try {
        setIsGeminiProcessing(true);
        console.log("Calling Gemini for live suggestions...");
        
        const { data, error } = await supabase.functions.invoke('parse-natural-language', {
          body: { 
            text: inputText,
            isLiveTyping: true 
          },
        });

        if (error) {
          console.error("Error calling Gemini during typing:", error);
          return;
        }
        
        if (data && data.success) {
          console.log("Received Gemini live suggestions:", data);
          setGeminiEntities({
            people: data.people || [],
            tags: data.tags || []
          });
        }
      } catch (err) {
        console.error("Exception in live Gemini processing:", err);
      } finally {
        setIsGeminiProcessing(false);
      }
    }, 500), // 500ms debounce delay
    []
  );

  // Trigger Gemini processing on specific events
  useEffect(() => {
    // Call when value changes and has @ or # symbol
    if (value && (value.includes('@') || value.includes('#'))) {
      debouncedGeminiCall(value);
    }
  }, [value, debouncedGeminiCall]);

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
    
    // Check for @ mentions and suggest people
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      // Count existing @ symbols to enforce the limit of 2 people
      const atCount = (value.match(/@/g) || []).length;
      
      // Only show suggestions if we have fewer than 2 @ symbols or if we're editing an existing one
      if (atCount <= 2) {
        // Get text from @ to cursor as the search query
        const query = textBeforeCursor.substring(lastAtIndex + 1).toLowerCase();
        
        // Show matching people or all people if just @ is typed
        if (query.length > 0) {
          const matchingPeople = people.filter(
            person => person.name.toLowerCase().includes(query)
          );
          setSuggestions({ type: 'person', items: matchingPeople });
          setPopoverOpen(matchingPeople.length > 0);
        } else {
          // When just @ is typed, show all people
          setSuggestions({ type: 'person', items: people });
          setPopoverOpen(people.length > 0);
        }
      }
      return;
    }
    
    // Check for tag suggestions
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    if (lastHashIndex !== -1) {
      const query = textBeforeCursor.substring(lastHashIndex + 1).toLowerCase();
      
      if (query.length > 0) {
        const matchingTags = tags.filter(
          tag => tag.name.toLowerCase().includes(query)
        );
        setSuggestions({ type: 'tag', items: matchingTags });
        setPopoverOpen(matchingTags.length > 0);
      } else {
        // Show all tags when just # is typed
        setSuggestions({ type: 'tag', items: tags });
        setPopoverOpen(tags.length > 0);
      }
      return;
    }

    // No suggestions if not typing a tag or person
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

    // Handle space key to trigger Gemini processing
    if (e.key === ' ' && value.includes('@')) {
      // This will be handled by the useEffect watching value changes
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
    
    // Find the @ or # symbol
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    
    if (lastAtIndex >= 0 && (lastHashIndex < 0 || lastAtIndex > lastHashIndex)) {
      // Count existing person mentions to enforce limit of 2
      const atCount = (value.match(/@/g) || []).length;
      
      // If we have less than 2 mentions or we're editing an existing one
      if (atCount < 3) {
        // Replace from @ to cursor position with suggestion and add a space
        const newText = beforeCursor.substring(0, lastAtIndex) + 
                      '@' + suggestion.name + ' ' + 
                      afterCursor;
        onChange(newText);
      }
    } else if (lastHashIndex >= 0) {
      // Replace from # to cursor position with suggestion and add a space
      const newText = beforeCursor.substring(0, lastHashIndex) + 
                    '#' + suggestion.name + ' ' + 
                    afterCursor;
      onChange(newText);
    }
    
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

  // Get token color based on type
  const getTokenColor = (type: Token['type']) => {
    switch (type) {
      case 'tag':
        return 'bg-purple-100 text-purple-800';
      case 'person':
        return 'bg-blue-100 text-blue-800';
      case 'priority':
        return 'bg-red-100 text-red-800';
      case 'date':
        return 'bg-orange-100 text-orange-800';
      case 'effort':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return '';
    }
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

        {/* AI-enhanced indicator */}
        {isGeminiProcessing && (
          <div className="absolute right-2 top-2 text-xs flex items-center gap-1 text-muted-foreground">
            <Wand2 size={14} className="animate-pulse" />
            <span>AI enhancing...</span>
          </div>
        )}
        
        {/* Tokenized display (shown below textarea for reference) */}
        {tokens.length > 0 && (
          <div 
            ref={displayRef}
            className="mt-2 text-sm rounded-md border border-transparent p-1 flex flex-wrap gap-1"
          >
            {tokens.map((token, index) => (
              token.type !== 'text' ? (
                <span 
                  key={index}
                  className={`rounded-sm px-1 ${getTokenColor(token.type)}`}
                >
                  {token.value}
                </span>
              ) : null
            ))}
          </div>
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
                    className="px-3 py-2 hover:bg-accent cursor-pointer text-sm flex items-center border-b last:border-b-0"
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
