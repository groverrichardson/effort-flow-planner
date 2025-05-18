
import { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface GroupFormProps {
  group?: { id: string; name: string };
  onSave?: () => void;
  onCancel?: () => void;
}

const GroupForm = ({ group, onSave, onCancel }: GroupFormProps) => {
  const { addTag, updateTag, loading } = useTaskContext();
  const [groupName, setGroupName] = useState(group?.name || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select all text when the form opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (group) {
        // Update existing group - passing full tag object
        await updateTag({ id: group.id, name: groupName.trim() });
        toast({ title: "Tag updated", description: `"${groupName.trim()}" has been updated` });
      } else {
        // Add new group
        await addTag(groupName.trim());
        setGroupName('');
        toast({ title: "Tag created", description: `"${groupName.trim()}" has been created` });
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save tag", 
        variant: "destructive" 
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input 
        ref={inputRef}
        value={groupName} 
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Add or edit tag/area..." 
        className="flex-1"
        disabled={loading}
      />
      
      <Button type="submit" variant="default" size="icon" className="h-10 w-10" disabled={loading}>
        <Save className="h-4 w-4" />
      </Button>
      
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          size="icon" 
          className="h-10 w-10"
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
};

export default GroupForm;
