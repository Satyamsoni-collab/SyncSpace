import React, {
  useEffect,
  useState
} from "react";

import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import JoinRoom from "./components/JoinRoom";

import Whiteboard from "./components/whiteboard/Whiteboard";
import CodeEditor from "./components/editor/CodeEditor";
import ReplayPanel from "./components/replay/ReplayPanel";

import {
  socket
} from "./services/socket";


function App() {


  const [page, setPage] =
    useState("login");


  const [user, setUser] =
    useState(null);


  const [workspace, setWorkspace] =
    useState(null);


  /*
    REPLAY PANEL STATE
  */

  const [showReplay, setShowReplay] =
    useState(false);



  /*
    CHECK LOGIN DATA
    WHEN PAGE REFRESHES
  */

  useEffect(() => {


    const savedToken =
      localStorage.getItem(
        "syncspaceToken"
      );


    const savedUser =
      localStorage.getItem(
        "syncspaceUser"
      );


    if (
      savedToken &&
      savedUser
    ) {


      try {


        const parsedUser =
          JSON.parse(
            savedUser
          );


        setUser(
          parsedUser
        );


        setPage(
          "join-room"
        );


      } catch (error) {


        console.error(
          "Failed to restore user session:",
          error
        );


        localStorage.removeItem(
          "syncspaceToken"
        );


        localStorage.removeItem(
          "syncspaceUser"
        );


        setUser(
          null
        );


        setPage(
          "login"
        );


      }


    }


  }, []);



  /*
    LOGIN SUCCESS
  */

  const handleLoginSuccess =
    (loggedInUser) => {


      setUser(
        loggedInUser
      );


      setPage(
        "join-room"
      );


    };



  /*
    JOIN ROOM
  */

  const handleJoinRoom =
    (userName, roomId) => {


      setWorkspace({
        userName,
        roomId
      });


      setShowReplay(
        false
      );


      setPage(
        "workspace"
      );


    };



  /*
    LEAVE ROOM
  */

  const handleLeaveRoom =
    () => {


      const confirmLeave =
        window.confirm(
          "Are you sure you want to leave this workspace?"
        );


      if (!confirmLeave) {

        return;

      }


      /*
        NOTIFY SOCKET SERVER
      */

      if (
        workspace?.roomId &&
        socket.connected
      ) {


        socket.emit(
          "leave-room",
          {

            roomId:
              workspace.roomId

          }
        );


      }


      /*
        CLOSE REPLAY PANEL
      */

      setShowReplay(
        false
      );


      /*
        CLEAR CURRENT WORKSPACE
      */

      setWorkspace(
        null
      );


      /*
        RETURN TO JOIN ROOM PAGE
      */

      setPage(
        "join-room"
      );


    };



  /*
    LOGOUT
  */

  const handleLogout =
    () => {


      const confirmLogout =
        window.confirm(
          "Are you sure you want to logout?"
        );


      if (!confirmLogout) {

        return;

      }


      /*
        LEAVE ROOM FIRST
      */

      if (
        workspace?.roomId &&
        socket.connected
      ) {


        socket.emit(
          "leave-room",
          {

            roomId:
              workspace.roomId

          }
        );


      }


      /*
        REMOVE LOGIN DATA
      */

      localStorage.removeItem(
        "syncspaceToken"
      );


      localStorage.removeItem(
        "syncspaceUser"
      );


      /*
        CLEAR STATE
      */

      setUser(
        null
      );


      setWorkspace(
        null
      );


      setShowReplay(
        false
      );


      /*
        RETURN TO LOGIN
      */

      setPage(
        "login"
      );


    };



  /*
    SHARE ROOM
  */

  const handleShare =
    async () => {


      if (!workspace) {

        return;

      }


      const shareText =
        `Join my SyncSpace workspace!

Room ID: ${workspace.roomId}`;


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



  /*
    LOGIN PAGE
  */

  if (page === "login") {


    return (

      <Login

        onSwitchToRegister={() =>
          setPage("register")
        }

        onLoginSuccess={
          handleLoginSuccess
        }

      />

    );


  }



  /*
    REGISTER PAGE
  */

  if (page === "register") {


    return (

      <Register

        onSwitchToLogin={() =>
          setPage("login")
        }

      />

    );


  }



  /*
    JOIN ROOM PAGE
  */

  if (page === "join-room") {


    return (

      <JoinRoom

        onJoin={
          handleJoinRoom
        }

        userName={
          user?.name || ""
        }

      />

    );


  }



  /*
    MAIN WORKSPACE
  */

  return (

    <div className="app-shell">


      {/* Background Effects */}

      <div
        className="background-glow glow-one"
      ></div>


      <div
        className="background-glow glow-two"
      ></div>



      {/* HEADER */}

      <header className="top-nav">


        <div className="brand-section">


          <div className="brand-icon">

            <span>
              S
            </span>

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



        <div className="room-status">


          <div
            className="live-dot"
          ></div>


          <span>
            Live Collaboration
          </span>


          <span className="room-badge">

            Room:
            {" "}
            {workspace?.roomId}

          </span>


        </div>



        <div className="nav-actions">


          {/* SHARE ROOM */}

          <button
            className="header-button secondary"
            onClick={
              handleShare
            }
          >

            🔗 Share Room

          </button>



          {/* HISTORY BUTTON */}

          <button
            className="header-button secondary"
            onClick={() =>
              setShowReplay(
                !showReplay
              )
            }
          >

            {showReplay
              ? "✕ Close History"
              : "📜 History"}

          </button>



          {/* LEAVE ROOM */}

          <button
            className="header-button leave"
            onClick={
              handleLeaveRoom
            }
          >

            Leave

          </button>



          {/* LOGOUT */}

          <button
            className="header-button logout"
            onClick={
              handleLogout
            }
          >

            Logout

          </button>


        </div>


      </header>



      {/* =========================
          REPLAY HISTORY POPUP
      ========================= */}

      {showReplay && (

        <div className="replay-overlay">


          <div className="replay-popup">


            <div className="replay-popup-header">


              <div>


                <h2>
                  📜 Workspace History
                </h2>


                <p>

                  Room:
                  {" "}
                  {workspace?.roomId}

                </p>


              </div>



              <button
                className="replay-close-button"
                onClick={() =>
                  setShowReplay(false)
                }
              >

                ✕ Close

              </button>


            </div>



            <ReplayPanel

              roomId={
                workspace?.roomId
              }

            />


          </div>


        </div>

      )}



      {/* =========================
          MAIN WORKSPACE
      ========================= */}

      <main className="workspace">


        {/* WHITEBOARD */}

        <section
          className="workspace-panel whiteboard-panel"
        >


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


              <span
                className="pulse-dot"
              ></span>


              LIVE


            </div>


          </div>



          <div className="panel-content">


            <Whiteboard

              roomId={
                workspace?.roomId
              }

              userName={
                workspace?.userName
              }

            />


          </div>


        </section>



        {/* DIVIDER */}

        <div className="workspace-divider">


          <div
            className="divider-line"
          ></div>


          <div className="divider-circle">

            ↔

          </div>


          <div
            className="divider-line"
          ></div>


        </div>



        {/* CODE EDITOR */}

        <section
          className="workspace-panel editor-panel"
        >


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


              <span
                className="pulse-dot"
              ></span>


              CONNECTED


            </div>


          </div>



          <div className="panel-content">


            <CodeEditor

              roomId={
                workspace?.roomId
              }

              userName={
                workspace?.userName
              }

            />


          </div>


        </section>


      </main>



      {/* FOOTER */}

      <footer className="status-bar">


        <div className="status-left">


          <span
            className="status-online-dot"
          ></span>


          You are collaborating as


          <strong>

            {" "}
            {workspace?.userName}

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