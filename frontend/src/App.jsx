import React from 'react';
import './App.css';

// --- Placeholders (Swap these out with your real imports later) ---
const WhiteboardPlaceholder = () => (
  <div className="placeholder-container whiteboard-container">
    <h3>🎨 Whiteboard Component</h3>
    <p>Waiting for canvas to mount...</p>
  </div>
);

const CodeEditorPlaceholder = () => (
  <div className="placeholder-container editor-container">
    <h3>💻 Code Editor Component</h3>
    <p>Waiting for Monaco Editor to mount...</p>
  </div>
);
// ------------------------------------------------------------------

function App() {
  return (
    <div className="app-shell">
      
      {/* 1. Top Navigation Bar */}
      <nav className="top-nav">
        <div className="logo">
          <h1>SyncSpace</h1>
        </div>
        <div className="nav-actions">
          <button className="btn outline">Share</button>
          <button className="btn primary">Export</button>
        </div>
      </nav>

      {/* 2. Main Workspace (Split Screen) */}
      <main className="workspace">
        
        {/* Left Side: Whiteboard */}
        <section className="workspace-panel left-panel">
          <WhiteboardPlaceholder />
        </section>

        {/* Visual Divider */}
        <div className="divider"></div>

        {/* Right Side: Monaco Code Editor */}
        <section className="workspace-panel right-panel">
          <CodeEditorPlaceholder />
        </section>

      </main>
    </div>
  );
}

export default App;