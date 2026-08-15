"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FiGrid,
  FiFileText,
  FiSettings,
  FiBell,
  FiSearch,
  FiPlus,
  FiX,
  FiShield,
  FiAlertTriangle,
  FiCheck,
  FiActivity,
  FiDroplet,
  FiHeart,
  FiZap,
  FiSun,
  FiMessageCircle,
  FiUser,
  FiEye,
  FiBarChart2,
  FiTrendingUp,
  FiChevronUp,
  FiChevronDown,
  FiMove,
} from "react-icons/fi";

/* ─────────────────── Types ─────────────────── */
interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  frequency: string;
  dosesRemaining: number;
  totalDoses: number;
  addedAt: string;
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

interface LocalSession {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
}

/* ─────────────────── SVG Sparkline Component ─────────────────── */
function Sparkline({ color, data, height = "h-8" }: { color: string; data: number[]; height?: string }) {
  const w = 90;
  const h = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full ${height} overflow-visible`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────── Logo Component ─────────────────── */
function CleraLogo({ size = "md", darkText = false }: { size?: "sm" | "md" | "lg"; darkText?: boolean }) {
  const iconSizes = { sm: "w-8 h-8", md: "w-11 h-11", lg: "w-14 h-14" };
  const textSizes = { sm: "text-2xl", md: "text-3xl", lg: "text-4xl" };

  return (
    <div className="flex items-center gap-3 cursor-pointer group shrink-0 select-none">
      <div className={`${iconSizes[size]} rounded-2xl bg-gradient-to-tr from-[#4F7DF2] via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-[#4F7DF2]/30 group-hover:scale-105 transition-transform`}>
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white">
          <circle cx="12" cy="12" r="9" opacity="0.35" />
          <path d="M12 6.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm0 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="currentColor" />
        </svg>
      </div>
      <span className={`${textSizes[size]} font-black tracking-widest ${darkText ? "text-[#1C2536]" : "text-white"} font-poppins uppercase`}>
        CLERA<span className="text-[#4F7DF2]">.</span>
      </span>
    </div>
  );
}

/* ─────────────────── Glowing AI Brain Component ─────────────────── */
function GlowingAIBrain() {
  return (
    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#0F172A]/5 to-[#1E293B]/10">
      <div className="absolute w-28 h-28 rounded-full bg-cyan-400/20 blur-xl animate-pulse" />
      <div className="absolute w-20 h-20 rounded-full bg-purple-500/20 blur-lg" />

      <svg viewBox="0 0 200 160" className="w-48 h-36 relative z-10 drop-shadow-[0_0_12px_rgba(46,134,171,0.5)]">
        <defs>
          <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#4F7DF2" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>
        <path d="M60 80 Q70 40 100 35 Q130 35 140 70 Q150 100 130 120 Q100 130 80 120 Q50 100 60 80 Z" fill="none" stroke="url(#brainGrad)" strokeWidth="2.5" strokeDasharray="4 2" />
        <path d="M75 75 Q85 50 100 48 Q115 50 125 75 Q130 95 115 110 Q100 115 85 110 Z" fill="none" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.7" />
        <ellipse cx="100" cy="80" rx="65" ry="22" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" transform="rotate(-15 100 80)" />
        <ellipse cx="100" cy="80" rx="55" ry="18" fill="none" stroke="#C084FC" strokeWidth="1.5" opacity="0.5" transform="rotate(25 100 80)" />
        <circle cx="100" cy="35" r="4" fill="#00F2FE" className="animate-ping" />
        <circle cx="140" cy="70" r="3.5" fill="#38BDF8" />
        <circle cx="130" cy="120" r="4" fill="#C084FC" />
        <circle cx="60" cy="80" r="3.5" fill="#00F2FE" />
        <circle cx="100" cy="80" r="6" fill="url(#brainGrad)" />
      </svg>
    </div>
  );
}

