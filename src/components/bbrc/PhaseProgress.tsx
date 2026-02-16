import { useState } from 'react';
import { TestPhase, TestScores, PatientData, PHASE_LABELS } from '@/lib/bbrc-constants';
import { Progress } from '@/components/ui/progress';

interface PhaseProgressProps {
  currentPhase: TestPhase;
}

const PHASES_ORDER: TestPhase[] = [
  'welcome', 'naming', 'incidental', 'exposure1', 'immediate', 
  'exposure2', 'learning', 'fluency', 'clock', 'delayed', 'recognition', 'report'
];

export function PhaseProgress({ currentPhase }: PhaseProgressProps) {
  const currentIndex = PHASES_ORDER.indexOf(currentPhase);
  const progress = ((currentIndex) / (PHASES_ORDER.length - 1)) * 100;

  if (currentPhase === 'welcome' || currentPhase === 'report') return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b p-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-primary">
            {PHASE_LABELS[currentPhase]}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentIndex}/{PHASES_ORDER.length - 1}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
