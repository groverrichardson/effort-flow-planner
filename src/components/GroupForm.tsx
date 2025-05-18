
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Tag } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface TagFormProps {
  group?: Tag | null;
  onSave?: (name: string) => void;
  onCancel?: () => void;
}

const TagForm = ({ group, onSave, onCancel }: TagFormProps) => {
  const { addTag, updateTag } = useTaskContext();
  const [name, setName] = useState('');
  const isEditing = !!group;

  useEffect(() => {
    if (group) {
      setName(group.name);
    } else {
      setName('');
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && group) {
      updateTag({ ...group, name });
      toast({ title: "Success", description: "Tag updated successfully" });
    } else if (onSave) {
      onSave(name);
    } else {
      addTag(name);
      toast({ title: "Success", description: "Tag created successfully" });
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tag name"
          className="flex-grow"
          autoFocus={isEditing}
        />
        <Button type="submit" size="sm">{isEditing ? 'Update' : 'Add'}</Button>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default TagForm;
