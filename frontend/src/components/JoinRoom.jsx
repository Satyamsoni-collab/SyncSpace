import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const JoinRoom = ({ onJoin }) => {
  const socket = useSocket();
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  
  // New States for UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for backend connection errors
  useEffect(() => {
    if (!socket) return;
    
    const handleConnectError = () => {
      setIsLoading(false);
      setError('Connection to server failed. Please try again.');
    };

    const handleSocketError = (data) => {
      setIsLoading(false);
      setError(data?.message || 'An error occurred while joining.');
    };

    socket.on('connect_error', handleConnectError);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('connect_error', handleConnectError);
      socket.off('error', handleSocketError);
    };
  }, [socket]);

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !roomId.trim()) {
      setError('Please enter both username and room ID.');
      return;
    }
    
    if (socket) {
      setIsLoading(true);
      
      // Emit the event to the backend
      socket.emit('join-room', { roomId, username });
      
      // Simulate a tiny delay for smooth UX transition to the workspace
      setTimeout(() => {
        setIsLoading(false);
        onJoin(roomId, username); // Passes data back to App.jsx
      }, 600);
    } else {
       setError('Socket connection not available yet. Please wait.');
    }
  };

  return (
    <div className="join-room-container">
      <h2>Join SyncSpace</h2>
      
      {/* Conditionally render the Error Banner */}
      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleJoin}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
        <input 
          type="text" 
          placeholder="Room ID" 
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <button type="submit" className="btn primary" disabled={isLoading}>
          {/* Show a CSS spinner if loading, otherwise show text */}
          {isLoading ? <span className="spinner"></span> : 'Join Workspace'}
        </button>
      </form>
    </div>
  );
};

export default JoinRoom;