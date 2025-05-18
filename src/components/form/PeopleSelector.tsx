
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, Plus } from 'lucide-react';
import { Person } from '@/types';

interface PeopleSelectorProps {
  selectedPeople: Person[];
  availablePeople: Person[];
  onTogglePerson: (personId: string) => void;
  onAddNewPerson: (personName: string) => void;
}

const PeopleSelector = ({ 
  selectedPeople, 
  availablePeople, 
  onTogglePerson, 
  onAddNewPerson 
}: PeopleSelectorProps) => {
  const [personSearch, setPersonSearch] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const filteredPeople = availablePeople.filter(p => 
    p.name.toLowerCase().includes(personSearch.toLowerCase()) && 
    !selectedPeople.some(sp => sp.id === p.id)
  );

  const handleAddNewPerson = () => {
    if (personSearch.trim()) {
      onAddNewPerson(personSearch.trim());
      setPersonSearch('');
    }
  };

  // Handle input focus and showing suggestions
  const handleInputFocus = () => {
    setForceOpen(true);
  };

  // Handle input changes and filtering
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonSearch(e.target.value);
    setForceOpen(true);
  };

  // Handle key press events for better UX
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && personSearch.trim()) {
      e.preventDefault();
      handleAddNewPerson();
    } else if (e.key === 'Escape') {
      setForceOpen(false);
      setIsPopoverOpen(false);
    } else if (e.key === 'Tab' && filteredPeople.length > 0) {
      e.preventDefault();
      onTogglePerson(filteredPeople[0].id);
      setPersonSearch('');
    }
  };
  
  // Focus input when popover is opened
  useEffect(() => {
    if (isPopoverOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isPopoverOpen]);

  // Handle clicks outside to close popover
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Don't close if clicking the input or the trigger
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setForceOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // When clicking the trigger, force the popover open
  const handleTriggerClick = () => {
    setForceOpen(true);
    // Give focus to the input after a small delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-1">People</label>
      <div className="flex flex-wrap gap-1 mb-1">
        {selectedPeople.map(person => (
          <Badge key={person.id} variant="outline" className="people-tag text-xs py-0 h-6 flex items-center gap-1">
            {person.name}
            <button 
              type="button" 
              onClick={() => onTogglePerson(person.id)}
              className="rounded-full hover:bg-accent ml-1 h-3 w-3 flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </Badge>
        ))}
      </div>
      <Popover open={isPopoverOpen || forceOpen} onOpenChange={(open) => {
        setIsPopoverOpen(open);
        if (open) {
          setForceOpen(true);
        }
      }}>
        <PopoverTrigger asChild>
          <div className="relative" ref={triggerRef} onClick={handleTriggerClick}>
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search or add people..."
              value={personSearch}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="p-2 max-h-[150px] overflow-y-auto">
            {filteredPeople.length > 0 ? (
              <div className="space-y-1">
                {filteredPeople.map(person => (
                  <div
                    key={person.id}
                    className="flex items-center px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                    onClick={() => {
                      onTogglePerson(person.id);
                      setPersonSearch('');
                    }}
                  >
                    {person.name}
                  </div>
                ))}
              </div>
            ) : (
              personSearch.trim() !== '' && (
                <div 
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                  onClick={handleAddNewPerson}
                >
                  <Plus size={14} />
                  Add "{personSearch.trim()}"
                </div>
              )
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PeopleSelector;
