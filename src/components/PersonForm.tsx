
import { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PersonFormProps {
  person?: { id: string; name: string };
  onSave?: () => void;
  onCancel?: () => void;
}

const PersonForm = ({ person, onSave, onCancel }: PersonFormProps) => {
  const { addPerson, updatePerson, loading } = useTaskContext();
  const [personName, setPersonName] = useState(person?.name || '');
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
    
    if (!personName.trim()) {
      toast({
        title: "Error",
        description: "Person name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (person) {
        // Update existing person - passing full person object
        await updatePerson({ id: person.id, name: personName.trim() });
        toast({ title: "Person updated", description: `"${personName.trim()}" has been updated` });
      } else {
        // Add new person
        await addPerson(personName.trim());
        setPersonName('');
        toast({ title: "Person added", description: `"${personName.trim()}" has been added` });
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving person:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save person", 
        variant: "destructive" 
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input 
        ref={inputRef}
        value={personName} 
        onChange={(e) => setPersonName(e.target.value)}
        placeholder="Add or edit person..." 
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

export default PersonForm;
