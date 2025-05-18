
import React from 'react';
import { DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

interface TagFilterItemsProps {
  tags: { id: string; name: string }[];
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
}

export const TagFilterItems: React.FC<TagFilterItemsProps> = ({
  tags,
  selectedTags,
  onToggleTag
}) => {
  return (
    <>
      {tags.length > 0 ? (
        tags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag.id}
            checked={selectedTags.includes(tag.id)}
            onCheckedChange={() => onToggleTag(tag.id)}
          >
            {tag.name}
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
