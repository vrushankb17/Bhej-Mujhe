"use client";
import React, { useCallback, useState } from "react";
import { UploadCloud, File } from "lucide-react";
import { motion } from "framer-motion";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function Dropzone({ onFileSelect, disabled = false }: DropzoneProps) {
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
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [disabled, onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden bg-[#111111]/50 backdrop-blur-md group ${
        isDragOver
          ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          : disabled
          ? "border-neutral-800 opacity-50 cursor-not-allowed"
          : "border-neutral-800 hover:border-neutral-600 hover:bg-[#1a1a1a]/50 cursor-pointer"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={handleChange}
        disabled={disabled}
      />
      
      <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragOver ? "bg-blue-500/20" : "bg-neutral-800 group-hover:bg-neutral-700"}`}>
        <UploadCloud className={`w-8 h-8 transition-colors duration-300 ${isDragOver ? "text-blue-400" : "text-neutral-400"}`} />
      </div>
      
      <h3 className="text-xl font-medium text-neutral-200 mb-2">
        {isDragOver ? "Drop file now!" : "Click or drag file to this area"}
      </h3>
      <p className="text-neutral-500 text-sm max-w-sm text-center">
        Any file size. It'll be directly transferred peer-to-peer with maximum speeds and zero server storage.
      </p>
    </motion.div>
  );
}
