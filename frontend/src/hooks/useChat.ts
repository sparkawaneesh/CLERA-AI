import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function detectLanguage(text: string): "hi" | "en" {
  return /[\u0900-\u097F]/.test(text) ? "hi" : "en";
}

export function useChat(sessionId?: string | null, initialMessages?: any[], onSessionUpdated?: () => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages from localStorage when sessionId changes
  useEffect(() => {
    if (sessionId) {
      const stored = localStorage.getItem(`aidoc_messages_${sessionId}`);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  // Save messages whenever they change
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(`aidoc_messages_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const language = detectLanguage(text);

    try {
      const response = await apiClient.post("/chat", {
        messages: [...messages, userMsg],
        language,
      });
      const data = response.data;
      const aiMsg: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: " Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
    onSessionUpdated?.();
  }, [messages, sessionId]);

  return { messages, sendMessage, addMessage, isTyping };
}