import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { ChemicalData } from './ChemicalInput';

interface CompoundManagerProps {
  onAddCompound: (compound: ChemicalData) => void;
}

const CompoundManager: React.FC<CompoundManagerProps> = ({ onAddCompound }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    molarWeight: 0,
    molarity: 0,
    density: 1,
    oxideMolarWeight: 0,
    conversionFactor: 1
  });

  const handleSubmit = () => {
    if (!formData.name || formData.molarWeight <= 0) return;

    const newCompound: ChemicalData = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      volume: 0,
      molarity: formData.molarity,
      molarWeight: formData.molarWeight,
      density: formData.density,
      oxideFormula: {
        oxideMolarWeight: formData.oxideMolarWeight,
        conversionFactor: formData.conversionFactor
      },
      isCustom: true
    };

    onAddCompound(newCompound);
    setIsOpen(false);
    setFormData({
      name: '',
      molarWeight: 0,
      molarity: 0,
      density: 1,
      oxideMolarWeight: 0,
      conversionFactor: 1
    });
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="bg-gradient-to-r from-accent to-primary text-accent-foreground">
        <CardTitle className="text-xl">Compound Manager</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Compound
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Compound</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="compound-name">Compound Name</Label>
                <Input
                  id="compound-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., CuCl2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="molar-weight">Molar Weight (g/mol)</Label>
                  <Input
                    id="molar-weight"
                    type="number"
                    step="0.01"
                    value={formData.molarWeight || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, molarWeight: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-molarity">Default Molarity (M)</Label>
                  <Input
                    id="default-molarity"
                    type="number"
                    step="0.01"
                    value={formData.molarity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, molarity: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="density">Density (g/mL)</Label>
                  <Input
                    id="density"
                    type="number"
                    step="0.01"
                    value={formData.density || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, density: parseFloat(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxide-molar-weight">Oxide Molar Weight</Label>
                  <Input
                    id="oxide-molar-weight"
                    type="number"
                    step="0.01"
                    value={formData.oxideMolarWeight || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, oxideMolarWeight: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversion-factor">Conversion Factor</Label>
                <Input
                  id="conversion-factor"
                  type="number"
                  step="0.01"
                  value={formData.conversionFactor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, conversionFactor: parseFloat(e.target.value) || 1 }))}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Add Compound
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CompoundManager;
