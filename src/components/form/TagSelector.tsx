
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    setIsPopoverOpen(true);
  };

  // Handle input changes and filtering
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagSearch(e.target.value);
  };

  // Handle key press events for better UX
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagSearch.trim()) {
      e.preventDefault();
      handleAddNewTag();
    } else if (e.key === 'Escape') {
      setIsPopoverOpen(false);
    }
  };
  
  // Focus input when popover is opened
  useEffect(() => {
    if (isPopoverOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isPopoverOpen]);

  return (
    <div>
      <label className="block text-xs font-medium mb-1">Tags</label>
      <div className="flex flex-wrap gap-1 mb-1">
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
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search or add tags..."
              value={tagSearch}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
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
    </div>
  );
};

export default TagSelector;
