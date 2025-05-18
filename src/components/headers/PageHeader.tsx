
import { Button } from '@/components/ui/button';
import { PlusCircle, Tag, User, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';

interface PageHeaderProps {
  onCreateTaskClick: () => void;
  onManageTagsClick: () => void;
  onManagePeopleClick: () => void;
}

const PageHeader = ({ 
  onCreateTaskClick, 
  onManageTagsClick,
  onManagePeopleClick
}: PageHeaderProps) => {
  const isMobile = useIsMobile();
  const { signOut, user } = useAuth();
  
  return (
    <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
        {user && (
          <p className="text-muted-foreground text-sm">
            Signed in as {user.email}
          </p>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          onClick={onManageTagsClick} 
          variant="outline" 
          size="sm"
          className="gap-1"
        >
          <Tag size={16} />
          {!isMobile && "Manage Tags"}
        </Button>
        
        <Button 
          onClick={onManagePeopleClick} 
          variant="outline" 
          size="sm"
          className="gap-1"
        >
          <User size={16} />
          {!isMobile && "Manage People"}
        </Button>
        
        <Button 
          onClick={onCreateTaskClick} 
          size="sm"
          className="gap-1"
        >
          <PlusCircle size={16} />
          {!isMobile && "New Task"}
        </Button>
        
        <Button
          onClick={() => signOut()}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <LogOut size={16} />
          {!isMobile && "Sign Out"}
        </Button>
      </div>
    </header>
  );
};

export default PageHeader;
