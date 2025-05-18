
import { useState, useEffect } from 'react';
import { Suggestion } from './TokenTypes';

interface UseSuggestionsProps {
  value: string;
  cursorPosition: number;
  people: { id: string; name: string }[];
  tags: { id: string; name: string }[];
}

export const useSuggestions = ({ 
  value,
  cursorPosition,
  people,
  tags
}: UseSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion>({ type: '', items: [] });
  const [popoverOpen, setPopoverOpen] = useState(false);

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

  // Apply a suggestion
  const applySuggestion = (suggestion: { id: string, name: string }, currentValue: string, currentPosition: number) => {
    const beforeCursor = currentValue.substring(0, currentPosition);
    const afterCursor = currentValue.substring(currentPosition);
    
    let newText = currentValue;
    
    // Find the @ or # symbol
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    
    if (lastAtIndex >= 0 && (lastHashIndex < 0 || lastAtIndex > lastHashIndex)) {
      // Count existing person mentions to enforce limit of 2
      const atCount = (currentValue.match(/@/g) || []).length;
      
      // If we have less than 2 mentions or we're editing an existing one
      if (atCount < 3) {
        // Replace from @ to cursor position with suggestion and add a space
        newText = beforeCursor.substring(0, lastAtIndex) + 
                '@' + suggestion.name + ' ' + 
                afterCursor;
      }
    } else if (lastHashIndex >= 0) {
      // Replace from # to cursor position with suggestion and add a space
      newText = beforeCursor.substring(0, lastHashIndex) + 
              '#' + suggestion.name + ' ' + 
              afterCursor;
    }
    
    setSuggestions({ type: '', items: [] });
    setPopoverOpen(false);
    
    return newText;
  };

  // Close suggestions when clicking outside (implemented in main component)
  const closeSuggestions = () => {
    setSuggestions({ type: '', items: [] });
    setPopoverOpen(false);
  };

  return {
    suggestions,
    popoverOpen,
    checkForSuggestions,
    applySuggestion,
    closeSuggestions
  };
};

export default useSuggestions;
