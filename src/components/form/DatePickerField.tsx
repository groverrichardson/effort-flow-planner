import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

interface DatePickerFieldProps {
    label?: string;
    date?: Date;
    setDate: (date: Date | undefined) => void;
    enableTime?: boolean;
    originalDatePhrase?: string | null;
    clearOriginalDatePhrase?: () => void;
    idPrefix?: string;
    description?: string;
    "aria-label"?: string;
}

const DatePickerField = ({ 
    label, 
    date, 
    setDate, 
    enableTime,
    originalDatePhrase,
    clearOriginalDatePhrase,
    idPrefix = "date-picker",
    description,
    "aria-label": ariaLabel
}: DatePickerFieldProps) => {
    const [open, setOpen] = useState(false);

    // Handle date selection and auto-close
    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setOpen(false); // Auto-close the popover after selection
        // Clear original date phrase if one exists and handler provided
        if (originalDatePhrase && clearOriginalDatePhrase) {
            clearOriginalDatePhrase();
        }
    };

    return (
        <div>
            {label && (
                <Label 
                    htmlFor={`${idPrefix}-trigger`} 
                    className="block text-sm font-medium mb-1"
                    id={`${idPrefix}-label`}
                >
                    {label}
                </Label>
            )}
            {description && (
                <p className="text-xs text-muted-foreground mb-2" id={`${idPrefix}-description`}>
                    {description}
                </p>
            )}
            {originalDatePhrase && (
                <div className="text-xs bg-muted/50 p-1 rounded mb-2 flex">
                    <span className="flex-grow">Interpreted from: "{originalDatePhrase}"</span>
                    {clearOriginalDatePhrase && (
                        <button 
                            onClick={clearOriginalDatePhrase} 
                            className="text-primary hover:underline"
                            type="button"
                            id={`${idPrefix}-clear-phrase-btn`}
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={`${idPrefix}-trigger`}
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal h-10 px-3 text-sm',
                            !date && 'text-muted-foreground'
                        )}
                        aria-label={ariaLabel || `Select ${label || 'date'}`}
                        aria-describedby={description ? `${idPrefix}-description` : undefined}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, enableTime ? 'PPp' : 'PP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 bg-background"
                    align="start"
                    id={`${idPrefix}-popover`}
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        initialFocus
                        className={cn('p-3 pointer-events-auto')}
                    />
                    {enableTime && date && (
                        <div className="p-3 border-t">
                            {/* Time picker could be added here */}
                            <p className="text-xs text-muted-foreground">
                                Time selection support coming soon
                            </p>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default DatePickerField;
