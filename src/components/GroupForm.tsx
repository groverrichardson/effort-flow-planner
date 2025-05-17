
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Group } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface GroupFormProps {
  group?: Group | null;
  onSave?: (name: string) => void;
  onCancel?: () => void;
}

const GroupForm = ({ group, onSave, onCancel }: GroupFormProps) => {
  const { addGroup, updateGroup } = useTaskContext();
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
        description: "Group name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && group) {
      updateGroup({ ...group, name });
      toast({ title: "Success", description: "Group updated successfully" });
    } else if (onSave) {
      onSave(name);
    } else {
      addGroup(name);
      toast({ title: "Success", description: "Group created successfully" });
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{isEditing ? 'Update Group' : 'Add Group'}</Button>
      </div>
    </form>
  );
};

export default GroupForm;
