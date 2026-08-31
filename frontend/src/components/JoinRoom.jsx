import React, { useState } from "react";
import "./JoinRoom.css";

function JoinRoom({ onJoin }) {
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("syncspace-demo");

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = userName.trim();
    const room = roomId.trim();

    if (!name) {
      alert("Please enter your name");
      return;
    }

    if (!room) {
      alert("Please enter a room ID");
      return;
    }

    onJoin(name, room);
  };

  return (
    <div className="join-page">

      {/* Background */}
      <div className="join-background">
        <div className="join-glow join-glow-one"></div>
        <div className="join-glow join-glow-two"></div>
      </div>

      {/* Navigation */}
      <nav className="join-nav">

        <div className="join-brand">

          <div className="join-brand-icon">
            S
          </div>

          <div className="join-brand-text">
            <div className="join-brand-name">
              SyncSpace
            </div>

            <div className="join-brand-subtitle">
              Real-time collaborative workspace
            </div>
          </div>

        </div>

        <div className="join-live-status">
          <span className="join-live-dot"></span>
          Live Collaboration
        </div>

      </nav>

      {/* Main */}
      <main className="join-main">

        {/* Left Side */}
        <section className="join-info">

          <div className="join-small-badge">
            <span>✦</span>
            COLLABORATE WITHOUT LIMITS
          </div>

          <h1 className="join-title">
            Work together.
            <span>Create together.</span>
          </h1>

          <p className="join-description">
            A real-time collaborative workspace where
            ideas, drawings and code come together
            in one shared space.
          </p>

          {/* Features */}
          <div className="join-features">

            <div className="join-feature">

              <div className="join-feature-icon">
                🎨
              </div>

              <div>
                <h3>
                  Collaborative Whiteboard
                </h3>

                <p>
                  Draw and brainstorm together in real time.
                </p>
              </div>

            </div>

            <div className="join-feature">

              <div className="join-feature-icon">
                💻
              </div>

              <div>
                <h3>
                  Live Code Editor
                </h3>

                <p>
                  Write and synchronize code instantly.
                </p>
              </div>

            </div>

            <div className="join-feature">

              <div className="join-feature-icon">
                ⚡
              </div>

              <div>
                <h3>
                  Instant Synchronization
                </h3>

                <p>
                  See every change as it happens.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* Right Side - Join Card */}
        <section className="join-card-wrapper">

          <div className="join-card">

            {/* Card top */}
            <div className="join-card-top">

              <div className="join-workspace-icon">
                ✨
              </div>

              <div>
                <h2>
                  Join your workspace
                </h2>

                <p>
                  Enter your details to start collaborating.
                </p>
              </div>

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div className="join-input-group">

                <label>
                  Your Name
                </label>

                <div className="join-input-wrapper">

                  <span className="join-input-icon">
                    👤
                  </span>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(event) =>
                      setUserName(event.target.value)
                    }
                  />

                </div>

              </div>

              {/* Room */}
              <div className="join-input-group">

                <label>
                  Workspace ID
                </label>

                <div className="join-input-wrapper">

                  <span className="join-input-icon">
                    🔗
                  </span>

                  <input
                    type="text"
                    placeholder="Example: team-project-1"
                    value={roomId}
                    onChange={(event) =>
                      setRoomId(event.target.value)
                    }
                  />

                </div>

              </div>

              {/* Button */}
              <button
                type="submit"
                className="join-submit-button"
              >

                <span>
                  Join Workspace
                </span>

                <span className="join-submit-arrow">
                  →
                </span>

              </button>

            </form>

            {/* Security */}
            <div className="join-security">

              <span className="join-security-dot"></span>

              <span>
                Your workspace connection is live and secure
              </span>

            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="join-footer">

        <span>
          ⚡ Built for seamless collaboration
        </span>

        <span>
          SyncSpace © 2026
        </span>

      </footer>

    </div>
  );
}

export default JoinRoom;