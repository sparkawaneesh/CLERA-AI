"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMic } from "react-icons/fi";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/chat" || pathname === "/") {
    return null;
  }

  return (
    <nav className="bg-[#0A0D14] sticky top-0 z-50">
      <div className="w-full px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#FFFFFF] font-bold text-lg tracking-wider">
          WELCOME, AYUSH
          <span className="flex items-center gap-1.5 text-xs text-[#10B981] font-normal ml-3 tracking-normal bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
            </span>
            Online
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.15)] text-[#CBD5E1] text-sm font-medium hover:border-[rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:text-white transition-all">
            <FiMic className="text-[#06B6D4]" /> Voice
          </button>
        </div>
      </div>
    </nav>
  );
}
