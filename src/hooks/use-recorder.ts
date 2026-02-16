import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '@/lib/elevenlabs';

interface UseRecorderResult {
  isRecording: boolean;
  transcript: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  resetTranscript: () => void;
}

export function useRecorder(): UseRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.start(250);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve('');
        return;
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        recorder.stream.getTracks().forEach(t => t.stop());
        
        try {
          const text = await transcribeAudio(blob);
          setTranscript(prev => prev ? `${prev} ${text}` : text);
          setIsRecording(false);
          resolve(text);
        } catch (err) {
          setIsRecording(false);
          reject(err);
        }
      };

      recorder.stop();
    });
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return { isRecording, transcript, startRecording, stopRecording, resetTranscript };
}
