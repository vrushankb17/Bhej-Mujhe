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

  // File reception state
  const receiveBufferRef = useRef<ArrayBuffer[]>([]);
  const receivedSizeRef = useRef<number>(0);
  const fileMetaRef = useRef<FileMetadata | null>(null);

  useEffect(() => {
    // Only import PeerJS on client side
    import("peerjs").then(({ default: Peer }) => {
      const peer = new Peer();
      
      peer.on("open", (id) => {
        setPeerId(id);
      });

      peer.on("connection", (conn) => {
        setupConnection(conn);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        setStatus("error");
      });

      peerRef.current = peer;
    });

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
    });

    conn.on("data", (data: any) => {
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
    
    conn.on("error", () => {
      setStatus("error");
    });
  }, []);

  const connectToPeer = useCallback((id: string) => {
    if (!peerRef.current) return;
    const conn = peerRef.current.connect(id, { reliable: true });
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
