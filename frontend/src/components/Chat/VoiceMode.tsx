"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Aura from "./Aura";
import type { AuraState, AuraEmotion } from "./Aura";

interface VoiceModeProps {
  isDark: boolean;
  addMessage: (role: "user" | "assistant", content: string) => void;
  chatEndpoint: string;
  ttsEndpoint: string;
  onClose: () => void;
}

// ─── Emotion keyword dictionaries ──────────────────────────
const ANGER_WORDS = [
  "pain", "angry", "frustrated", "terrible", "worst", "hate", "furious",
  "annoyed", "irritated", "emergency", "severe", "dying", "horrible",
  "unbearable", "agony", "rage", "mad", "killing", "awful",
];
const SADNESS_WORDS = [
  "sad", "depressed", "anxious", "worried", "lonely", "hopeless",
  "crying", "scared", "fear", "nervous", "helpless", "lost",
  "grief", "tired", "exhausted", "miserable", "suffering", "upset",
];

function detectEmotion(text: string): AuraEmotion {
  const lower = text.toLowerCase();
  let angerScore = 0;
  let sadnessScore = 0;
  for (const word of ANGER_WORDS) {
    if (lower.includes(word)) angerScore++;
  }
  for (const word of SADNESS_WORDS) {
    if (lower.includes(word)) sadnessScore++;
  }
  if (angerScore > sadnessScore && angerScore >= 1) return "anger";
  if (sadnessScore > angerScore && sadnessScore >= 1) return "sadness";
  return "neutral";
}

