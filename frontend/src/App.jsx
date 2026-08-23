import React from "react";

import "./App.css";

import Whiteboard from
  "./components/whiteboard/Whiteboard";

import CodeEditor from
  "./components/editor/CodeEditor";


function App() {

  return (

    <div className="app-shell">

      <nav className="top-nav">

        <div className="brand">

          <h1>SyncSpace</h1>

          <p>
            Real-Time Collaborative Workspace
          </p>

        </div>


        <div className="nav-center">

          <span className="live-dot"></span>

          <span>
            Live Collaboration
          </span>

        </div>


        <div className="nav-actions">

          <button
            className="btn outline"
          >
            Share Room
          </button>

          <button
            className="btn primary"
          >
            Export
          </button>

        </div>

      </nav>


      <main className="workspace">

        <section
          className="workspace-panel left-panel"
        >

          <div className="panel-title">

            <div>

              <h2>
                Collaborative Whiteboard
              </h2>

              <p>
                Draw and brainstorm together
              </p>

            </div>

          </div>


          <Whiteboard />

        </section>


        <div className="divider"></div>


        <section
          className="workspace-panel right-panel"
        >

          <CodeEditor />

        </section>

      </main>

    </div>

  );

}


export default App;