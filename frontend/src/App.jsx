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


      {/* Animated Background */}

      <div className="background-glow glow-one"></div>

      <div className="background-glow glow-two"></div>

      <div className="background-grid"></div>


      {/* Header */}

      <header className="top-nav">


        {/* Brand */}

        <div className="brand-section">


          <div className="brand-icon">

            <span>S</span>

          </div>


          <div className="brand-text">

            <h1>
              SyncSpace
            </h1>

            <p>
              Real-time collaborative workspace
            </p>

          </div>


        </div>



        {/* Room Status */}

        <div className="room-status">


          <div className="live-status">

            <span className="live-dot"></span>

            <span>
              Live Collaboration
            </span>

          </div>


          <span className="room-badge">

            Room: {workspace.roomId}

          </span>


        </div>

        {/* Conditionally render Room ID & Username if the user has joined */}
        {joined && (
          <div className="nav-info">
            <span className="room-badge">Room: {roomId}</span>
            <span className="user-badge">User: {username}</span>
          </div>
        )}

        <div className="nav-actions">


          <button
            className="header-button secondary"
            onClick={handleShare}
          >

            🔗 Share Room

          </button>



          <button
            className="header-button leave"
            onClick={handleLeaveRoom}
          >

            Leave

          </button>


        </div>

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