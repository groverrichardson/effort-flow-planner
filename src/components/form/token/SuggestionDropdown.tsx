
import React from 'react';
import { Suggestion } from './TokenTypes';

interface SuggestionDropdownProps {
  popoverOpen: boolean;
  suggestions: Suggestion;
  applySuggestion: (suggestion: { id: string, name: string }) => void;
  selectedIndex: number;
}

const SuggestionDropdown: React.FC<SuggestionDropdownProps> = ({ 
  popoverOpen, 
  suggestions, 
  applySuggestion, 
  selectedIndex
}) => {
  if (!popoverOpen || suggestions.items.length === 0) return null;
  
  return (
    <div 
      className="absolute z-50 bg-popover border rounded-md shadow-lg mt-1 w-60 max-h-[200px] overflow-y-auto"
      style={{
        top: 'calc(100% + 5px)',
        left: '10px',
      }}
    >
      <div className="p-2 max-h-[150px] overflow-y-auto">
        {suggestions.items.length === 0 ? (
          <div className="px-3 py-2.5 text-sm text-muted-foreground">
            No {suggestions.type === 'tag' ? 'tags' : 'people'} found
          </div>
        ) : (
          suggestions.items.map((item, index) => (
            <div
              key={item.id}
              className={`px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm flex items-center border-b last:border-b-0 ${
                index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => applySuggestion(item)}
            >
              <span className="mr-2">{suggestions.type === 'tag' ? '#' : '@'}</span>
              {item.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionDropdown;
