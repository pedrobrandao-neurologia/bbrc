import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { speakText } from '@/lib/elevenlabs';
import { useRecorder } from '@/hooks/use-recorder';
import { matchAnimals, PHASE_INSTRUCTIONS } from '@/lib/bbrc-constants';

interface FluencyPhaseProps {
  onComplete: (count: number, transcript: string) => void;
}

export function FluencyPhase({ onComplete }: FluencyPhaseProps) {
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [matchedAnimals, setMatchedAnimals] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullTranscript, setFullTranscript] = useState('');
  const { isRecording, transcript, startRecording, stopRecording, resetTranscript } = useRecorder();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    speakText(PHASE_INSTRUCTIONS.fluency)
      .then(() => { if (!cancelled) setIsSpeaking(false); })
      .catch(() => { if (!cancelled) setIsSpeaking(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (transcript) {
      setMatchedAnimals(matchAnimals(transcript));
    }
  }, [transcript]);

  // Timer logic
  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      // Time's up - stop and finish
      setTimerActive(false);
      handleTimeUp();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timerActive, timeLeft]);

  const handleTimeUp = useCallback(async () => {
    if (isRecording) {
      setIsProcessing(true);
      try {
        const text = await stopRecording();
        const allText = transcript ? `${transcript} ${text}` : text;
        const matched = matchAnimals(allText);
        onComplete(matched.size, allText);
      } finally {
        setIsProcessing(false);
      }
    } else {
      onComplete(matchedAnimals.size, transcript);
    }
  }, [isRecording, stopRecording, transcript, matchedAnimals, onComplete]);

  const handleStart = useCallback(async () => {
    setTimerActive(true);
    await startRecording();
  }, [startRecording]);

  const handleStopAndTranscribe = useCallback(async () => {
    setIsProcessing(true);
    try {
      const text = await stopRecording();
      if (text) {
        const allText = transcript ? `${transcript} ${text}` : text;
        setMatchedAnimals(matchAnimals(allText));
      }
    } finally {
      setIsProcessing(false);
    }
    // Restart recording if timer still going
    if (timeLeft > 0 && timerActive) {
      await startRecording();
    }
  }, [stopRecording, startRecording, transcript, timeLeft, timerActive]);

  const handleFinish = useCallback(async () => {
    setTimerActive(false);
    if (isRecording) {
      setIsProcessing(true);
      try {
        const text = await stopRecording();
        const allText = transcript ? `${transcript} ${text}` : text;
        const matched = matchAnimals(allText);
        onComplete(matched.size, allText);
      } finally {
        setIsProcessing(false);
      }
    } else {
      onComplete(matchedAnimals.size, transcript);
    }
  }, [isRecording, stopRecording, transcript, matchedAnimals, onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">5. Fluência Verbal</CardTitle>
          <p className="text-muted-foreground">Diga nomes de animais</p>
          <p className="text-4xl font-mono font-bold text-primary mt-2">{timeLeft}s</p>
          <Progress value={((60 - timeLeft) / 60) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Animais: {matchedAnimals.size}
            </Badge>

            <div className="flex gap-2">
              {!timerActive && timeLeft === 60 ? (
                <Button onClick={handleStart} disabled={isSpeaking} size="lg">
                  <Mic className="mr-2 h-5 w-5" />
                  Iniciar
                </Button>
              ) : (
                <>
                  {isRecording && (
                    <Button onClick={handleStopAndTranscribe} variant="destructive" size="lg" disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MicOff className="mr-2 h-5 w-5" />}
                      {isProcessing ? 'Processando...' : 'Pausar'}
                    </Button>
                  )}
                  <Button onClick={handleFinish} variant="outline" size="lg" disabled={isProcessing}>
                    Finalizar →
                  </Button>
                </>
              )}
            </div>
          </div>

          {transcript && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Transcrição: {transcript}</p>
            </div>
          )}

          {matchedAnimals.size > 0 && (
            <div className="flex flex-wrap gap-2">
              {Array.from(matchedAnimals).map(a => (
                <Badge key={a} className="text-sm">{a}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
