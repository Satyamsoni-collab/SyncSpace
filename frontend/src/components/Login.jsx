import React, { useState } from "react";
import "./Login.css";

function Login({
  onSwitchToRegister,
  onLoginSuccess
}) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {

        throw new Error(
          result.message ||
          "Login failed"
        );

      }

      /*
        SAVE LOGIN SESSION
      */

      if (result.token) {

        localStorage.setItem(
          "syncspaceToken",
          result.token
        );

      }

      if (result.user) {

        localStorage.setItem(
          "syncspaceUser",
          JSON.stringify(result.user)
        );

        onLoginSuccess(result.user);

      } else {

        onLoginSuccess({
          name:
            result.name ||
            email.split("@")[0],

          email
        });

      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
        "Unable to login"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">

      {/* Background */}

      <div className="auth-grid"></div>

      <div className="auth-orb auth-orb-one"></div>

      <div className="auth-orb auth-orb-two"></div>

      <div className="auth-orb auth-orb-three"></div>


      {/* Navigation */}

      <nav className="auth-nav">

        <div className="auth-brand">

          <div className="auth-brand-icon">
            S
          </div>

          <div>

            <h2>SyncSpace</h2>

            <span>
              Real-time collaborative workspace
            </span>

          </div>

        </div>


        <div className="auth-live">

          <span></span>

          Live Collaboration

        </div>

      </nav>


      {/* Main */}

      <main className="auth-main">


        {/* LEFT SIDE */}

        <section className="auth-info">

          <div className="auth-badge">
            ⚡ COLLABORATE IN REAL TIME
          </div>


          <h1>
            Build together.
            <span>
              Create together.
            </span>
          </h1>


          <p className="auth-description">

            SyncSpace brings your team together
            with real-time whiteboarding and
            collaborative code editing.

          </p>


          <div className="auth-features">

            <div className="auth-feature">

              <div className="auth-feature-icon">
                🎨
              </div>

              <div>

                <h3>
                  Real-Time Whiteboard
                </h3>

                <p>
                  Draw, brainstorm and share ideas
                  instantly.
                </p>

              </div>

            </div>


            <div className="auth-feature">

              <div className="auth-feature-icon">
                💻
              </div>

              <div>

                <h3>
                  Collaborative Code
                </h3>

                <p>
                  Edit code together with your team
                  in real time.
                </p>

              </div>

            </div>


            <div className="auth-feature">

              <div className="auth-feature-icon">
                🔄
              </div>

              <div>

                <h3>
                  Persistent Workspace
                </h3>

                <p>
                  Your work stays saved even after
                  refreshing the page.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* LOGIN CARD */}

        <section className="auth-card-wrapper">

          <div className="auth-card">

            <div className="auth-card-glow"></div>


            <div className="auth-card-header">

              <div className="auth-lock">
                🔐
              </div>

              <h2>
                Welcome Back
              </h2>

              <p>
                Login to continue to SyncSpace
              </p>

            </div>


            {error && (

              <div className="auth-error">
                ⚠️ {error}
              </div>

            )}


            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >


              {/* EMAIL */}

              <div className="auth-input-group">

                <label>
                  Email Address
                </label>

                <div className="auth-input-wrapper">

                  <span>
                    ✉️
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="auth-input-group">

                <label>
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <span>
                    🔒
                  </span>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >

                {loading
                  ? "Signing in..."
                  : "Login to SyncSpace"}

                {!loading && (
                  <span>→</span>
                )}

              </button>

            </form>


            {/* REGISTER */}

            <div className="auth-switch">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={
                  onSwitchToRegister
                }
              >
                Create Account
              </button>

            </div>


            <div className="auth-security">

              <span></span>

              Secure authentication

              <span></span>

            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="auth-footer">

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

export default Login;