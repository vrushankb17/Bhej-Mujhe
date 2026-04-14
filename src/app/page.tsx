"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Dropzone from "@/components/Dropzone";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Copy, Check, Upload, Download, AlertCircle, RefreshCw, ChevronLeft, Send, Sparkles } from "lucide-react";

type Role = "send" | "receive" | null;

export default function Home() {
  const { peerId, status, progress, receivedFile, connectToPeer, sendFile, resetTransfer, disconnect } = useWebRTC();
  const [role, setRole] = useState<Role>(null);
  const [partnerIdInput, setPartnerIdInput] = useState("");
  const [copied, setCopied] = useState(false);

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
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Dynamic Background Ambient Light matching Status */}
      <motion.div 
        animate={{ 
          backgroundColor: status === 'error' ? 'rgba(239, 68, 68, 0.15)' : 
                           status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 
                           'rgba(59, 130, 246, 0.15)'
        }}
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000" 
      />
      <motion.div 
        animate={{ 
          backgroundColor: status === 'error' ? 'rgba(239, 68, 68, 0.05)' : 
                           status === 'completed' ? 'rgba(16, 185, 129, 0.05)' : 
                           'rgba(59, 130, 246, 0.1)' 
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000" 
      />
      
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 w-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: ROLE SELECTION */}
          {!role && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent tracking-tight mb-4 text-center">
                What do you want to do?
              </h2>
              <p className="text-neutral-500 mb-12 text-center max-w-lg">
                Choose to send files directly to another device, or receive a file using a connection code.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                <button
                  onClick={() => setRole("send")}
                  className="group relative flex flex-col items-center p-10 bg-card/40 hover:bg-card/80 border border-card-border hover:border-blue-500/50 rounded-3xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-blue-500/20">
                    <Upload className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Send File</h3>
                  <p className="text-neutral-500 text-sm">Generate a code and send files</p>
                </button>

                <button
                  onClick={() => setRole("receive")}
                  className="group relative flex flex-col items-center p-10 bg-card/40 hover:bg-card/80 border border-card-border hover:border-emerald-500/50 rounded-3xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-emerald-500/20">
                    <Download className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Receive File</h3>
                  <p className="text-neutral-500 text-sm">Enter a code to receive files</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ACTIVE ROLE VIEW */}
          {role && (
            <motion.div
              key="active-role"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full flex justify-center flex-col items-center"
            >
              <button 
                onClick={resetAll}
                className="mb-8 self-start flex items-center gap-2 text-neutral-500 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to role selection
              </button>

              {/* ----- SENDER FLOW ----- */}
              {role === "send" && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 h-full min-h-[400px]">
                  
                  {/* Sender Info / Status */}
                  <div className="bg-card/60 backdrop-blur-xl border border-card-border rounded-3xl p-8 flex flex-col relative overflow-hidden justify-between">
                     <div>
                       <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                         <Send className="w-6 h-6 text-blue-500" /> Sending Device
                       </h2>
                       <p className="text-neutral-400 text-sm mb-8">Share this 16-character connection code with the receiver.</p>
                       
                       <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-4 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                          <span className="font-mono text-xl tracking-wider text-blue-300 truncate mr-4">
                            {peerId ? peerId : "Generating..."}
                          </span>
                          <button 
                            onClick={handleCopy}
                            disabled={!peerId}
                            className="bg-blue-600/20 hover:bg-blue-500 text-blue-400 hover:text-white p-3 rounded-xl transition-all active:scale-95 flex-shrink-0"
                          >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                       </div>
                     </div>

                     <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800 flex items-center justify-between">
                       <span className="text-sm font-medium text-neutral-400">Status</span>
                       <div className="flex items-center gap-2 text-sm">
                         {status === 'disconnected' && <><span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /><span className="text-yellow-500">Waiting for receiver...</span></>}
                         {status === 'connecting' && <><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /><span className="text-blue-500">Connecting...</span></>}
                         {(status === 'connected' || status === 'transferring' || status === 'completed') && <><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-emerald-500">Connected</span></>}
                         {status === 'error' && <><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-red-500">Error</span></>}
                       </div>
                     </div>
                  </div>

                  {/* Sender Action Area */}
                  <div className="flex flex-col justify-center h-full min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                      {status === "disconnected" || status === "connecting" ? (
                        <motion.div
                          key="waiting-sender"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-800 rounded-3xl relative"
                        >
                          {/* Radar animation for waiting */}
                          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                            <motion.div 
                              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full bg-blue-500/30"
                            />
                            <div className="w-16 h-16 rounded-full bg-card border border-neutral-800 flex items-center justify-center z-10 shadow-lg">
                              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin-slow" />
                            </div>
                          </div>
                          <h3 className="text-xl font-medium mb-2">Ready to Connect</h3>
                          <p className="text-neutral-500 text-sm max-w-[200px]">Waiting for receiver to input your connection code...</p>
                        </motion.div>
                      ) : status === "error" ? (
                        <ErrorComponent message="Connection failed or was interrupted." onRetry={resetTransfer} />
                      ) : status === "transferring" ? (
                        <TransferProgress progress={progress} role="send" />
                      ) : status === "completed" ? (
                        <CompletedComponent role="send" onReset={resetTransfer} />
                      ) : (
                        <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                          <Dropzone onFileSelect={sendFile} disabled={false} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ----- RECEIVER FLOW ----- */}
              {role === "receive" && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 h-full min-h-[400px]">
                  
                  {/* Receiver Input / Status */}
                  <div className="bg-card/60 backdrop-blur-xl border border-card-border rounded-3xl p-8 flex flex-col relative justify-between">
                     <div>
                       <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                         <Download className="w-6 h-6 text-emerald-500" /> Receiving Device
                       </h2>
                       <p className="text-neutral-400 text-sm mb-8">Paste the 16-character connection code from the sender.</p>
                       
                       <form onSubmit={handleConnect} className="flex flex-col gap-4 mb-4">
                        <input
                          type="text"
                          value={partnerIdInput}
                          onChange={(e) => setPartnerIdInput(e.target.value)}
                          placeholder="e.g. 1a2b3c4d5e6f7g8h"
                          disabled={status === 'connected' || status === 'connecting' || status === 'transferring' || status === 'completed'}
                          className="bg-neutral-900 border border-neutral-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-6 py-4 font-mono text-lg outline-none transition-all placeholder:text-neutral-600 disabled:opacity-50 text-emerald-300"
                        />
                        <button 
                          type="submit"
                          disabled={!partnerIdInput.trim() || status === 'connected' || status === 'connecting' || status === 'transferring' || status === 'completed'}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all font-semibold rounded-2xl p-4 shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                        >
                          Connect to Sender
                        </button>
                      </form>
                     </div>

                     <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800 flex items-center justify-between">
                       <span className="text-sm font-medium text-neutral-400">Status</span>
                       <div className="flex items-center gap-2 text-sm">
                         {status === 'disconnected' && <><span className="w-2 h-2 rounded-full bg-neutral-500" /><span className="text-neutral-500">Not Connected</span></>}
                         {status === 'connecting' && <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-emerald-500">Bridging connection...</span></>}
                         {(status === 'connected' || status === 'transferring' || status === 'completed') && <><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-emerald-500">Connected</span></>}
                         {status === 'error' && <><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-red-500">Error</span></>}
                       </div>
                     </div>
                  </div>

                  {/* Receiver Action Area */}
                  <div className="flex flex-col justify-center h-full min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                      {status === "disconnected" || status === "connecting" ? (
                        <motion.div
                          key="waiting-receive"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-800 rounded-3xl relative"
                        >
                          <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
                             <Sparkles className="w-8 h-8 text-neutral-600" />
                          </div>
                          <h3 className="text-xl font-medium mb-2 opacity-50">Awaiting Connection</h3>
                          <p className="text-neutral-600 text-sm max-w-[200px]">Enter a code to securely bridge your devices.</p>
                        </motion.div>
                      ) : status === "error" ? (
                        <ErrorComponent message="Connection lost or transfer failed." onRetry={resetTransfer} />
                      ) : status === "transferring" ? (
                        <TransferProgress progress={progress} role="receive" />
                      ) : status === "completed" && receivedFile ? (
                        <motion.div
                          key="completed-receive"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                          className="h-full flex flex-col items-center justify-center p-8 border border-emerald-500/30 rounded-3xl bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden"
                        >
                          <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            transition={{ delay: 0.2, type: "spring" }}
                            className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-[40px]" 
                          />
                          
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-6 z-10"
                          >
                            <Download className="w-12 h-12 text-emerald-400" />
                          </motion.div>
                          
                          <h3 className="text-3xl font-bold mb-2 z-10">File Received</h3>
                          <p className="text-emerald-200/60 mb-8 z-10 text-sm text-center max-w-[250px] truncate">
                            {receivedFile.name} • {(receivedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          
                          <a
                            href={receivedFile.url}
                            download={receivedFile.name}
                            className="z-10 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] active:scale-95 flex items-center gap-3"
                          >
                            <Download className="w-5 h-5" />
                            Save to Device
                          </a>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="connected-await-file"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="h-full flex flex-col items-center justify-center text-center p-8 border border-emerald-500/20 rounded-3xl bg-emerald-500/5 relative"
                        >
                          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30"
                            />
                            <div className="w-16 h-16 rounded-full bg-card border border-emerald-500/50 flex items-center justify-center z-10">
                              <Check className="w-6 h-6 text-emerald-500" />
                            </div>
                          </div>
                          <h3 className="text-xl font-medium mb-2 text-emerald-100">Connection Bridged</h3>
                          <p className="text-emerald-300/60 text-sm">Waiting for sender to select and send a file...</p>
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

// ------ Helper Components for clean separation ------

const TransferProgress = ({ progress, role }: { progress: number, role: 'send' | 'receive' }) => {
  const color = role === 'send' ? 'bg-blue-500' : 'bg-emerald-500';
  const shadow = role === 'send' ? 'shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'shadow-[0_0_20px_rgba(16,185,129,0.6)]';
  const textColor = role === 'send' ? 'text-blue-400' : 'text-emerald-400';

  return (
    <motion.div
      key="progress-ui"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`h-full flex flex-col justify-center p-10 border rounded-3xl backdrop-blur-md relative overflow-hidden ${role === 'send' ? 'border-blue-500/20 bg-blue-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}
    >
      {/* High performance progressing background */}
      <motion.div 
        className={`absolute bottom-0 left-0 right-0 opacity-10 ${color}`}
        initial={{ height: '0%' }}
        animate={{ height: `${progress}%` }}
        transition={{ ease: "linear", duration: 0.2 }}
      />

      <div className="text-center z-10 relative">
        {/* Animated circle progress */}
        <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
               <motion.circle 
                 cx="50" cy="50" r="46" 
                 fill="transparent" 
                 stroke="currentColor" 
                 className={textColor}
                 strokeWidth="8" 
                 strokeLinecap="round"
                 strokeDasharray="289"
                 initial={{ strokeDashoffset: 289 }}
                 animate={{ strokeDashoffset: 289 - (289 * progress) / 100 }}
                 transition={{ ease: "linear", duration: 0.2 }}
               />
            </svg>
            <div className={`text-4xl font-black ${textColor}`}>
              {progress}%
            </div>
        </div>
        
        <h3 className="text-xl font-medium mb-2">{role === 'send' ? 'Sending File...' : 'Receiving File...'}</h3>
        <p className="text-neutral-500 text-sm">Please do not close this tab or lock your device.</p>
      </div>
    </motion.div>
  );
};

const CompletedComponent = ({ role, onReset }: { role: 'send' | 'receive', onReset: () => void }) => {
  return (
    <motion.div
      key="completed-send"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col items-center justify-center p-8 border border-blue-500/30 rounded-3xl bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)] text-center relative"
    >
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mb-6 z-10"
      >
        <Check className="w-12 h-12 text-blue-400" />
      </motion.div>
      <h3 className="text-3xl font-bold mb-2">Transfer Complete!</h3>
      <p className="text-blue-200/60 mb-8 max-w-[200px] text-sm">The file was successfully sent directly to the receiver.</p>
      <button 
        onClick={onReset}
        className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
      >
        Send another file
      </button>
    </motion.div>
  );
};

const ErrorComponent = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <motion.div
    key="error"
    initial={{ opacity: 0, rotate: -2 }}
    animate={{ opacity: 1, rotate: 0 }}
    className="h-full flex flex-col items-center justify-center text-center p-8 border border-red-500/30 rounded-3xl bg-red-500/5 relative overflow-hidden"
  >
    <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mb-6">
       <AlertCircle className="w-10 h-10 text-red-400" />
    </div>
    <h3 className="text-2xl font-bold mb-2 text-red-200">Transfer Failed</h3>
    <p className="text-red-400/80 mb-6 text-sm">{message}</p>
    <button onClick={onRetry} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
      Try Again
    </button>
  </motion.div>
);
