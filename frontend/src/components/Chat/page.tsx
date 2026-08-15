"use client";
import { useState } from "react";
import ChatWindow from "@/components/Chat/ChatWindow";
import ChatResults from "@/components/Chat/ChatResults";

interface LocalSession {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
}

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [middlePanel, setMiddlePanel] = useState<string | null>(null);

  const getSessions = (): LocalSession[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem("aidoc_sessions");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const [sessions, setSessions] = useState<LocalSession[]>(getSessions());

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    const newSession: LocalSession = {
      id: newId,
      title: "New Chat",
      last_message: "",
      updated_at: new Date().toISOString(),
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("aidoc_sessions", JSON.stringify(updated));
    setActiveSessionId(newId);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("aidoc_sessions", JSON.stringify(updated));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const sidebarButtons = [
    { id: "arrow", icon: "←", label: "Home", action: () => window.location.href = "/" },
    { id: "newchat", icon: "+", label: "New Chat", action: handleNewChat },
    { id: "chats", icon: "💬", label: "Chats", action: () => setMiddlePanel(middlePanel === "chats" ? null : "chats") },
    { id: "favourites", icon: "⭐", label: "Favourites", action: () => setMiddlePanel(middlePanel === "favourites" ? null : "favourites") },
    { id: "sync", icon: "🔄", label: "Sync", action: () => setMiddlePanel(middlePanel === "sync" ? null : "sync") },
    { id: "documents", icon: "📄", label: "Documents", action: () => setMiddlePanel(middlePanel === "documents" ? null : "documents") },
    { id: "settings", icon: "⚙️", label: "Settings", action: () => setMiddlePanel(middlePanel === "settings" ? null : "settings") },
    { id: "profile", icon: "👤", label: "Profile", action: () => setMiddlePanel(middlePanel === "profile" ? null : "profile") },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Mobile toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden fixed top-20 left-4 z-50 bg-[#2e2e2e] text-white p-2 rounded-full shadow-lg border border-white/10">
        ☰
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} md:flex md:flex-col md:h-full md:w-20 md:items-center md:shrink-0 md:border-r md:border-white/10 md:bg-[#2a2a2a] md:z-20 md:py-6 md:gap-5`}>
        {sidebarButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={btn.action}
            title={btn.label}
            className={`p-3 rounded-full bg-[#323232] hover:bg-white/10 text-white/60 hover:text-white/90 transition border border-white/5 ${
              middlePanel === btn.id ? "bg-white/15 text-white border-white/20" : ""
            }`}
          >
            <span className="text-lg">{btn.icon}</span>
          </button>
        ))}
      </div>

      {/* Middle panel */}
      {middlePanel === "chats" && (
        <div className="hidden md:block shrink-0">
<ChatResults sessions={sessions} activeSessionId={activeSessionId} onSelectSession={handleSelectSession} onDeleteSession={handleDeleteSession} isDark={isDark} />
        </div>
      )}
      {middlePanel && middlePanel !== "chats" && (
        <div className="hidden md:flex w-[350px] h-full bg-[#2a2a2a] border-r border-white/10 items-center justify-center shrink-0">
          <div className="text-center text-white/50">
            <span className="text-4xl block mb-3">{sidebarButtons.find(b => b.id === middlePanel)?.icon}</span>
            <p className="text-lg text-white/80 font-medium">{sidebarButtons.find(b => b.id === middlePanel)?.label}</p>
            <p className="text-sm mt-1">Coming soon</p>
          </div>
        </div>
      )}

      {/* Main chat */}
      <div className="flex-1">
        <ChatResults sessions={sessions} activeSessionId={activeSessionId} onSelectSession={handleSelectSession} onDeleteSession={handleDeleteSession} isDark={isDark} />
      </div>
    </div>
  );
}