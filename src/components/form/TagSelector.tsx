
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, Plus } from 'lucide-react';
import { Tag } from '@/types';

interface TagSelectorProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onToggleTag: (tagId: string) => void;
  onAddNewTag: (tagName: string) => void;
}

const TagSelector = ({ 
  selectedTags, 
  availableTags, 
  onToggleTag, 
  onAddNewTag 
}: TagSelectorProps) => {
  const [tagSearch, setTagSearch] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const filteredTags = availableTags.filter(g => 
    g.name.toLowerCase().includes(tagSearch.toLowerCase()) && 
    !selectedTags.some(sg => sg.id === g.id)
  );

  const handleAddNewTag = () => {
    if (tagSearch.trim()) {
      onAddNewTag(tagSearch.trim());
      setTagSearch('');
    }
  };

  // Handle input focus and showing suggestions
  const handleInputFocus = () => {
    setForceOpen(true);
  };

  // Handle input changes and filtering
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagSearch(e.target.value);
    setForceOpen(true);
  };

  // Handle key press events for better UX
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagSearch.trim()) {
      e.preventDefault();
      handleAddNewTag();
    } else if (e.key === 'Escape') {
      setForceOpen(false);
      setIsPopoverOpen(false);
    } else if (e.key === 'Tab' && filteredTags.length > 0) {
      e.preventDefault();
      onToggleTag(filteredTags[0].id);
      setTagSearch('');
    }
  };
  
  // Focus input when popover is opened
  useEffect(() => {
    if (isPopoverOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isPopoverOpen]);

  // Handle clicks outside to close popover
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Don't close if clicking the input or the trigger
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setForceOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // When clicking the trigger, force the popover open
  const handleTriggerClick = () => {
    setForceOpen(true);
    // Give focus to the input after a small delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-1">Tags</label>
      {/* Popover for input and suggestions */}
      <Popover open={isPopoverOpen || forceOpen} onOpenChange={(open) => {
        setIsPopoverOpen(open);
        if (open) {
          setForceOpen(true);
        }
      }}>
        <PopoverTrigger asChild>
          {/* Added conditional margin-bottom to this div */}
          <div 
            className={`relative ${selectedTags.length > 0 ? 'mb-2' : ''}`} 
            ref={triggerRef} 
            onClick={handleTriggerClick}
          >
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search or add tags..."
              value={tagSearch}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="pl-8 h-10 text-xs"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="p-2 max-h-[150px] overflow-y-auto">
            {filteredTags.length > 0 ? (
              <div className="space-y-1">
                {filteredTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                    onClick={() => {
                      onToggleTag(tag.id);
                      setTagSearch('');
                    }}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            ) : (
              tagSearch.trim() !== '' && (
                <div 
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                  onClick={handleAddNewTag}
                >
                  <Plus size={14} />
                  Add "{tagSearch.trim()}"
                </div>
              )
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected tag pills - moved below the input and conditionally rendered */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map(tag => (
            <Badge key={tag.id} variant="outline" className="tag-tag text-xs py-0 h-6 flex items-center gap-1">
              {tag.name}
              <button 
                type="button" 
                onClick={() => onToggleTag(tag.id)}
                className="rounded-full hover:bg-accent ml-1 h-3 w-3 flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
