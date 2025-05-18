
import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Wand2 } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import { Token } from './token/TokenTypes';
import { regexHighlighting } from './token/TokenProcessor';
import TokenHighlighter from './token/TokenHighlighter';
import SuggestionDropdown from './token/SuggestionDropdown';
import useGeminiHighlighting from './token/useGeminiHighlighting';
import useSuggestions from './token/useSuggestions';

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
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const { isGeminiProcessing, geminiEntities } = useGeminiHighlighting(value);
  const { 
    suggestions, 
    popoverOpen, 
    checkForSuggestions, 
    applySuggestion: applyRawSuggestion, 
    closeSuggestions 
  } = useSuggestions({ value, cursorPosition, people, tags });
  
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        closeSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeSuggestions]);

  // Apply a suggestion wrapper
  const applySuggestion = (suggestion: { id: string, name: string }) => {
    const newText = applyRawSuggestion(suggestion, value, cursorPosition);
    onChange(newText);
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
      closeSuggestions();
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

        {/* AI-enhanced indicator */}
        {isGeminiProcessing && (
          <div className="absolute right-2 top-2 text-xs flex items-center gap-1 text-muted-foreground">
            <Wand2 size={14} className="animate-pulse" />
            <span>AI enhancing...</span>
          </div>
        )}
        
        {/* Tokenized display (shown below textarea for reference) */}
        <div ref={displayRef}>
          <TokenHighlighter tokens={tokens} />
        </div>
        
        {/* Display suggestions as a dropdown */}
        <div ref={suggestionRef}>
          <SuggestionDropdown 
            popoverOpen={popoverOpen}
            suggestions={suggestions}
            applySuggestion={applySuggestion}
          />
        </div>
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
