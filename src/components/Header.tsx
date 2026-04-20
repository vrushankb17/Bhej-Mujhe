"use client";
import React from "react";
import { Send } from "lucide-react";

export default function Header() {
  return (
    <header className="flex justify-between items-center py-8 px-6 bg-transparent w-full max-w-5xl mx-auto z-50">
      <div className="flex items-center gap-3">
        {/* Minimalist Logo */}
        <div className="flex items-end select-none cursor-default group">
          <div className="flex items-start transition-opacity group-hover:opacity-80">
            <span className="text-2xl sm:text-3xl font-medium text-white leading-none tracking-tight">भे</span>
            <span className="text-lg sm:text-xl font-light text-white/50 leading-none pt-[5px] pl-1 tracking-[0.2em] uppercase">hej</span>
          </div>
          <div className="flex items-start ml-3 sm:ml-4 relative transition-opacity group-hover:opacity-80">
            <span className="text-2xl sm:text-3xl font-medium text-white leading-none tracking-tight">मु</span>
            <span className="text-lg sm:text-xl font-light text-white/50 leading-none pt-[5px] pl-1 tracking-[0.2em] uppercase">jhe</span>
            <span className="w-1 h-1 bg-white/30 rounded-full absolute -right-3 bottom-1.5 transition-colors group-hover:bg-white"></span>
          </div>
        </div>
      </div>
      <div className="text-xs font-mono tracking-widest text-white/30 uppercase flex items-center gap-2 select-none">
        <div className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/30 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/40"></span>
        </div>
        Ready
      </div>
    </header>
  );
}
