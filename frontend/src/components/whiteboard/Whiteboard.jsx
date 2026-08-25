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

  const remoteShapesRef = useRef([]);

  const animationFrameRef = useRef(null);


  const [shapes, setShapes] =
    useState([]);


  const [tool, setTool] =
    useState("pen");


  const [color, setColor] =
    useState("#2563eb");


  const [stageSize, setStageSize] =
    useState({
      width: 800,
      height: 600
    });


  const [connectedUsers, setConnectedUsers] =
    useState([]);


  const [connected, setConnected] =
    useState(false);


  /*
    Get canvas size
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
        width: container.clientWidth,
        height: container.clientHeight
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
    Connect to Socket Server
  */

  useEffect(() => {


    connectToServer(
      roomId,
      userName
    );


    const handleConnect = () => {

      setConnected(true);

    };


    const handleDisconnect = () => {

      setConnected(false);

    };


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
              Array.isArray(previousUsers)
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


    const handleUserLeft =
      ({ id }) => {


        if (!id) {
          return;
        }


        setConnectedUsers(
          (previousUsers) => {


            const safeUsers =
              Array.isArray(previousUsers)
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


    const handleWhiteboardDraw =
      ({ shape }) => {


        if (!shape) {
          return;
        }


        setShapes(
          (previousShapes) => [

            ...previousShapes,
            shape

          ]
        );


      };


    const handleWhiteboardClear =
      () => {


        setShapes([]);


      };


    socket.on(
      "connect",
      handleConnect
    );


    socket.on(
      "disconnect",
      handleDisconnect
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
      "whiteboard-clear",
      handleWhiteboardClear
    );


    if (socket.connected) {

      setConnected(true);

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
        "whiteboard-clear",
        handleWhiteboardClear
      );


    };


  }, [
    roomId,
    userName
  ]);



  /*
    Start Drawing
  */

  const handleMouseDown =
    useCallback((event) => {


      const stage =
        event.target.getStage();


      const pointer =
        stage.getPointerPosition();


      if (!pointer) {
        return;
      }


      drawingRef.current = true;


      let newShape;


      if (tool === "pen") {


        newShape = {

          id:
            `${socket.id}-${Date.now()}`,

          type: "pen",

          points: [
            pointer.x,
            pointer.y
          ],

          color,

          strokeWidth: 3

        };


      }


      else if (
        tool === "rectangle"
      ) {


        newShape = {

          id:
            `${socket.id}-${Date.now()}`,

          type: "rectangle",

          x:
            pointer.x,

          y:
            pointer.y,

          width: 0,

          height: 0,

          color

        };


      }


      else if (
        tool === "text"
      ) {


        const text =
          window.prompt(
            "Enter your text"
          );


        if (!text) {

          drawingRef.current =
            false;

          return;

        }


        newShape = {

          id:
            `${socket.id}-${Date.now()}`,

          type: "text",

          x:
            pointer.x,

          y:
            pointer.y,

          text,

          color

        };


        drawingRef.current =
          false;


        setShapes(
          (previousShapes) => [

            ...previousShapes,

            newShape

          ]
        );


        socket.emit(
          "whiteboard-draw",
          {

            roomId,

            shape:
              newShape

          }
        );


        return;

      }


      currentShapeRef.current =
        newShape;


      setShapes(
        (previousShapes) => [

          ...previousShapes,

          newShape

        ]
      );


    }, [
      tool,
      color,
      roomId
    ]);



  /*
    Drawing Movement

    Optimized with requestAnimationFrame
    to reduce lag.
  */

  const handleMouseMove =
    useCallback((event) => {


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


                if (
                  shape.type === "pen"
                ) {


                  shape.points = [

                    ...shape.points,

                    pointer.x,

                    pointer.y

                  ];


                }


                else if (
                  shape.type ===
                  "rectangle"
                ) {


                  shape.width =
                    pointer.x -
                    shape.x;


                  shape.height =
                    pointer.y -
                    shape.y;


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


    }, []);



  /*
    Finish Drawing
  */

  const handleMouseUp =
    useCallback(() => {


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
        Send only when drawing
        is completed.

        This prevents hundreds of
        socket events while using pen.
      */

      socket.emit(
        "whiteboard-draw",
        {

          roomId,

          shape:
            completedShape

        }
      );


    }, [
      roomId
    ]);



  /*
    Clear Canvas
  */

  const clearCanvas =
    useCallback(() => {


      setShapes([]);


      socket.emit(
        "whiteboard-clear",
        {

          roomId

        }
      );


    }, [
      roomId
    ]);



  /*
    Render Shapes
  */

  const renderShape =
    (shape) => {


      if (!shape) {
        return null;
      }


      if (
        shape.type === "pen"
      ) {


        return (

          <Line

            key={shape.id}

            points={
              shape.points || []
            }

            stroke={
              shape.color ||
              "#2563eb"
            }

            strokeWidth={
              shape.strokeWidth || 3
            }

            lineCap="round"

            lineJoin="round"

            tension={0.3}

          />

        );


      }


      if (
        shape.type ===
        "rectangle"
      ) {


        return (

          <Rect

            key={shape.id}

            x={shape.x}

            y={shape.y}

            width={shape.width}

            height={shape.height}

            stroke={
              shape.color ||
              "#2563eb"
            }

            strokeWidth={3}

            cornerRadius={4}

          />

        );


      }


      if (
        shape.type === "text"
      ) {


        return (

          <Text

            key={shape.id}

            x={shape.x}

            y={shape.y}

            text={shape.text}

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
    Count Users Safely

    Current user + valid remote users
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

        tool={tool}

        setTool={setTool}

        color={color}

        setColor={setColor}

        clearCanvas={
          clearCanvas
        }

        connectedUsers={
          totalUsers
        }

        connected={
          connected
        }

      />



      <div
        className="canvas-container"
      >


        <Stage

          ref={stageRef}

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