import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import emsLogo from '@/assets/ems-logo.png';
import ChemicalInput, { ChemicalData } from './ChemicalInput';
import CompoundManager from './CompoundManager';
import BlendingSection from './BlendingSection';

interface CalculationResults {
  [key: string]: number;
  totalWeight: number;
}

const OxideCalculator: React.FC = () => {
  const [micaWeight, setMicaWeight] = useState<number>(0);
  const [blendingWeight, setBlendingWeight] = useState<number>(0);
  const [chemicals, setChemicals] = useState<ChemicalData[]>([
    {
      id: 'ticl4',
      name: 'TiCl4 Solution',
      volume: 0,
      molarity: 1,
      molarWeight: 189.68,
      density: 1.726,
      oxideFormula: { oxideMolarWeight: 79.87, conversionFactor: 1.728 }
    },
    {
      id: 'fecl3',
      name: 'FeCl3 Solution',
      volume: 0,
      molarity: 0.8,
      molarWeight: 270.3,
      oxideFormula: { oxideMolarWeight: 159.7, conversionFactor: 0.5 }
    },
    {
      id: 'feso4',
      name: 'FeSO4·7H2O Solution',
      volume: 0,
      molarity: 1,
      molarWeight: 278.01,
      oxideFormula: { oxideMolarWeight: 159.7, conversionFactor: 0.5 }
    },
    {
      id: 'alcl3',
      name: 'AlCl3 Solution',
      volume: 0,
      molarity: 0.5,
      molarWeight: 133.3,
      oxideFormula: { oxideMolarWeight: 60.08, conversionFactor: 0.4918 }
    },
    {
      id: 'sncl4',
      name: 'SnCl4 Solution',
      volume: 0,
      molarity: 0.07,
      molarWeight: 350.6,
      oxideFormula: { oxideMolarWeight: 150.71, conversionFactor: 0.7645 }
    },
    {
      id: 'sodiumsilicate',
      name: 'Sodium Silicate Solution',
      volume: 0,
      molarity: 0.5,
      molarWeight: 122.06,
      oxideFormula: { oxideMolarWeight: 122.06, conversionFactor: 1 }
    },
    {
      id: 'copper',
      name: 'Copper Solution',
      volume: 0,
      molarity: 0.5,
      molarWeight: 241.6,
      oxideFormula: { oxideMolarWeight: 79.5, conversionFactor: 0.4237 }
    },
    {
      id: 'cobalt',
      name: 'Cobalt Solution',
      volume: 0,
      molarity: 0.5,
      molarWeight: 237.39,
      oxideFormula: { oxideMolarWeight: 74.93, conversionFactor: 0.3156 }
    },
    {
      id: 'chromium',
      name: 'Chromium Solution',
      volume: 0,
      molarity: 0.5,
      molarWeight: 722.3,
      oxideFormula: { oxideMolarWeight: 151.99, conversionFactor: 0.2104 }
    }
  ]);

  const [results, setResults] = useState<CalculationResults>({
    totalWeight: 0
  });

  const calculateResults = () => {
    let newResults: CalculationResults = { totalWeight: 0 };
    let totalOxideWeight = 0;

    chemicals.forEach(chemical => {
      if (chemical.volume > 0 && chemical.molarity > 0) {
        // Calculate chemical weight
        let chemicalWeight: number;

        if (chemical.id === 'ticl4') {
          // Special formula for TiCl4
          chemicalWeight = chemical.molarity * (chemical.volume / (1000 * (chemical.density || 1))) * chemical.molarWeight;
        } else {
          // Standard formula for others
          chemicalWeight = chemical.molarity * (chemical.volume / 1000) * chemical.molarWeight;
        }

        // Calculate oxide weight
        let oxideWeight = 0;
        if (chemical.oxideFormula) {
          if (chemical.id === 'ticl4') {
            oxideWeight = (chemicalWeight * chemical.oxideFormula.conversionFactor * chemical.oxideFormula.oxideMolarWeight) / chemical.molarWeight;
          } else if (chemical.id === 'cobalt' || chemical.id === 'copper' || chemical.id === 'sncl4' || chemical.id === 'chromium') {
            // Direct formula for cobalt, copper, tin, and chromium (1:1 molar conversion)
            oxideWeight = (chemicalWeight * chemical.oxideFormula.oxideMolarWeight) / chemical.molarWeight;
          } else {
            oxideWeight = (chemicalWeight * chemical.oxideFormula.oxideMolarWeight) / (chemical.molarWeight * (chemical.oxideFormula.conversionFactor === 0.5 ? 2 : (1 / chemical.oxideFormula.conversionFactor)));
          }
        }

        newResults[`${chemical.id}Weight`] = chemicalWeight;
        newResults[`${chemical.id}OxideWeight`] = oxideWeight;
        totalOxideWeight += oxideWeight;
      }
    });

    const totalWeight = micaWeight + totalOxideWeight + blendingWeight;
    newResults.totalWeight = totalWeight;

    // Calculate percentages
    if (totalWeight > 0) {
      newResults.micaPercentage = (micaWeight / totalWeight) * 100;
      newResults.blendingPercentage = (blendingWeight / totalWeight) * 100;

      chemicals.forEach(chemical => {
        const oxideWeight = newResults[`${chemical.id}OxideWeight`] || 0;
        if (oxideWeight > 0) {
          newResults[`${chemical.id}Percentage`] = (oxideWeight / totalWeight) * 100;
        }
      });
    }

    setResults(newResults);
  };

  useEffect(() => {
    calculateResults();
  }, [chemicals, micaWeight, blendingWeight]);

  const updateChemical = (id: string, field: keyof ChemicalData, value: number) => {
    setChemicals(prev => prev.map(chem =>
      chem.id === id ? { ...chem, [field]: value } : chem
    ));
  };

  const addCustomChemical = (newChemical: ChemicalData) => {
    setChemicals(prev => [...prev, newChemical]);
  };

  const removeChemical = (id: string) => {
    setChemicals(prev => prev.filter(chem => chem.id !== id));
  };

  const resetCalculator = () => {
    setMicaWeight(0);
    setBlendingWeight(0);
    setChemicals(prev => prev.map(chem => ({ ...chem, volume: 0 })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={emsLogo}
            alt="Esoteric Mineral Solution"
            className="h-24 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-primary mb-2">
            Esoteric Mineral Solution
          </h1>
          <p className="text-lg text-muted-foreground">
            Oxide Coating Percentage Calculator
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="blending">Blending</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <Card className="shadow-lg border-border/50">
                  <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <CardTitle className="text-xl">Base Materials</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <Label htmlFor="mica-weight" className="text-sm font-medium">
                        Mica Weight (g)
                      </Label>
                      <Input
                        id="mica-weight"
                        type="number"
                        value={micaWeight || ''}
                        onChange={(e) => setMicaWeight(parseFloat(e.target.value) || 0)}
                        placeholder="Enter mica weight"
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-border/50">
                  <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <CardTitle className="text-xl">Chemical Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {chemicals.map(chemical => (
                      <ChemicalInput
                        key={chemical.id}
                        chemical={chemical}
                        onUpdate={updateChemical}
                        onDelete={chemical.isCustom ? removeChemical : undefined}
                        showDelete={chemical.isCustom}
                      />
                    ))}

                    <Button onClick={resetCalculator} variant="outline" className="w-full">
                      Reset Calculator
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <Card className="shadow-lg border-border/50">
                <CardHeader className="bg-gradient-to-r from-secondary to-accent text-secondary-foreground">
                  <CardTitle className="text-xl">Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Weight Calculations */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary">Weight Calculations (g)</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {chemicals.map(chemical => {
                        const chemWeight = results[`${chemical.id}Weight`];
                        const oxideWeight = results[`${chemical.id}OxideWeight`];
                        if (chemWeight > 0) {
                          return (
                            <React.Fragment key={chemical.id}>
                              <div className="flex justify-between">
                                <span>{chemical.name}:</span>
                                <span className="font-medium">{chemWeight.toFixed(3)}</span>
                              </div>
                              {oxideWeight > 0 && (
                                <div className="flex justify-between">
                                  <span>Oxide:</span>
                                  <span className="font-medium">{oxideWeight.toFixed(3)}</span>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-primary">
                      <span>Total Weight:</span>
                      <span>{results.totalWeight.toFixed(3)} g</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Percentage Results */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary">Component Percentages</h3>
                    <div className="space-y-3">
                      {results.micaPercentage > 0 && (
                        <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <span className="font-medium text-foreground">Mica:</span>
                          <span className="text-lg font-bold text-primary">
                            {results.micaPercentage.toFixed(2)}%
                          </span>
                        </div>
                      )}

                      {chemicals.map(chemical => {
                        const percentage = results[`${chemical.id}Percentage`];
                        if (percentage > 0) {
                          return (
                            <div key={chemical.id} className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                              <span className="font-medium text-foreground">{chemical.name} Oxide:</span>
                              <span className="text-lg font-bold text-primary">
                                {percentage.toFixed(2)}%
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}

                      {results.blendingPercentage > 0 && (
                        <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <span className="font-medium text-foreground">Blending Components:</span>
                          <span className="text-lg font-bold text-primary">
                            {results.blendingPercentage.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blending">
            <BlendingSection onWeightChange={setBlendingWeight} />
          </TabsContent>

          <TabsContent value="manage">
            <CompoundManager onAddCompound={addCustomChemical} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OxideCalculator;
