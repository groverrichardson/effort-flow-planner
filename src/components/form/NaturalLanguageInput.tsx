
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface NaturalLanguageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const NaturalLanguageInput = ({ value, onChange, onSubmit }: NaturalLanguageInputProps) => {
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe your task in natural language (e.g., 'Create a high priority presentation for the marketing team due next Friday')"
        className="min-h-[80px] text-sm"
      />
      <div className="text-right">
        <Button 
          type="button" 
          size="sm"
          onClick={onSubmit}
        >
          Parse Task
        </Button>
      </div>
    </div>
  );
};

export default NaturalLanguageInput;
