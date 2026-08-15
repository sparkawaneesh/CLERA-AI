"use client";
import { FiSearch, FiTrash2, FiMessageCircle, FiMoreHorizontal, FiStar, FiEdit3 } from "react-icons/fi";
import { useState } from "react";

interface Session {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
}

interface ChatResultsProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isDark: boolean;
}

function groupSessionsByDate(sessions: Session[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const groups: { label: string; sessions: Session[] }[] = [
    { label: "Today", sessions: [] },
    { label: "Yesterday", sessions: [] },
    { label: "Older", sessions: [] },
  ];
  for (const s of sessions) {
    const d = new Date(s.updated_at);
    if (d >= today) groups[0].sessions.push(s);
    else if (d >= yesterday) groups[1].sessions.push(s);
    else groups[2].sessions.push(s);
  }
  return groups.filter(g => g.sessions.length > 0);
}

export default function ChatResults({ sessions, activeSessionId, onSelectSession, onDeleteSession, isDark }: ChatResultsProps) {
  const grouped = groupSessionsByDate(sessions);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const bg = isDark ? "bg-[#1a1a1a]" : "bg-white";
  const text = isDark ? "text-white" : "text-gray-900";
  const subtext = isDark ? "text-gray-500" : "text-gray-400";
  const sessionHover = isDark ? "hover:bg-[#222]" : "hover:bg-gray-50";
  const activeBg = isDark ? "bg-white/5 border-white/20" : "bg-gray-100 border-gray-300";
  const iconBg = isDark ? "bg-[#222] text-gray-500" : "bg-gray-100 text-gray-400";
  const iconActiveBg = isDark ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900";
  const timeText = isDark ? "text-gray-600" : "text-gray-400";
  const borderColor = isDark ? "border-white/10" : "border-gray-200";
  const menuBg = isDark ? "bg-[#2a2a2a] border-white/10" : "bg-white border-gray-200";

  const startRename = (session: Session) => {
    setRenaming(session.id);
    setRenameValue(session.title);
    setMenuOpen(null);
  };

  const saveRename = (id: string) => {
    if (!renameValue.trim()) return;
    const stored = JSON.parse(localStorage.getItem("aidoc_sessions") || "[]");
    const updated = stored.map((s: Session) => s.id === id ? { ...s, title: renameValue.trim() } : s);
    localStorage.setItem("aidoc_sessions", JSON.stringify(updated));
    window.location.reload();
  };

  const addToFavourites = (session: Session) => {
    const favs = JSON.parse(localStorage.getItem("aidoc_favourites") || "[]");
    const exists = favs.find((f: any) => f.id === session.id);
    if (!exists) {
      favs.push({ id: session.id, type: "chat", title: session.title, addedAt: new Date().toISOString() });
      localStorage.setItem("aidoc_favourites", JSON.stringify(favs));
      alert("⭐ Added to favourites!");
    } else {
      alert("Already in favourites.");
    }
    setMenuOpen(null);
  };

  return (
    <div className={`flex flex-col w-full min-w-[250px] max-w-[600px] h-full overflow-y-auto resize-x no-scrollbar py-6 px-4 z-10 shrink-0 ${bg}`}>
      <h2 className={`text-xl font-bold mb-5 pl-2 font-display ${text}`}>Chats</h2>

      {sessions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {grouped.map((group) => (
            <div key={group.label}>
              <h3 className={`text-xs uppercase font-semibold mb-2 pl-2 ${subtext}`}>{group.label}</h3>
              <div className="flex flex-col gap-1">
                {group.sessions.map((session) => (
                  <div key={session.id} className="relative group">
                    {renaming === session.id ? (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${isDark ? "border-white/30 bg-[#222]" : "border-gray-400 bg-white"}`}>
                        <FiEdit3 className={`w-4 h-4 shrink-0 ${isDark ? "text-white/60" : "text-gray-500"}`} />
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveRename(session.id); if (e.key === "Escape") setRenaming(null); }}
                          className={`flex-1 bg-transparent text-sm font-medium focus:outline-none ${isDark ? "text-white" : "text-gray-900"}`}
                          autoFocus
                        />
                        <button onClick={() => saveRename(session.id)} className={`text-xs font-medium px-2 py-0.5 rounded-md ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Save</button>
                        <button onClick={() => setRenaming(null)} className={`text-xs px-2 py-0.5 rounded-md ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}>Cancel</button>
                      </div>
                    ) : (
                      <div
                        onClick={() => onSelectSession(session.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") onSelectSession(session.id); }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-start gap-3 border cursor-pointer ${
                          activeSessionId === session.id
                            ? activeBg
                            : `${sessionHover} border-transparent`
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${activeSessionId === session.id ? iconActiveBg : iconBg}`}>
                          <FiMessageCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${text}`}>{session.title}</p>
                          {session.last_message && (
                            <p className={`text-xs truncate mt-0.5 ${subtext}`}>{session.last_message}</p>
                          )}
                          <p className={`text-[10px] mt-1 ${timeText}`}>
                            {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Three‑dots menu */}
                        <div className="relative shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === session.id ? null : session.id);
                            }}
                            className={`p-1.5 rounded-lg transition ${
                              isDark
                                ? "text-white/80 hover:text-white hover:bg-white/10"
                                : "text-gray-800 hover:text-black hover:bg-gray-200"
                            }`}
                          >
                            <FiMoreHorizontal className="w-4 h-4" />
                          </button>

                          {menuOpen === session.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className={`absolute right-0 top-8 z-20 w-44 rounded-xl border shadow-lg py-1 ${menuBg}`}>
                                <button
                                  onClick={() => addToFavourites(session)}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition ${isDark ? "text-white/70 hover:text-white hover:bg-[#333]" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                                >
                                  <FiStar className="w-4 h-4" /> Add to favourites
                                </button>
                                <button
                                  onClick={() => startRename(session)}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition ${isDark ? "text-white/70 hover:text-white hover:bg-[#333]" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                                >
                                  <FiEdit3 className="w-4 h-4" /> Rename
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this chat?")) onDeleteSession(session.id);
                                    setMenuOpen(null);
                                  }}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition ${isDark ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" : "text-red-500 hover:text-red-600 hover:bg-red-50"}`}
                                >
                                  <FiTrash2 className="w-4 h-4" /> Delete Chat
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50 px-4 pb-20">
          <FiSearch className="w-12 h-12 mb-4 text-gray-600" />
          <p className={`font-medium text-lg ${text}`}>No Chats Found</p>
          <p className={`text-sm ${subtext}`}>Your conversations will appear here.</p>
        </div>
      )}
    </div>
  );
}