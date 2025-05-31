import React, { useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import Fuse from 'fuse.js';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { X } from 'lucide-react'; // X is not used
import { Task } from '@/types';

interface FullScreenSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[]; // All tasks to search through
}

const FullScreenSearchModal: React.FC<FullScreenSearchModalProps> = ({ isOpen, onClose, tasks }): ReactNode => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  // inputRef is defined below useEffects as it's only used in one of them

  const fuseInstance = useMemo(() => {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return null;
    }
    try {
      const fuse = new Fuse(tasks, {
        keys: ['title', 'tags.name'],
        includeScore: true,
        threshold: 0.4,
      });
      
      return fuse;
    } catch (error) {
      console.error('Error initializing Fuse.js:', error);
      return null;
    }
  }, [tasks]);

  const inputRef = useRef<HTMLInputElement>(null); // Moved here

  useEffect(() => {
    
    if (isOpen) {
      setSearchQuery(''); // Reset search query when modal opens
      inputRef.current?.focus(); // Auto-focus input
    } else {
      setFilteredTasks([]); // Clear tasks when modal is closed
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) { // Don't run search logic if modal is closed
      return;
    }

    if (searchQuery.trim() === '') {
      const newFiltered = tasks && Array.isArray(tasks) ? tasks : [];
      setFilteredTasks(newFiltered);
      return;
    }

    if (!fuseInstance) {
      setFilteredTasks([]); // Fuse not ready, or tasks empty
      return;
    }
    const results = fuseInstance.search(searchQuery);
    
    setFilteredTasks(results.map(result => result.item));
  }, [searchQuery, tasks, fuseInstance, isOpen]); // Added isOpen to dependencies

  
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      id="fullscreen-search-modal" 
      className="fixed inset-0 z-50 bg-background flex flex-col p-4 pt-safe-top animate-slide-in-up transition-transform duration-300 ease-out"
    >
      <div className="flex items-center mb-4">
        <Input
          ref={inputRef}
          id="fullscreen-search-input"
          type="search"
          placeholder="Search tasks, notes, tags..."
          value={searchQuery}
          onChange={(e) => {
            
            setSearchQuery(e.target.value);
          }}
          className="flex-grow mr-2 h-10 text-lg"
          autoFocus
        />
        <Button variant="ghost" onClick={onClose} className="text-lg text-primary">
          Cancel
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {searchQuery.trim() !== '' && filteredTasks.length === 0 && (
          <div id="search-no-results" className="text-center text-muted-foreground mt-8">
            <p className="text-lg">No results found for "{searchQuery}".</p>
          </div>
        )}
        {filteredTasks.length > 0 && (
          <ul id="search-results-list" className="space-y-2">
            {filteredTasks.map(task => (
              <li 
                key={task.id}
                id={`search-result-task-${task.id}`}
                className="p-3 bg-card rounded-md shadow hover:bg-muted cursor-pointer"
                onClick={() => {
                  navigate(`/tasks/${task.id}`);
                  onClose();
                }} // Navigate and close modal
              >
                <h3 className="font-semibold text-card-foreground">{task.title}</h3>
                {/* Display tags or other relevant info here if desired */}
                {task.tags && task.tags.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate">
                    Tags: {task.tags.map(tag => tag.name).join(', ')}
                  </p>
                )}
                {/* Add more task details as needed, e.g., due date */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FullScreenSearchModal;