/* ─────────────────── Main Dashboard Page ─────────────────── */
export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [isDark, setIsDark] = useState(false);

  // ── MID PANEL STATE ──
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tabHistory, setTabHistory] = useState<string[]>([]);
  const [panelWidth, setPanelWidth] = useState(420);
  const [viewingDoc, setViewingDoc] = useState<DocItem | null>(null);
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [ocrPendingText, setOcrPendingText] = useState<string | null>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("aidoc_theme");
    setIsDark(saved === "dark");
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

  useEffect(() => {
    setProfile(JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}"));
    setDocuments(JSON.parse(localStorage.getItem("aidoc_documents") || "[]"));
    setSessions(getSessions());

    const storedMeds = JSON.parse(localStorage.getItem("aidoc_medications") || "[]");
    if (storedMeds.length > 0) {
      setMedications(storedMeds);
    } else {
      const defaults: Medication[] = [
        {
          id: "1",
          name: "Amoxicillin",
          dosage: "500mg",
          schedule: "Take 1 pill after breakfast",
          frequency: "Twice daily",
          dosesRemaining: 2,
          totalDoses: 7,
          addedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: "2",
          name: "Metformin",
          dosage: "1000mg",
          schedule: "Take 1 pill with dinner",
          frequency: "Daily",
          dosesRemaining: 7,
          totalDoses: 7,
          addedAt: new Date().toISOString(),
        },
      ];
      setMedications(defaults);
      localStorage.setItem("aidoc_medications", JSON.stringify(defaults));
    }
  }, []);

  // Interaction Checker State
  const [interactionInput, setInteractionInput] = useState("");
  const [isCheckingInteraction, setIsCheckingInteraction] = useState(false);
  const [interactionResult, setInteractionResult] = useState<{
    status: "safe" | "warning";
    badgeText: string;
    msg: string;
  } | null>(null);

  // Add Medication Drawer State
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [drawerStep, setDrawerStep] = useState(1);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    schedule: "Take 1 pill with water",
  });

  // Dynamic Vitals simulation
  const [vitalsData, setVitalsData] = useState([
    { id: "hr", label: "Heart Rate", val: 73, unit: "bpm", trend: [75, 72, 74, 71, 73, 72, 73], color: "#FF5C5C", status: "Normal", icon: <FiHeart /> },
    { id: "bp", label: "Blood Pressure", val: "120/80", unit: "mmHg", trend: [118, 122, 119, 121, 120, 120, 120], color: "#4F7DF2", status: "Normal", icon: <FiActivity /> },
    { id: "bs", label: "Blood Sugar", val: 95, unit: "mg/dL", trend: [110, 102, 98, 92, 96, 94, 95], color: "#F59E0B", status: "Normal", icon: <FiDroplet /> },
    { id: "sp", label: "Oxygen (SpO2)", val: "98%", unit: "", trend: [97, 98, 98, 99, 98, 98, 98], color: "#10B981", status: "Normal", icon: <FiZap /> },
    { id: "weight", label: "Weight", val: "68", unit: "kg", trend: [68, 68, 68, 68, 68, 68, 68], color: "#8B5CF6", status: "Stable", icon: <FiZap /> },
    { id: "temp", label: "Body Temp", val: "98.6°F", unit: "", trend: [98.4, 98.6, 98.7, 98.5, 98.6, 98.6, 98.6], color: "#06B6D4", status: "Normal", icon: <FiSun /> },
  ]);

  // Moveable Cards Drag & Drop & Collapse State (All 6 Cards with localStorage persistence)
  const [cards, setCards] = useState<string[]>([
    "lab_report",
    "active_observation",
    "med_checker",
    "prescriptions",
    "ai_summary",
    "key_vitals",
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropOverIndex, setDropOverIndex] = useState<number | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  // Restore layout order & collapsed state on mount
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem("aidoc_card_order");
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setCards(parsed);
        }
      }
      const savedCollapsed = localStorage.getItem("aidoc_collapsed_cards");
      if (savedCollapsed) {
        setCollapsedCards(JSON.parse(savedCollapsed));
      }
    } catch (e) {
      console.error("localStorage load error:", e);
    }
  }, []);

  const toggleCollapse = (cardId: string) => {
    setCollapsedCards((prev) => {
      const updated = { ...prev, [cardId]: !prev[cardId] };
      try {
        localStorage.setItem("aidoc_collapsed_cards", JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setCards((prev) => {
      const updated = [...prev];
      const item = updated[draggedIndex];
      updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, item);
      try {
        localStorage.setItem("aidoc_card_order", JSON.stringify(updated));
      } catch (err) { }
      return updated;
    });
    setDraggedIndex(targetIndex);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setVitalsData((prev) =>
        prev.map((v) => {
          if (v.id === "hr") {
            const nextVal = 70 + Math.floor(Math.random() * 5);
            return { ...v, val: nextVal, trend: [...v.trend.slice(1), nextVal] };
          }
          return v;
        })
      );
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const saveMedications = (meds: Medication[]) => {
    setMedications(meds);
    localStorage.setItem("aidoc_medications", JSON.stringify(meds));
  };

  const handleAddMedicationSubmit = () => {
    if (!newMed.name.trim()) return;
    const medItem: Medication = {
      id: crypto.randomUUID(),
      name: newMed.name.trim(),
      dosage: newMed.dosage.trim() || "500mg",
      schedule: newMed.schedule.trim() || "Daily",
      frequency: newMed.frequency,
      dosesRemaining: 7,
      totalDoses: 7,
      addedAt: new Date().toISOString(),
    };
    saveMedications([medItem, ...medications]);
    setNewMed({ name: "", dosage: "", frequency: "Daily", schedule: "Take 1 pill with water" });
    setDrawerStep(1);
    setShowAddMedModal(false);
  };

  const removeMedication = (id: string) => {
    saveMedications(medications.filter((m) => m.id !== id));
  };

  const handleCheckInteraction = () => {
    if (!interactionInput.trim()) return;
    setIsCheckingInteraction(true);
    setInteractionResult(null);

    setTimeout(() => {
      setIsCheckingInteraction(false);
      const query = interactionInput.trim().toLowerCase();

      if (query.includes("aspirin") || query.includes("ibuprofen") || query.includes("warfarin") || query.includes("advil")) {
        setInteractionResult({
          status: "warning",
          badgeText: "⚠️ Moderate-High Risk Interaction",
          msg: `Caution: ${interactionInput} may interact with Amoxicillin or alter blood thinning properties. Consult Dr. AYUSH before taking.`,
        });
      } else {
        const medNames = medications.map((m) => m.name).join(" or ");
        setInteractionResult({
          status: "safe",
          badgeText: `✅ No interaction found with ${medNames || "your current regimen"}.`,
          msg: `${interactionInput} has no documented interactions with your active prescriptions.`,
        });
      }
    }, 900);
  };

  /* ─── PANEL FUNCTIONS ─── */
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
    openTab("chats");
  };

  const handleSelectSession = (id: string) => {
    window.location.href = `/chat?session=${id}`;
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem("aidoc_sessions", JSON.stringify(updated));
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
      setDocuments(docs);
    };
    reader.readAsDataURL(file);
  };

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

      if (rawText) setOcrPendingText(rawText);
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

  const tabLabels: Record<string, { label: string }> = {
    chats: { label: "Chats" },
    documents: { label: "Docs" },
    settings: { label: "Settings" },
    profile: { label: "Profile" },
  };

  const renderDocViewer = () => {
    if (!viewingDoc) return null;
    const doc = documents.find((d) => d.id === viewingDoc.id) || viewingDoc;
    return (
      <div className="p-5 h-full flex flex-col bg-[#E1E5EC]/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold truncate flex-1 text-[#1A202C]">{doc.name}</h2>
          <button onClick={() => setViewingDoc(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 transition ml-3"><FiX className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xs text-slate-500">{new Date(doc.date).toLocaleString()} · {(doc.size / 1024).toFixed(1)} KB</p>
          {!doc.ocrLoading && (<button onClick={() => handleAnalyzeWithAIDOC(doc)} className="px-4 py-1.5 rounded-xl text-xs font-medium transition bg-[#E1E5EC]/85 backdrop-blur-sm text-[#4F7DF2] shadow-[-4px_-4px_8px_#ffffff,4px_4px_8px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[inset_4px_4px_8px_#BDC4CF,inset_-4px_-4px_8px_#ffffff] border border-white/40">Send to AIDOC</button>)}
          {doc.ocrLoading && <span className="text-xs text-slate-500">⏳ Extracting text…</span>}
        </div>
        {doc.ocrText && (
          <div className="mb-4 p-4 rounded-2xl bg-[#E1E5EC]/85 backdrop-blur-sm shadow-[inset_6px_6px_12px_#BDC4CF,inset_-6px_-6px_12px_#ffffff] max-h-[40%] overflow-y-auto border border-white/30">
            <p className="text-xs font-semibold uppercase text-slate-400">Extracted Text</p>
            <p className="text-sm whitespace-pre-wrap text-slate-700">{doc.ocrText}</p>
          </div>
        )}
        <div className="flex-1 overflow-auto rounded-2xl flex items-center justify-center bg-[#EDF1F7]/90 backdrop-blur-sm shadow-[inset_6px_6px_12px_#BDC4CF,inset_-6px_-6px_12px_#ffffff] border border-white/30">
          {doc.type.includes("pdf") ? (<iframe src={doc.data} className="w-full h-full rounded-2xl" title={doc.name} />) : (<img src={doc.data} alt={doc.name} className="max-w-full max-h-full object-contain rounded-2xl" />)}
        </div>
      </div>
    );
  };

  const renderTabContent = (tab: string) => {
    if (viewingDoc) return renderDocViewer();

    switch (tab) {
      case "chats":
        return (
          <div className="p-6 h-full bg-[#E1E5EC]/80 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 text-[#1A202C]">Chats</h2>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No chat history yet.</p>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-[#E1E5EC]/85 backdrop-blur-sm rounded-2xl shadow-[-6px_-6px_12px_#ffffff,6px_6px_12px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[inset_4px_4px_8px_#BDC4CF,inset_-4px_-4px_8px_#ffffff] transition-all group cursor-pointer border border-white/40" onClick={() => handleSelectSession(s.id)}>
                    <div className="text-left flex-1 truncate">
                      <p className="text-sm font-bold text-[#1A202C] truncate">{s.title}</p>
                      <p className="text-xs text-slate-500 truncate">{s.last_message || "Start a new conversation..."}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case "documents":
        return (
          <div className="p-6 h-full bg-[#E1E5EC]/80 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 text-[#1A202C]">Documents</h2>
            <label className="bg-[#E1E5EC]/85 backdrop-blur-sm rounded-3xl p-8 text-center block cursor-pointer shadow-[inset_6px_6px_12px_#BDC4CF,inset_-6px_-6px_12px_#ffffff] transition-colors mb-6 border border-white/40">
              <div className="text-4xl mb-3 text-[#4F7DF2] flex justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </div>
              <p className="font-semibold mb-1 text-[#1A202C]">Upload Medical Files</p>
              <p className="text-sm text-slate-500">Prescriptions, lab reports, scans</p>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { if (e.target.files?.[0]) addDocument(e.target.files[0]); }} />
            </label>
            <div className="space-y-3">
              {documents.length === 0 ? (<p className="text-center text-sm py-12 text-slate-500">No documents uploaded yet.</p>) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#E1E5EC]/85 backdrop-blur-sm shadow-[-6px_-6px_12px_#ffffff,6px_6px_12px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[inset_4px_4px_8px_#BDC4CF,inset_-4px_-4px_8px_#ffffff] transition-all border border-white/40">
                    <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                      <span className="text-lg shrink-0">🖼️</span>
                      <div className="truncate">
                        <p className="text-sm truncate text-[#1A202C]">{doc.name}</p>
                        <p className="text-xs text-slate-500">{new Date(doc.date).toLocaleDateString()} · {(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {!doc.ocrLoading && (<button onClick={() => handleAnalyzeWithAIDOC(doc)} className="p-2 rounded-xl bg-[#E1E5EC]/85 backdrop-blur-sm text-slate-500 shadow-[-4px_-4px_8px_#ffffff,4px_4px_8px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] hover:text-[#4F7DF2] transition border border-white/40" title="Send to AIDOC"><FiMessageCircle className="w-4 h-4" /></button>)}
                      {doc.ocrLoading && <span className="text-xs text-slate-500">⏳</span>}
                      <button onClick={() => setViewingDoc(doc)} className="p-2 rounded-xl bg-[#E1E5EC]/85 backdrop-blur-sm text-slate-500 shadow-[-4px_-4px_8px_#ffffff,4px_4px_8px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] hover:text-[#4F7DF2] transition border border-white/40" title="View"><FiEye className="w-4 h-4" /></button>
                      <button onClick={() => { const updated = documents.filter((d: DocItem) => d.id !== doc.id); setDocuments(updated); localStorage.setItem("aidoc_documents", JSON.stringify(updated)); }} className="p-2 rounded-xl bg-[#E1E5EC]/85 backdrop-blur-sm text-slate-500 shadow-[-4px_-4px_8px_#ffffff,4px_4px_8px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] hover:text-red-500 transition border border-white/40" title="Delete"><FiX className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="p-6 bg-[#E1E5EC]">
            <h2 className="text-xl font-bold mb-6 text-[#1A202C]">Settings</h2>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#E1E5EC]/85 backdrop-blur-sm shadow-[-6px_-6px_12px_#ffffff,6px_6px_12px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/40">
                <p className="font-semibold mb-1 text-[#1A202C]">AI Model</p>
                <p className="text-sm text-slate-500">Currently: aidoc-medical (local)</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#E1E5EC]/85 backdrop-blur-sm shadow-[-6px_-6px_12px_#ffffff,6px_6px_12px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/40">
                <p className="font-semibold mb-3 text-[#1A202C]">Language</p>
                <div className="flex gap-2">
                  {["en", "hi", "auto"].map((lang) => {
                    const current = localStorage.getItem("aidoc_language") || "auto";
                    return (<button key={lang} onClick={() => localStorage.setItem("aidoc_language", lang)} className={`px-4 py-2 rounded-xl text-sm font-medium transition shadow-[-4px_-4px_8px_#ffffff,4px_4px_8px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[inset_4px_4px_8px_#BDC4CF,inset_-4px_-4px_8px_#ffffff] border border-white/40 ${current === lang ? "bg-[#4F7DF2] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]" : "bg-[#E1E5EC] text-slate-500 hover:text-[#1A202C]"}`}>{lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "Auto"}</button>);
                  })}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#E1E5EC]/85 backdrop-blur-sm shadow-[-6px_-6px_12px_#ffffff,6px_6px_12px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/40">
                <p className="font-semibold mb-3 text-[#1A202C]">Data</p>
                <button onClick={() => { if (confirm("Delete all chats, documents, and settings?")) { localStorage.clear(); window.location.reload(); } }} className="px-5 py-2 rounded-xl text-sm font-medium bg-red-100/50 text-red-500 shadow-[-4px_-4px_8px_#ffffff,4px_4px_8px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[inset_4px_4px_8px_#BDC4CF,inset_-4px_-4px_8px_#ffffff] transition border border-white/40">Clear All Data</button>
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="p-6 bg-[#E1E5EC]">
            <h2 className="text-xl font-bold mb-6 text-[#1A202C]">Profile</h2>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 text-4xl bg-[#E1E5EC]/85 backdrop-blur-sm shadow-[inset_6px_6px_12px_#BDC4CF,inset_-6px_-6px_12px_#ffffff] border border-white/40">👤</div>
              <input type="text" defaultValue={(() => { if (typeof window === "undefined") return ""; const p = localStorage.getItem("aidoc_patient_profile"); return p ? JSON.parse(p).name : ""; })()} onBlur={(e) => { const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}"); p.name = e.target.value; localStorage.setItem("aidoc_patient_profile", JSON.stringify(p)); }} className="text-center bg-transparent text-xl font-bold border-b-2 pb-1 focus:outline-none text-[#1A202C] border-transparent focus:border-[#4F7DF2] placeholder-slate-400" placeholder="Your name" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-slate-500">Personal Information</h3>
            <div className="space-y-3 mb-6">
              {[{ label: "Date of Birth", key: "dob", placeholder: "DD/MM/YYYY" }, { label: "Gender", key: "gender", placeholder: "Male / Female / Other" }, { label: "Height (cm)", key: "height", placeholder: "e.g. 170" }].map((field) => {
                const saved = (() => { if (typeof window === "undefined") return ""; const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}"); return p[field.key] || ""; })();
                return (<div key={field.key} className="p-4 rounded-2xl bg-[#E1E5EC]/85 backdrop-blur-sm shadow-[-6px_-6px_12px_#ffffff,6px_6px_12px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/40"><p className="text-xs uppercase mb-1 text-slate-500 font-semibold">{field.label}</p><input type="text" defaultValue={saved} onBlur={(e) => { const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}"); p[field.key] = e.target.value; localStorage.setItem("aidoc_patient_profile", JSON.stringify(p)); }} className="w-full bg-transparent text-sm focus:outline-none text-[#1A202C] font-medium" placeholder={field.placeholder} /></div>);
              })}
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-slate-500">Medical History</h3>
            <div className="space-y-3">
              {[{ label: "Allergies", key: "allergies", placeholder: "e.g. Penicillin, Peanuts" }, { label: "Medical Conditions", key: "conditions", placeholder: "e.g. Diabetes, Asthma" }].map((field) => {
                const saved = (() => { if (typeof window === "undefined") return ""; const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}"); return p[field.key] || ""; })();
                return (<div key={field.key} className="p-4 rounded-2xl bg-[#E1E5EC]/85 backdrop-blur-sm shadow-[-6px_-6px_12px_#ffffff,6px_6px_12px_#BDC4CF,inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/40"><p className="text-xs uppercase mb-1 text-slate-500 font-semibold">{field.label}</p><input type="text" defaultValue={saved} onBlur={(e) => { const p = JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}"); p[field.key] = e.target.value; localStorage.setItem("aidoc_patient_profile", JSON.stringify(p)); }} className="w-full bg-transparent text-sm focus:outline-none text-[#1A202C] font-medium" placeholder={field.placeholder} /></div>);
              })}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-br from-[#E2E9F7] via-[#EAEFF9] to-[#E2EAF8] text-[#0F172A] font-sans flex flex-col lg:flex-row p-3 gap-3 select-none">

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* A. Ultra-Transparent VisionOS Dark Glass Floating Sidebar       */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <aside className="w-full lg:w-[68px] lg:h-[calc(100vh-24px)] flex lg:flex-col items-center justify-between shrink-0 z-30 py-5 px-2 bg-black/40 backdrop-blur-3xl border border-white/25 rounded-full lg:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.35),inset_0_1.5px_1.5px_rgba(255,255,255,0.5)] my-auto">
        {/* Dashboard Pill */}
        <button onClick={() => window.location.href = "/"} className="w-11 h-11 rounded-full bg-[#3B66F5] text-white flex items-center justify-center shadow-lg shadow-[#3B66F5]/40 hover:scale-110 transition-transform border border-white/30">
          <FiGrid className="w-5 h-5" />
        </button>

        {/* Action Pills */}
        <div className="flex lg:flex-col items-center gap-3">
          <button onClick={handleNewChat} className="w-10 h-10 rounded-full bg-white/10 text-white/90 hover:bg-white/25 hover:text-white flex items-center justify-center transition-all border border-white/15 shadow-inner" title="New Chat">
            <FiPlus className="w-4.5 h-4.5" />
          </button>
          <button onClick={() => openTab("chats")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${activeTab === "chats" ? "bg-[#3B66F5] text-white shadow-lg shadow-[#3B66F5]/40 border-white/40" : "bg-white/10 text-white/90 hover:bg-white/25 hover:text-white border-white/15 shadow-inner"}`} title="Chats">
            <FiMessageCircle className="w-4.5 h-4.5" />
          </button>
          <button onClick={() => openTab("documents")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${activeTab === "documents" ? "bg-[#3B66F5] text-white shadow-lg shadow-[#3B66F5]/40 border-white/40" : "bg-white/10 text-white/90 hover:bg-white/25 hover:text-white border-white/15 shadow-inner"}`} title="Documents">
            <FiFileText className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* System & Profile Pills */}
        <div className="flex lg:flex-col items-center gap-3">
          <button onClick={() => openTab("settings")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${activeTab === "settings" ? "bg-[#3B66F5] text-white shadow-lg shadow-[#3B66F5]/40 border-white/40" : "bg-white/10 text-white/90 hover:bg-white/25 hover:text-white border-white/15 shadow-inner"}`} title="Settings">
            <FiSettings className="w-4.5 h-4.5" />
          </button>
          <button onClick={() => openTab("profile")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${activeTab === "profile" ? "bg-[#3B66F5] text-white shadow-lg shadow-[#3B66F5]/40 border-white/40" : "bg-white/10 text-white/90 hover:bg-white/25 hover:text-white border-white/15 shadow-inner"}`} title="Profile">
            <FiUser className="w-4.5 h-4.5" />
          </button>
          <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white/10 text-white/90 hover:bg-white/25 hover:text-white flex items-center justify-center transition-all border border-white/15 text-xs shadow-inner" title="Toggle Theme">
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* B. MID PANEL (COLLAPSIBLE DRAWER)                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className={`hidden md:flex relative shrink-0 items-stretch gap-0 transition-all duration-500 ease-out ${activeTab ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
        {activeTab && (
          <div className="relative shrink-0 h-[calc(100vh-24px)]">
            <div style={{ width: `${panelWidth}px` }} className="flex flex-col h-full rounded-[32px] bg-[#E1E5EC]/90 backdrop-blur-md border-[1.5px] border-white/50 shadow-[10px_10px_24px_#BDC4CF,-10px_-10px_24px_#ffffff]">
              {tabHistory.length > 1 && !viewingDoc && (
                <div className="flex gap-2 p-3 pb-1">
                  {tabHistory.map((tab) => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setViewingDoc(null); }} className={`flex-1 py-1 text-xs font-semibold rounded-xl transition shadow-[-3px_-3px_6px_#ffffff,3px_3px_6px_#BDC4CF] border border-white/40 ${activeTab === tab ? "text-[#1C2536]" : "text-slate-400 hover:text-slate-700"}`}>
                      {tabLabels[tab]?.label}
                    </button>
                  ))}
                </div>
              )}
              {tabHistory.length <= 1 && !viewingDoc && (
                <div className="px-5 pt-3 pb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tabLabels[activeTab]?.label}</span>
                </div>
              )}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {renderTabContent(activeTab)}
              </div>
              <div className="px-3 pb-3">
                <button onClick={closePanel} className="w-full py-2.5 rounded-xl text-xs font-medium transition bg-[#E1E5EC]/85 backdrop-blur-sm text-slate-500 shadow-[-3px_-3px_6px_#ffffff,3px_3px_6px_#BDC4CF] hover:text-slate-800 border border-white/40">Close Panel</button>
              </div>
            </div>
            <div onMouseDown={startResize} className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#4F7DF2]/20 transition-colors z-50 flex items-center justify-center">
              <div className="w-1 h-10 rounded-full bg-slate-300/50 hover:bg-[#4F7DF2]/50 transition-colors" />
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* C. MAIN UNIFIED CANVAS (3D Neumorphic Elements INSIDE Cards)  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-24px)] overflow-hidden space-y-3 p-1">
        {/* ── Top Bar (Integrated Top Bar) ── */}
        <div className="px-3 py-1.5 flex items-center justify-between gap-4 border-b border-slate-300/40 shrink-0">
          {/* Left: CLERA Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <CleraLogo size="md" darkText={true} />
          </div>

          {/* Center: Search Bar (3D Recessed Neumorphism + No blue focus box) */}
          <div className="flex-1 max-w-lg mx-auto bg-[#D7E0EE] rounded-full shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] flex items-center px-4 py-2 gap-2.5 focus-within:ring-0 focus-within:outline-none border border-white/40">
            <FiSearch className="text-[#3B66F5] w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Ask CLERA anything about your health..."
              className="w-full bg-transparent text-xs text-[#0F172A] font-medium placeholder-slate-400 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
            />
            <span className="text-[10px] font-bold bg-[#E2E8F4] px-2 py-0.5 rounded-lg text-slate-600 shadow-[2px_2px_5px_#B0BACD,-2px_-2px_5px_#FFFFFF] shrink-0">⌘K</span>
          </div>

          {/* Right: User Greeting & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex flex-col items-end text-right">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-[#0F172A]">Good afternoon, <span className="text-[#3B66F5]">Ayush</span></span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Monday, July 27 · 2:45 PM</span>
            </div>
            <button className="relative p-2.5 rounded-full bg-[#E2E8F4] text-slate-700 hover:text-[#3B66F5] shadow-[3px_3px_8px_#B0BACD,-3px_-3px_8px_#FFFFFF] hover:shadow-[inset_2px_2px_5px_#B0BACD,inset_-2px_-2px_5px_#FFFFFF] transition-all focus:outline-none border border-white/50">
              <FiBell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-[#E2E8F4]"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#E2E8F4] shadow-[3px_3px_8px_#B0BACD,-3px_-3px_8px_#FFFFFF] flex items-center justify-center text-xs font-black text-[#0F172A] border border-white/50">A</div>
          </div>
        </div>

        {/* ── Main Dashboard Cards Grid (Zero Bottom Empty Space & Drag Reorder) ── */}
        <main className="flex-1 overflow-hidden flex flex-col justify-between gap-3">
          {(() => {
            const renderCardComponent = (cardId: string, globalIndex: number) => {
              const isCollapsed = collapsedCards[cardId];
              const isDragging = draggedIndex === globalIndex;
              const isTargetOver = dropOverIndex === globalIndex && !isDragging;

              // TOP-LEFT DRAG HANDLE COMPONENT (<FiGrid />) - 3D NEUMORPHIC BUTTON
              const renderDragHandle = () => (
                <div
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, globalIndex)}
                  onDragEnd={handleDragEnd}
                  className="p-1.5 rounded-xl bg-[#E2E8F4] shadow-[2.5px_2.5px_6px_#B0BACD,-2.5px_-2.5px_6px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-slate-600 hover:text-[#3B66F5] transition-all cursor-grab active:cursor-grabbing shrink-0 border border-white/60"
                  title="Hold & drag to reorder card"
                >
                  <FiGrid className="w-3.5 h-3.5" />
                </div>
              );

              // TOP-RIGHT COLLAPSE/EXPAND BUTTON - 3D NEUMORPHIC BUTTON
              const renderCollapseButton = () => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(cardId);
                  }}
                  className="p-1.5 rounded-xl bg-[#E2E8F4] shadow-[2.5px_2.5px_6px_#B0BACD,-2.5px_-2.5px_6px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-slate-600 hover:text-[#3B66F5] transition-all shrink-0 focus:outline-none border border-white/60"
                  title={isCollapsed ? "Expand card" : "Collapse card"}
                >
                  {isCollapsed ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronUp className="w-3.5 h-3.5" />}
                </button>
              );

              /* CARD 1: LATEST LAB REPORT */
              if (cardId === "lab_report") {
                return (
                  <div
                    key="lab_report"
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDrop={(e) => handleDrop(e, globalIndex)}
                    className={`h-full lg:col-span-1 bg-[#E2E8F4] rounded-[24px] shadow-[0_8px_22px_rgba(145,155,175,0.35)] hover:shadow-[0_12px_28px_rgba(145,155,175,0.45)] transition-all duration-300 ease-in-out p-4 flex flex-col justify-between gap-3 border border-slate-300/40 ${isDragging ? "opacity-30 scale-95 border-2 border-dashed border-[#3B66F5]" : ""} ${isTargetOver ? "border-2 border-dashed border-[#3B66F5] bg-[#DCE4F2] scale-[1.01]" : ""}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-300/40">
                      <div className="flex items-center gap-2">
                        {renderDragHandle()}
                        <div className="p-1.5 rounded-xl bg-[#D6DFEE] shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-[#3B66F5] border border-white/40">
                          <FiFileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[#0F172A] font-black text-xs tracking-wider font-poppins uppercase">LATEST LAB REPORT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCollapsed && <span className="text-[9px] font-black text-slate-400 uppercase">Collapsed</span>}
                        <span className="text-[10px] font-bold bg-[#D6DFEE] px-2.5 py-0.5 rounded-full shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-slate-600 border border-white/40">Jul 25</span>
                        {renderCollapseButton()}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-[#0F172A] leading-tight">
                            <span className="text-[#3B66F5]">Summary:</span> Elevated LDL Cholesterol detected (132 mg/dL).
                          </p>
                          <p className="text-[10px] text-slate-600 font-medium leading-normal line-clamp-2">
                            Lipid panel indicates borderline elevation in LDL. HDL & Triglycerides within optimal ranges.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-cyan-50/90 border border-cyan-300/60 text-[11px] font-bold text-[#3B66F5] flex items-center gap-2 shadow-sm">
                          <FiAlertTriangle className="w-4 h-4 text-cyan-600 shrink-0" />
                          <span>LDL is above optimal range</span>
                        </div>

                        {/* RECESSED 3D NEUMORPHIC WELL FOR METRICS */}
                        <div className="p-2.5 rounded-2xl bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] flex items-center justify-between gap-2 text-[10px] border border-white/40">
                          <div>
                            <p className="text-[9px] text-slate-500 font-semibold">LDL</p>
                            <p className="font-black text-[#0F172A]">132 <span className="text-[8px] font-normal text-slate-500">mg/dL</span> <span className="text-[8px] font-black text-red-600 bg-red-100 px-1.5 py-0.2 rounded ml-1 border border-red-200">High</span></p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 font-semibold">HDL</p>
                            <p className="font-black text-[#0F172A]">58 <span className="text-[8px] font-normal text-slate-500">mg/dL</span> <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded ml-1 border border-emerald-200">Normal</span></p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 font-semibold">Triglycerides</p>
                            <p className="font-black text-[#0F172A]">118 <span className="text-[8px] font-normal text-slate-500">mg/dL</span> <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded ml-1 border border-emerald-200">Normal</span></p>
                          </div>
                        </div>

                        {/* 3D NEUMORPHIC ACTION BUTTON (#E6F2FF) */}
                        <button onClick={() => alert("View Full Report")} className="w-full py-2.5 px-3 rounded-xl bg-[#E6F2FF] text-[#3B66F5] font-black text-xs shadow-[3.5px_3.5px_8px_#B0BACD,-3.5px_-3.5px_8px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] hover:bg-[#D4E8FF] transition-all focus:outline-none border border-white/60">
                          View Full Report
                        </button>
                      </>
                    )}
                  </div>
                );
              }

              /* CARD 2: ACTIVE OBSERVATION */
              if (cardId === "active_observation") {
                return (
                  <div
                    key="active_observation"
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDrop={(e) => handleDrop(e, globalIndex)}
                    className={`h-full lg:col-span-1 bg-[#E2E8F4] rounded-[24px] shadow-[0_8px_22px_rgba(145,155,175,0.35)] hover:shadow-[0_12px_28px_rgba(145,155,175,0.45)] transition-all duration-300 ease-in-out p-4 flex flex-col justify-between gap-3 border border-slate-300/40 ${isDragging ? "opacity-30 scale-95 border-2 border-dashed border-[#3B66F5]" : ""} ${isTargetOver ? "border-2 border-dashed border-[#3B66F5] bg-[#DCE4F2] scale-[1.01]" : ""}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-300/40">
                      <div className="flex items-center gap-2">
                        {renderDragHandle()}
                        <div className="p-1.5 rounded-xl bg-[#D6DFEE] shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-pink-500 border border-white/40">
                          <FiActivity className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[#0F172A] font-black text-xs tracking-wider font-poppins uppercase">ACTIVE OBSERVATION</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCollapsed && <span className="text-[9px] font-black text-slate-400 uppercase">Collapsed</span>}
                        <span className="text-[10px] font-bold bg-[#D6DFEE] px-2.5 py-0.5 rounded-full shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-slate-600 border border-white/40">Day 2</span>
                        {renderCollapseButton()}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <>
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-[#0F172A]">
                            Medication Watch: <span className="font-medium text-slate-600">Amoxicillin started 2 days ago — feeling ok?</span>
                          </p>
                          <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                            <span>🍃</span>
                            <span>High pollen count today — monitor symptoms.</span>
                          </div>
                        </div>

                        <GlowingAIBrain />
                      </>
                    )}
                  </div>
                );
              }

              /* CARD 3: MEDICATION INTERACTION CHECKER */
              if (cardId === "med_checker") {
                return (
                  <div
                    key="med_checker"
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDrop={(e) => handleDrop(e, globalIndex)}
                    className={`h-full lg:col-span-1 bg-[#E2E8F4] rounded-[24px] shadow-[0_8px_22px_rgba(145,155,175,0.35)] hover:shadow-[0_12px_28px_rgba(145,155,175,0.45)] transition-all duration-300 ease-in-out p-4 flex flex-col justify-between gap-3 border border-slate-300/40 ${isDragging ? "opacity-30 scale-95 border-2 border-dashed border-[#3B66F5]" : ""} ${isTargetOver ? "border-2 border-dashed border-[#3B66F5] bg-[#DCE4F2] scale-[1.01]" : ""}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-300/40">
                      <div className="flex items-center gap-2">
                        {renderDragHandle()}
                        <div className="p-1.5 rounded-xl bg-[#D6DFEE] shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-purple-600 border border-white/40">
                          <FiShield className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[#0F172A] font-black text-xs tracking-wider font-poppins uppercase">INTERACTION CHECKER</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCollapsed && <span className="text-[9px] font-black text-slate-400 uppercase">Collapsed</span>}
                        {renderCollapseButton()}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <>
                        <div className="relative">
                          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                          <input
                            type="text"
                            value={interactionInput}
                            onChange={(e) => { setInteractionInput(e.target.value); setInteractionResult(null); }}
                            onKeyDown={(e) => e.key === "Enter" && handleCheckInteraction()}
                            placeholder="Search for OTC drug..."
                            className="w-full pl-9 pr-3 py-2 bg-[#D6DFEE] shadow-[inset_3px_3px_6px_#B0BACD,inset_-3px_-3px_6px_#FFFFFF] rounded-xl text-xs text-[#0F172A] font-semibold placeholder-slate-400 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none border border-white/40"
                          />
                        </div>

                        {/* 3D NEUMORPHIC ACTION BUTTON (#E6F2FF) */}
                        <button
                          onClick={handleCheckInteraction}
                          disabled={!interactionInput.trim() || isCheckingInteraction}
                          className="w-full py-2.5 rounded-xl bg-[#E6F2FF] text-[#3B66F5] font-black text-xs shadow-[3.5px_3.5px_8px_#B0BACD,-3.5px_-3.5px_8px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] hover:bg-[#D4E8FF] disabled:opacity-40 transition-all border border-white/60 focus:outline-none"
                        >
                          {isCheckingInteraction ? (<span className="animate-spin w-3.5 h-3.5 border-2 border-[#3B66F5] border-t-transparent rounded-full inline-block"></span>) : "Check Interactions"}
                        </button>

                        <div className="flex-1 min-h-[65px] flex items-center justify-center bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] rounded-2xl p-2.5 border border-white/40">
                          {interactionResult ? (
                            <div className={`p-2 rounded-xl text-[11px] font-bold space-y-0.5 ${interactionResult.status === "warning" ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"}`}>
                              <p className="font-extrabold">{interactionResult.badgeText}</p>
                              <p className="text-[10px] opacity-90">{interactionResult.msg}</p>
                            </div>
                          ) : (
                            <div className="text-center flex flex-col items-center gap-0.5">
                              <p className="text-xs font-extrabold text-[#0F172A]">No interactions found</p>
                              <p className="text-[9px] text-slate-500 font-semibold">with active regimen.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              }

              /* CARD 4: ACTIVE PRESCRIPTIONS */
              if (cardId === "prescriptions") {
                return (
                  <div
                    key="prescriptions"
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDrop={(e) => handleDrop(e, globalIndex)}
                    className={`h-full lg:col-span-1 bg-[#E2E8F4] rounded-[24px] shadow-[0_8px_22px_rgba(145,155,175,0.35)] hover:shadow-[0_12px_28px_rgba(145,155,175,0.45)] transition-all duration-300 ease-in-out p-4 flex flex-col justify-between gap-3 border border-slate-300/40 ${isDragging ? "opacity-30 scale-95 border-2 border-dashed border-[#3B66F5]" : ""} ${isTargetOver ? "border-2 border-dashed border-[#3B66F5] bg-[#DCE4F2] scale-[1.01]" : ""}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-300/40">
                      <div className="flex items-center gap-2">
                        {renderDragHandle()}
                        <div className="p-1.5 rounded-xl bg-[#D6DFEE] shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-[#3B66F5] border border-white/40">
                          <FiActivity className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[#0F172A] font-black text-xs tracking-wider font-poppins uppercase">ACTIVE PRESCRIPTIONS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setShowAddMedModal(true)} className="text-[10px] font-extrabold text-[#3B66F5] px-2.5 py-0.5 rounded-full bg-[#E2E8F4] shadow-[2.5px_2.5px_6px_#B0BACD,-2.5px_-2.5px_6px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] border border-white/60 focus:outline-none">
                          + Add
                        </button>
                        {renderCollapseButton()}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-2 max-h-[140px] overflow-y-auto no-scrollbar flex-1">
                        {medications.map((med) => (
                          <div key={med.id} className="p-2.5 bg-[#D6DFEE] shadow-[inset_3px_3px_6px_#B0BACD,inset_-3px_-3px_6px_#FFFFFF] rounded-2xl flex flex-col gap-1 border border-white/40">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-[#0F172A]">{med.name}</span>
                                <span className="text-[9px] font-bold bg-[#E2E8F4] text-slate-700 px-2 py-0.2 rounded-full shadow-[inset_1px_1px_3px_#B0BACD,inset_-1px_-1px_3px_#FFFFFF]">{med.dosage}</span>
                              </div>
                              <button onClick={() => removeMedication(med.id)} className="text-slate-400 hover:text-red-500">
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium">{med.schedule}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1.5 bg-slate-300/60 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((med.totalDoses - med.dosesRemaining) / med.totalDoses) * 100}%` }}></div>
                              </div>
                              <span className="text-[9px] font-black text-emerald-700">✓ {med.dosesRemaining}/{med.totalDoses} Doses</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              /* CARD 5: AI HEALTH SUMMARY */
              if (cardId === "ai_summary") {
                return (
                  <div
                    key="ai_summary"
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDrop={(e) => handleDrop(e, globalIndex)}
                    className={`h-full lg:col-span-2 bg-[#E2E8F4] rounded-[24px] shadow-[0_8px_22px_rgba(145,155,175,0.35)] hover:shadow-[0_12px_28px_rgba(145,155,175,0.45)] transition-all duration-300 ease-in-out p-4 flex flex-col justify-between gap-3 border border-slate-300/40 ${isDragging ? "opacity-30 scale-95 border-2 border-dashed border-[#3B66F5]" : ""} ${isTargetOver ? "border-2 border-dashed border-[#3B66F5] bg-[#DCE4F2] scale-[1.01]" : ""}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-300/40">
                      <div className="flex items-center gap-2">
                        {renderDragHandle()}
                        <div className="p-1.5 rounded-xl bg-[#D6DFEE] shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-purple-600 border border-white/40">
                          <FiBarChart2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[#0F172A] font-black text-xs tracking-wider font-poppins uppercase">AI HEALTH SUMMARY</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold bg-emerald-100/90 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300/50 shadow-sm">Updated Today</span>
                        {renderCollapseButton()}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch flex-1">
                        <div className="bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] rounded-2xl p-3 flex flex-col justify-between border border-white/40">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider font-poppins">AI HEALTH INDEX</span>
                          <div className="flex items-baseline gap-1 my-1">
                            <span className="text-3xl font-black text-[#0F172A]">89</span>
                            <span className="text-xs text-slate-500 font-semibold">/100</span>
                            <span className="ml-auto text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/50">+7%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-300/60 rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-gradient-to-r from-[#3B66F5] to-purple-600 rounded-full w-[89%]" />
                          </div>
                          <p className="text-[9px] text-slate-600 font-bold">Status: <strong className="text-emerald-700">Optimal</strong></p>
                        </div>

                        <div className="md:col-span-2 space-y-2 text-[10px] flex flex-col justify-center">
                          <div className="flex items-start gap-2">
                            <span>🟢</span>
                            <div>
                              <p className="font-black text-[#0F172A]">Cardiovascular Telemetry Stable</p>
                              <p className="text-slate-600 font-medium">Heart rate (73 bpm) and BP (120/80 mmHg) remain in normal range.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span>🟡</span>
                            <div>
                              <p className="font-black text-[#0F172A]">Lipid Panel Follow-up</p>
                              <p className="text-slate-600 font-medium">Borderline elevated LDL (132 mg/dL). Routine monitoring advised.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span>🟢</span>
                            <div>
                              <p className="font-black text-[#0F172A]">High Prescription Adherence</p>
                              <p className="text-slate-600 font-medium">Active medications tracked with optimal adherence.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              /* CARD 6: KEY VITALS TELEMETRY */
              if (cardId === "key_vitals") {
                return (
                  <div
                    key="key_vitals"
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDrop={(e) => handleDrop(e, globalIndex)}
                    className={`h-full w-full lg:col-span-3 bg-[#E2E8F4] rounded-[24px] shadow-[0_8px_22px_rgba(145,155,175,0.35)] hover:shadow-[0_12px_28px_rgba(145,155,175,0.45)] transition-all duration-300 ease-in-out p-4 flex flex-col justify-between gap-3 border border-slate-300/40 ${isDragging ? "opacity-30 scale-95 border-2 border-dashed border-[#3B66F5]" : ""} ${isTargetOver ? "border-2 border-dashed border-[#3B66F5] bg-[#DCE4F2] scale-[1.01]" : ""}`}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-300/40">
                      <div className="flex items-center gap-2">
                        {renderDragHandle()}
                        <div className="p-1.5 rounded-xl bg-[#D6DFEE] shadow-[inset_2px_2px_4px_#B0BACD,inset_-2px_-2px_4px_#FFFFFF] text-red-500 border border-white/40">
                          <FiHeart className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[#0F172A] font-black text-xs tracking-wider font-poppins uppercase">KEY VITALS TELEMETRY</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 font-extrabold">Real-time telemetry</span>
                        {renderCollapseButton()}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 flex-1 items-stretch">
                        {vitalsData.map((vital) => (
                          <div key={vital.id} className="bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] rounded-2xl p-2.5 flex flex-col justify-between gap-1 border border-white/40">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-600 font-extrabold truncate">{vital.label}</span>
                              <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">{vital.status}</span>
                            </div>
                            <div className="flex items-baseline gap-1 my-0.5">
                              <p className="text-base font-black text-[#0F172A]">{vital.val}</p>
                              <span className="text-[8px] text-slate-500 font-bold">{vital.unit}</span>
                            </div>
                            <div className="mt-auto">
                              <Sparkline color={vital.color} data={vital.trend} height="h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-y-auto no-scrollbar auto-rows-fr">
                {cards.map((cardId, globalIndex) => renderCardComponent(cardId, globalIndex))}
              </div>
            );
          })()}
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ADD MEDICATION MODAL                                            */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#E2E8F4] backdrop-blur-lg h-full shadow-[-12px_0_30px_#A9B5CB] flex flex-col justify-between p-6 overflow-y-auto border-l border-white/80">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-300/40 pb-4">
                <h3 className="text-sm font-extrabold text-[#0F172A] font-poppins uppercase tracking-wider">ADD ACTIVE MEDICATION</h3>
                <button onClick={() => setShowAddMedModal(false)} className="text-slate-400 hover:text-slate-600"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500"><span className={drawerStep >= 1 ? "text-[#3B66F5]" : ""}>1. Search</span><span className={drawerStep >= 2 ? "text-[#3B66F5]" : ""}>2. Dosage</span><span className={drawerStep >= 3 ? "text-[#3B66F5]" : ""}>3. Frequency</span><span className={drawerStep >= 4 ? "text-[#3B66F5]" : ""}>4. Save</span></div>
              {drawerStep === 1 && (<div className="space-y-3"><label className="block text-xs font-extrabold text-[#0F172A]">Drug Name</label><input type="text" placeholder="e.g., Amoxicillin, Lisinopril..." value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} className="w-full p-3 bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] rounded-xl text-sm text-[#0F172A] font-semibold focus:outline-none border border-white/40" /></div>)}
              {drawerStep === 2 && (<div className="space-y-3"><label className="block text-xs font-extrabold text-[#0F172A]">Dosage (mg / strength)</label><input type="text" placeholder="e.g., 500mg, 10mg..." value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} className="w-full p-3 bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] rounded-xl text-sm text-[#0F172A] font-semibold focus:outline-none border border-white/40" /></div>)}
              {drawerStep === 3 && (<div className="space-y-3"><label className="block text-xs font-extrabold text-[#0F172A]">Frequency & Schedule</label><select value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} className="w-full p-3 bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] rounded-xl text-sm text-[#0F172A] font-semibold focus:outline-none mb-2 border border-white/40"><option value="Daily">Daily</option><option value="Twice daily">Twice daily</option><option value="Three times daily">Three times daily</option><option value="As needed">As needed</option></select><input type="text" placeholder="Instruction e.g., Take 1 pill after breakfast" value={newMed.schedule} onChange={(e) => setNewMed({ ...newMed, schedule: e.target.value })} className="w-full p-3 bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] rounded-xl text-sm text-[#0F172A] font-semibold focus:outline-none border border-white/40" /></div>)}
              {drawerStep === 4 && (<div className="space-y-3 p-4 bg-[#D6DFEE] shadow-[inset_3px_3px_7px_#B0BACD,inset_-3px_-3px_7px_#FFFFFF] rounded-2xl text-sm border border-white/40"><p className="font-black text-[#0F172A]">Review New Medication</p><p><span className="font-bold text-slate-500">Name:</span> {newMed.name}</p><p><span className="font-bold text-slate-500">Dosage:</span> {newMed.dosage}</p><p><span className="font-bold text-slate-500">Frequency:</span> {newMed.frequency}</p><p><span className="font-bold text-slate-500">Schedule:</span> {newMed.schedule}</p></div>)}
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-300/40">
              {drawerStep > 1 && (<button onClick={() => setDrawerStep((s) => s - 1)} className="flex-1 py-3 rounded-xl bg-[#E2E8F4] font-extrabold text-sm text-slate-700 shadow-[4px_4px_10px_#B0BACD,-4px_-4px_10px_#FFFFFF] hover:text-[#0F172A] border border-white/60">Back</button>)}
              {drawerStep < 4 ? (<button onClick={() => setDrawerStep((s) => s + 1)} disabled={!newMed.name.trim()} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#3B66F5] to-[#4F7DF2] text-white font-extrabold text-sm hover:scale-[1.01] disabled:opacity-40 shadow-[4px_4px_12px_#B0BACD,-4px_-4px_12px_#FFFFFF]">Next</button>) : (<button onClick={handleAddMedicationSubmit} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm hover:scale-[1.01] shadow-[4px_4px_12px_#B0BACD,-4px_-4px_12px_#FFFFFF]">Save to Prescriptions</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}