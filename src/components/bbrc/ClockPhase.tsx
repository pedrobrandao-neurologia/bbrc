import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { speakText } from '@/lib/elevenlabs';
import { PHASE_INSTRUCTIONS } from '@/lib/bbrc-constants';
import { Pencil, Eraser, Undo2 } from 'lucide-react';

interface ClockPhaseProps {
  onComplete: (score: number) => void;
}

export function ClockPhase({ onComplete }: ClockPhaseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  useEffect(() => {
    speakText(PHASE_INSTRUCTIONS.clock).catch(console.error);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      }
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const { x, y } = getPos(e);
      ctx.lineWidth = tool === 'eraser' ? 20 : 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#000000';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const newHistory = history.slice(0, -1);
      ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
      setHistory(newHistory);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">6. Teste do Relógio</CardTitle>
          <p className="text-muted-foreground">Desenhe um relógio marcando 11h10</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 justify-center">
            <Button variant={tool === 'pen' ? 'default' : 'outline'} size="sm" onClick={() => setTool('pen')}>
              <Pencil className="mr-1 h-4 w-4" /> Caneta
            </Button>
            <Button variant={tool === 'eraser' ? 'default' : 'outline'} size="sm" onClick={() => setTool('eraser')}>
              <Eraser className="mr-1 h-4 w-4" /> Borracha
            </Button>
            <Button variant="outline" size="sm" onClick={undo}>
              <Undo2 className="mr-1 h-4 w-4" /> Desfazer
            </Button>
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="border rounded-lg cursor-crosshair w-full max-w-[500px] touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Pontuação Shulman (avaliador seleciona):</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(s => (
                <Button
                  key={s}
                  variant={selectedScore === s ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setSelectedScore(s)}
                  className="w-12 h-12 text-lg"
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>1 = Inaceitável | 2 = Algum esboço | 3 = Números presentes, sem ponteiros</p>
              <p>4 = Pequenos erros | 5 = Perfeito ou quase perfeito</p>
            </div>
          </div>

          <Button
            onClick={() => selectedScore !== null && onComplete(selectedScore)}
            disabled={selectedScore === null}
            className="w-full"
            size="lg"
          >
            Avançar →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
