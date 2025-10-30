import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

let socket: Socket | null = null;

export const initSocket = (userId?: string, role?: string) => {
  if (socket?.connected) return socket;

  const API_URL = (() => {
    const fromEnv = (import.meta as any).env?.VITE_API_URL as string | undefined;
    if (fromEnv && typeof fromEnv === "string" && fromEnv.trim()) {
      const trimmed = fromEnv.replace(/\/$/, "");
      return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
    }
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (host.endsWith("safetyplus.co.in")) return "https://api.safetyplus.co.in";
      if (host.endsWith("netlify.app")) return "https://safetyplus-backend.onrender.com";
    }
    return "http://localhost:5000";
  })();

  socket = io(API_URL, {
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket.IO connected");

    if (role === "admin") {
      socket?.emit("join", { role: "admin" });
    } else if (userId) {
      socket?.emit("join", { userId });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Hook for using Socket.IO in components
export const useSocket = () => {
  const { user } = useAuthStore();

  const connectSocket = () => {
    const role = user?.role;
    const userId = user?.id;

    initSocket(userId, role);
  };

  return {
    socket: socket,
    connectSocket,
    disconnectSocket: disconnectSocket,
  };
};
