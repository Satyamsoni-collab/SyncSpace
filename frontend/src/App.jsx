import React, { useState } from 'react';
import Whiteboard from './components/whiteboard/Whiteboard';
import './App.css';

// A lightweight placeholder for joining rooms.
// If you already have a JoinRoom component, you can replace this with your import!
const JoinRoomPlaceholder = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  
  return (
    <div className="join-room-container">
      <h2>Join SyncSpace</h2>
      <form onSubmit={(e) => { e.preventDefault(); onJoin(roomId, username); }}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} required />
        <button type="submit" className="btn primary">Join Workspace</button>
      </form>
    </div>
  );
};

// Placeholder for the Monaco Code Editor
const CodeEditorPlaceholder = () => (
  <div className="placeholder-container editor-container">
    <h3>💻 Code Editor Component</h3>
    <p>Waiting for Monaco Editor to mount...</p>
  </div>
);

function App() {
  // Room Joining State Management
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const handleJoin = (room, user) => {
    setRoomId(room);
    setUsername(user);
    setJoined(true);
  };

  return (
    <div className="app-shell">
      
      {/* 1. Top Navigation Bar */}
      <nav className="top-nav">
        <div className="logo">
          <h1>SyncSpace</h1>
        </div>

        {/* Conditionally render Room ID & Username if the user has joined */}
        {joined && (
          <div className="nav-info">
            <span className="room-badge">Room: {roomId}</span>
            <span className="user-badge">User: {username}</span>
          </div>
        )}

        <div className="nav-actions">
          <button className="btn outline">Share</button>
          <button className="btn primary">Export</button>
        </div>
      </nav>

      {/* 2. Main Workspace or Join Room Screen */}
      {!joined ? (
        <JoinRoomPlaceholder onJoin={handleJoin} />
      ) : (
        <main className="workspace">
          
          {/* Left Side: Whiteboard */}
          <section className="workspace-panel left-panel">
            <Whiteboard />
          </section>

          {/* Visual Divider (Drag capabilities can be added later) */}
          <div className="divider"></div>

          {/* Right Side: Monaco Code Editor Placeholder */}
          <section className="workspace-panel right-panel">
            <CodeEditorPlaceholder />
          </section>

        </main>
      )}
    </div>
  );
}

export default App;