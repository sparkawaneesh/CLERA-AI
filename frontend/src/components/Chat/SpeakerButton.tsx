"use client";
import { FaVolumeUp, FaStop } from "react-icons/fa";
import { useState, useRef, useCallback } from "react";

interface Props {
  text: string;
  lang: string;
}

export default function SpeakerButton({ text, lang }: Props) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingRef = useRef(false);

  const stopAll = useCallback(() => {
    // Kill any Edge TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Kill any browser TTS fallback
    speechSynthesis.cancel();
    setPlaying(false);
    loadingRef.current = false;
  }, []);

  const speak = async () => {
    // If already playing or loading, stop everything
    if (playing || loadingRef.current) {
      stopAll();
      return;
    }

    // Set loading guard
    loadingRef.current = true;
    setPlaying(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });
      const data = await res.json();

      // Check if still supposed to play (not cancelled during fetch)
      if (!loadingRef.current) return;

      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audioRef.current = audio;
        audio.onended = () => {
          setPlaying(false);
          audioRef.current = null;
          loadingRef.current = false;
        };
        audio.onerror = () => {
          setPlaying(false);
          audioRef.current = null;
          loadingRef.current = false;
        };
        audio.play();
      } else {
        loadingRef.current = false;
        setPlaying(false);
      }
    } catch {
      loadingRef.current = false;
      setPlaying(false);
    }
  };

  return (
    <button
      onClick={speak}
      className={`text-gray-400 hover:text-primary-500 transition ${playing ? "text-red-400 hover:text-red-500" : ""}`}
      title={playing ? "Stop" : "Read aloud"}
    >
      {playing ? <FaStop /> : <FaVolumeUp />}
    </button>
  );
}