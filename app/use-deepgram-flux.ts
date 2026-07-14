import { DeepgramClient } from "@deepgram/sdk";
import { useEffect, useRef, useState } from "react";
export default function useDeepgramFlux({
  token,
  eot_threshold,
  eot_timeout_ms,
  onTurnStart,
  onUpdate,
  onTurnEnd,
  onError,
  model = "flux-general-en",
}: {
  token: string;
  eot_threshold?: number;
  eot_timeout_ms?: number;
  onTurnStart?: (transcript: string) => void;
  onUpdate?: (transcript: string) => void;
  onTurnEnd?: (transcript: string) => void;
  onError: (err: Error) => void;
  model?: "flux-general-en" | "flux-general-multi";
}) {
  const deepgram = new DeepgramClient({ accessToken: token });
  type V2Socket = Awaited<ReturnType<typeof deepgram.listen.v2.connect>>;

  const [connected, setConnected] = useState(false);
  const [interimTranscript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const [errored, setErrored] = useState(false);
  const isConnectingRef = useRef(false);
  const [error, setError] = useState<Error>();
  const socketRef = useRef<V2Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    async function initializeSocket() {
      isConnectingRef.current = true;
      socketRef.current = await deepgram.listen.v2.connect({
        eot_threshold,
        eot_timeout_ms,
        model,
        Authorization: token,
      });
      socketRef.current.connect();
      socketRef.current.on("error", (e) => {
        setError(e);
        setErrored(true);
      });
      socketRef.current.on("message", (data) => {
        setErrored(false);
        setError(undefined);

        if (data.type === "TurnInfo") {
          if (data.event === "StartOfTurn") {
            // console.log("Start", data.transcript);
            onTurnStart?.(data.transcript);
          }
          if (data.event === "Update") {
            if (data.transcript) {
              setTranscript(data.transcript);
              onUpdate?.(data.transcript);
            }
          }
          if (data.event === "EndOfTurn") {
            console.log("END OF TURN DETECTED");
            onTurnEnd?.(data.transcript);
            setTranscript("");
          }
        }
      });

      socketRef.current.on("error", (e) => {
        onError(e);
        setError(e);
      });
      socketRef.current.on("open", async () => {
        setConnected(true);

        //Handle Error
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          mediaRecorderRef.current = new MediaRecorder(stream);

          mediaRecorderRef.current.addEventListener(
            "dataavailable",
            (event) => {
              if (
                socketRef.current &&
                event.data.size > 0 &&
                socketRef.current.readyState === WebSocket.OPEN
              ) {
                socketRef.current.sendMedia(event.data);
              }
            },
          );

          mediaRecorderRef.current.start(100);
          setListening(true);
        } catch (e) {
          setErrored(true);
          setError(e as Error);
        }
      });
    }
    if (!isConnectingRef.current) initializeSocket();
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (socketRef.current) socketRef.current.close();
    };
  }, []);
  return { connected, listening, errored, error, interimTranscript };
}
