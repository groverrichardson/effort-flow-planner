
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Tag, User, LogOut, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import TaskFilters from '@/components/filters/TaskFilters';
import { useTaskContext } from '@/context/TaskContext';
import { Priority } from '@/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PageHeaderProps {
  onCreateTaskClick: () => void;
  onManageTagsClick: () => void;
  onManagePeopleClick: () => void;
  filterProps?: {
    selectedTags: string[];
    selectedPeople: string[];
    selectedPriorities: Priority[];
    filterByDueDate: string;
    filterByGoLive: boolean;
    onToggleTag: (tagId: string) => void;
    onTogglePerson: (personId: string) => void;
    onTogglePriority: (priority: Priority) => void;
    onSetFilterByDueDate: (value: string) => void;
    onSetFilterByGoLive: (value: boolean) => void;
    onResetFilters: () => void;
    viewingCompleted?: boolean;
    showTodaysTasks?: boolean;
    onShowAllActive?: () => void;
    onShowToday?: () => void;
    onShowCompleted?: () => void;
  };
}

const PageHeader = ({ 
  onCreateTaskClick, 
  onManageTagsClick,
  onManagePeopleClick,
  filterProps
}: PageHeaderProps) => {
  const isMobile = useIsMobile();
  const { signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { tags, people } = useTaskContext();
  
  const MobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col p-0">
        <ScrollArea className="h-full">
          <div className="p-6 flex flex-col gap-3 h-full">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-3 mt-4">
              <Button 
                onClick={() => {
                  onManageTagsClick();
                  setMobileMenuOpen(false);
                }} 
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Tag size={16} />
                Manage Tags
              </Button>
              
              <Button 
                onClick={() => {
                  onManagePeopleClick();
                  setMobileMenuOpen(false);
                }} 
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <User size={16} />
                Manage People
              </Button>

              <Button 
                onClick={() => {
                  onCreateTaskClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-2"
              >
                <PlusCircle size={16} />
                New Task
              </Button>
            </div>
            
            {isMobile && filterProps && (
              <>
                <Separator className="my-4" />
                
                <div className="flex-1 overflow-y-auto">
                  <TaskFilters
                    selectedTags={filterProps.selectedTags}
                    selectedPeople={filterProps.selectedPeople}
                    selectedPriorities={filterProps.selectedPriorities}
                    filterByDueDate={filterProps.filterByDueDate}
                    filterByGoLive={filterProps.filterByGoLive}
                    onToggleTag={filterProps.onToggleTag}
                    onTogglePerson={filterProps.onTogglePerson}
                    onTogglePriority={filterProps.onTogglePriority}
                    onSetFilterByDueDate={filterProps.onSetFilterByDueDate}
                    onSetFilterByGoLive={filterProps.onSetFilterByGoLive}
                    onResetFilters={filterProps.onResetFilters}
                    tags={tags}
                    people={people}
                    inMobileMenu={true}
                    viewingCompleted={filterProps.viewingCompleted}
                    showTodaysTasks={filterProps.showTodaysTasks}
                    onShowAllActive={filterProps.onShowAllActive}
                    onShowToday={filterProps.onShowToday}
                    onShowCompleted={filterProps.onShowCompleted}
                  />
                </div>
              </>
            )}
            
            <div className="mt-auto">
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
  
  return (
    <header className="mb-6 flex flex-col gap-2">
      {/* Desktop layout */}
      {!isMobile && (
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/df8e6029-f2da-4281-bd02-198de6b96226.png" 
              alt="Do Next Logo" 
              className="h-4"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={onManageTagsClick} 
              variant="outline" 
              size="sm"
              className="gap-1"
            >
              <Tag size={16} />
              Manage Tags
            </Button>
            
            <Button 
              onClick={onManagePeopleClick} 
              variant="outline" 
              size="sm"
              className="gap-1"
            >
              <User size={16} />
              Manage People
            </Button>
            
            <Button 
              onClick={onCreateTaskClick} 
              size="sm"
              className="gap-1"
            >
              <PlusCircle size={16} />
              New Task
            </Button>
            
            <Button
              onClick={() => signOut()}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      )}
      
      {/* Mobile layout - header and greeting in separate rows */}
      {isMobile && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/df8e6029-f2da-4281-bd02-198de6b96226.png" 
                alt="Do Next Logo" 
                className="h-4"
              />
            </div>
            <MobileMenu />
          </div>
          {user && (
            <p className="text-muted-foreground text-sm">
              Hi, {user.email?.split('@')[0]}
            </p>
          )}
        </>
      )}
    </header>
  );
};

export default PageHeader;
