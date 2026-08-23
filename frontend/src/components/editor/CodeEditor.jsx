import React, {
  useEffect,
  useState
} from "react";

import Editor from
  "@monaco-editor/react";

import {
  useSocket
} from "../../context/SocketContext";

import "./editor.css";


function CodeEditor() {

  const socket =
    useSocket();


  const [code, setCode] =
    useState(
`// Start collaborating here

console.log("Hello from SyncSpace");`
    );


  const [language, setLanguage] =
    useState("javascript");


  const roomId =
    "syncspace-demo";


  const [userName] =
    useState(() => {

      const savedName =
        localStorage.getItem(
          "syncspace-user-name"
        );

      return (
        savedName ||
        "Anonymous User"
      );

    });


  useEffect(() => {

    if (!socket) {
      return;
    }


    const joinRoom = () => {

      socket.emit(
        "join-room",
        {
          roomId,
          userName
        }
      );

    };


    if (socket.connected) {

      joinRoom();

    } else {

      socket.on(
        "connect",
        joinRoom
      );

    }


    const handleCodeChange =
      ({
        code: updatedCode,
        language: updatedLanguage
      }) => {

        if (
          updatedCode !== undefined
        ) {

          setCode(updatedCode);

        }


        if (updatedLanguage) {

          setLanguage(
            updatedLanguage
          );

        }

      };


    socket.on(
      "code-change",
      handleCodeChange
    );


    return () => {

      socket.off(
        "connect",
        joinRoom
      );

      socket.off(
        "code-change",
        handleCodeChange
      );

    };

  }, [
    socket,
    userName
  ]);


  function handleEditorChange(
    value
  ) {

    const newCode =
      value || "";


    setCode(newCode);


    socket?.emit(
      "code-change",
      {
        roomId,
        code: newCode,
        language
      }
    );

  }


  function handleLanguageChange(
    event
  ) {

    const newLanguage =
      event.target.value;


    setLanguage(
      newLanguage
    );


    socket?.emit(
      "code-change",
      {
        roomId,
        code,
        language: newLanguage
      }
    );

  }


  return (

    <div className="editor-wrapper">

      <div className="editor-header">

        <div>

          <h2>
            Collaborative Editor
          </h2>

          <p>
            Real-time code synchronization
          </p>

        </div>


        <div className="editor-controls">

          <div className="connection-status">

            <span
              className={
                socket?.connected
                  ? "status-dot connected"
                  : "status-dot"
              }
            />

            {socket?.connected
              ? "Connected"
              : "Connecting"}

          </div>


          <select
            value={language}
            onChange={
              handleLanguageChange
            }
          >

            <option value="javascript">
              JavaScript
            </option>

            <option value="python">
              Python
            </option>

            <option value="java">
              Java
            </option>

            <option value="cpp">
              C++
            </option>

            <option value="html">
              HTML
            </option>

            <option value="css">
              CSS
            </option>

          </select>

        </div>

      </div>


      <div className="editor-container">

        <Editor

          height="100%"

          language={language}

          value={code}

          onChange={
            handleEditorChange
          }

          theme="vs-dark"

          options={{

            fontSize: 15,

            minimap: {
              enabled: false
            },

            automaticLayout: true,

            padding: {
              top: 16
            }

          }}

        />

      </div>

    </div>

  );

}


export default CodeEditor;