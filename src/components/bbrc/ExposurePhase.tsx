import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { speakText, } from '@/lib/elevenlabs';
import { PHASE_INSTRUCTIONS } from '@/lib/bbrc-constants';

interface ExposurePhaseProps {
  phaseKey: 'exposure1' | 'exposure2';
  onComplete: () => void;
}

export function ExposurePhase({ phaseKey, onComplete }: ExposurePhaseProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    speakText(PHASE_INSTRUCTIONS[phaseKey]).catch(console.error);
  }, [phaseKey]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Observe as figuras</CardTitle>
          <p className="text-muted-foreground text-xl font-mono">{timeLeft}s restantes</p>
          <Progress value={((30 - timeLeft) / 30) * 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <img src="/bbrc_estimulos.jpg" alt="Prancha de estímulos" className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
