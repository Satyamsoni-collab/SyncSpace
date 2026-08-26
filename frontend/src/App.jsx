import React, { useState } from 'react';
import Whiteboard from './components/whiteboard/Whiteboard';
import JoinRoom from './components/JoinRoom'; // Imported your real component!
import './App.css';

const CodeEditorPlaceholder = () => (
  <div className="placeholder-container editor-container">
    <h3>💻 Code Editor Component</h3>
    <p>Waiting for Monaco Editor to mount...</p>
  </div>
);

function App() {
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
<<<<<<< HEAD


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


=======
      
      <nav className="top-nav">
        <div className="logo">
          <h1>SyncSpace</h1>
>>>>>>> feature/react-ui
        </div>

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

      {/* Conditionally render the real JoinRoom component */}
      {!joined ? (
        <JoinRoom onJoin={handleJoin} />
      ) : (
        <main className="workspace">
          <section className="workspace-panel left-panel">
            <Whiteboard />
          </section>

          <div className="divider"></div>

          <section className="workspace-panel right-panel">
            <CodeEditorPlaceholder />
          </section>
        </main>
      )}
    </div>

  );

}


export default App;