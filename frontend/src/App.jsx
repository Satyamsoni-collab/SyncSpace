import React, { useState, useEffect } from 'react';
import Whiteboard from './components/whiteboard/Whiteboard';
import JoinRoom from './components/JoinRoom';
import { useSocket, SocketProvider } from './context/SocketContext';

const AppContent = () => {
  const socket = useSocket();
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for backend room events and console.log the data
    socket.on('user-joined', (data) => {
      console.log('Event received [user-joined]:', data);
    });

    socket.on('room-users', (users) => {
      console.log('Event received [room-users]:', users);
    });

    socket.on('user-disconnected', (data) => {
      console.log('Event received [user-disconnected]:', data);
    });

    // Clean up event listeners to prevent memory leaks or duplicate logs
    return () => {
      socket.off('user-joined');
      socket.off('room-users');
      socket.off('user-disconnected');
    };
  }, [socket]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {!hasJoined ? (
        <JoinRoom onJoin={() => setHasJoined(true)} />
      ) : (
        <Whiteboard />
      )}
    </div>
  );
};

function App() {
  return (
    // Wrap the entire app with the SocketProvider
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;