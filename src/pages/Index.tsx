import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import GroupForm from '@/components/GroupForm';
import PersonForm from '@/components/PersonForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Users,
  Tag,
  Menu,
  Settings,
  Edit,
  Trash
} from 'lucide-react';

const Index = () => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setCreateTaskOpen(true)}>
            <Plus size={16} className="mr-1" />
            New Task
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Manage</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setManageDialogOpen(true);
                setActiveTab('tags');
              }}>
                <Tag size={16} className="mr-2" />
                Tags & Areas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setManageDialogOpen(true);
                setActiveTab('people');
              }}>
                <Users size={16} className="mr-2" />
                People
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings size={16} className="mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TaskList />

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={() => setCreateTaskOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Manage Tags/People Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tags" className="flex items-center gap-1">
                <Tag size={16} />
                <span>Tags/Areas</span>
              </TabsTrigger>
              <TabsTrigger value="people" className="flex items-center gap-1">
                <Users size={16} />
                <span>People</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tags" className="mt-4">
              <ManageTags />
            </TabsContent>
            
            <TabsContent value="people" className="mt-4">
              <ManagePeople />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

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
                    <span className="truncate">{tag.name}</span>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingTag(tag)}
                        className="h-7 w-7"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700 h-7 w-7"
                        onClick={() => deleteTag(tag.id)}
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
          <p className="text-muted-foreground">No tags created yet</p>
        )}
      </div>
    </div>
  );
};

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

export default Index;
