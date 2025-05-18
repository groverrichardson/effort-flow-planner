
import { Button } from "@/components/ui/button";
import { Plus, Settings, Users, Tags, Upload } from "lucide-react";
import MobileFilterSection from "../filters/components/MobileFilterSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageHeaderProps {
  onCreateTaskClick: () => void;
  onManageTagsClick: () => void;
  onManagePeopleClick: () => void;
  onBulkImportClick: () => void;
  filterProps: any;
}

const PageHeader = ({
  onCreateTaskClick,
  onManageTagsClick,
  onManagePeopleClick,
  onBulkImportClick,
  filterProps
}: PageHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-2 mb-6">
      {/* Main header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={onManageTagsClick}
              >
                <Tags className="h-4 w-4" />
                Tags
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={onManagePeopleClick}
              >
                <Users className="h-4 w-4" />
                People
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={onBulkImportClick}
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            </>
          )}
          
          <Button
            variant="default"
            size="sm"
            className="gap-1"
            onClick={onCreateTaskClick}
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
          
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              className="ml-2"
              onClick={onManageTagsClick}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile filter section */}
      {isMobile && <MobileFilterSection {...filterProps} />}
    </div>
  );
};

export default PageHeader;
