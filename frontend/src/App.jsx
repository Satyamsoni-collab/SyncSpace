import React, { useState } from "react";
import Whiteboard from "./components/whiteboard/Whiteboard";
import JoinRoom from "./components/JoinRoom";
import "./App.css";

const CodeEditorPlaceholder = () => (
  <div className="placeholder-container editor-container">
    <h3>💻 Code Editor Component</h3>
    <p>Waiting for Monaco Editor to mount...</p>
  </div>
);

function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleJoin = (room, user) => {
    setRoomId(room);
    setUsername(user);
    setJoined(true);
  };

  const handleLeaveRoom = () => {
    setJoined(false);
    setRoomId("");
    setUsername("");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      alert("Room ID copied!");
    } catch (error) {
      console.error("Unable to copy room ID:", error);
    }
  };

  return (
    <div className="app-shell">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>
      <div className="background-grid"></div>

      {joined && (
        <nav className="top-nav">
          <div className="logo">
            <h1>SyncSpace</h1>
          </div>

          <div className="nav-info">
            <span className="room-badge">Room: {roomId}</span>
            <span className="user-badge">User: {username}</span>
          </div>

          <div className="nav-actions">
            <button className="header-button secondary" onClick={handleShare}>
              🔗 Share Room
            </button>

            <button className="header-button leave" onClick={handleLeaveRoom}>
              Leave
            </button>
          </div>
        </nav>
      )}

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