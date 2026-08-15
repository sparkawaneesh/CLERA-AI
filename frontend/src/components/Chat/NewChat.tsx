"use client";
import { BsStars } from "react-icons/bs";
import { FiX, FiArrowUp, FiEdit3, FiCopy, FiMoreHorizontal, FiFileText, FiImage, FiMic } from "react-icons/fi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { HiOutlineTranslate } from "react-icons/hi";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { getStreamUrl } from "@/lib/api";

interface NewChatProps {
  sessionId: string | null;
  initialMessages: any[];
  onNewChat: () => void;
  onSessionUpdated: () => void;
}

export default function NewChat({ sessionId, initialMessages, onNewChat, onSessionUpdated }: NewChatProps) {
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hi there!\nHow can I help you today?",
      isGreeting: true
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when session changes
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      setMessages([
        {
          role: "assistant",
          content: "Hi there!\nHow can I help you today?",
          isGreeting: true
        }
      ]);
    }
  }, [initialMessages, sessionId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // If no session yet, create one first
    if (!sessionId) {
      onNewChat();
      // We need to wait for the session to be created — the parent will update sessionId.
      // For now, we'll proceed without persistence and the next message will persist.
    }

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(getStreamUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.filter(m => !m.isGreeting), userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          language: /[\u0900-\u097F]/.test(input) ? "hi" : "en",
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      setIsLoading(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines from the buffer
        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastMsg = { ...newMsgs[newMsgs.length - 1] };
                  lastMsg.content = "⚠️ " + parsed.error;
                  newMsgs[newMsgs.length - 1] = lastMsg;
                  return newMsgs;
                });
              } else if (parsed.content) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastMsg = { ...newMsgs[newMsgs.length - 1] };
                  lastMsg.content += parsed.content;
                  newMsgs[newMsgs.length - 1] = lastMsg;
                  return newMsgs;
                });
              }
              // "done" event — refresh session list in parent
              if (parsed.done) {
                onSessionUpdated();
              }
            } catch (e) {
              // Ignore incomplete JSON
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.content) {
              setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = { ...newMsgs[newMsgs.length - 1] };
                lastMsg.content += parsed.content;
                newMsgs[newMsgs.length - 1] = lastMsg;
                return newMsgs;
              });
            }
            if (parsed.done) {
              onSessionUpdated();
            }
          } catch (e) { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Sorry, I could not connect to the backend." }]);
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex-1 h-full backdrop-blur-3xl bg-white/40 shadow-sm border-l border-white/60 flex flex-col overflow-hidden relative font-sans">

      {/* Animated fluid background */}
      <div className="absolute inset-0 overflow-hidden rounded-[40px] -z-10 pointer-events-none bg-white/40">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] bg-blue-300/30 rounded-full blur-[100px] animate-pulse duration-10000"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[60%] bg-green-300/20 rounded-full blur-[100px] animate-pulse duration-7000" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[20%] left-[10%] w-[60%] h-[60%] bg-purple-300/30 rounded-full blur-[100px] animate-pulse duration-10000" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 shrink-0">
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition">
          <BsStars className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-xl font-display font-medium">
          {sessionId ? "Chat" : "New Chat"}
        </h2>
        <button
          onClick={onNewChat}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-black hover:shadow-md transition"
          title="New Chat"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Messages — scrollable area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 flex flex-col gap-4">

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end mt-4' : 'gap-3 mt-4'} animate-in`}>
            {msg.role === 'assistant' && (
              <div className={`rounded-full overflow-hidden shrink-0 shadow-md ${msg.isGreeting ? 'w-12 h-12' : 'w-10 h-10 mt-1'}`}>
                <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80" alt="AI Avatar" width={48} height={48} className="object-cover w-full h-full" unoptimized />
              </div>
            )}

            {msg.role === 'assistant' && msg.isGreeting ? (
              <div className="flex flex-col justify-center">
                <p className="text-gray-600 text-sm mb-1">{msg.content.split('\n')[0]}</p>
                <p className="text-2xl font-semibold font-display">{msg.content.split('\n')[1]}</p>
              </div>
            ) : msg.role === 'assistant' ? (
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl rounded-tl-none shadow-sm flex-1 relative group max-w-[85%] transition-all duration-300 hover:shadow-md">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm break-words">
                  {msg.content}
                </div>
                <div className="absolute -right-12 top-3 flex-col gap-2 opacity-0 group-hover:opacity-100 transition hidden lg:flex">
                  <button onClick={() => handleCopy(msg.content)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-black transition hover:scale-110" title="Copy">
                    <FiCopy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl rounded-tr-none shadow-sm max-w-[75%] transition-all duration-300 hover:shadow-md">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm break-words">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 mt-4 animate-in">
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — sticky at bottom */}
      <div className="shrink-0 px-6 pb-5 pt-3">

        {/* Quick Action Buttons */}
        <div className="flex gap-3 mb-3 justify-center">
          <button
            onClick={() => alert('File upload feature coming soon!')}
            className="p-3 bg-white/60 hover:bg-white/80 transition backdrop-blur-xl rounded-full shadow-sm border border-white/60 group relative"
            title="Chat Files"
          >
            <AiOutlineFilePdf className="w-5 h-5 text-red-500" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg">
              Chat Files
            </span>
          </button>

          <button
            onClick={() => alert('Image upload feature coming soon!')}
            className="p-3 bg-white/60 hover:bg-white/80 transition backdrop-blur-xl rounded-full shadow-sm border border-white/60 group relative"
            title="Images"
          >
            <FiImage className="w-5 h-5 text-green-500" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg">
              Images
            </span>
          </button>

          <button
            onClick={() => alert('Translation model starting...')}
            className="p-3 bg-white/60 hover:bg-white/80 transition backdrop-blur-xl rounded-full shadow-sm border border-white/60 group relative"
            title="Translate"
          >
            <HiOutlineTranslate className="w-5 h-5 text-blue-500" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg">
              Translate
            </span>
          </button>

          <button
            onClick={() => navigator.mediaDevices.getUserMedia({ audio: true }).then(() => alert('Microphone access granted!')).catch(() => alert('Microphone access denied.'))}
            className="p-3 bg-white/60 hover:bg-white/80 transition backdrop-blur-xl rounded-full shadow-sm border border-white/60 group relative"
            title="Audio Chat"
          >
            <FiMic className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg">
              Audio Chat
            </span>
          </button>
        </div>

        {/* Input Field */}
        <div className="bg-white/60 backdrop-blur-xl rounded-full p-2 flex items-center shadow-sm border border-white/60">
          <input
            type="text"
            placeholder="Ask me anything ..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 min-w-0 bg-transparent outline-none px-4 text-gray-700 placeholder-gray-500 font-sans text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
          >
            <FiArrowUp className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

    </div>
  );
}
