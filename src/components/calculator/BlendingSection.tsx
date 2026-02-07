import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';

interface BlendingComponent {
  id: string;
  name: string;
  weight: number;
}

interface BlendingSectionProps {
  onWeightChange: (totalWeight: number) => void;
}

const BlendingSection: React.FC<BlendingSectionProps> = ({ onWeightChange }) => {
  const [components, setComponents] = useState<BlendingComponent[]>([
    { id: 'mica', name: 'Mica', weight: 0 },
    { id: 'mgst', name: 'MgSt', weight: 0 },
    { id: 'silica', name: 'Silica', weight: 0 },
    { id: 'silane-gptms', name: 'Silane GPTMS', weight: 0 },
    { id: 'linseed-oil', name: 'Linseed Oil', weight: 0 }
  ]);

  const [newComponentName, setNewComponentName] = useState('');

  const updateWeight = (id: string, weight: number) => {
    const updated = components.map(comp =>
      comp.id === id ? { ...comp, weight } : comp
    );
    setComponents(updated);

    const totalWeight = updated.reduce((sum, comp) => sum + comp.weight, 0);
    onWeightChange(totalWeight);
  };

  const addComponent = () => {
    if (!newComponentName.trim()) return;

    const newComponent: BlendingComponent = {
      id: `custom-${Date.now()}`,
      name: newComponentName,
      weight: 0
    };

    setComponents(prev => [...prev, newComponent]);
    setNewComponentName('');
  };

  const removeComponent = (id: string) => {
    const updated = components.filter(comp => comp.id !== id);
    setComponents(updated);

    const totalWeight = updated.reduce((sum, comp) => sum + comp.weight, 0);
    onWeightChange(totalWeight);
  };

  const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0);

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="bg-gradient-to-r from-accent to-secondary text-accent-foreground">
        <CardTitle className="text-xl">Blending Components</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {components.map((component, index) => (
          <div key={component.id} className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor={`blend-${component.id}`} className="text-sm font-medium">
                {component.name} (g)
              </Label>
              <Input
                id={`blend-${component.id}`}
                type="number"
                value={component.weight || ''}
                onChange={(e) => updateWeight(component.id, parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            {index >= 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeComponent(component.id)}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Separator />

        <div className="flex space-x-2">
          <Input
            value={newComponentName}
            onChange={(e) => setNewComponentName(e.target.value)}
            placeholder="Component name"
            className="flex-1"
          />
          <Button onClick={addComponent} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-primary">
          <span>Total Blending Weight:</span>
          <span>{totalWeight.toFixed(3)} g</span>
        </div>

        {totalWeight > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Component Percentages</h3>
              <div className="space-y-3">
                {components.map(component => {
                  if (component.weight > 0) {
                    const percentage = (component.weight / totalWeight) * 100;
                    return (
                      <div key={component.id} className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <span className="font-medium text-foreground">{component.name}:</span>
                        <span className="text-lg font-bold text-primary">
                          {percentage.toFixed(2)}%
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BlendingSection;
