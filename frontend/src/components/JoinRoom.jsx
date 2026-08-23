import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

const JoinRoom = ({ onJoin }) => {
  const socket = useSocket();
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim() || !roomId.trim()) return;
    
    if (socket) {
      // 1. Emit the join-room event matching the backend's expected data structure
      socket.emit('join-room', { roomId, username });
      
      // 2. Notify parent component to update local state and show the Whiteboard
      onJoin();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <h2 style={{ fontFamily: 'sans-serif', marginBottom: '20px' }}>Join SyncSpace</h2>
      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input 
          type="text" 
          placeholder="Room ID" 
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', fontSize: '16px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Join Room
        </button>
      </form>
    </div>
  );
};

export default JoinRoom;