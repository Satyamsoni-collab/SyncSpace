import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize the connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Clean up connection on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};