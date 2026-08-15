"use client";
import { useState, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  isDark: boolean;
}

export default function VoiceInputButton({ onTranscript, disabled, isDark }: Props) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const start = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in your browser. Try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN,en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      onTranscript(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const idleBg = isDark ? "bg-gray-200" : "bg-gray-100";
  const idleText = isDark ? "text-gray-600" : "text-gray-500";

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      disabled={disabled}
      className={`p-2 rounded-full transition ${listening ? "bg-red-500 text-white animate-pulse" : `${idleBg} ${idleText}`}`}
      title={listening ? "Stop listening" : "Speak now"}
    >
      {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
    </button>
  );
}