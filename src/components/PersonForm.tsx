
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface PersonFormProps {
  person?: Person | null;
  onSave?: (name: string) => void;
  onCancel?: () => void;
}

const PersonForm = ({ person, onSave, onCancel }: PersonFormProps) => {
  const { addPerson, updatePerson } = useTaskContext();
  const [name, setName] = useState('');
  const isEditing = !!person;

  useEffect(() => {
    if (person) {
      setName(person.name);
    } else {
      setName('');
    }
  }, [person]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Person name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && person) {
      updatePerson({ ...person, name });
      toast({ title: "Success", description: "Person updated successfully" });
    } else if (onSave) {
      onSave(name);
    } else {
      addPerson(name);
      toast({ title: "Success", description: "Person added successfully" });
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Person name"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{isEditing ? 'Update Person' : 'Add Person'}</Button>
      </div>
    </form>
  );
};

export default PersonForm;
