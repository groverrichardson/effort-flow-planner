
import { Button } from "@/components/ui/button";
import { Menu, Plus, Settings, Users, Tags, Upload, LogOut } from "lucide-react";
import MobileFilterSection from "../filters/components/MobileFilterSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/f05941d8-1610-496d-8ed8-27adb9a6893a.png" alt="DoNext Logo" className={isMobile ? "h-6" : "h-8"} />
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
              
              <Button
                variant="default"
                size="sm"
                className="gap-1"
                onClick={onCreateTaskClick}
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </>
          )}
          
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col p-0 w-[280px]">
                <div className="flex-1 overflow-auto p-4">
                  <MobileFilterSection {...filterProps} />
                </div>
                <div className="border-t p-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 justify-start"
                    onClick={onManageTagsClick}
                  >
                    <Tags className="h-4 w-4" />
                    Manage Tags
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 justify-start"
                    onClick={onManagePeopleClick}
                  >
                    <Users className="h-4 w-4" />
                    Manage People
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 justify-start"
                    onClick={onBulkImportClick}
                  >
                    <Upload className="h-4 w-4" />
                    Import CSV
                  </Button>
                  
                  <Button
                    variant="default"
                    className="w-full gap-1 justify-start"
                    onClick={onCreateTaskClick}
                  >
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full gap-1 justify-start mt-4"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
      
      {/* Mobile filter section removed from here - now in the hamburger menu */}
    </div>
  );
};

export default PageHeader;
