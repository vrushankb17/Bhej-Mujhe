"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Dropzone from "@/components/Dropzone";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Copy, Check, Upload, Download, AlertCircle, RefreshCw, ChevronLeft, Send, Sparkles } from "lucide-react";

type Role = "send" | "receive" | null;

export default function Home() {
  const { peerId, status, progress, receivedFile, connectToPeer, sendFile, resetTransfer, disconnect, initialize } = useWebRTC();
  const [role, setRole] = useState<Role>(null);
  const [partnerIdInput, setPartnerIdInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const handleFilesSelect = async (files: File[]) => {
    if (files.length === 1) {
      sendFile(files[0]);
    } else if (files.length > 1) {
      setIsZipping(true);
      setZipProgress(0);
      try {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        files.forEach((file) => {
          zip.file(file.name, file);
        });
        const blob = await zip.generateAsync(
          { type: "blob", compression: "STORE" },
          (metadata) => {
            setZipProgress(Math.round(metadata.percent));
          }
        );
        const zipFile = new File([blob], "bhej-mujhe-files.zip", { type: "application/zip" });
        setIsZipping(false);
        sendFile(zipFile);
      } catch (err) {
        console.error("Zipping error:", err);
        setIsZipping(false);
      }
    }
  };

  const handleCopy = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerIdInput.trim()) {
      connectToPeer(partnerIdInput.trim());
    }
  };

  const resetAll = () => {
    setRole(null);
    setPartnerIdInput("");
    disconnect();
  };

  return (
    <div className="flex flex-col min-h-screen bg-black relative overflow-hidden text-neutral-200">
      <motion.div 
        animate={{ 
          opacity: status === 'error' ? 0.3 : status === 'completed' ? 0.5 : 0.2
        }}
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-[120px] pointer-events-none transition-opacity duration-1000" 
      />
      <motion.div 
        animate={{ 
          opacity: status === 'error' ? 0.1 : status === 'completed' ? 0.3 : 0.1
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-[120px] pointer-events-none transition-opacity duration-1000" 
      />
      
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 w-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {!role && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight mb-4 text-center">
                Transfer Files.
              </h2>
              <p className="text-neutral-500 mb-16 text-center max-w-lg font-light tracking-wide text-lg">
                Select your role for this session.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <button
                  onClick={() => { setRole("send"); initialize("send"); }}
                  className="group relative flex flex-col items-center p-12 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-2xl transition-all duration-700 overflow-hidden"
                >
                  <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mb-8 transition-transform duration-700 group-hover:-translate-y-1">
                    <Upload strokeWidth={1} className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-light mb-2 tracking-wide text-white/90">Send</h3>
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest mt-2">Generate Code</p>
                </button>

                <button
                  onClick={() => { setRole("receive"); initialize("receive"); }}
                  className="group relative flex flex-col items-center p-12 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-2xl transition-all duration-700 overflow-hidden"
                >
                  <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mb-8 transition-transform duration-700 group-hover:-translate-y-1">
                    <Download strokeWidth={1} className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-light mb-2 tracking-wide text-white/90">Receive</h3>
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest mt-2">Enter Code</p>
                </button>
              </div>
            </motion.div>
          )}

          {role && (
            <motion.div
              key="active-role"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full flex flex-col max-w-4xl"
            >
              <button 
                onClick={resetAll}
                className="mb-10 self-start flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-light tracking-wide"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {role === "send" && (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
                  <div className="bg-white/[0.02] border border-white/[0.03] rounded-2xl p-10 flex flex-col justify-between">
                     <div>
                       <h2 className="text-xl font-light mb-2 flex items-center gap-3 text-white/90">
                         <Send strokeWidth={1.5} className="w-5 h-5 text-white/50" /> Sending
                       </h2>
                       <p className="text-white/40 text-sm mb-10 font-light tracking-wide leading-relaxed">Share this ID securely with the receiver.</p>
                       
                       <div className="bg-black/50 border border-white/[0.05] rounded-xl p-5 mb-4 flex items-center justify-between group group-hover:border-white/[0.1] transition-all">
                          <span className="font-mono text-2xl tracking-[0.2em] text-white/80 select-all">
                            {peerId ? peerId : "......"}
                          </span>
                          <button 
                            onClick={handleCopy}
                            disabled={!peerId}
                            className="text-white/30 hover:text-white transition-colors disabled:opacity-30"
                          >
                            {copied ? <Check strokeWidth={1.5} className="w-5 h-5" /> : <Copy strokeWidth={1.5} className="w-5 h-5" />}
                          </button>
                       </div>
                     </div>

                     <div className="pt-6 border-t border-white/[0.05] flex items-center justify-between mt-auto">
                       <span className="text-xs tracking-widest uppercase font-mono text-white/30">Status</span>
                       <div className="flex items-center gap-2 text-sm font-light text-white/60">
                         {status === 'disconnected' && <><span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" /><span>Waiting</span></>}
                         {status === 'connecting' && <><span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" /><span>Connecting</span></>}
                         {(status === 'connected' || status === 'transferring' || status === 'completed') && <><span className="w-1.5 h-1.5 rounded-full bg-white" /><span className="text-white">Connected</span></>}
                         {status === 'error' && <><span className="w-1.5 h-1.5 rounded-full bg-red-400" /><span className="text-red-400">Error</span></>}
                       </div>
                     </div>
                  </div>

                  <div className="flex flex-col justify-center h-full min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                      {status === "disconnected" || status === "connecting" ? (
                        <motion.div
                          key="waiting-sender"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full flex flex-col items-center justify-center text-center p-8 border border-white/[0.03] rounded-2xl bg-white/[0.01]"
                        >
                          <RefreshCw strokeWidth={1} className="w-8 h-8 text-white/20 animate-spin-slow mb-6" />
                          <h3 className="text-lg font-light mb-2 text-white/80">Awaiting</h3>
                          <p className="text-white/40 text-sm max-w-[200px] font-light">Receiver has not connected yet.</p>
                        </motion.div>
                      ) : status === "error" ? (
                        <ErrorComponent message="Connection failed." onRetry={resetTransfer} />
                      ) : status === "transferring" ? (
                        <TransferProgress progress={progress} role="send" />
                      ) : status === "completed" ? (
                        <CompletedComponent role="send" onReset={resetTransfer} />
                      ) : isZipping ? (
                        <ZippingProgress progress={zipProgress} />
                      ) : (
                        <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                          <Dropzone onFilesSelect={handleFilesSelect} disabled={false} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {role === "receive" && (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
                  <div className="bg-white/[0.02] border border-white/[0.03] rounded-2xl p-10 flex flex-col justify-between">
                     <div>
                       <h2 className="text-xl font-light mb-2 flex items-center gap-3 text-white/90">
                         <Download strokeWidth={1.5} className="w-5 h-5 text-white/50" /> Receiving
                       </h2>
                       <p className="text-white/40 text-sm mb-10 font-light tracking-wide leading-relaxed">Enter the sender's 6-digit ID.</p>
                       
                       <form onSubmit={handleConnect} className="flex flex-col gap-4 mb-4">
                        <input
                          type="text"
                          value={partnerIdInput}
                          onChange={(e) => setPartnerIdInput(e.target.value)}
                          placeholder="ID"
                          disabled={status === 'connected' || status === 'connecting' || status === 'transferring' || status === 'completed'}
                          className="bg-black/50 border border-white/[0.05] focus:border-white/[0.2] rounded-xl px-5 py-4 font-mono text-xl tracking-[0.2em] outline-none transition-all placeholder:text-white/20 disabled:opacity-50 text-white"
                        />
                        <button 
                          type="submit"
                          disabled={!partnerIdInput.trim() || status === 'connected' || status === 'connecting' || status === 'transferring' || status === 'completed'}
                          className="bg-white text-black disabled:bg-white/10 disabled:text-white/30 transition-all font-medium tracking-wide rounded-xl p-4 mt-2"
                        >
                          Connect
                        </button>
                      </form>
                     </div>

                     <div className="pt-6 border-t border-white/[0.05] flex items-center justify-between mt-auto">
                       <span className="text-xs tracking-widest uppercase font-mono text-white/30">Status</span>
                       <div className="flex items-center gap-2 text-sm font-light text-white/60">
                         {status === 'disconnected' && <><span className="w-1.5 h-1.5 rounded-full bg-white/20" /><span>Idle</span></>}
                         {status === 'connecting' && <><span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" /><span>Connecting</span></>}
                         {(status === 'connected' || status === 'transferring' || status === 'completed') && <><span className="w-1.5 h-1.5 rounded-full bg-white" /><span className="text-white">Connected</span></>}
                         {status === 'error' && <><span className="w-1.5 h-1.5 rounded-full bg-red-400" /><span className="text-red-400">Error</span></>}
                       </div>
                     </div>
                  </div>

                  <div className="flex flex-col justify-center h-full min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                      {status === "disconnected" || status === "connecting" ? (
                        <motion.div
                          key="waiting-receive"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full flex flex-col items-center justify-center text-center p-8 border border-white/[0.03] rounded-2xl bg-white/[0.01]"
                        >
                          <Sparkles strokeWidth={1} className="w-8 h-8 text-white/20 mb-6" />
                          <h3 className="text-lg font-light mb-2 text-white/80">Ready</h3>
                          <p className="text-white/40 text-sm max-w-[200px] font-light">Enter code to securely bridge devices.</p>
                        </motion.div>
                      ) : status === "error" ? (
                        <ErrorComponent message="Transfer failed." onRetry={resetTransfer} />
                      ) : status === "transferring" ? (
                        <TransferProgress progress={progress} role="receive" />
                      ) : status === "completed" && receivedFile ? (
                        <motion.div
                          key="completed-receive"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-full flex flex-col items-center justify-center p-10 border border-white/[0.08] rounded-2xl bg-white/[0.02]"
                        >
                          <Download strokeWidth={1} className="w-10 h-10 text-white mb-6" />
                          <h3 className="text-2xl font-light mb-2 text-white">Received</h3>
                          <p className="text-white/40 mb-8 max-w-[250px] truncate font-mono text-xs text-center">
                            {receivedFile.name}
                          </p>
                          <a
                            href={receivedFile.url}
                            download={receivedFile.name}
                            className="bg-white text-black px-8 py-4 rounded-xl font-medium tracking-wide transition-all hover:bg-white/90 flex items-center gap-3"
                          >
                            Save
                          </a>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="connected-await-file"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-full flex flex-col items-center justify-center text-center p-8 border border-white/[0.03] rounded-2xl bg-white/[0.01]"
                        >
                          <Check strokeWidth={1} className="w-8 h-8 text-white mb-6" />
                          <h3 className="text-lg font-light mb-2 text-white">Connected</h3>
                          <p className="text-white/40 text-sm font-light">Waiting for sender's file.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const TransferProgress = ({ progress, role }: { progress: number, role: 'send' | 'receive' }) => {
  return (
    <motion.div
      key="progress-ui"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`h-full flex flex-col items-center justify-center p-10 border border-white/[0.05] rounded-2xl bg-white/[0.02] relative overflow-hidden`}
    >
      <div className="z-10 relative flex flex-col items-center">
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="48" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
               <motion.circle 
                 cx="50" cy="50" r="48" 
                 fill="transparent" 
                 stroke="white" 
                 strokeWidth="1" 
                 strokeLinecap="round"
                 strokeDasharray="301.59"
                 initial={{ strokeDashoffset: 301.59 }}
                 animate={{ strokeDashoffset: 301.59 - (301.59 * progress) / 100 }}
                 transition={{ ease: "linear", duration: 0.2 }}
               />
            </svg>
            <div className="text-2xl font-light text-white tracking-widest text-center">
              {progress}%
            </div>
        </div>
        
        <h3 className="text-lg font-light mb-2 text-white/80">{role === 'send' ? 'Sending' : 'Receiving'}</h3>
        <p className="text-white/30 text-xs uppercase tracking-widest font-mono">Transfer in progress</p>
      </div>
    </motion.div>
  );
};

const CompletedComponent = ({ role, onReset }: { role: 'send' | 'receive', onReset: () => void }) => {
  return (
    <motion.div
      key="completed-send"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-10 border border-white/[0.05] rounded-2xl bg-white/[0.02] text-center"
    >
      <Check strokeWidth={1} className="w-10 h-10 text-white mb-6" />
      <h3 className="text-2xl font-light mb-2 text-white">Complete</h3>
      <p className="text-white/40 mb-10 text-sm font-light">Successfully transferred.</p>
      <button 
        onClick={onReset}
        className="bg-white/10 hover:bg-white/20 border border-white/[0.05] text-white px-8 py-3 rounded-xl font-light tracking-wide transition-all"
      >
        Send another
      </button>
    </motion.div>
  );
};

const ErrorComponent = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <motion.div
    key="error"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="h-full flex flex-col items-center justify-center text-center p-10 border border-red-500/10 rounded-2xl bg-red-500/5"
  >
    <AlertCircle strokeWidth={1} className="w-10 h-10 text-red-400 mb-6" />
    <h3 className="text-xl font-light mb-2 text-red-200">Failed</h3>
    <p className="text-red-300/60 mb-8 text-sm font-light">{message}</p>
    <button onClick={onRetry} className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-8 py-3 rounded-xl font-light transition-all">
      Retry
    </button>
  </motion.div>
);

const ZippingProgress = ({ progress }: { progress: number }) => (
  <motion.div
    key="zipping-ui"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`h-full flex flex-col items-center justify-center p-10 border border-white/[0.05] rounded-2xl bg-white/[0.02] relative overflow-hidden`}
  >
    <div className="z-10 relative flex flex-col items-center">
      <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="48" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
             <motion.circle 
               cx="50" cy="50" r="48" 
               fill="transparent" 
               stroke="white" 
               strokeWidth="1" 
               strokeLinecap="round"
               strokeDasharray="301.59"
               initial={{ strokeDashoffset: 301.59 }}
               animate={{ strokeDashoffset: 301.59 - (301.59 * progress) / 100 }}
               transition={{ ease: "linear", duration: 0.2 }}
             />
          </svg>
          <div className="text-2xl font-light text-white tracking-widest text-center">
            {progress}%
          </div>
      </div>
      
      <h3 className="text-lg font-light mb-2 text-white/80">Archiving</h3>
      <p className="text-white/30 text-xs uppercase tracking-widest font-mono">Preparing files</p>
    </div>
  </motion.div>
);

