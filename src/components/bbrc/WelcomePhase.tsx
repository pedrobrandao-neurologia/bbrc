import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientData } from '@/lib/bbrc-constants';

interface WelcomePhaseProps {
  onStart: (patient: PatientData) => void;
}

export function WelcomePhase({ onStart }: WelcomePhaseProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !education) return;
    onStart({ name, age: parseInt(age), education });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">BBRC Digital</CardTitle>
          <CardDescription className="text-lg">
            Bateria Breve de Rastreio Cognitivo
          </CardDescription>
          <p className="mt-2 text-sm text-muted-foreground">
            Instrumento de rastreio cognitivo recomendado pela Academia Brasileira de Neurologia
            (Nitrini et al., 1994).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Nome do paciente</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
                className="text-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-base">Idade</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Anos"
                min="0"
                max="120"
                className="text-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Escolaridade</Label>
              <Select value={education} onValueChange={setEducation} required>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="Selecione a escolaridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analfabeto">Analfabeto</SelectItem>
                  <SelectItem value="1-3">1 a 3 anos</SelectItem>
                  <SelectItem value="4-7">4 a 7 anos</SelectItem>
                  <SelectItem value="8+">8 ou mais anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full text-lg h-12 mt-4" disabled={!name || !age || !education}>
              Iniciar Teste
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
