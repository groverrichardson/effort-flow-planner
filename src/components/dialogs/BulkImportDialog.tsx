
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CSVTaskImporter from "@/components/bulk-import/CSVTaskImporter";
import { UploadIcon } from "lucide-react";

interface BulkImportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const BulkImportDialog = ({ 
  open, 
  onOpenChange,
  trigger 
}: BulkImportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <UploadIcon className="h-4 w-4" />
            Import CSV
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Tasks</DialogTitle>
          <DialogDescription>
            Import multiple tasks at once using a CSV file.
          </DialogDescription>
        </DialogHeader>
        <CSVTaskImporter />
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportDialog;
