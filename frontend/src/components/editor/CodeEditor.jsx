import React, {
  useEffect,
  useState
} from "react";

import Editor from "@monaco-editor/react";

import {
  socket,
  connectToServer
} from "../../services/socket";

import "./editor.css";


function CodeEditor({
  roomId = "syncspace-demo",
  userName = "Guest"
}) {


  const [code, setCode] = useState(
`// Welcome to SyncSpace

console.log("Start collaborating!");`
  );


  const [language, setLanguage] =
    useState("javascript");


  const [connected, setConnected] =
    useState(false);


  useEffect(() => {


    const handleConnect = () => {

      setConnected(true);


      connectToServer(
        roomId,
        userName
      );


    };


    const handleDisconnect = () => {

      setConnected(false);

    };


    const handleCodeChange = ({
      code: updatedCode,
      language: updatedLanguage
    }) => {


      if (
        updatedCode !== undefined
      ) {

        setCode(
          updatedCode
        );

      }


      if (
        updatedLanguage
      ) {

        setLanguage(
          updatedLanguage
        );

      }


    };


    /*
      Listen before connecting
    */

    socket.on(
      "connect",
      handleConnect
    );


    socket.on(
      "disconnect",
      handleDisconnect
    );


    socket.on(
      "code-change",
      handleCodeChange
    );


    /*
      If socket is already connected,
      directly join the room.
    */

    if (socket.connected) {

      setConnected(true);


      connectToServer(
        roomId,
        userName
      );

    } else {

      socket.connect();

    }


    return () => {


      socket.off(
        "connect",
        handleConnect
      );


      socket.off(
        "disconnect",
        handleDisconnect
      );


      socket.off(
        "code-change",
        handleCodeChange
      );


    };


  }, [
    roomId,
    userName
  ]);



  const handleCodeChange =
    (value) => {


      const newCode =
        value || "";


      setCode(
        newCode
      );


      if (socket.connected) {

        socket.emit(
          "code-change",
          {

            roomId,

            code:
              newCode,

            language

          }
        );

      }


    };



  const handleLanguageChange =
    (event) => {


      const newLanguage =
        event.target.value;


      setLanguage(
        newLanguage
      );


      if (socket.connected) {

        socket.emit(
          "code-change",
          {

            roomId,

            code,

            language:
              newLanguage

          }
        );

      }


    };



  const exportCode = () => {


    const fileExtension =
      {

        javascript: "js",

        python: "py",

        java: "java",

        cpp: "cpp",

        html: "html",

        css: "css"

      }[language] || "txt";


    const blob =
      new Blob(
        [code],
        {
          type:
            "text/plain"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      `syncspace-code.${fileExtension}`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );


  };



  return (

    <div className="code-editor-wrapper">


      {/* Editor Toolbar */}

      <div className="editor-toolbar">


        <div className="editor-status">


          <span
            className={
              connected
                ? "connection-dot connected"
                : "connection-dot"
            }
          >
          </span>


          <div className="connection-info">


            <span className="connection-text">

              {connected
                ? "Connected"
                : "Connecting..."}

            </span>


            <span className="connection-room">

              Room: {roomId}

            </span>


          </div>


        </div>



        <div className="editor-actions">


          <select
            className="language-select"
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



          <button
            className="export-code-button"
            onClick={exportCode}
          >

            ↓ Export

          </button>


        </div>


      </div>



      {/* Monaco Editor */}

      <div className="monaco-wrapper">


        <Editor

          height="100%"

          language={language}

          value={code}

          onChange={
            handleCodeChange
          }

          theme="vs-dark"

          options={{

            minimap: {
              enabled: false
            },


            fontSize: 14,


            fontFamily:
              "Consolas, monospace",


            padding: {
              top: 18,
              bottom: 18
            },


            smoothScrolling: true,


            cursorSmoothCaretAnimation:
              "on",


            scrollBeyondLastLine:
              false,


            automaticLayout: true,


            lineNumbers:
              "on",


            roundedSelection:
              true,


            cursorBlinking:
              "smooth",


            wordWrap:
              "on"


          }}

        />


      </div>


      {/* Bottom Status */}

      <div className="editor-footer">


        <span>

          👤 {userName}

        </span>


        <span>

          ⚡ Real-time code sync

        </span>


      </div>


    </div>

  );


}


export default CodeEditor;