
import { useState, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef } from 'react';
import { EditorView } from '@tiptap/pm/view'; // For Tiptap's handleKeyDown
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
  id?: string; // Added id prop
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonLabel?: string;
  autoFocus?: boolean;
}

const NaturalLanguageInput = ({ 
  id, // Destructure id
  value, 
  onChange, 
  onSubmit, 
  placeholder = "What would you like to get done today?", 
  buttonLabel = "Create Task",
  autoFocus = false
}: NaturalLanguageInputProps) => {
  const { tags, people } = useTaskContext();
  const [cursorPosition, setCursorPosition] = useState<number>(0); // Keep for basic input handling if needed
  const [tokens, setTokens] = useState<Token[]>([]);
    const suggestionRef = useRef<HTMLDivElement>(null); // Related to SuggestionDropdown
  const displayRef = useRef<HTMLDivElement>(null); // Related to TokenHighlighter
  
  // Custom hooks
  const { isGeminiProcessing, geminiEntities } = useGeminiHighlighting(value);
  const { 
    suggestions, 
    popoverOpen, 
    selectedIndex,
    checkForSuggestions, 
    applySuggestion: applyRawSuggestion, 
    closeSuggestions, 
    selectNextSuggestion,
    selectPreviousSuggestion
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
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    // Known issue: including geminiEntities in deps causes Vitest worker crash
  }, [value]);

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
  const handleKeyDown = (view: EditorView, e: KeyboardEvent): boolean | void => {
    console.log(`NaturalLanguageInput.handleKeyDown - Key: ${e.key}, DefaultPrevented: ${e.defaultPrevented}, PopoverOpen: ${popoverOpen}`);


    // Check for Ctrl+Enter or Cmd+Enter for submission
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) { // Only submit if there's text
        onSubmit();
      }
      console.log('NaturalLanguageInput.handleKeyDown - Returning (void) from Ctrl/Cmd+Enter');
      return; // Prevent further processing like suggestion handling
    }

    if (e.key === 'Escape' && popoverOpen) {
      e.preventDefault();
      closeSuggestions();
      console.log('NaturalLanguageInput.handleKeyDown - Returning (void) from Escape');
      return;
    }

    if (popoverOpen && suggestions.items.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectNextSuggestion();
        console.log('NaturalLanguageInput.handleKeyDown - Returning (void) from ArrowDown');
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectPreviousSuggestion();
        console.log('NaturalLanguageInput.handleKeyDown - Returning (void) from ArrowUp');
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const itemToApply = selectedIndex !== -1 && suggestions.items[selectedIndex]
          ? suggestions.items[selectedIndex]
          : suggestions.items[0]; 
        
        if (itemToApply) {
          closeSuggestions();
          applySuggestion(itemToApply);
        }
        console.log('NaturalLanguageInput.handleKeyDown - Returning (void) from Tab');
        return;
      }
    }
    // If no conditions met, Tiptap expects 'false' or 'undefined' to continue processing.
    // This function implicitly returns 'undefined'.
    console.log(`NaturalLanguageInput.handleKeyDown - Key: ${e.key} - No specific handler, returning undefined (allowing default Tiptap behavior)`);
  };

  const handleInputChange = (htmlValue: string) => {
    // Convert HTML to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlValue;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    onChange(plainText); // Call the passed onChange prop with plain text

    // Keep suggestion logic based on plain text if that's the intent
    // or adjust if it needs raw HTML or Tiptap editor state.
    // For now, assuming plainText is what drives suggestions.
    const newCursorPosition = plainText.length; // Cursor position in plain text
    setCursorPosition(newCursorPosition);
    checkForSuggestions(plainText, newCursorPosition);
  };

  const handleCursorPositionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const newCursorPosition = target.selectionStart || 0;
    setCursorPosition(newCursorPosition);
    checkForSuggestions(target.value, newCursorPosition);
  };

  return (
    <div id={id} className="flex flex-col gap-2">
      <div className="text-xs flex items-center gap-1 text-muted-foreground self-end mb-1 min-h-[14px]">
        {isGeminiProcessing ? (
          <>
            <Wand2 size={14} className="animate-pulse" />
            <span>AI enhancing...</span>
          </>
        ) : (
          <span className="invisible">&nbsp;</span> /* Placeholder to maintain height */
        )}
      </div>
      <div className="relative">
        <Textarea showToolbar={false}
                    value={value}
          onChange={(html: string) => handleInputChange(html)}
          onTiptapKeyDown={handleKeyDown} // Pass the Tiptap-specific keydown handler
          placeholder={placeholder}
          className="min-h-[60px] text-base resize-none"
          autoFocus={autoFocus}
          data-testid="tiptap-editor" // Added data-testid
        />
        
        <div ref={displayRef}>
          <TokenHighlighter tokens={tokens} />
        </div>
        
        <div ref={suggestionRef}>
          <SuggestionDropdown 
            popoverOpen={popoverOpen}
            suggestions={suggestions}
            applySuggestion={applySuggestion}
            selectedIndex={selectedIndex}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button 
          type="button" 
          size="sm"
          onClick={() => onSubmit()} // Call onSubmit prop correctly
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
