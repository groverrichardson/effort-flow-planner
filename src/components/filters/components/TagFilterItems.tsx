
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Tag } from '@/types';

interface TagFilterItemsProps {
  tags: Tag[];
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
  size?: "sm" | "default";
  className?: string;
  fullWidth?: boolean;
  compact?: boolean;
}

export const TagFilterItems: React.FC<TagFilterItemsProps> = ({
  tags = [],
  selectedTags = [],
  onToggleTag,
  size,
  className,
  fullWidth,
  compact = false
}) => {
  // Ensure tags and selectedTags are arrays even if undefined is passed
  const safeTagsArray = Array.isArray(tags) ? tags : [];
  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];
  
  // If we're rendering as buttons/badges (for mobile)
  if (size) {
    return (
      <div className={className}>
        {safeTagsArray.length > 0 ? (
          safeTagsArray.map((tag) => (
            <Button
              key={tag.id}
              variant={safeSelectedTags.includes(tag.id) ? "default" : "outline"}
              size={compact ? "xs" : size}
              onClick={() => onToggleTag(tag.id)}
              className={`${fullWidth ? "w-full justify-between" : ""} ${compact ? "h-6 text-xs py-0" : ""}`}
            >
              {tag.name}
              {tag.color && <span className="ml-2 h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />}
            </Button>
          ))
        ) : (
          <div className="text-muted-foreground text-xs">No tags available</div>
        )}
      </div>
    );
  }
  
  // Default dropdown menu items
  return (
    <>
      {safeTagsArray.length > 0 ? (
        safeTagsArray.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag.id}
            checked={safeSelectedTags.includes(tag.id)}
            onCheckedChange={() => onToggleTag(tag.id)}
          >
            {tag.name}
            {tag.color && <span className="ml-2 h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />}
          </DropdownMenuCheckboxItem>
        ))
      ) : (
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          No tags available
        </DropdownMenuLabel>
      )}
    </>
  );
};

export default TagFilterItems;
