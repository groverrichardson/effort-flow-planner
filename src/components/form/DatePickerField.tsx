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

interface DatePickerFieldProps {
    label?: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
}

const DatePickerField = ({ label, value, onChange }: DatePickerFieldProps) => {
    const [open, setOpen] = useState(false);

    // Handle date selection and auto-close
    const handleSelect = (date: Date | null) => {
        onChange(date);
        setOpen(false); // Auto-close the popover after selection
    };

    return (
        <div>
            {label && <label className="block text-xs font-medium mb-1">{label}</label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal h-10 px-3 text-xs',
                            !value && 'text-muted-foreground'
                        )}>
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {value ? format(value, 'PP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 bg-background"
                    align="start">
                    <Calendar
                        mode="single"
                        selected={value || undefined}
                        onSelect={handleSelect}
                        initialFocus
                        className={cn('p-3 pointer-events-auto')}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default DatePickerField;
