import React from "react";

import {
  SocketProvider
} from "./context/SocketContext";

import Whiteboard from "./components/whiteboard/Whiteboard";


function App() {

  return (

    <SocketProvider>

      <div
        style={{
          width: "100vw",
          height: "100vh"
        }}
      >

        <Whiteboard />

      </div>

    </SocketProvider>

  );

}


export default App;