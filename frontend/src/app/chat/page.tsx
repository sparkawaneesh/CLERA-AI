"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ChatWindow from "@/components/Chat/ChatWindow";
import ChatResults from "@/components/Chat/ChatResults";
import {
  FiGrid,
  FiArrowLeft,
  FiPlus,
  FiMessageCircle,
  FiFileText,
  FiSettings,
  FiUser,
  FiEye,
  FiX,
} from "react-icons/fi";

interface LocalSession {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
}

interface DocItem {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  data: string;
  ocrText?: string;
  ocrLoading?: boolean;
}

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tabHistory, setTabHistory] = useState<string[]>([]);
  const [viewingDoc, setViewingDoc] = useState<DocItem | null>(null);
  const [panelWidth, setPanelWidth] = useState(420);
  const [isDark, setIsDark] = useState(true);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [ocrPendingText, setOcrPendingText] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newDocId, setNewDocId] = useState<string | null>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("aidoc_theme");
    setIsDark(saved !== "light");
  }, []);

  useEffect(() => {
    setDocuments(JSON.parse(localStorage.getItem("aidoc_documents") || "[]"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("aidoc_theme", next ? "dark" : "light");
  };

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

  const refreshDocs = () =>
    setDocuments(JSON.parse(localStorage.getItem("aidoc_documents") || "[]"));

  const handleAnalyzeWithAIDOC = async (doc: DocItem) => {
    const updated = documents.map((d) =>
      d.id === doc.id ? { ...d, ocrLoading: true } : d
    );
    setDocuments(updated);
    localStorage.setItem("aidoc_documents", JSON.stringify(updated));

    try {
      const base64 = doc.data.split(",")[1];
      const byteChars = atob(base64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++)
        byteNums[i] = byteChars.charCodeAt(i);
      const byteArr = new Uint8Array(byteNums);
      const blob = new Blob([byteArr], { type: doc.type });
      const form = new FormData();
      form.append("file", blob, doc.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const res = await fetch("http://localhost:8000/api/v1/documents/ocr", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      let rawText = data.text || "";

      const final = documents.map((d) =>
        d.id === doc.id
          ? { ...d, ocrText: rawText, ocrLoading: false }
          : d
      );
      setDocuments(final);
      localStorage.setItem("aidoc_documents", JSON.stringify(final));

      if (rawText) {
        setOcrPendingText(rawText);
      }
    } catch {
      const final = documents.map((d) =>
        d.id === doc.id
          ? { ...d, ocrLoading: false, ocrText: "OCR failed. Is the backend running?" }
          : d
      );
      setDocuments(final);
      localStorage.setItem("aidoc_documents", JSON.stringify(final));
    }
  };

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
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem("aidoc_sessions", JSON.stringify(updated));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const openTab = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab(null);
      setTabHistory([]);
      setViewingDoc(null);
      return;
    }
    const filtered = tabHistory.filter((t) => t !== tab);
    if (!activeTab) {
      setActiveTab(tab);
      setTabHistory([tab]);
    } else if (filtered.length >= 1) {
      const current = activeTab;
      setActiveTab(tab);
      setTabHistory([current, tab]);
    } else {
      setActiveTab(tab);
      setTabHistory([...filtered, tab]);
    }
  };

  const closePanel = () => {
    setActiveTab(null);
    setTabHistory([]);
    setViewingDoc(null);
  };

  const addDocument = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const id = crypto.randomUUID();
      const docs = JSON.parse(localStorage.getItem("aidoc_documents") || "[]");
      const newDoc: DocItem = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        date: new Date().toISOString(),
        data: reader.result as string,
      };
      docs.push(newDoc);
      localStorage.setItem("aidoc_documents", JSON.stringify(docs));
      refreshDocs();
      setNewDocId(id);
      setTimeout(() => setNewDocId(null), 2000);
      alert(`✅ "${file.name}" uploaded!`);
    };
    reader.readAsDataURL(file);
  };

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX - 80;
    if (newWidth >= 300 && newWidth <= 700) setPanelWidth(newWidth);
  }, []);

  const stopResize = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleResize]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResize);
    };
  }, [handleResize, stopResize]);

  // ---------- Theme variables ----------
  const outerBg = isDark ? "bg-[#0B0D12]" : "bg-[#f5f3f7]";
  const panelBg = isDark
    ? "bg-white/5 backdrop-blur-xl border border-white/10"
    : "bg-white/70 backdrop-blur-xl border border-gray-200";
  const cardBg = isDark
    ? "bg-white/5 backdrop-blur-md border border-white/5"
    : "bg-white/80 backdrop-blur-md border border-gray-200";
  const borderColor = isDark ? "border-white/10" : "border-gray-200";
  const headingColor = isDark ? "text-white/90" : "text-gray-900";
  const subtextColor = isDark ? "text-white/40" : "text-gray-500";
  const shadow = "shadow-sm";

  const renderDocViewer = () => {
    if (!viewingDoc) return null;
    const doc = documents.find((d) => d.id === viewingDoc.id) || viewingDoc;
    return (
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold truncate flex-1 ${headingColor}`}>
            {doc.name}
          </h2>
          <button
            onClick={() => setViewingDoc(null)}
            className={`p-2 rounded-xl border ${borderColor} ${cardBg} ${shadow} ${
              isDark
                ? "text-white/50 hover:text-white hover:bg-[#333]"
                : "text-gray-400 hover:text-gray-800 hover:bg-gray-50"
            } transition ml-3`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <p className={`text-xs ${subtextColor}`}>
            {new Date(doc.date).toLocaleString()} · {(doc.size / 1024).toFixed(1)} KB
          </p>
          {!doc.ocrLoading && (
            <button
              onClick={() => handleAnalyzeWithAIDOC(doc)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${borderColor} ${
                isDark
                  ? "bg-white/5 text-white/70 hover:bg-white/10"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Send to AIDOC
            </button>
          )}
          {doc.ocrLoading && (
            <span className={`text-xs ${subtextColor}`}>⏳ Extracting text…</span>
          )}
        </div>
        {doc.ocrText && (
          <div
            className={`mb-4 p-4 rounded-xl border ${borderColor} ${cardBg} ${shadow} max-h-[40%] overflow-y-auto`}
          >
            <p className={`text-xs font-semibold uppercase ${subtextColor}`}>
              Extracted Text
            </p>
            <p
              className={`text-sm whitespace-pre-wrap ${
                isDark ? "text-white/80" : "text-gray-700"
              }`}
            >
              {doc.ocrText}
            </p>
          </div>
        )}
        <div
          className={`flex-1 overflow-auto rounded-2xl flex items-center justify-center border ${borderColor} ${
            isDark ? "bg-black/30" : "bg-gray-100"
          }`}
        >
          {doc.type.includes("pdf") ? (
            <iframe src={doc.data} className="w-full h-full rounded-2xl" title={doc.name} />
          ) : (
            <img src={doc.data} alt={doc.name} className="max-w-full max-h-full object-contain rounded-2xl" />
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = (tab: string) => {
    if (viewingDoc) return renderDocViewer();

    switch (tab) {
      case "chats":
        return (
          <ChatResults
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            isDark={isDark}
          />
        );
      case "documents":
        return (
          <div className="p-5">
            <h2 className={`text-xl font-bold mb-6 ${headingColor}`}>Documents</h2>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) addDocument(file);
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center block cursor-pointer transition-all duration-300 glass-border mb-4 ${
                isDragOver
                  ? "border-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.4)] animate-pulse"
                  : isDark
                  ? "border-white/10 hover:bg-white/5"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-4xl block mb-3">{isDragOver ? "📁" : "📤"}</span>
              <p className={`font-medium mb-1 ${isDark ? "text-white/70" : "text-gray-700"}`}>
                {isDragOver ? "Drop your medical file here" : "Upload Medical Files"}
              </p>
              <p className={`text-sm ${subtextColor}`}>Prescriptions, lab reports, scans</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addDocument(file);
                }}
              />
            </label>

            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className={`text-center text-sm py-12 ${subtextColor}`}>
                  No documents uploaded yet.
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`relative flex items-center justify-between p-4 rounded-xl glass-border transition-all duration-300 ${cardBg} ${
                      isDark
                        ? "hover:bg-white/10 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,242,254,0.08)]"
                        : "hover:bg-white hover:shadow-md"
                    } ${newDocId === doc.id ? "scanline" : ""}`}
                  >
                    {newDocId === doc.id && (
                      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                        <div className="scanline-effect" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                      <span className="text-lg shrink-0">
                        {doc.type.includes("pdf") ? "📕" : "🖼️"}
                      </span>
                      <div className="truncate">
                        <p
                          className={`text-sm truncate ${
                            isDark ? "text-white/80" : "text-gray-700"
                          }`}
                        >
                          {doc.name}
                        </p>
                        <p className={`text-xs ${subtextColor}`}>
                          {new Date(doc.date).toLocaleDateString()} · {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {!doc.ocrLoading && (
                        <button
                          onClick={() => handleAnalyzeWithAIDOC(doc)}
                          className={`p-2 rounded-lg border ${borderColor} ${cardBg} ${shadow} ${
                            isDark
                              ? "text-white/40 hover:text-white hover:bg-[#333]"
                              : "text-gray-400 hover:text-gray-800 hover:bg-gray-50"
                          } transition`}
                          title="Send to AIDOC"
                        >
                          <FiMessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      {doc.ocrLoading && <span className="text-xs text-gray-500">⏳</span>}
                      <button
                        onClick={() => {
                          const docFull = documents.find((d) => d.id === doc.id);
                          setViewingDoc(docFull || doc);
                        }}
                        className={`p-2 rounded-lg border ${borderColor} ${cardBg} ${shadow} ${
                          isDark
                            ? "text-white/40 hover:text-white hover:bg-[#333]"
                            : "text-gray-400 hover:text-gray-800 hover:bg-gray-50"
                        } transition`}
                        title="View"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const updated = documents.filter((d: DocItem) => d.id !== doc.id);
                          setDocuments(updated);
                          localStorage.setItem("aidoc_documents", JSON.stringify(updated));
                        }}
                        className={`p-2 rounded-lg border ${borderColor} ${cardBg} ${shadow} ${
                          isDark
                            ? "text-white/40 hover:text-red-400 hover:bg-red-500/10"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        } transition`}
                        title="Delete"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="p-5">
            <h2 className={`text-xl font-bold mb-6 ${headingColor}`}>Settings</h2>
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border ${borderColor} ${cardBg} ${shadow}`}>
                <p className={`font-medium mb-1 ${isDark ? "text-white/80" : "text-gray-800"}`}>
                  AI Model
                </p>
                <p className={`text-sm ${subtextColor}`}>Currently: aidoc-medical (local)</p>
              </div>
              <div className={`p-4 rounded-xl border ${borderColor} ${cardBg} ${shadow}`}>
                <p className={`font-medium mb-2 ${isDark ? "text-white/80" : "text-gray-800"}`}>
                  Language
                </p>
                <div className="flex gap-2">
                  {["en", "hi", "auto"].map((lang) => {
                    const current = localStorage.getItem("aidoc_language") || "auto";
                    return (
                      <button
                        key={lang}
                        onClick={() => localStorage.setItem("aidoc_language", lang)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
                          current === lang
                            ? isDark
                              ? "bg-white text-black border-white"
                              : "bg-black text-white border-black"
                            : isDark
                            ? "bg-transparent border-white/10 text-white/50 hover:text-white hover:border-white/30"
                            : "bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400"
                        }`}
                      >
                        {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "Auto"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ---------- HEALTH SYNC (moved from left panel) ---------- */}
              <div className={`p-4 rounded-xl border ${borderColor} ${cardBg} ${shadow}`}>
                <p className={`font-medium mb-3 ${isDark ? "text-white/80" : "text-gray-800"}`}>
                  Health Sync
                </p>
                <div className="space-y-2">
                  {["Google Fit", "Apple Health"].map((name) => {
                    const key = name === "Google Fit" ? "aidoc_sync_google" : "aidoc_sync_apple";
                    const connected = localStorage.getItem(key) === "true";
                    return (
                      <div key={name} className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>
                          {name}
                        </span>
                        <button
                          onClick={() => {
                            localStorage.setItem(key, String(!connected));
                            // Force re-render by toggling a dummy state if needed, but this is fine for now
                            window.location.reload();
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${
                            connected
                              ? "bg-green-600/20 text-green-400 border-green-500/30"
                              : isDark
                              ? "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border-white/10"
                              : "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-gray-200"
                          }`}
                        >
                          {connected ? "✓ Connected" : "Connect"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${borderColor} ${cardBg} ${shadow}`}>
                <p className={`font-medium mb-2 ${isDark ? "text-white/80" : "text-gray-800"}`}>Data</p>
                <button
                  onClick={() => {
                    if (confirm("Delete all chats, documents, and settings?")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="p-5">
            <h2 className={`text-xl font-bold mb-6 ${headingColor}`}>Profile</h2>
            <div className="flex flex-col items-center mb-6">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 border-2 text-3xl ${
                  isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"
                }`}
              >
                👤
              </div>
              <input
                type="text"
                defaultValue={(() => {
                  if (typeof window === "undefined") return "";
                  const p = localStorage.getItem("aidoc_patient_profile");
                  return p ? JSON.parse(p).name : "";
                })()}
                onBlur={(e) => {
                  const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}");
                  p.name = e.target.value;
                  localStorage.setItem("aidoc_patient_profile", JSON.stringify(p));
                }}
                className={`text-center bg-transparent text-lg font-medium border-b pb-1 focus:outline-none ${
                  isDark
                    ? "text-white/90 border-white/10 focus:border-white/30"
                    : "text-gray-800 border-gray-200 focus:border-gray-400"
                } placeholder-gray-400`}
                placeholder="Your name"
              />
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${subtextColor}`}>
              Personal
            </h3>
            <div className="space-y-2 mb-5">
              {[
                { label: "Date of Birth", key: "dob", placeholder: "DD/MM/YYYY" },
                { label: "Gender", key: "gender", placeholder: "Male / Female / Other" },
                { label: "Height (cm)", key: "height", placeholder: "e.g. 170" },
                { label: "Age", key: "age", placeholder: "Enter age" },
                { label: "Blood Group", key: "bloodGroup", placeholder: "A+ / B+ / O+ etc." },
              ].map((field) => {
                const saved = (() => {
                  if (typeof window === "undefined") return "";
                  const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}");
                  return p[field.key] || "";
                })();
                return (
                  <div
                    key={field.key}
                    className={`p-3 rounded-xl border ${borderColor} ${cardBg} ${shadow}`}
                  >
                    <p className={`text-xs uppercase mb-0.5 ${subtextColor}`}>{field.label}</p>
                    <input
                      type="text"
                      defaultValue={saved}
                      onBlur={(e) => {
                        const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}");
                        p[field.key] = e.target.value;
                        localStorage.setItem("aidoc_patient_profile", JSON.stringify(p));
                      }}
                      className={`w-full bg-transparent text-sm focus:outline-none ${
                        isDark ? "text-white/80" : "text-gray-700"
                      }`}
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              })}
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${subtextColor}`}>
              Medical
            </h3>
            <div className="space-y-2 mb-5">
              {[
                { label: "Allergies", key: "allergies", placeholder: "e.g. Penicillin, Peanuts" },
                { label: "Medical Conditions", key: "conditions", placeholder: "e.g. Diabetes, Asthma" },
              ].map((field) => {
                const saved = (() => {
                  if (typeof window === "undefined") return "";
                  const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}");
                  return p[field.key] || "";
                })();
                return (
                  <div
                    key={field.key}
                    className={`p-3 rounded-xl border ${borderColor} ${cardBg} ${shadow}`}
                  >
                    <p className={`text-xs uppercase mb-0.5 ${subtextColor}`}>{field.label}</p>
                    <input
                      type="text"
                      defaultValue={saved}
                      onBlur={(e) => {
                        const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}");
                        p[field.key] = e.target.value;
                        localStorage.setItem("aidoc_patient_profile", JSON.stringify(p));
                      }}
                      className={`w-full bg-transparent text-sm focus:outline-none ${
                        isDark ? "text-white/80" : "text-gray-700"
                      }`}
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              })}
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${subtextColor}`}>
              Lifestyle
            </h3>
            <div className="space-y-2 mb-5">
              {[
                { label: "Diet Preference", key: "diet", placeholder: "Veg / Non‑Veg / Vegan / Jain" },
                { label: "Exercise Frequency", key: "exercise", placeholder: "None / Light / Moderate / Heavy" },
              ].map((field) => {
                const saved = (() => {
                  if (typeof window === "undefined") return "";
                  const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}");
                  return p[field.key] || "";
                })();
                return (
                  <div
                    key={field.key}
                    className={`p-3 rounded-xl border ${borderColor} ${cardBg} ${shadow}`}
                  >
                    <p className={`text-xs uppercase mb-0.5 ${subtextColor}`}>{field.label}</p>
                    <input
                      type="text"
                      defaultValue={saved}
                      onBlur={(e) => {
                        const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}");
                        p[field.key] = e.target.value;
                        localStorage.setItem("aidoc_patient_profile", JSON.stringify(p));
                      }}
                      className={`w-full bg-transparent text-sm focus:outline-none ${
                        isDark ? "text-white/80" : "text-gray-700"
                      }`}
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              })}
            </div>
            {/* Health Metrics still in Profile for editing, but displayed on Dashboard */}
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${subtextColor}`}>
              Health Metrics
            </h3>
            <div className="space-y-2">
              {[
                { label: "Heart Rate (bpm)", key: "heartRate", icon: "❤️" },
                { label: "Blood Pressure", key: "bloodPressure", icon: "🩸" },
                { label: "Weight (kg)", key: "weight", icon: "⚖️" },
                { label: "Sleep (hours)", key: "sleep", icon: "😴" },
                { label: "Steps (daily)", key: "steps", icon: "👣" },
                { label: "Blood Sugar (mg/dL)", key: "bloodSugar", icon: "🩸" },
              ].map((item) => {
                const saved = JSON.parse(localStorage.getItem("aidoc_health_data") || "{}");
                return (
                  <div
                    key={item.key}
                    className={`p-3 rounded-xl border flex items-center gap-3 ${borderColor} ${cardBg} ${shadow}`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <div className="flex-1">
                      <p className={`text-xs mb-0.5 ${isDark ? "text-white/60" : "text-gray-600"}`}>
                        {item.label}
                      </p>
                      <input
                        type="text"
                        placeholder="Enter value"
                        defaultValue={saved[item.key] || ""}
                        onBlur={(e) => {
                          const data = JSON.parse(localStorage.getItem("aidoc_health_data") || "{}");
                          data[item.key] = e.target.value;
                          localStorage.setItem("aidoc_health_data", JSON.stringify(data));
                        }}
                        className={`w-full rounded-lg px-2 py-1.5 text-sm focus:outline-none border ${
                          isDark
                            ? "bg-[#1a1a1a] border-white/10 text-white/70 focus:border-white/20"
                            : "bg-gray-50 border-gray-200 text-gray-600 focus:border-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const tabLabels: Record<string, { label: string }> = {
    chats: { label: "Chats" },
    documents: { label: "Docs" },
    settings: { label: "Settings" },
    profile: { label: "Profile" },
  };

  const topButtons = [
    {
      id: "dashboard",
      icon: <FiGrid className="w-5 h-5" />,
      label: "Dashboard",
      action: () => (window.location.href = "/"),
    },
  ];

  const mainButtons = [
    {
      id: "newchat",
      icon: <FiPlus className="w-5 h-5" />,
      label: "New Chat",
      action: handleNewChat,
    },
    {
      id: "chats",
      icon: <FiMessageCircle className="w-5 h-5" />,
      label: "Chats",
      action: () => openTab("chats"),
    },
    {
      id: "documents",
      icon: <FiFileText className="w-5 h-5" />,
      label: "Documents",
      action: () => openTab("documents"),
    },
  ];

  const bottomButtons = [
    {
      id: "settings",
      icon: <FiSettings className="w-5 h-5" />,
      label: "Settings",
      action: () => openTab("settings"),
    },
    {
      id: "profile",
      icon: <FiUser className="w-5 h-5" />,
      label: "Profile",
      action: () => openTab("profile"),
    },
  ];

  const sidebarContainer = "w-full lg:w-[80px] lg:h-[calc(100vh-16px)] flex lg:flex-col items-center shrink-0 z-30 py-5 bg-transparent";

  const groupBase = "flex flex-col gap-3 p-2 rounded-[28px] bg-[#0E1625] shadow-lg";

  const iconBase = "w-12 h-12 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center bg-transparent";
  const iconInactive = "text-white/60 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95";
  const iconActive = "text-white bg-white/20 shadow-sm scale-105";

  return (
    <div className={`h-screen flex overflow-hidden gap-2 p-2 ${outerBg} relative`}>
      {/* Subtle radial gradient backdrop */}
      {isDark && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, #1a1e2b 0%, #0B0D12 70%)",
          }}
        />
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`md:hidden fixed top-20 left-4 z-50 p-2.5 rounded-xl shadow-md border ${borderColor} ${panelBg}`}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex ${sidebarContainer}`}
      >
        {/* Top Group */}
        <div className={groupBase}>
          {topButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.action}
              title={btn.label}
              className={`${iconBase} ${iconInactive}`}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Middle Group */}
        <div className={`${groupBase} my-auto`}>
          {mainButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.action}
              title={btn.label}
              className={`${iconBase} ${
                activeTab === btn.id ? iconActive : iconInactive
              }`}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Bottom Group */}
        <div className={groupBase}>
          {bottomButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.action}
              title={btn.label}
              className={`${iconBase} ${
                activeTab === btn.id ? iconActive : iconInactive
              }`}
            >
              {btn.icon}
            </button>
          ))}
          <button
            onClick={toggleTheme}
            className={`${iconBase} ${iconInactive}`}
            title="Toggle theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Middle panel with spring slide transition + laser right edge */}
      <div
        className={`hidden md:flex relative shrink-0 items-stretch gap-0 transition-all duration-500 ease-out ${
          activeTab
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
      >
        {activeTab && (
          <div className="relative shrink-0">
            <div
              style={{ width: `${panelWidth}px` }}
              className={`flex flex-col h-full rounded-2xl border ${borderColor} ${panelBg} ${shadow} laser-right-edge`}
            >
              {/* Tab header */}
              {tabHistory.length > 1 && !viewingDoc && (
                <div className="flex gap-1.5 p-3 pb-2">
                  {tabHistory.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setViewingDoc(null);
                      }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition border ${
                        activeTab === tab
                          ? isDark
                            ? "bg-white/10 text-white border-white/20"
                            : "bg-gray-100 text-gray-900 border-gray-300"
                          : isDark
                          ? "text-gray-500 hover:text-white hover:bg-[#222] border-transparent"
                          : "text-gray-400 hover:text-gray-700 hover:bg-gray-50 border-transparent"
                      }`}
                    >
                      {tabLabels[tab]?.label}
                    </button>
                  ))}
                </div>
              )}
              {tabHistory.length <= 1 && !viewingDoc && (
                <div className="px-4 pt-3 pb-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}>
                    {tabLabels[activeTab]?.label}
                  </span>
                </div>
              )}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {renderTabContent(activeTab)}
              </div>
              <div className="px-3 pb-3">
                <button
                  onClick={closePanel}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition border ${borderColor} ${
                    isDark
                      ? "text-white/40 hover:text-white hover:bg-[#222]"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Close Panel
                </button>
              </div>
            </div>
            {/* Resize handle */}
            <div
              onMouseDown={startResize}
              className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize hover:bg-purple-500/20 transition-colors z-50 flex items-center justify-center"
            >
              <div className="w-1 h-10 rounded-full bg-gray-300/50 hover:bg-purple-400/50 transition-colors" />
            </div>
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div
        className={`flex-1 h-full rounded-2xl overflow-hidden border ${
          isDark ? "border-white/10" : "border-gray-800"
        }`}
      >
        <ChatWindow
          sessionId={activeSessionId}
          isDark={isDark}
          toggleTheme={toggleTheme}
          autoSendMessage={ocrPendingText}
          onMessageSent={() => setOcrPendingText(null)}
        />
      </div>
    </div>
  );
}