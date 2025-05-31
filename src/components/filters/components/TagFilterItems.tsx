import React, { useCallback, memo } from 'react';
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

// Memoized sub-component for DropdownMenuCheckboxItem
interface MemoizedTagCheckboxItemProps {
  tag: Tag;
  isSelected: boolean;
  onToggleTag: (tagId: string) => void;
}

const MemoizedTagCheckboxItem = memo<MemoizedTagCheckboxItemProps>(({ tag, isSelected, onToggleTag }) => {
  const handleCheckedChange = useCallback(() => {
    onToggleTag(tag.id);
  }, [onToggleTag, tag.id]);

  return (
    <DropdownMenuCheckboxItem
      key={tag.id} // key is still good here, though React.memo handles reconciliation
      checked={isSelected}
      onCheckedChange={handleCheckedChange}
    >
      {tag.name}
      {tag.color && <span className="ml-2 h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />}
    </DropdownMenuCheckboxItem>
  );
});
MemoizedTagCheckboxItem.displayName = 'MemoizedTagCheckboxItem';

// Memoized sub-component for Button variant
interface MemoizedTagButtonProps {
  tag: Tag;
  isSelected: boolean;
  onToggleTag: (tagId: string) => void;
  size: "sm" | "default";
  className?: string; // Added className here as it's used in button styling
  fullWidth?: boolean;
  compact?: boolean;
}

const MemoizedTagButton = memo<MemoizedTagButtonProps>(({ tag, isSelected, onToggleTag, size, className, fullWidth, compact }) => {
  const handleClick = useCallback(() => {
    onToggleTag(tag.id);
  }, [onToggleTag, tag.id]);

  return (
    <Button
      key={tag.id} // key is still good here
      variant={isSelected ? "default" : "outline"}
      size={compact ? "xs" : size}
      onClick={handleClick}
      className={`rounded-full ${compact ? "h-6 text-xs py-0" : ""}`.trim()} // Ensure className from props is applied
    >
      {tag.name}
      {tag.color && <span className="ml-2 h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />}
    </Button>
  );
});
MemoizedTagButton.displayName = 'MemoizedTagButton';

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
            <MemoizedTagButton
              key={tag.id}
              tag={tag}
              isSelected={safeSelectedTags.includes(tag.id)}
              onToggleTag={onToggleTag} // Pass the original stable onToggleTag
              size={size}
              className={className} // Pass className to the memoized component
              fullWidth={fullWidth}
              compact={compact}
            />
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
          <MemoizedTagCheckboxItem
            key={tag.id}
            tag={tag}
            isSelected={safeSelectedTags.includes(tag.id)}
            onToggleTag={onToggleTag} // Pass the original stable onToggleTag
          />
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
