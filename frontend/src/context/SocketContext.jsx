import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { io } from "socket.io-client";

// Backend Socket.IO server
const SOCKET_URL = "http://localhost:5001";

// Create socket context
const SocketContext = createContext(null);

// Custom hook to access socket
export function useSocket() {
  return useContext(SocketContext);
}

// Socket provider
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to backend
    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
    });

    // Save socket instance
    setSocket(newSocket);

    // Connection status
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    // Cleanup when component unmounts
    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}