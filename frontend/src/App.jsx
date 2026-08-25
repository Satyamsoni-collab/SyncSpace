import React, { useState } from "react";

import "./App.css";

import JoinRoom from "./components/JoinRoom";
import Whiteboard from "./components/whiteboard/Whiteboard";
import CodeEditor from "./components/editor/CodeEditor";


function App() {

  const [workspace, setWorkspace] = useState(null);


  const handleJoinRoom = (userName, roomId) => {

    setWorkspace({
      userName,
      roomId
    });

  };


  const handleLeaveRoom = () => {

    const confirmLeave = window.confirm(
      "Are you sure you want to leave this workspace?"
    );


    if (confirmLeave) {

      window.location.reload();

    }

  };


  const handleShare = async () => {

    if (!workspace) {
      return;
    }


    const shareText =
      `Join my SyncSpace workspace!

Room ID: ${workspace.roomId}

Open SyncSpace and enter this Room ID to collaborate with me.`;


    try {

      await navigator.clipboard.writeText(
        shareText
      );


      alert(
        "Room details copied to clipboard!"
      );

    } catch (error) {

      alert(
        `Room ID: ${workspace.roomId}`
      );

    }

  };


  if (!workspace) {

    return (

      <JoinRoom
        onJoin={handleJoinRoom}
      />

    );

  }


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



        {/* Actions */}

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


      </header>



      {/* Main Workspace */}

      <main className="workspace">


        {/* ================= WHITEBOARD ================= */}

        <section className="workspace-panel whiteboard-panel">


          <div className="panel-header">


            <div className="panel-title-group">


              <div className="panel-icon purple">

                🎨

              </div>


              <div>

                <h2>
                  Whiteboard
                </h2>

                <p>
                  Draw and brainstorm together in real time
                </p>

              </div>


            </div>



            <div className="panel-live">

              <span className="pulse-dot"></span>

              LIVE

            </div>


          </div>



          <div className="panel-content">


            {/* IMPORTANT:
                Send the same roomId and userName
                to the Whiteboard
            */}

            <Whiteboard
              roomId={workspace.roomId}
              userName={workspace.userName}
            />


          </div>


        </section>



        {/* Workspace Divider */}

        <div className="workspace-divider">


          <div className="divider-line"></div>


          <div className="divider-circle">

            ↔

          </div>


          <div className="divider-line"></div>


        </div>



        {/* ================= CODE EDITOR ================= */}

        <section className="workspace-panel editor-panel">


          <div className="panel-header">


            <div className="panel-title-group">


              <div className="panel-icon blue">

                💻

              </div>


              <div>

                <h2>
                  Code Editor
                </h2>

                <p>
                  Write and edit code together instantly
                </p>

              </div>


            </div>



            <div className="panel-live">

              <span className="pulse-dot"></span>

              CONNECTED

            </div>


          </div>



          <div className="panel-content">


            {/* IMPORTANT:
                Send the same roomId and userName
                to the Code Editor
            */}

            <CodeEditor
              roomId={workspace.roomId}
              userName={workspace.userName}
            />


          </div>


        </section>


      </main>



      {/* Bottom Status Bar */}

      <footer className="status-bar">


        <div className="status-left">


          <span className="status-online-dot"></span>


          <span>
            You are collaborating as
          </span>


          <strong>
            {workspace.userName}
          </strong>


        </div>



        <div className="status-center">

          ⚡ Changes sync instantly across connected users

        </div>



        <div className="status-right">

          SyncSpace © 2026

        </div>


      </footer>


    </div>

  );

}


export default App;