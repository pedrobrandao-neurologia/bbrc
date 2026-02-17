const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function speakText(text: string): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`TTS failed: ${response.status}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('Audio playback failed'));
    };
    audio.play().catch(reject);
  });
}

export async function transcribeAudio(audioBlob: Blob, filename = 'recording.webm'): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, filename);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-transcribe`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`STT failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text || '';
}
