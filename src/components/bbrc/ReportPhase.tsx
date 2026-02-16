import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TestScores, PatientData, ABN_CUTOFFS } from '@/lib/bbrc-constants';
import { Printer } from 'lucide-react';

interface ReportPhaseProps {
  patient: PatientData;
  scores: TestScores;
  onRestart: () => void;
}

const SCORE_LABELS: { key: keyof TestScores; label: string; max: string; cutoffKey: string }[] = [
  { key: 'naming', label: 'Nomeação', max: '/10', cutoffKey: 'naming' },
  { key: 'incidental', label: 'Memória Incidental', max: '/10', cutoffKey: 'incidental' },
  { key: 'immediate', label: 'Memória Imediata', max: '/10', cutoffKey: 'immediate' },
  { key: 'learning', label: 'Aprendizado', max: '/10', cutoffKey: 'learning' },
  { key: 'fluency', label: 'Fluência Verbal', max: '', cutoffKey: 'fluency' },
  { key: 'clock', label: 'Teste do Relógio', max: '/5', cutoffKey: '' },
  { key: 'delayed', label: 'Memória Tardia', max: '/10', cutoffKey: 'delayed' },
  { key: 'recognition', label: 'Reconhecimento', max: '/10', cutoffKey: 'recognition' },
];

export function ReportPhase({ patient, scores, onRestart }: ReportPhaseProps) {
  const cutoffs = ABN_CUTOFFS[patient.education] || ABN_CUTOFFS['8+'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl print:shadow-none print:border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Relatório Final — BBRC Digital</CardTitle>
          <div className="text-muted-foreground space-y-1">
            <p className="text-lg font-medium">{patient.name}</p>
            <p>Idade: {patient.age} anos | Escolaridade: {patient.education === 'analfabeto' ? 'Analfabeto' : patient.education === '8+' ? '≥8 anos' : `${patient.education} anos`}</p>
            <p className="text-sm">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fase</TableHead>
                <TableHead className="text-center">Pontuação</TableHead>
                <TableHead className="text-center">Ponto de Corte</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SCORE_LABELS.map(({ key, label, max, cutoffKey }) => {
                const score = scores[key];
                const cutoff = cutoffKey ? cutoffs[cutoffKey] : undefined;
                const belowCutoff = cutoff !== undefined && score < cutoff;

                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{label}</TableCell>
                    <TableCell className="text-center text-lg">
                      {score}{max}
                    </TableCell>
                    <TableCell className="text-center">
                      {cutoff !== undefined ? `≥ ${cutoff}` : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {cutoff !== undefined ? (
                        <Badge variant={belowCutoff ? 'destructive' : 'default'}>
                          {belowCutoff ? 'Abaixo' : 'Normal'}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <p className="text-xs text-muted-foreground text-center">
            Pontos de corte: Consenso ABN 2022 (Smid et al., Dement Neuropsychol)
          </p>

          <div className="flex gap-2 justify-center print:hidden">
            <Button onClick={handlePrint} size="lg">
              <Printer className="mr-2 h-5 w-5" />
              Imprimir / Salvar PDF
            </Button>
            <Button onClick={onRestart} variant="outline" size="lg">
              Novo Teste
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
