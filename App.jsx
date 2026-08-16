import React from 'react';
import Editor from '@monaco-editor/react';

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#1e1e1e', color: '#fff', padding: '10px 20px', fontSize: '18px' }}>
        SyncSpace Editor
      </header>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Welcome to SyncSpace Editor\nconsole.log('Hello Zeba!');"
          theme="vs-dark"
        />
      </div>
    </div>
  );
}

export default App;
