"use client";
import React from "react";
import { Send } from "lucide-react";

export default function Header() {
  return (
    <header className="flex justify-between items-center py-5 px-6 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/20 flex items-center justify-center rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Send className="text-blue-400 w-5 h-5 -ml-1 mt-0.5" />
        </div>
        {/* Hybrid Hindi/English Logo typography */}
        <div className="flex items-end select-none">
          <div className="flex items-start">
            <span className="text-3xl sm:text-4xl font-black text-white leading-none">भे</span>
            <span className="text-2xl sm:text-3xl font-bold text-white leading-none border-t-[3px] sm:border-t-4 border-white pt-1 -ml-[1px] tracking-tight">hej</span>
          </div>
          <div className="flex items-start ml-2 sm:ml-3 relative">
            <span className="text-3xl sm:text-4xl font-black text-white leading-none">मु</span>
            <span className="text-2xl sm:text-3xl font-bold text-white leading-none border-t-[3px] sm:border-t-4 border-white pt-1 -ml-[1px] tracking-tight">jhe</span>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#10b981] rounded-full absolute -right-4 bottom-1 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
          </div>
        </div>
      </div>
      <div className="text-sm font-medium tracking-wide text-neutral-500 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
        Device Ready
      </div>
    </header>
  );
}
