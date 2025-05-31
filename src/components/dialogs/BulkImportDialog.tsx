
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
      ) : null}
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Added sr-only DialogTitle for accessibility compliance */}
        <DialogTitle className="sr-only">Bulk Import Tasks</DialogTitle>
        <DialogHeader>
          {/* Changed original DialogTitle to a div, styles preserved */}
          <div className="text-lg font-semibold leading-none tracking-tight" id="bulk-import-dialog-title">Bulk Import Tasks</div>
          <DialogDescription id="bulk-import-dialog-description">
            Import multiple tasks at once using a CSV file.
          </DialogDescription>
        </DialogHeader>
        <CSVTaskImporter />
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportDialog;
