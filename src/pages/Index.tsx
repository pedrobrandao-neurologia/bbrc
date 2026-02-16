import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TestPhase, TestScores, PatientData } from '@/lib/bbrc-constants';
import { WelcomePhase } from '@/components/bbrc/WelcomePhase';
import { NamingPhase } from '@/components/bbrc/NamingPhase';
import { RecallPhase } from '@/components/bbrc/RecallPhase';
import { ExposurePhase } from '@/components/bbrc/ExposurePhase';
import { FluencyPhase } from '@/components/bbrc/FluencyPhase';
import { ClockPhase } from '@/components/bbrc/ClockPhase';
import { RecognitionPhase } from '@/components/bbrc/RecognitionPhase';
import { ReportPhase } from '@/components/bbrc/ReportPhase';
import { PhaseProgress } from '@/components/bbrc/PhaseProgress';

const INITIAL_SCORES: TestScores = {
  naming: 0,
  incidental: 0,
  immediate: 0,
  learning: 0,
  fluency: 0,
  clock: 0,
  delayed: 0,
  recognition: 0,
};

const Index = () => {
  const [phase, setPhase] = useState<TestPhase>('welcome');
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [scores, setScores] = useState<TestScores>(INITIAL_SCORES);
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);

  const saveTranscript = useCallback((key: string, text: string) => {
    setTranscripts(prev => ({ ...prev, [key]: text }));
  }, []);

  const handleStart = useCallback(async (data: PatientData) => {
    setPatient(data);
    // Create patient + session in DB
    try {
      const { data: patientRow, error: pErr } = await supabase
        .from('patients')
        .insert({ name: data.name, age: data.age, education: data.education })
        .select('id')
        .single();

      if (patientRow) {
        const { data: session, error: sErr } = await supabase
          .from('test_sessions')
          .insert({ patient_id: patientRow.id })
          .select('id')
          .single();

        if (session) setSessionId(session.id);
      }
    } catch (e) {
      console.error('DB Error:', e);
    }

    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Will be handled per phase
    }
    setPhase('naming');
  }, []);

  const updateSession = useCallback(async (updates: Partial<TestScores>) => {
    if (!sessionId) return;
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.naming !== undefined) dbUpdates.naming_score = updates.naming;
      if (updates.incidental !== undefined) dbUpdates.incidental_score = updates.incidental;
      if (updates.immediate !== undefined) dbUpdates.immediate_score = updates.immediate;
      if (updates.learning !== undefined) dbUpdates.learning_score = updates.learning;
      if (updates.fluency !== undefined) dbUpdates.fluency_count = updates.fluency;
      if (updates.clock !== undefined) dbUpdates.clock_score = updates.clock;
      if (updates.delayed !== undefined) dbUpdates.delayed_score = updates.delayed;
      if (updates.recognition !== undefined) dbUpdates.recognition_score = updates.recognition;

      await supabase.from('test_sessions').update(dbUpdates).eq('id', sessionId);
    } catch (e) {
      console.error('Update error:', e);
    }
  }, [sessionId]);

  const saveAllTranscripts = useCallback(async () => {
    if (!sessionId) return;
    try {
      await supabase.from('test_sessions').update({ transcripts }).eq('id', sessionId);
    } catch (e) {
      console.error('Transcript save error:', e);
    }
  }, [sessionId, transcripts]);

  const advancePhase = useCallback((nextPhase: TestPhase) => {
    setPhase(nextPhase);
  }, []);

  const handleRestart = useCallback(() => {
    setPhase('welcome');
    setPatient(null);
    setScores(INITIAL_SCORES);
    setTranscripts({});
    setSessionId(null);
  }, []);

  return (
    <>
      <PhaseProgress currentPhase={phase} />
      <div className={phase !== 'welcome' && phase !== 'report' ? 'pt-16' : ''}>
        {phase === 'welcome' && (
          <WelcomePhase onStart={handleStart} />
        )}

        {phase === 'naming' && (
          <NamingPhase onComplete={(score, text) => {
            setScores(s => ({ ...s, naming: score }));
            saveTranscript('naming', text);
            updateSession({ naming: score });
            advancePhase('incidental');
          }} />
        )}

        {phase === 'incidental' && (
          <RecallPhase phase="incidental" onComplete={(score, text) => {
            setScores(s => ({ ...s, incidental: score }));
            saveTranscript('incidental', text);
            updateSession({ incidental: score });
            advancePhase('exposure1');
          }} />
        )}

        {phase === 'exposure1' && (
          <ExposurePhase phaseKey="exposure1" onComplete={() => advancePhase('immediate')} />
        )}

        {phase === 'immediate' && (
          <RecallPhase phase="immediate" onComplete={(score, text) => {
            setScores(s => ({ ...s, immediate: score }));
            saveTranscript('immediate', text);
            updateSession({ immediate: score });
            advancePhase('exposure2');
          }} />
        )}

        {phase === 'exposure2' && (
          <ExposurePhase phaseKey="exposure2" onComplete={() => advancePhase('learning')} />
        )}

        {phase === 'learning' && (
          <RecallPhase phase="learning" onComplete={(score, text) => {
            setScores(s => ({ ...s, learning: score }));
            saveTranscript('learning', text);
            updateSession({ learning: score });
            advancePhase('fluency');
          }} />
        )}

        {phase === 'fluency' && (
          <FluencyPhase onComplete={(count, text) => {
            setScores(s => ({ ...s, fluency: count }));
            saveTranscript('fluency', text);
            updateSession({ fluency: count });
            advancePhase('clock');
          }} />
        )}

        {phase === 'clock' && (
          <ClockPhase onComplete={(score) => {
            setScores(s => ({ ...s, clock: score }));
            updateSession({ clock: score });
            advancePhase('delayed');
          }} />
        )}

        {phase === 'delayed' && (
          <RecallPhase phase="delayed" onComplete={(score, text) => {
            setScores(s => ({ ...s, delayed: score }));
            saveTranscript('delayed', text);
            updateSession({ delayed: score });
            advancePhase('recognition');
          }} />
        )}

        {phase === 'recognition' && (
          <RecognitionPhase onComplete={(score, text) => {
            setScores(s => ({ ...s, recognition: score }));
            saveTranscript('recognition', text);
            updateSession({ recognition: score });
            saveAllTranscripts();
            advancePhase('report');
          }} />
        )}

        {phase === 'report' && patient && (
          <ReportPhase patient={patient} scores={scores} onRestart={handleRestart} />
        )}
      </div>
    </>
  );
};

export default Index;
