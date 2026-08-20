import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

function App() {
  const [code, setCode] = useState('// Week 2: Shared Code State Integration\nconsole.log("Ready for sync!");');

  function handleEditorChange(value) {
    setCode(value);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#1e1e1e', color: '#fff', padding: '10px 20px', fontSize: '18px' }}>
        SyncSpace Editor - Week 2
      </header>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

export default App;
