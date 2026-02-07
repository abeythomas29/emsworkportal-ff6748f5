import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export interface ChemicalData {
  id: string;
  name: string;
  volume: number;
  molarity: number;
  molarWeight: number;
  density?: number;
  oxideFormula?: {
    oxideMolarWeight: number;
    conversionFactor: number;
  };
  isCustom?: boolean;
}

interface ChemicalInputProps {
  chemical: ChemicalData;
  onUpdate: (id: string, field: keyof ChemicalData, value: number) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

const ChemicalInput: React.FC<ChemicalInputProps> = ({
  chemical,
  onUpdate,
  onDelete,
  showDelete = false
}) => {
  return (
    <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-card/50">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-primary">{chemical.name}</h3>
        {showDelete && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(chemical.id)}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${chemical.id}-volume`}>Volume (mL)</Label>
          <Input
            id={`${chemical.id}-volume`}
            type="number"
            value={chemical.volume || ''}
            onChange={(e) => onUpdate(chemical.id, 'volume', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${chemical.id}-molarity`}>Molarity (M)</Label>
          <Input
            id={`${chemical.id}-molarity`}
            type="number"
            step="0.01"
            value={chemical.molarity || ''}
            onChange={(e) => onUpdate(chemical.id, 'molarity', parseFloat(e.target.value) || 0)}
            placeholder="0.5"
          />
        </div>
      </div>
    </div>
  );
};

export default ChemicalInput;
