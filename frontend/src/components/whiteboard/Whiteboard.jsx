import React, {
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";

import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Text
} from "react-konva";

import Toolbar from "./Toolbar";

import {
  socket,
  connectToServer
} from "../../services/socket";

import "./whiteboard.css";


function Whiteboard({
  roomId = "syncspace-demo",
  userName = `User-${Math.floor(Math.random() * 1000)}`
}) {

  const stageRef = useRef(null);

  const drawingRef = useRef(false);

  const currentShapeRef = useRef(null);

  const animationFrameRef = useRef(null);


  /*
    SHAPES
  */

  const [shapes, setShapes] =
    useState([]);


  /*
    UNDO HISTORY

    Stores previous versions of the
    whiteboard.
  */

  const [history, setHistory] =
    useState([]);


  /*
    TOOL
  */

  const [tool, setTool] =
    useState("pen");


  /*
    COLOR
  */

  const [color, setColor] =
    useState("#2563eb");


  /*
    CANVAS SIZE
  */

  const [stageSize, setStageSize] =
    useState({
      width: 800,
      height: 600
    });


  /*
    CONNECTED USERS
  */

  const [connectedUsers, setConnectedUsers] =
    useState([]);


  /*
    CONNECTION STATUS
  */

  const [connected, setConnected] =
    useState(false);



  /*
    SAVE HISTORY

    Before changing the board, save
    the current state.
  */

  const saveHistory =
    useCallback(() => {

      setShapes(
        (currentShapes) => {

          setHistory(
            (previousHistory) => [

              ...previousHistory,

              currentShapes

            ].slice(-30)
          );

          return currentShapes;

        }
      );

    }, []);



  /*
    GET CANVAS SIZE
  */

  useEffect(() => {

    const updateSize = () => {

      const container =
        document.querySelector(
          ".canvas-container"
        );


      if (!container) {
        return;
      }


      setStageSize({

        width:
          container.clientWidth,

        height:
          container.clientHeight

      });

    };


    updateSize();


    window.addEventListener(
      "resize",
      updateSize
    );


    return () => {

      window.removeEventListener(
        "resize",
        updateSize
      );

    };

  }, []);



  /*
    SOCKET CONNECTION
    AND WORKSPACE RESTORATION
  */

  useEffect(() => {

    /*
      RESTORE SAVED WORKSPACE
    */

    const handleWorkspaceState =
      (workspace) => {

        if (!workspace) {
          return;
        }


        const savedShapes =
          workspace.whiteboardData;


        if (
          Array.isArray(savedShapes)
        ) {

          setShapes(
            savedShapes
          );


          setHistory([]);

        }

      };



    /*
      SOCKET CONNECT
    */

    const handleConnect = () => {

      setConnected(true);


      connectToServer(
        roomId,
        userName
      );

    };



    /*
      SOCKET DISCONNECT
    */

    const handleDisconnect = () => {

      setConnected(false);

    };



    /*
      ROOM USERS
    */

    const handleRoomUsers =
      (users) => {

        const validUsers =
          Array.isArray(users)
            ? users.filter(
                (user) =>
                  user &&
                  user.id
              )
            : [];


        setConnectedUsers(
          validUsers
        );

      };



    /*
      NEW USER
    */

    const handleUserJoined =
      (user) => {

        if (
          !user ||
          !user.id
        ) {

          return;

        }


        setConnectedUsers(
          (previousUsers) => {

            const safeUsers =
              Array.isArray(
                previousUsers
              )
                ? previousUsers.filter(
                    (existingUser) =>
                      existingUser &&
                      existingUser.id
                  )
                : [];


            const alreadyExists =
              safeUsers.some(
                (existingUser) =>
                  existingUser.id ===
                  user.id
              );


            if (alreadyExists) {

              return safeUsers;

            }


            return [
              ...safeUsers,
              user
            ];

          }
        );

      };



    /*
      USER LEFT
    */

    const handleUserLeft =
      ({ id }) => {

        if (!id) {
          return;
        }


        setConnectedUsers(
          (previousUsers) => {

            const safeUsers =
              Array.isArray(
                previousUsers
              )
                ? previousUsers
                : [];


            return safeUsers.filter(
              (user) =>
                user &&
                user.id &&
                user.id !== id
            );

          }
        );

      };



    /*
      RECEIVE NEW SHAPE
    */

    const handleWhiteboardDraw =
      ({ shape }) => {

        if (!shape) {
          return;
        }


        setShapes(
          (previousShapes) => {

            /*
              Prevent duplicate shape IDs.
            */

            const exists =
              previousShapes.some(
                (existingShape) =>
                  existingShape.id ===
                  shape.id
              );


            if (exists) {

              return previousShapes;

            }


            return [
              ...previousShapes,
              shape
            ];

          }
        );

      };



    /*
      RECEIVE COMPLETE WHITEBOARD STATE

      Used by Undo.
    */

    const handleWhiteboardState =
      ({ shapes: updatedShapes }) => {

        if (
          !Array.isArray(updatedShapes)
        ) {

          return;

        }


        setShapes(
          updatedShapes
        );

      };



    /*
      CLEAR WHITEBOARD
    */

    const handleWhiteboardClear =
      () => {

        setHistory(
          (previousHistory) => [

            ...previousHistory,
            shapes

          ].slice(-30)
        );


        setShapes([]);

      };



    /*
      SOCKET EVENTS
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
      "workspace-state",
      handleWorkspaceState
    );


    socket.on(
      "room-users",
      handleRoomUsers
    );


    socket.on(
      "user-joined",
      handleUserJoined
    );


    socket.on(
      "user-left",
      handleUserLeft
    );


    socket.on(
      "whiteboard-draw",
      handleWhiteboardDraw
    );


    socket.on(
      "whiteboard-state",
      handleWhiteboardState
    );


    socket.on(
      "whiteboard-clear",
      handleWhiteboardClear
    );



    /*
      JOIN ROOM
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



    /*
      CLEANUP
    */

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
        "workspace-state",
        handleWorkspaceState
      );


      socket.off(
        "room-users",
        handleRoomUsers
      );


      socket.off(
        "user-joined",
        handleUserJoined
      );


      socket.off(
        "user-left",
        handleUserLeft
      );


      socket.off(
        "whiteboard-draw",
        handleWhiteboardDraw
      );


      socket.off(
        "whiteboard-state",
        handleWhiteboardState
      );


      socket.off(
        "whiteboard-clear",
        handleWhiteboardClear
      );

    };

  }, [
    roomId,
    userName
  ]);



  /*
    START DRAWING
  */

  const handleMouseDown =
    useCallback(
      (event) => {

        const stage =
          event.target.getStage();


        const pointer =
          stage.getPointerPosition();


        if (!pointer) {
          return;
        }



        /*
          TEXT TOOL
        */

        if (
          tool === "text"
        ) {

          const text =
            window.prompt(
              "Enter your text"
            );


          if (!text) {
            return;
          }


          const newShape = {

            id:
              `${socket.id}-${Date.now()}`,

            type:
              "text",

            x:
              pointer.x,

            y:
              pointer.y,

            text,

            color

          };


          saveHistory();


          setShapes(
            (previousShapes) => [

              ...previousShapes,

              newShape

            ]
          );


          if (socket.connected) {

            socket.emit(
              "whiteboard-draw",
              {

                roomId,

                shape:
                  newShape

              }
            );

          }


          return;

        }



        /*
          PEN
        */

        if (
          tool === "pen"
        ) {

          const newShape = {

            id:
              `${socket.id}-${Date.now()}`,

            type:
              "pen",

            points: [

              pointer.x,

              pointer.y

            ],

            color,

            strokeWidth:
              3

          };


          saveHistory();


          drawingRef.current =
            true;


          currentShapeRef.current =
            newShape;


          setShapes(
            (previousShapes) => [

              ...previousShapes,

              newShape

            ]
          );


          return;

        }



        /*
          RECTANGLE
        */

        if (
          tool === "rectangle"
        ) {

          const newShape = {

            id:
              `${socket.id}-${Date.now()}`,

            type:
              "rectangle",

            x:
              pointer.x,

            y:
              pointer.y,

            width:
              0,

            height:
              0,

            color

          };


          saveHistory();


          drawingRef.current =
            true;


          currentShapeRef.current =
            newShape;


          setShapes(
            (previousShapes) => [

              ...previousShapes,

              newShape

            ]
          );


          return;

        }



        /*
          CIRCLE

          Circle starts at the pointer
          position and radius is calculated
          from the distance to the pointer.
        */

        if (
          tool === "circle"
        ) {

          const newShape = {

            id:
              `${socket.id}-${Date.now()}`,

            type:
              "circle",

            x:
              pointer.x,

            y:
              pointer.y,

            radius:
              0,

            color

          };


          saveHistory();


          drawingRef.current =
            true;


          currentShapeRef.current =
            newShape;


          setShapes(
            (previousShapes) => [

              ...previousShapes,

              newShape

            ]
          );


          return;

        }

      },
      [
        tool,
        color,
        roomId,
        saveHistory
      ]
    );



  /*
    DRAWING MOVEMENT
  */

  const handleMouseMove =
    useCallback(
      (event) => {

        if (
          !drawingRef.current ||
          !currentShapeRef.current
        ) {

          return;

        }


        if (
          animationFrameRef.current
        ) {

          return;

        }


        animationFrameRef.current =
          requestAnimationFrame(
            () => {

              const stage =
                event.target.getStage();


              const pointer =
                stage.getPointerPosition();


              if (!pointer) {

                animationFrameRef.current =
                  null;

                return;

              }


              setShapes(
                (previousShapes) => {

                  const safeShapes =
                    Array.isArray(
                      previousShapes
                    )
                      ? previousShapes
                      : [];


                  const updatedShapes =
                    [...safeShapes];


                  const currentShape =
                    currentShapeRef.current;


                  if (!currentShape) {

                    return updatedShapes;

                  }


                  const index =
                    updatedShapes.findIndex(
                      (shape) =>
                        shape &&
                        shape.id ===
                        currentShape.id
                    );


                  if (index === -1) {

                    return updatedShapes;

                  }


                  const shape =
                    {
                      ...updatedShapes[index]
                    };



                  /*
                    PEN
                  */

                  if (
                    shape.type === "pen"
                  ) {

                    shape.points = [

                      ...shape.points,

                      pointer.x,

                      pointer.y

                    ];

                  }



                  /*
                    RECTANGLE

                    Normalize negative dimensions.
                  */

                  else if (
                    shape.type ===
                    "rectangle"
                  ) {

                    shape.x =
                      Math.min(
                        currentShape.x,
                        pointer.x
                      );


                    shape.y =
                      Math.min(
                        currentShape.y,
                        pointer.y
                      );


                    shape.width =
                      Math.abs(
                        pointer.x -
                        currentShape.x
                      );


                    shape.height =
                      Math.abs(
                        pointer.y -
                        currentShape.y
                      );

                  }



                  /*
                    CIRCLE

                    Calculate radius using
                    distance formula.
                  */

                  else if (
                    shape.type ===
                    "circle"
                  ) {

                    const dx =
                      pointer.x -
                      currentShape.x;


                    const dy =
                      pointer.y -
                      currentShape.y;


                    shape.radius =
                      Math.sqrt(
                        dx * dx +
                        dy * dy
                      );

                  }


                  updatedShapes[index] =
                    shape;


                  currentShapeRef.current =
                    shape;


                  return updatedShapes;

                }
              );


              animationFrameRef.current =
                null;

            }
          );

      },
      []
    );



  /*
    FINISH DRAWING
  */

  const handleMouseUp =
    useCallback(
      () => {

        if (
          !drawingRef.current ||
          !currentShapeRef.current
        ) {

          return;

        }


        drawingRef.current =
          false;


        const completedShape =
          currentShapeRef.current;


        currentShapeRef.current =
          null;


        /*
          Do not save empty drawings.
        */

        if (
          completedShape.type ===
            "pen" &&
          (!completedShape.points ||
            completedShape.points.length < 4)
        ) {

          return;

        }


        if (
          completedShape.type ===
            "rectangle" &&
          (
            completedShape.width === 0 ||
            completedShape.height === 0
          )
        ) {

          return;

        }


        if (
          completedShape.type ===
            "circle" &&
          completedShape.radius <= 1
        ) {

          return;

        }


        /*
          SEND COMPLETED SHAPE
        */

        if (socket.connected) {

          socket.emit(
            "whiteboard-draw",
            {

              roomId,

              shape:
                completedShape

            }
          );

        }

      },
      [
        roomId
      ]
    );



  /*
    UNDO
  */

  const undoCanvas =
    useCallback(
      () => {

        if (
          history.length === 0
        ) {

          return;

        }


        const previousHistory =
          [...history];


        const previousShapes =
          previousHistory.pop();


        setHistory(
          previousHistory
        );


        const safeShapes =
          Array.isArray(
            previousShapes
          )
            ? previousShapes
            : [];


        setShapes(
          safeShapes
        );


        /*
          Synchronize Undo with
          other users and MongoDB.
        */

        if (socket.connected) {

          socket.emit(
            "whiteboard-state",
            {

              roomId,

              shapes:
                safeShapes

            }
          );

        }

      },
      [
        history,
        roomId
      ]
    );



  /*
    KEYBOARD UNDO

    Ctrl + Z
    Cmd + Z
  */

  useEffect(() => {

    const handleKeyDown =
      (event) => {

        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key.toLowerCase() === "z"
        ) {

          event.preventDefault();


          undoCanvas();

        }

      };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    undoCanvas
  ]);



  /*
    CLEAR CANVAS
  */

  const clearCanvas =
    useCallback(
      () => {

        if (
          shapes.length === 0
        ) {

          return;

        }


        /*
          Save current board before clear.
        */

        setHistory(
          (previousHistory) => [

            ...previousHistory,

            shapes

          ].slice(-30)
        );


        setShapes([]);


        if (socket.connected) {

          socket.emit(
            "whiteboard-clear",
            {

              roomId

            }
          );

        }

      },
      [
        roomId,
        shapes
      ]
    );



  /*
    RENDER SHAPES
  */

  const renderShape =
    (shape) => {

      if (!shape) {
        return null;
      }



      /*
        PEN
      */

      if (
        shape.type === "pen"
      ) {

        return (

          <Line

            key={
              shape.id
            }

            points={
              shape.points || []
            }

            stroke={
              shape.color ||
              "#2563eb"
            }

            strokeWidth={
              shape.strokeWidth ||
              3
            }

            lineCap="round"

            lineJoin="round"

            tension={0.3}

          />

        );

      }



      /*
        RECTANGLE
      */

      if (
        shape.type ===
        "rectangle"
      ) {

        return (

          <Rect

            key={
              shape.id
            }

            x={
              shape.x
            }

            y={
              shape.y
            }

            width={
              shape.width || 0
            }

            height={
              shape.height || 0
            }

            stroke={
              shape.color ||
              "#2563eb"
            }

            strokeWidth={3}

            cornerRadius={4}

          />

        );

      }



      /*
        CIRCLE
      */

      if (
        shape.type ===
        "circle"
      ) {

        return (

          <Circle

            key={
              shape.id
            }

            x={
              shape.x
            }

            y={
              shape.y
            }

            radius={
              shape.radius || 0
            }

            stroke={
              shape.color ||
              "#2563eb"
            }

            strokeWidth={3}

          />

        );

      }



      /*
        TEXT
      */

      if (
        shape.type ===
        "text"
      ) {

        return (

          <Text

            key={
              shape.id
            }

            x={
              shape.x
            }

            y={
              shape.y
            }

            text={
              shape.text
            }

            fontSize={20}

            fill={
              shape.color ||
              "#111827"
            }

          />

        );

      }


      return null;

    };



  /*
    CONNECTED USER COUNT
  */

  const totalUsers =
    1 +
    connectedUsers.filter(
      (user) =>
        user &&
        user.id &&
        user.id !== socket.id
    ).length;



  return (

    <div className="whiteboard-container">


      <Toolbar

        tool={
          tool
        }

        setTool={
          setTool
        }

        color={
          color
        }

        setColor={
          setColor
        }

        clearCanvas={
          clearCanvas
        }

        undoCanvas={
          undoCanvas
        }

        canUndo={
          history.length > 0
        }

        connectedUsers={
          totalUsers
        }

        connected={
          connected
        }

      />



      {/* Extra controls make Circle and Undo
          available even if Toolbar does not
          currently contain the buttons. */}

      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "8px",
          background: "#111827",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}
      >

        <button
          type="button"
          onClick={() =>
            setTool("circle")
          }
          style={{
            padding: "7px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              tool === "circle"
                ? "#2563eb"
                : "#1f2937",
            color: "white",
            cursor: "pointer"
          }}
        >
          ◯ Circle
        </button>


        <button
          type="button"
          onClick={
            undoCanvas
          }
          disabled={
            history.length === 0
          }
          style={{
            padding: "7px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              history.length > 0
                ? "#374151"
                : "#1f2937",
            color:
              history.length > 0
                ? "white"
                : "#6b7280",
            cursor:
              history.length > 0
                ? "pointer"
                : "not-allowed"
          }}
        >
          ↩ Undo
        </button>

      </div>



      <div
        className="canvas-container"
      >

        <Stage

          ref={
            stageRef
          }

          width={
            stageSize.width
          }

          height={
            stageSize.height
          }

          onMouseDown={
            handleMouseDown
          }

          onMouseMove={
            handleMouseMove
          }

          onMouseUp={
            handleMouseUp
          }

          onTouchStart={
            handleMouseDown
          }

          onTouchMove={
            handleMouseMove
          }

          onTouchEnd={
            handleMouseUp
          }

        >

          <Layer>

            {shapes.map(
              renderShape
            )}

          </Layer>

        </Stage>

      </div>

    </div>

  );

}


export default Whiteboard;