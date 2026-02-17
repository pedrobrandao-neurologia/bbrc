import { useState, useRef, useCallback, useEffect } from 'react';
import { transcribeAudio } from '@/lib/elevenlabs';

interface UseRecorderResult {
  isRecording: boolean;
  transcript: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  resetTranscript: () => void;
}

// Detect the best supported audio mimeType for this browser
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/aac',
    'audio/wav',
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  // Fallback: let the browser decide
  return '';
}

// Map mimeType to a file extension for the transcription API
function getFileExtension(mimeType: string): string {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('aac')) return 'aac';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
}

export function useRecorder(): UseRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('');

  // Cleanup on unmount: release microphone and stop any active recording
  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        try { recorder.stop(); } catch {}
      }
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      mediaRecorderRef.current = null;
      streamRef.current = null;
    };
  }, []);

  const startRecording = useCallback(async () => {
    // Release any previous stream before acquiring a new one
    const prevStream = streamRef.current;
    if (prevStream) {
      prevStream.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mimeType = getSupportedMimeType();
    mimeTypeRef.current = mimeType;

    const options: MediaRecorderOptions = {};
    if (mimeType) {
      options.mimeType = mimeType;
    }

    const mediaRecorder = new MediaRecorder(stream, options);
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
        setIsRecording(false);
        resolve('');
        return;
      }

      recorder.onstop = async () => {
        // Use the actual mimeType from the recorder or our detected type
        const actualMime = recorder.mimeType || mimeTypeRef.current || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: actualMime });
        const ext = getFileExtension(actualMime);

        // Release the stream tracks so the mic is freed for next phase
        const stream = streamRef.current;
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        try {
          const text = await transcribeAudio(blob, `recording.${ext}`);
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
