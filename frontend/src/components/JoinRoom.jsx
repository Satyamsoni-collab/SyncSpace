import React, { useState } from "react";


function JoinRoom({ onJoin }) {

  const [userName, setUserName] =
    useState("");

  const [roomId, setRoomId] =
    useState("syncspace-demo");


  const handleSubmit = (event) => {

    event.preventDefault();


    if (!userName.trim()) {

      alert(
        "Please enter your name"
      );

      return;

    }


    if (!roomId.trim()) {

      alert(
        "Please enter a room ID"
      );

      return;

    }


    onJoin(
      userName.trim(),
      roomId.trim()
    );

  };


  return (

    <div className="join-page">


      {/* Animated Background */}

      <div className="join-orb orb-one"></div>

      <div className="join-orb orb-two"></div>

      <div className="join-orb orb-three"></div>



      {/* Navigation */}

      <nav className="join-nav">


        <div className="join-logo">


          <div className="brand-icon">

            S

          </div>


          <span>
            SyncSpace
          </span>


        </div>



        <div className="nav-live-status">

          <span className="live-dot"></span>

          Real-time collaboration

        </div>


      </nav>



      {/* Main Section */}

      <main className="join-main">


        {/* Left Information */}

        <section className="join-hero">


          <div className="hero-badge">

            <span className="spark">

              ✦

            </span>

            COLLABORATE WITHOUT LIMITS

          </div>



          <h1>

            Work together.

            <span>
              Create together.
            </span>

          </h1>



          <p className="hero-description">

            A real-time collaborative workspace where
            ideas, drawings and code come together in
            one shared space.

          </p>



          <div className="feature-list">


            <div className="feature-item">

              <div className="feature-icon">

                🎨

              </div>


              <div>

                <h3>
                  Collaborative Whiteboard
                </h3>

                <p>
                  Draw ideas together in real time.
                </p>

              </div>


            </div>



            <div className="feature-item">

              <div className="feature-icon">

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



            <div className="feature-item">

              <div className="feature-icon">

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



        {/* Join Card */}

        <section className="join-card-container">


          <div className="join-card">


            <div className="join-card-glow"></div>



            <div className="join-card-header">


              <div className="workspace-icon">

                ✨

              </div>


              <h2>
                Join your workspace
              </h2>


              <p>
                Enter your details to start collaborating.
              </p>


            </div>



            <form
              onSubmit={handleSubmit}
            >


              <div className="input-group">


                <label>

                  Your Name

                </label>


                <div className="input-wrapper">

                  <span>

                    👤

                  </span>


                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(event) =>
                      setUserName(
                        event.target.value
                      )
                    }
                  />

                </div>


              </div>



              <div className="input-group">


                <label>

                  Workspace ID

                </label>


                <div className="input-wrapper">

                  <span>

                    🔗

                  </span>


                  <input
                    type="text"
                    placeholder="Example: team-project-1"
                    value={roomId}
                    onChange={(event) =>
                      setRoomId(
                        event.target.value
                      )
                    }
                  />

                </div>


              </div>



              <button
                type="submit"
                className="join-button"
              >

                <span>

                  Join Workspace

                </span>

                <span className="join-arrow">

                  →

                </span>


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


        <span>

          ⚡ Built for seamless collaboration

        </span>


        <span>

          SyncSpace 2026

        </span>


      </footer>


    </div>

  );

}


export default JoinRoom;