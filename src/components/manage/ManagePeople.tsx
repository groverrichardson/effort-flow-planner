
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import PersonForm from '@/components/PersonForm';

const ManagePeople = () => {
  const { people, deletePerson } = useTaskContext();
  const [editingPerson, setEditingPerson] = useState<{ id: string; name: string } | null>(null);
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Add Person</h3>
        <PersonForm />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Existing People</h3>
        {people.length > 0 ? (
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {people.map(person => (
              <div key={person.id} className="flex items-center justify-between p-2 border rounded-md">
                {editingPerson?.id === person.id ? (
                  <PersonForm 
                    person={person}
                    onSave={() => setEditingPerson(null)}
                    onCancel={() => setEditingPerson(null)}
                  />
                ) : (
                  <div className="flex w-full items-center justify-between">
                    <span className="truncate">{person.name}</span>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingPerson(person)}
                        className="h-7 w-7"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700 h-7 w-7"
                        onClick={() => deletePerson(person.id)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No people added yet</p>
        )}
      </div>
    </div>
  );
};

export default ManagePeople;
