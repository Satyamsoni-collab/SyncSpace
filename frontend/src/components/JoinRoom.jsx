import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

function JoinRoom({ onJoin }) {
  const socket = useSocket();

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("syncspace-demo");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!socket) return;

    const handleConnectError = () => {
      setIsLoading(false);
      setError("Connection to server failed. Please try again.");
    };

    const handleSocketError = (data) => {
      setIsLoading(false);
      setError(data?.message || "An error occurred while joining.");
    };

    socket.on("connect_error", handleConnectError);
    socket.on("error", handleSocketError);

    return () => {
      socket.off("connect_error", handleConnectError);
      socket.off("error", handleSocketError);
    };
  }, [socket]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    const cleanRoomId = roomId.trim();

    if (!cleanUsername) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanRoomId) {
      setError("Please enter a room ID.");
      return;
    }

    if (!socket) {
      setError("Socket connection not available yet. Please wait.");
      return;
    }

    setIsLoading(true);

    socket.emit("join-room", {
      roomId: cleanRoomId,
      username: cleanUsername,
    });

    setTimeout(() => {
      setIsLoading(false);
      onJoin(cleanRoomId, cleanUsername);
    }, 600);
  };

  return (
    <div className="join-page">
      <div className="join-orb orb-one"></div>
      <div className="join-orb orb-two"></div>
      <div className="join-orb orb-three"></div>

      <nav className="join-nav">
        <div className="join-logo">
          <div className="brand-icon">S</div>
          <span>SyncSpace</span>
        </div>

        <div className="nav-live-status">
          <span className="live-dot"></span>
          Real-time collaboration
        </div>
      </nav>

      <main className="join-main">
        <section className="join-hero">
          <div className="hero-badge">
            <span className="spark">✦</span>
            COLLABORATE WITHOUT LIMITS
          </div>

          <h1>
            Work together.
            <span>Create together.</span>
          </h1>

          <p className="hero-description">
            A real-time collaborative workspace where ideas, drawings and code
            come together in one shared space.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🎨</div>

              <div>
                <h3>Collaborative Whiteboard</h3>
                <p>Draw ideas together in real time.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💻</div>

              <div>
                <h3>Live Code Editor</h3>
                <p>Write and synchronize code instantly.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">⚡</div>

              <div>
                <h3>Instant Synchronization</h3>
                <p>See every change as it happens.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="join-card-container">
          <div className="join-card">
            <div className="join-card-glow"></div>

            <div className="join-card-header">
              <div className="workspace-icon">✨</div>

              <h2>Join your workspace</h2>

              <p>Enter your details to start collaborating.</p>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Your Name</label>

                <div className="input-wrapper">
                  <span>👤</span>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Workspace ID</label>

                <div className="input-wrapper">
                  <span>🔗</span>

                  <input
                    type="text"
                    placeholder="Example: team-project-1"
                    value={roomId}
                    onChange={(event) => setRoomId(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="join-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <span>Join Workspace</span>
                    <span className="join-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="join-card-footer">
              <span className="secure-dot"></span>
              Your workspace connection is live and secure
            </div>
          </div>
        </section>
      </main>

      <footer className="join-footer">
        <span>⚡ Built for seamless collaboration</span>
        <span>SyncSpace 2026</span>
      </footer>
    </div>
  );
}

export default JoinRoom;