import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { speakText } from '@/lib/elevenlabs';
import { useRecorder } from '@/hooks/use-recorder';
import { matchTargetFigures, PHASE_INSTRUCTIONS, RECOGNITION_ORIGINALS } from '@/lib/bbrc-constants';

interface RecognitionPhaseProps {
  onComplete: (score: number, transcript: string) => void;
}

export function RecognitionPhase({ onComplete }: RecognitionPhaseProps) {
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [matchedFigures, setMatchedFigures] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const { isRecording, transcript, startRecording, stopRecording } = useRecorder();

  useEffect(() => {
    let cancelled = false;
    speakText(PHASE_INSTRUCTIONS.recognition)
      .then(() => { if (!cancelled) setIsSpeaking(false); })
      .catch(() => { if (!cancelled) setIsSpeaking(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (transcript) {
      setMatchedFigures(matchTargetFigures(transcript));
    }
  }, [transcript]);

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      setIsProcessing(true);
      try {
        const text = await stopRecording();
        if (text) {
          const allText = transcript ? `${transcript} ${text}` : text;
          setMatchedFigures(matchTargetFigures(allText));
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, transcript]);

  const handleFinish = useCallback(async () => {
    if (isRecording) {
      setIsProcessing(true);
      try {
        const text = await stopRecording();
        const allText = transcript ? `${transcript} ${text}` : text;
        const matched = matchTargetFigures(allText);
        onComplete(matched.size, allText);
      } finally {
        setIsProcessing(false);
      }
    } else {
      onComplete(matchedFigures.size, transcript);
    }
  }, [isRecording, stopRecording, transcript, matchedFigures, onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">8. Reconhecimento</CardTitle>
          <p className="text-muted-foreground">Diga quais figuras estavam na prancha original</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border overflow-hidden">
            <img src="/bbrc_reconhecimento.jpg" alt="Prancha de reconhecimento" className="w-full" />
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Acertos: {matchedFigures.size}/10
            </Badge>

            <div className="flex gap-2">
              <Button
                onClick={handleToggleRecording}
                disabled={isSpeaking || isProcessing}
                variant={isRecording ? 'destructive' : 'default'}
                size="lg"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="mr-2 h-5 w-5" />
                ) : (
                  <Mic className="mr-2 h-5 w-5" />
                )}
                {isProcessing ? 'Processando...' : isRecording ? 'Parar' : 'Gravar'}
              </Button>
              <Button onClick={handleFinish} variant="outline" size="lg" disabled={isProcessing || isSpeaking}>
                Finalizar →
              </Button>
            </div>
          </div>

          {transcript && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Transcrição: {transcript}</p>
            </div>
          )}

          {matchedFigures.size > 0 && (
            <div className="flex flex-wrap gap-2">
              {Array.from(matchedFigures).map(f => (
                <Badge key={f} className="text-sm">{f}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
