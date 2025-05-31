import { useState } from 'react'; // Added useState
import { useTheme } from '@/context/ThemeContext'; // Added for theme toggle
import { Sun, Moon } from 'lucide-react'; // Added for icons
import { Button } from '@/components/ui/button';
import {
    Menu,
    // Plus, // No longer used directly here
    // Settings, // No longer used directly here
    Users,
    Tags,
    Upload,
    // LogOut, // No longer used directly here
} from 'lucide-react';
// import MobileFilterSection from '../filters/components/MobileFilterSection'; // No longer used directly here
import Sidebar from '@/components/Sidebar'; // Added Sidebar import
import { useIsMobile } from '@/hooks/use-mobile';
import { Task } from '@/types'; // Import Task type
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface PageHeaderProps {
    onCreateTaskClick: () => void;
    onManageTagsClick: () => void;
    onManagePeopleClick: () => void;
    onBulkImportClick: () => void;
    filterProps: any;
    isBulkEditing: boolean; // Added for bulk edit state
    onToggleBulkEdit: () => void; // Added for toggling bulk edit
    allTasks: Task[]; // Added to pass all tasks to Sidebar for search modal
}

const PageHeader = ({
    onCreateTaskClick,
    onManageTagsClick,
    onManagePeopleClick,
    onBulkImportClick,
    filterProps,
    isBulkEditing, // Added
    onToggleBulkEdit, // Added
    allTasks, // Destructure allTasks
}: PageHeaderProps) => {
    const isMobile = useIsMobile();
    const [sheetOpen, setSheetOpen] = useState(false);
    const { theme, toggleTheme } = useTheme(); // Added for theme toggle

    const handleInteractOutside = (event: Event) => {
        const target = event.target as HTMLElement;
        // Check if the click target or its ancestor is the Windsurf toolbar
        // The class 'toolbar-container' is assumed for Windsurf's toolbar
        if (target.closest && typeof target.closest === 'function' && target.closest('.toolbar-container')) {
            event.preventDefault();
        }
    };

    return (
        <div className="flex flex-col gap-2 mb-6 px-4">
            {/* Main header */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <img
                        src="/lovable-uploads/61973109-0cfe-43a9-9f3e-e52a3d6f09a1.png"
                        alt="DoNext Logo"
                        className={isMobile ? 'h-6' : 'h-8'}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Desktop buttons removed, will be in Sidebar */}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        id="theme-toggle-button"
                        className="mr-2"
                    >
                        {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <div className="flex items-center gap-1 mr-2" id="flame-counter-container">
                        <img src="/green-flame.png" alt="Flame icon" id="flame-icon" className="h-6" />
                        <span id="flame-count-value" className="font-semibold">0</span>
                    </div>
                    {isMobile && (
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen} modal={false}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" id="mobile-menu-trigger">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="p-0 w-full bg-background" // Removed flex flex-col, sidebar handles its own layout
                                onInteractOutside={handleInteractOutside}
                                // style={{padding: 0}} // Ensure no padding from SheetContent itself if Sidebar manages it
                            >
                                <Sidebar 
                                    filterControls={filterProps}
                                    isOpen={true} // Sidebar content should be in 'open' state when sheet is open
                                    onToggle={() => setSheetOpen(false)} // Sidebar's internal toggle will close the sheet
                                    onManageTagsClick={() => { onManageTagsClick(); setSheetOpen(false); }}
                                    onManagePeopleClick={() => { onManagePeopleClick(); setSheetOpen(false); }}
                                    onBulkImportClick={() => { onBulkImportClick(); setSheetOpen(false); }}
                                    isBulkEditing={isBulkEditing} // Added
                                    onToggleBulkEdit={() => { onToggleBulkEdit(); setSheetOpen(false); }} // Added and closes sheet
                                    isMobileSheetView={true}
                                    allTasks={allTasks} // Pass allTasks to Sidebar
                                />
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>{' '}
            {/* End of main header items div */}
        </div>
    );
};

export default PageHeader;
