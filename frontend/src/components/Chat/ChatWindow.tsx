

"use client";
import { useState, useEffect, FormEvent, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import VoiceMode from "./VoiceMode";
import { getProfile, saveProfile } from "@/lib/patientMemory";
import { FiMic } from "react-icons/fi";

const WELCOME_QUOTES = [
  "YOUR BODY HAS A STORY. LET'S WRITE A HEALTHIER NEXT CHAPTER TOGETHER.",
  "HEALTHCARE, CENTERED AROUND YOU.",
  "WELCOME! BRINGING CLARITY AND CONFIDENCE TO YOUR HEALTH.",
  "DECODING YOUR WELLNESS, ONE HEARTBEAT AT A TIME.",
  "WHERE EXPERTISE MEETS EMPATHY AT EVERY PULSE.",
  "PULSING WITH PURPOSE, DEDICATED TO YOUR CARE.",
  "WE SPEAK THE LANGUAGE OF YOUR HEALTH.",
  "BECAUSE EVERY SYMPTOM IS A SENTENCE, AND WE'RE HERE TO LISTEN.",
  "HEALING ISN'T A DESTINATION, IT'S A JOURNEY. LET'S WALK IT TOGETHER.",
  "STOP GUESSING. START KNOWING. WELCOME TO AIDOC."
];

export default function ChatWindow({
  profileName,
  sessionId,
  onSessionUpdated,
  autoSendMessage,
  onMessageSent,
  isDark,
  toggleTheme,
}: {
  profileName?: string;
  sessionId: string | null;
  onSessionUpdated?: () => void;
  autoSendMessage?: string | null;
  onMessageSent?: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}) {
  const { messages, sendMessage, addMessage, isTyping } = useChat(sessionId, [], onSessionUpdated);
  const [profile, setProfile] = useState<ReturnType<typeof getProfile>>(null);
  const [nameInput, setNameInput] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [quote, setQuote] = useState(WELCOME_QUOTES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSent = useRef(false);

  useEffect(() => {
    const existing = getProfile();
    setProfile(existing);
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const currentIdx = parseInt(localStorage.getItem("aidoc_quote_idx") || "0", 10);
    setQuote(WELCOME_QUOTES[currentIdx]);
    const nextIdx = (currentIdx + 1) % WELCOME_QUOTES.length;
    localStorage.setItem("aidoc_quote_idx", nextIdx.toString());
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (autoSendMessage && !hasSent.current && !loadingProfile && profile) {
      sendMessage(autoSendMessage);
      hasSent.current = true;
      onMessageSent?.();
    }
  }, [autoSendMessage, loadingProfile, profile]);

  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newProfile = {
      name: nameInput.trim(),
      language: "en",
      lastVisit: new Date().toISOString(),
      symptoms: [],
    };
    saveProfile(newProfile);
    setProfile(newProfile);
  };

  if (loadingProfile) {
    return (
      <div
        className={`flex items-center justify-center h-full ${
          isDark
            ? "bg-white/5 backdrop-blur-xl border border-white/10"
            : "bg-white/70 backdrop-blur-xl border border-gray-200"
        }`}
      >
        <div className="flex gap-2">
          <span
            className={`w-3 h-3 rounded-full animate-bounce [animation-delay:-0.3s] ${
              isDark ? "bg-white/25" : "bg-gray-400"
            }`}
          ></span>
          <span
            className={`w-3 h-3 rounded-full animate-bounce [animation-delay:-0.15s] ${
              isDark ? "bg-white/25" : "bg-gray-400"
            }`}
          ></span>
          <span
            className={`w-3 h-3 rounded-full animate-bounce ${
              isDark ? "bg-white/25" : "bg-gray-400"
            }`}
          ></span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className={`flex items-center justify-center h-full ${
          isDark
            ? "bg-white/5 backdrop-blur-xl border border-white/10"
            : "bg-white/70 backdrop-blur-xl border border-gray-200"
        }`}
      >
        <form
          onSubmit={handleNameSubmit}
          className={`p-8 rounded-2xl max-w-md w-full shadow-lg ${
            isDark
              ? "bg-white/5 backdrop-blur-xl border border-white/10"
              : "bg-white/80 backdrop-blur-xl border border-gray-200"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDark ? "bg-white/8" : "bg-gray-100"
            }`}
          >
            <span className="text-3xl">🩺</span>
          </div>
          <h2
            className={`text-2xl font-display font-semibold mb-2 text-center ${
              isDark ? "text-white/95" : "text-gray-800"
            }`}
          >
            Welcome to AIDOC
          </h2>
          <p className={`mb-6 text-center ${isDark ? "text-white/60" : "text-gray-500"}`}>
            Your personal AI health companion.
          </p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className={`w-full p-4 border rounded-xl focus:outline-none ${
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-gray-400"
            }`}
            placeholder="Enter your name"
            required
          />
          <button
            type="submit"
            className={`mt-4 w-full p-4 rounded-xl font-medium transition ${
              isDark
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Start Your Health Journey
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 h-full flex flex-col overflow-hidden relative ${
        isDark
          ? "bg-white/5 backdrop-blur-xl border border-white/10"
          : "bg-white/70 backdrop-blur-xl border border-gray-200"
      }`}
    >
      {/* Fluid animated background (only dark) */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[55%] rounded-full blur-[130px] fluid-1" />
          <div className="absolute top-[25%] -right-[8%] w-[45%] h-[50%] rounded-full blur-[110px] fluid-2" />
          <div className="absolute -bottom-[10%] left-[15%] w-[55%] h-[45%] rounded-full blur-[140px] fluid-3" />
        </div>
      )}

      {/* Light mode purple gradient mesh background */}
      {!isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[150px] bg-gradient-to-br from-purple-200 via-purple-100 to-pink-100 opacity-60" />
          <div className="absolute top-[10%] right-[0%] w-[50%] h-[50%] rounded-full blur-[120px] bg-gradient-to-bl from-purple-300 via-purple-100 to-transparent opacity-40" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full blur-[150px] bg-gradient-to-tr from-purple-200 via-pink-100 to-transparent opacity-50" />
          <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full blur-[100px] bg-gradient-to-r from-purple-100 via-white to-purple-100 opacity-50" />
          <div className="absolute top-[50%] left-[10%] w-[35%] h-[35%] rounded-full blur-[80px] bg-gradient-to-r from-purple-200 to-pink-100 opacity-30" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[90px] bg-gradient-to-bl from-purple-300 to-purple-100 opacity-30" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 relative z-10">
        <button
          onClick={() => setVoiceMode(!voiceMode)}
          className={`group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            voiceMode
              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-105"
              : isDark
              ? "bg-white/5 backdrop-blur-md text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              : "bg-white text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 shadow-sm"
          }`}
          title={voiceMode ? "Stop voice mode" : "Start voice mode"}
        >
          {voiceMode && (
            <span className="absolute inset-0 rounded-full animate-ping bg-cyan-400/30 duration-1000" />
          )}
          <span className="relative flex items-center gap-2">
            <FiMic className={`w-4 h-4 ${voiceMode ? "animate-pulse" : ""}`} />
            <span className="text-sm font-medium hidden sm:inline">
              {voiceMode ? "Listening" : "Voice"}
            </span>
          </span>
        </button>

        <h2 className={`text-lg font-display font-medium ${isDark ? "text-white/80" : "text-gray-500"}`}>
          {sessionId ? "Consultation" : `Welcome, ${profile.name}`}
        </h2>

        <button
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition border ${
            isDark
              ? "bg-white/5 backdrop-blur-md border-white/10 text-white/60 hover:text-white"
              : "bg-white border-gray-200 text-gray-500 hover:text-gray-800 shadow-sm"
          }`}
          title="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 relative z-10 no-scrollbar flex flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center max-w-3xl mx-auto w-full">
            <h1 className={`mb-8 text-2xl font-sans uppercase tracking-widest ${isDark ? "text-white/90" : "text-gray-800"}`}>
              {quote}
            </h1>
            <div className="w-full">
              <ChatInput onSend={sendMessage} disabled={isTyping} isDark={isDark} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} isDark={isDark} />
            ))}
            {isTyping && <TypingIndicator isDark={isDark} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input at bottom only if messages exist */}
      {messages.length > 0 && (
        <div className="relative z-10">
          <ChatInput onSend={sendMessage} disabled={isTyping} isDark={isDark} />
        </div>
      )}

      {/* Voice mode overlay */}
      {voiceMode && (
        <VoiceMode
          isDark={isDark}
          addMessage={addMessage}
          chatEndpoint="http://localhost:8000/api/v1/chat"
          ttsEndpoint="http://localhost:8000/api/v1/chat/tts"
          onClose={() => setVoiceMode(false)}
        />
      )}
    </div>
  );
}
