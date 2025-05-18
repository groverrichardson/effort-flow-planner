
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import GroupForm from '@/components/GroupForm';

const ManageTags = () => {
  const { tags, deleteTag } = useTaskContext();
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Add Tag/Area</h3>
        <GroupForm />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Existing Tags/Areas</h3>
        {tags.length > 0 ? (
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-2 border rounded-md">
                {editingTag?.id === tag.id ? (
                  <GroupForm 
                    group={tag}
                    onSave={() => setEditingTag(null)}
                    onCancel={() => setEditingTag(null)}
                  />
                ) : (
                  <div className="flex w-full items-center justify-between">
                    <div 
                      className="truncate cursor-pointer flex-grow py-1 px-2 hover:bg-muted rounded"
                      onClick={() => setEditingTag(tag)}
                    >
                      {tag.name}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700 h-7 w-7"
                      onClick={() => deleteTag(tag.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No tags created yet</p>
        )}
      </div>
    </div>
  );
};

export default ManageTags;
