import React, { useState } from "react";
import "./Register.css";

function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed. Please try again."
        );

        setMessageType("error");
        setLoading(false);

        return;
      }

      if (data.token) {
        localStorage.setItem(
          "syncspaceToken",
          data.token
        );
      }

      localStorage.setItem(
        "syncspaceUser",
        JSON.stringify({
          name: name.trim(),
          email: email.trim()
        })
      );

      setMessage(
        "Account created successfully!"
      );

      setMessageType("success");

      setTimeout(() => {
        onSwitchToLogin();
      }, 1200);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setMessage(
        "Unable to connect to SyncSpace server."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* Background decoration */}

      <div className="register-glow register-glow-one"></div>

      <div className="register-glow register-glow-two"></div>

      <div className="register-grid"></div>


      {/* Navigation */}

      <nav className="register-nav">

        <div
          className="register-brand"
          onClick={onSwitchToLogin}
        >

          <div className="register-brand-icon">
            S
          </div>

          <div>
            <h2>SyncSpace</h2>

            <span>
              Real-time collaborative workspace
            </span>
          </div>

        </div>


        <div className="register-nav-status">

          <span className="register-live-dot"></span>

          Live Collaboration

        </div>

      </nav>


      {/* Main */}

      <main className="register-main">

        {/* Left section */}

        <section className="register-intro">

          <div className="register-badge">
            ✦ COLLABORATE • CREATE • CONNECT
          </div>

          <h1>
            Build together.
            <span>
              In real time.
            </span>
          </h1>

          <p className="register-description">
            Create your SyncSpace account and work
            together with your team using a shared
            whiteboard and collaborative code editor.
          </p>


          <div className="register-features">

            <div className="register-feature">

              <div className="register-feature-icon">
                🎨
              </div>

              <div>
                <h3>
                  Collaborative Whiteboard
                </h3>

                <p>
                  Draw, brainstorm and share ideas together.
                </p>
              </div>

            </div>


            <div className="register-feature">

              <div className="register-feature-icon">
                💻
              </div>

              <div>
                <h3>
                  Real-time Code Editor
                </h3>

                <p>
                  Write and edit code with your teammates.
                </p>
              </div>

            </div>


            <div className="register-feature">

              <div className="register-feature-icon">
                ⚡
              </div>

              <div>
                <h3>
                  Instant Synchronization
                </h3>

                <p>
                  Changes are synchronized instantly.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* Register Card */}

        <section className="register-card-wrapper">

          <div className="register-card">

            <div className="register-card-glow"></div>


            <div className="register-card-header">

              <div className="register-icon">
                S
              </div>

              <h2>
                Create Account
              </h2>

              <p>
                Join SyncSpace and start collaborating.
              </p>

            </div>


            <form
              className="register-form"
              onSubmit={handleSubmit}
            >

              {/* Name */}

              <div className="register-input-group">

                <label>
                  Full Name
                </label>

                <div className="register-input-wrapper">

                  <span>
                    👤
                  </span>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    autoComplete="name"
                    disabled={loading}
                    required
                  />

                </div>

              </div>


              {/* Email */}

              <div className="register-input-group">

                <label>
                  Email Address
                </label>

                <div className="register-input-wrapper">

                  <span>
                    ✉️
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    disabled={loading}
                    required
                  />

                </div>

              </div>


              {/* Password */}

              <div className="register-input-group">

                <label>
                  Password
                </label>

                <div className="register-input-wrapper">

                  <span>
                    🔒
                  </span>

                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    disabled={loading}
                    required
                  />

                </div>

                <small>
                  Minimum 6 characters
                </small>

              </div>


              {/* Message */}

              {message && (

                <div
                  className={`register-message ${messageType}`}
                >
                  {message}
                </div>

              )}


              {/* Submit */}

              <button
                className="register-submit-button"
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="register-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="register-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>


            {/* Login */}

            <div className="register-login-section">

              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={onSwitchToLogin}
              >
                Login
              </button>

            </div>


            {/* Security */}

            <div className="register-secure">

              <span className="secure-check">
                ✓
              </span>

              Your information is securely stored

            </div>

          </div>

        </section>

      </main>


      {/* Footer */}

      <footer className="register-footer">

        <span>
          SyncSpace © 2026
        </span>

        <span>
          Real-time collaboration platform
        </span>

      </footer>

    </div>
  );
}

export default Register;