import axios from "axios";

export function float32ToWav(audio: Float32Array, sampleRate = 16000): Blob {
  const buffer = new ArrayBuffer(44 + audio.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + audio.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, "data");
  view.setUint32(40, audio.length * 2, true);

  for (let i = 0; i < audio.length; i++) {
    const s = Math.max(-1, Math.min(1, audio[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}
export const transcribe = async (segment: Float32Array, gameId:string) => {
  // 1. Convert the raw VAD segment to a valid WAV blob (16kHz mono)
  const wavBlob = float32ToWav(segment, 16000);

  try {
    // 2. Fetch the ephemeral Deepgram token from your backend
    // We expect this returns { access_token: "..." }
    const { data: { access_token } } = await axios.post(`/api/games/${gameId}/grant`);

    // 3. Send the WAV blob to Deepgram
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true',
      wavBlob,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'audio/wav',
        },
      }
    );

    // 4. Extract and return the transcript
    const transcript = response.data.results?.channels[0]?.alternatives[0]?.transcript;
    
    if (transcript && transcript.trim().length > 0) {
      console.log("Deepgram Transcript:", transcript);
      return transcript;
    }
  } catch (err) {
    console.error("Deepgram Transcription failed:", err);
  }
};