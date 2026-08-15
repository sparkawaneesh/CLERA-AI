"use client";
import { useEffect, useState } from "react";
import { FiPlus, FiEye, FiX, FiMessageCircle } from "react-icons/fi";

interface DocItem {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  data: string;
  ocrText?: string;
}

export default function PrescriptionsPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(localStorage.getItem("aidoc_theme") !== "light");
    setDocuments(JSON.parse(localStorage.getItem("aidoc_documents") || "[]"));
  }, []);

  const refreshDocs = () =>
    setDocuments(JSON.parse(localStorage.getItem("aidoc_documents") || "[]"));

  const addDocument = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const id = crypto.randomUUID();
      const docs = JSON.parse(localStorage.getItem("aidoc_documents") || "[]");
      docs.push({
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        date: new Date().toISOString(),
        data: reader.result,
      });
      localStorage.setItem("aidoc_documents", JSON.stringify(docs));
      refreshDocs();
    };
    reader.readAsDataURL(file);
  };

  const panelBg = isDark ? "bg-white/5 backdrop-blur-xl border border-white/10" : "bg-white/70 backdrop-blur-xl border border-gray-200";
  const cardBg = isDark ? "bg-white/5 backdrop-blur-md border border-white/5" : "bg-white/80 backdrop-blur-md border border-gray-200";
  const headingColor = isDark ? "text-white/90" : "text-gray-900";
  const subtextColor = isDark ? "text-white/40" : "text-gray-500";

  return (
    <div className="min-h-screen p-6 bg-[#E1E5EC] text-[#1C2536] font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1C2536]">Prescriptions</h1>
        <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#4F7DF2] text-white font-bold shadow-[4px_4px_8px_#BDC4CF,-4px_-4px_8px_#FFFFFF] hover:bg-[#3B6BE0] transition">
          <FiPlus className="inline mr-2" /> Upload
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addDocument(file);
          }} />
        </label>
      </div>

      {documents.length === 0 ? (
        <p className="text-slate-500 text-sm">No prescriptions uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 rounded-[24px] bg-[#EDF1F7] shadow-[6px_6px_14px_#BDC4CF,-6px_-6px_14px_#FFFFFF] border border-white/60 flex items-center justify-between">
              <div className="flex items-center gap-3 truncate">
                <span className="text-xl">{doc.type.includes("pdf") ? "📄" : "🖼️"}</span>
                <div>
                  <p className="font-semibold text-sm text-[#1C2536] truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(doc.date).toLocaleDateString()} · {(doc.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl bg-[#EDF1F7] text-slate-500 shadow-[3px_3px_6px_#BDC4CF,-3px_-3px_6px_#FFFFFF] hover:text-[#4F7DF2] transition" title="View">
                  <FiEye className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl bg-[#EDF1F7] text-slate-500 shadow-[3px_3px_6px_#BDC4CF,-3px_-3px_6px_#FFFFFF] hover:text-red-500 transition" title="Delete"
                  onClick={() => {
                    const updated = documents.filter((d) => d.id !== doc.id);
                    setDocuments(updated);
                    localStorage.setItem("aidoc_documents", JSON.stringify(updated));
                  }}>
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}