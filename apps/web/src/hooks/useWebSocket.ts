"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getUser } from "@/lib/api";

export function useWebSocket<T = unknown>(event = "location_update") {
  const socketRef = useRef<Socket | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const user = getUser();
    const url = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";
    const socket = io(url, {
      auth: { fleetId: user?.fleetId },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on(event, (payload: T) => setData(payload));

    return () => {
      socket.disconnect();
    };
  }, [event]);

  const send = useCallback((name: string, payload: unknown) => {
    socketRef.current?.emit(name, payload);
  }, []);

  return { data, connected, send };
}
