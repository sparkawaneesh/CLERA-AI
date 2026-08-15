"use client";
import { useState } from "react";
import { FiSend, FiMic, FiMicOff } from "react-icons/fi";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isDark: boolean;
  voiceMode?: boolean;
  onToggleVoice?: () => void;
}

export default function ChatInput({
  onSend,
  disabled,
  isDark,
  voiceMode = false,
  onToggleVoice,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-3 px-4 pb-4 pt-2">
      <div
        className={`flex-1 flex items-center rounded-2xl border transition-all duration-300 ${
          isDark
            ? "bg-white/5 border-white/10 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,242,254,0.4)] shadow-[0_0_8px_rgba(0,242,254,0.15)]"
            : "bg-white border-gray-200 focus-within:border-cyan-400 focus-within:shadow-[0_0_10px_rgba(0,242,254,0.2)]"
        }`}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={voiceMode ? "Listening..." : "Describe your symptoms or ask a question..."}
          disabled={disabled}
          rows={1}
          className={`w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/30 ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        />
        {onToggleVoice && (
          <button
            type="button"
            onClick={onToggleVoice}
            className={`relative p-2 mr-1 rounded-full transition-all ${
              voiceMode
                ? "text-cyan-400"
                : isDark
                ? "text-white/40 hover:text-white"
                : "text-gray-400 hover:text-gray-700"
            }`}
            title={voiceMode ? "Stop listening" : "Start voice mode"}
          >
            {voiceMode ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
            {voiceMode && (
              <span className="absolute inset-0 rounded-full animate-ping bg-cyan-400/20" />
            )}
          </button>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        className={`shrink-0 p-3 rounded-full transition-all ${
          disabled || !input.trim()
            ? isDark
              ? "bg-white/5 text-white/20"
              : "bg-gray-100 text-gray-300"
            : isDark
            ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)]"
            : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-md"
        }`}
      >
        <FiSend className="w-5 h-5" />
      </button>
    </div>
  );
}