"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type Peer from "peerjs";
import type { DataConnection } from "peerjs";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "transferring" | "completed" | "error";

interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

export const useWebRTC = () => {
  const [peerId, setPeerId] = useState<string>("");
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [progress, setProgress] = useState<number>(0);
  const [receivedFile, setReceivedFile] = useState<{ name: string; url: string; size: number } | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  const receiveBufferRef = useRef<ArrayBuffer[]>([]);
  const receivedSizeRef = useRef<number>(0);
  const fileMetaRef = useRef<FileMetadata | null>(null);

  const initialize = useCallback((role: 'send' | 'receive') => {
    import("peerjs").then(({ default: Peer }) => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }

      const peerConfig = {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443?transport=tcp',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            }
          ]
        }
      };

      let peer: Peer;
      
      if (role === 'send') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        peer = new Peer(`bhej-mujhe-${code}`, peerConfig);
        setPeerId(code); 
      } else {
        peer = new Peer(peerConfig);
      }
      
      peer.on("open", (id) => {
        if (role === 'receive') {
          // Internal receiver ID,  don't display it.
        }
      });

      peer.on("disconnected", () => {
        console.log("Disconnected from signaling server. Reconnecting...");
        if (peerRef.current && !peerRef.current.destroyed) {
          peerRef.current.reconnect();
        }
      });

      peer.on("connection", (conn) => {
        setupConnection(conn);
      });

      peer.on("error", (err: any) => {
        console.error("Peer error:", err.type, err);
        if (err.type === 'webrtc') {
          return;
        }
        if (connRef.current && connRef.current.open) {
          return;
        }
        
        if (err.type === 'peer-unavailable') {
          setStatus("error");
          return;
        }

        if (err.type === 'network' || err.type === 'server-error') {
           setTimeout(() => {
             if (peerRef.current && !peerRef.current.destroyed && peerRef.current.disconnected) {
                console.log("Attempting reconnect after network error...");
                peerRef.current.reconnect();
             }
           }, 2000);
           return;
        }

        setStatus("error");
      });

      peerRef.current = peer;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const setupConnection = useCallback((conn: DataConnection) => {
    connRef.current = conn;
    setStatus("connecting");

    conn.on("open", () => {
      setStatus("connected");
      setProgress(0);
      setReceivedFile(null);
      receiveBufferRef.current = [];
      receivedSizeRef.current = 0;
      fileMetaRef.current = null;
      setTimeout(() => {
        try { conn.send({ type: "handshake" }); } catch (e) {}
      }, 500);
    });

    conn.on("data", (data: any) => {
      setStatus(prev => (prev === "connecting" || prev === "error") ? "connected" : prev);

      if (data.type === "handshake") {
        return;
      }

      if (data.type === "meta") {
        fileMetaRef.current = data.meta;
        receiveBufferRef.current = [];
        receivedSizeRef.current = 0;
        setStatus("transferring");
      } else if (data.type === "chunk") {
        const chunk = data.chunk as ArrayBuffer;
        receiveBufferRef.current.push(chunk);
        receivedSizeRef.current += chunk.byteLength;
        
        if (fileMetaRef.current) {
          setProgress(Math.round((receivedSizeRef.current / fileMetaRef.current.size) * 100));
          
          if (receivedSizeRef.current === fileMetaRef.current.size) {
            // File fully received
            const blob = new Blob(receiveBufferRef.current, { type: fileMetaRef.current.type });
            const url = URL.createObjectURL(blob);
            setReceivedFile({
              name: fileMetaRef.current.name,
              url,
              size: fileMetaRef.current.size
            });
            setStatus("completed");
          }
        }
      }
    });

    conn.on("close", () => {
      setStatus("disconnected");
    });
    
    conn.on("error", (err: any) => {
      console.error("Connection error:", err);
      if (!conn.open) {
        setStatus("error");
      }
    });
  }, []);

  const connectToPeer = useCallback((id: string) => {
    if (!peerRef.current) return;
    // Prefix the input to match the hidden true ID
    const fullId = `bhej-mujhe-${id.replace(/\s+/g, '')}`;
    const conn = peerRef.current.connect(fullId, { reliable: true });
    setupConnection(conn);
  }, [setupConnection]);

  const sendFile = useCallback((file: File) => {
    if (!connRef.current || status !== "connected") return;
    
    setStatus("transferring");
    setProgress(0);
    
    // Send metadata
    connRef.current.send({
      type: "meta",
      meta: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });

    // Chunk size config: 256KB chunks for fast reliable P2P without overwhelming buffers
    const chunkSize = 256 * 1024;
    let offset = 0;
    
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      if (!connRef.current) return;
      if (e.target?.result instanceof ArrayBuffer) {
        connRef.current.send({
          type: "chunk",
          chunk: e.target.result
        });
        
        offset += e.target.result.byteLength;
        setProgress(Math.round((offset / file.size) * 100));
        
        if (offset < file.size) {
          readSlice(offset);
        } else {
          setStatus("completed");
        }
      }
    };

    const readSlice = (o: number) => {
      const slice = file.slice(o, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };

    // start reading
    readSlice(0);
  }, [status]);

  return {
    peerId,
    status,
    progress,
    receivedFile,
    connectToPeer,
    sendFile,
    initialize,
    resetTransfer: () => {
      setStatus(connRef.current ? "connected" : "disconnected");
      setProgress(0);
      setReceivedFile(null);
    },
    disconnect: () => {
      if (connRef.current) {
        connRef.current.close();
        connRef.current = null;
      }
      setStatus("disconnected");
      setProgress(0);
      setReceivedFile(null);
    }
  };
};
