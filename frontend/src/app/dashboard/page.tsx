"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DocItem {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  data: string;
  ocrText?: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const isDark = true; // or from theme context

  useEffect(() => {
    setProfile(JSON.parse(localStorage.getItem("aidoc_patient_profile") || "{}"));
    setHealthData(JSON.parse(localStorage.getItem("aidoc_health_data") || "{}"));
    setDocuments(JSON.parse(localStorage.getItem("aidoc_documents") || "[]"));
  }, []);

  // Theme classes (same as chat)
  const panelBg = isDark ? "bg-white/5 backdrop-blur-xl border border-white/10" : "bg-white/70 backdrop-blur-xl border border-gray-200";
  const cardBg = isDark ? "bg-white/5 backdrop-blur-md border border-white/5" : "bg-white/80 backdrop-blur-md border border-gray-200";
  const headingColor = isDark ? "text-white/90" : "text-gray-900";
  const subtextColor = isDark ? "text-white/40" : "text-gray-500";

  return (
    <div className="min-h-screen p-6 bg-[#E1E5EC] text-[#1C2536] font-sans">
      <h1 className="text-3xl font-bold mb-6 text-[#1C2536]">
        Welcome back{profile?.name ? `, ${profile.name}` : ""}
      </h1>

      {/* Health Metrics Section */}
      <section className="mb-8">
        <h2 className="text-sm font-extrabold mb-4 text-[#1C2536] font-poppins uppercase tracking-wider">HEALTH METRICS</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: "Heart Rate", key: "heartRate", unit: "bpm" },
            { label: "Blood Pressure", key: "bloodPressure", unit: "" },
            { label: "Weight", key: "weight", unit: "kg" },
            { label: "Sleep", key: "sleep", unit: "hours" },
            { label: "Steps", key: "steps", unit: "daily" },
            { label: "Blood Sugar", key: "bloodSugar", unit: "mg/dL" },
          ].map((item) => (
            <div key={item.key} className="p-4 rounded-[24px] bg-[#EDF1F7] shadow-[6px_6px_14px_#BDC4CF,-6px_-6px_14px_#FFFFFF] border border-white/60">
              <p className="text-xs uppercase text-slate-500 font-semibold">{item.label}</p>
              <p className="text-2xl font-bold mt-1 text-[#1C2536]">
                {healthData?.[item.key] || "—"} {item.unit}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section className="mb-8">
        <h2 className="text-sm font-extrabold mb-4 text-[#1C2536] font-poppins uppercase tracking-wider">RECENT DOCUMENTS</h2>
        {documents.length === 0 ? (
          <p className="text-slate-500 text-sm">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="p-4 rounded-[24px] bg-[#EDF1F7] shadow-[6px_6px_14px_#BDC4CF,-6px_-6px_14px_#FFFFFF] border border-white/60 flex items-center gap-3">
                <span className="text-lg">{doc.type.includes("pdf") ? "📕" : "🖼️"}</span>
                <span className="truncate text-sm font-semibold text-[#1C2536]">{doc.name}</span>
                <span className="text-xs text-slate-500 ml-auto">{new Date(doc.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/chat" className="px-6 py-3 rounded-xl bg-[#4F7DF2] text-white font-bold shadow-[4px_4px_8px_#BDC4CF,-4px_-4px_8px_#FFFFFF] hover:bg-[#3B6BE0] transition">
          Start New Chat
        </Link>
        <button onClick={() => window.location.href = "/chat?openDocuments=true"} className="px-6 py-3 rounded-xl bg-[#EDF1F7] text-[#1C2536] font-bold border border-white/60 shadow-[4px_4px_8px_#BDC4CF,-4px_-4px_8px_#FFFFFF] hover:shadow-[inset_3px_3px_6px_#BDC4CF,inset_-3px_-3px_6px_#FFFFFF] transition">
          Upload Document
        </button>
      </div>
    </div>
  );
}