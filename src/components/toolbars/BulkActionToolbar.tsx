import { Button } from '@/components/ui/button';
import { CheckCircle2, Trash2, Archive } from 'lucide-react'; // Added Archive
import { cn } from '@/lib/utils';

interface BulkActionToolbarProps {
    selectedTaskCount: number;
    onMarkSelectedComplete: () => void;
    onArchiveSelected: () => void; // Renamed from onDeleteSelected
    onDeleteSelectedPermanently: () => void;
}

const BulkActionToolbar = ({
    selectedTaskCount,
    onMarkSelectedComplete,
    onArchiveSelected,
    onDeleteSelectedPermanently,
}: BulkActionToolbarProps) => {
    return (
        <div className="flex items-center justify-start gap-2 px-1 rounded-md">
            <span className="text-sm text-muted-foreground mr-2">
                {selectedTaskCount} task(s) selected
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={onMarkSelectedComplete}
                className="h-8 flex items-center"
                disabled={selectedTaskCount === 0}>
                <CheckCircle2 size={16} className="mr-1" />
                <span>Mark Complete</span>
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onArchiveSelected}
                className="h-8 flex items-center"
                disabled={selectedTaskCount === 0}>
                <Archive size={16} className="mr-1" />
                <span>Archive Selected</span>
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSelectedPermanently}
                className="h-8 flex items-center"
                disabled={selectedTaskCount === 0}
                id="bulk-action-delete-selected-button">
                <Trash2 size={16} className="mr-1" />
                <span>Delete Selected</span>
            </Button>
        </div>
    );
};

export default BulkActionToolbar;
