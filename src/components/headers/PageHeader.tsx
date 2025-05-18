
import { Button } from '@/components/ui/button';
import { Plus, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tag, Users, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageHeaderProps {
  onCreateTaskClick: () => void;
  onManageTagsClick: () => void;
  onManagePeopleClick: () => void;
}

const PageHeader = ({ onCreateTaskClick, onManageTagsClick, onManagePeopleClick }: PageHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-center gap-4 mb-8">
      <h1 className="text-2xl md:text-3xl font-bold">Task Manager</h1>
      <div className="flex items-center gap-2">
        <Button onClick={onCreateTaskClick} size="sm" className="md:hidden">
          <Plus size={16} />
        </Button>
        <Button onClick={onCreateTaskClick} className="hidden md:flex">
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
            <DropdownMenuItem onClick={onManageTagsClick}>
              <Tag size={16} className="mr-2" />
              Tags & Areas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onManagePeopleClick}>
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
  );
};

export default PageHeader;