export default function VoiceMode({ isDark, addMessage, chatEndpoint, ttsEndpoint, onClose }: VoiceModeProps) {
  const [auraState, setAuraState] = useState<AuraState>("idle");
  const [urgency, setUrgency] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [notSupported, setNotSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [emotion, setEmotion] = useState<AuraEmotion>("neutral");
  const [aidocReply, setAidocReply] = useState("");

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isActiveRef = useRef(true);
  const auraStateRef = useRef<AuraState>("idle");
  const stoppingRef = useRef(false);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioAnimFrameRef = useRef<number>(0);

  useEffect(() => { auraStateRef.current = auraState; }, [auraState]);

  // ─── Web Audio API: microphone volume analysis ──────────
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Float32Array(analyser.fftSize);

      const tick = () => {
        if (!analyserRef.current) return;
        analyser.getFloatTimeDomainData(dataArray);

        // Compute RMS volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // Normalise to 0-1 (typical speech RMS is 0.01-0.15)
        const normalised = Math.min(1, rms / 0.12);
        setAudioLevel(normalised);

        audioAnimFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      console.warn("Audio analysis unavailable:", err);
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (audioAnimFrameRef.current) {
      cancelAnimationFrame(audioAnimFrameRef.current);
      audioAnimFrameRef.current = 0;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Cleanup everything on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      stoppingRef.current = true;
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      stopAudioAnalysis();
    };
  }, [stopAudioAnalysis]);

  const stopAll = useCallback(() => {
    stoppingRef.current = true;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
  }, []);

  const detectUrgency = (text: string) => {
    const urgentWords = ["pain", "emergency", "severe", "bleeding", "heart", "stroke", "chest", "urgent", "help", "dying"];
    return urgentWords.some(word => text.toLowerCase().includes(word));
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotSupported(true); setAuraState("error"); return; }

    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    stoppingRef.current = false;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US,hi-IN";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    let silenceTimer: NodeJS.Timeout | null = null;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
        else interim += event.results[i][0].transcript;
      }
      const currentText = finalTranscript + interim;
      setTranscript(currentText);

      // Update emotion based on what user is saying
      setEmotion(detectEmotion(currentText));

      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        const final = finalTranscript.trim();
        if (final) {
          stoppingRef.current = true;
          recognition.stop();
          handleUserSpeech(final);
          finalTranscript = "";
          setTranscript("");
          setEmotion("neutral");
        }
      }, 1800);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      if (event.error === "not-allowed") setAuraState("error");
      if (event.error === "aborted" || event.error === "network") stoppingRef.current = true;
    };

    recognition.onend = () => {
      if (isActiveRef.current && !stoppingRef.current && auraStateRef.current !== "processing") {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setAuraState("listening");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserSpeech = async (text: string) => {
    setAuraState("processing");
    setUrgency(detectUrgency(text));
    addMessage("user", text);

    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }], language: /[\u0900-\u097F]/.test(text) ? "hi" : "en" }),
      });
      const data = await res.json();
      const reply = data.reply || "I'm sorry, I couldn't process that.";
      addMessage("assistant", reply);

      const ttsRes = await fetch(ttsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reply, language: /[\u0900-\u097F]/.test(reply) ? "hi" : "en" }),
      });
      const ttsData = await ttsRes.json();

      if (ttsData.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${ttsData.audio}`);
        audioRef.current = audio;
        setAuraState("speaking");
        setAidocReply(reply);
        audio.onended = () => { audioRef.current = null; setUrgency(false); setAidocReply(""); startListening(); };
        audio.onerror = () => { audioRef.current = null; setUrgency(false); setAidocReply(""); startListening(); };
        audio.play();
      } else {
        setUrgency(false);
        startListening();
      }
    } catch {
      setAuraState("error");
      setTimeout(() => startListening(), 3000);
    }
  };

  const handleInterrupt = () => {
    if (auraStateRef.current === "speaking" || auraStateRef.current === "processing") {
      stopAll();
      setUrgency(false);
      startListening();
    }
  };

  // Start listening + audio analysis on mount
  useEffect(() => {
    isActiveRef.current = true;
    startAudioAnalysis();
    const timer = setTimeout(() => startListening(), 500);
    return () => clearTimeout(timer);
  }, [startListening, startAudioAnalysis]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundColor: isDark ? "#000000" : "#ffffff",
        backgroundImage: isDark
          ? "radial-gradient(circle at 30% 20%, rgba(126, 34, 206, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)"
          : "radial-gradient(circle at 30% 20%, rgba(216, 180, 254, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(233, 213, 255, 0.3) 0%, transparent 50%)"
      }}
      onClick={handleInterrupt}
    >
      {notSupported ? (
        <div className="text-center px-6">
          <p className={`text-lg font-medium ${isDark ? "text-white" : "text-gray-800"}`}>🎤 Speech recognition not supported.</p>
          <p className={`text-sm mt-2 ${isDark ? "text-gray-300" : "text-gray-500"}`}>Please use Chrome on desktop.</p>
        </div>
      ) : (
        <>
          {/* Full-overlay neural brain animation */}
          <Aura
            state={auraState}
            urgency={urgency}
            isDark={isDark}
            audioLevel={audioLevel}
            emotion={emotion}
          />

          {/* User transcript overlay — shown while listening */}
          {auraState === "listening" && transcript && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-xl w-full px-6 text-center z-10 pointer-events-none">
              <p className="font-lexend text-white font-semibold text-lg md:text-xl text-center leading-relaxed tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {transcript}
              </p>
            </div>
          )}

          {/* AIDOC response transcription — displayed cleanly without a box, below pulse animation, UPPERCASE, Lexend font */}
          {auraState === "speaking" && aidocReply && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-2xl w-full px-6 text-center z-10 pointer-events-none">
              <p className="font-lexend text-xs text-slate-300/80 font-bold uppercase tracking-widest mb-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                AIDOC
              </p>
              <p className="font-lexend text-white font-bold text-lg md:text-xl text-center leading-relaxed uppercase tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                {aidocReply.toUpperCase()}
              </p>
            </div>
          )}

          <p className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-sm font-medium z-10 ${isDark ? "text-white/70" : "text-gray-600"}`}>
            {auraState === "idle" && "Initializing…"}
            {auraState === "listening" && "I'm listening — speak clearly"}
            {auraState === "processing" && "Thinking…"}
            {auraState === "speaking" && "AIDOC is speaking — tap to interrupt"}
            {auraState === "error" && "Microphone issue — check permissions & retry"}
          </p>

          {auraState === "error" && !notSupported && (
            <button onClick={(e) => { e.stopPropagation(); startListening(); }} className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition z-10">
              Retry Listening
            </button>
          )}
        </>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); stopAudioAnalysis(); onClose(); }}
        className="absolute bottom-4 right-4 px-5 py-2 rounded-full text-red-400 border border-red-500/30 hover:bg-red-500/30 transition text-sm font-medium z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 60%, transparent 100%)",
          boxShadow: "0 0 15px rgba(239,68,68,0.25), 0 0 30px rgba(239,68,68,0.1), inset 0 0 8px rgba(239,68,68,0.1)",
        }}
      >
        End Voice Mode
      </button>
    </div>
  );
}