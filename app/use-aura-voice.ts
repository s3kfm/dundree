import axios from 'axios';
import { useState, useCallback, useRef } from 'react';

export const useAuraVoice = (gameId: string | number, defaultVoice = 'aura-2-vesta-en') => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text) return;

    
    try {
      setIsPlaying(true);

      // 1. Get your temporary token from your backend
      const tokenRes = await axios.post(`/api/games/${gameId}/grant`);
      const { access_token } = tokenRes.data;

      // 2. Use standard FETCH to hit the REST endpoint
      // We pass the token in the Authorization header
      const response = await fetch(`https://api.deepgram.com/v1/speak?model=${defaultVoice}&encoding=linear16&sample_rate=48000`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(`Deepgram API error: ${response.status}`);
      if (!response.body) throw new Error("No response body");

      // 3. Setup Audio Context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
      }

      // 4. Process the stream
      const reader = response.body.getReader();
      let nextStartTime = audioContextRef.current.currentTime;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // value is a Uint8Array of linear16 PCM data
        // For linear16, we need to convert the bytes to Float32 for Web Audio
        const audioBuffer = await decodeLinear16(value, audioContextRef.current);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.start(nextStartTime);
        nextStartTime += audioBuffer.duration;
      }

    } catch (err) {
      console.error("Voice Error:", err);
    } finally {
      setIsPlaying(false);
    }
  }, [gameId, defaultVoice]);

  return { speak, isPlaying };
};

// Helper: Convert Raw Linear16 bytes to an AudioBuffer
async function decodeLinear16(rawData: Uint8Array, context: AudioContext) {
  const int16Data = new Int16Array(rawData.buffer, rawData.byteOffset, rawData.byteLength / 2);
  const float32Data = new Float32Array(int16Data.length);
  
  for (let i = 0; i < int16Data.length; i++) {
    float32Data[i] = int16Data[i] / 32768.0; // Normalize PCM to [-1, 1]
  }

  const buffer = context.createBuffer(1, float32Data.length, 48000);
  buffer.getChannelData(0).set(float32Data);
  return buffer;
}