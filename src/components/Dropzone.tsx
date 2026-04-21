"use client";
import React, { useCallback, useState } from "react";
import { UploadCloud, File } from "lucide-react";
import { motion } from "framer-motion";

interface DropzoneProps {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
}

export default function Dropzone({ onFilesSelect, disabled = false }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files));
    }
  }, [disabled, onFilesSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden group ${
        isDragOver
          ? "bg-white/10 scale-[1.02]"
          : disabled
          ? "bg-transparent border border-white/5 opacity-50 cursor-not-allowed"
          : "bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] cursor-pointer"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={handleChange}
        disabled={disabled}
      />
      
      <motion.div 
        animate={{ y: isDragOver ? -5 : 0 }}
        className="mb-8 opacity-70"
      >
        <UploadCloud strokeWidth={1} className={`w-10 h-10 transition-colors duration-500 ${isDragOver ? "text-white" : "text-white/50"}`} />
      </motion.div>
      
      <h3 className={`text-xl font-light tracking-wide mb-3 transition-colors duration-500 ${isDragOver ? "text-white" : "text-white/70"}`}>
        {isDragOver ? "Release to drop" : "Select or drop files"}
      </h3>
      <p className="text-white/30 text-xs font-mono tracking-widest uppercase text-center mt-2">
        Direct P2P
      </p>
    </motion.div>
  );
}
