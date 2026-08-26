import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Stage,
  Layer,
  Line,
  Rect,
  Text,
  Circle
} from "react-konva";

import Toolbar from "./Toolbar";

import {
  useSocket
} from "../../context/SocketContext";

import "./whiteboard.css";


function Whiteboard() {

  const socket = useSocket();

  const stageRef = useRef(null);

  const containerRef = useRef(null);


  const [roomId] =
    useState("syncspace-demo");


  const [userName] =
    useState(() => {

      const savedName =
        localStorage.getItem(
          "syncspace-user-name"
        );

      if (savedName) {
        return savedName;
      }

      const newName =
        `User-${Math.floor(
          Math.random() * 1000
        )}`;

      localStorage.setItem(
        "syncspace-user-name",
        newName
      );

      return newName;

    });


  const [tool, setTool] =
    useState("pen");

  const [color, setColor] =
    useState("#2563eb");

  const [shapes, setShapes] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [startPoint, setStartPoint] =
    useState(null);

  const [stageSize, setStageSize] =
    useState({
      width: 800,
      height: 500
    });


  /*
    JOIN ROOM
  */

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


    return () => {

      socket.off(
        "connect",
        joinRoom
      );

    };

  }, [
    socket,
    roomId,
    userName
  ]);


  /*
    USER LIST
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleRoomUsers =
      (roomUsers) => {

        setUsers(
          Array.isArray(roomUsers)
            ? roomUsers
            : []
        );

      };


    const handleUserJoined =
      (user) => {

        if (!user) {
          return;
        }

        setUsers(
          (previousUsers) => {

            const exists =
              previousUsers.some(
                (item) =>
                  item.id === user.id
              );

            if (exists) {
              return previousUsers;
            }

            return [
              ...previousUsers,
              user
            ];

          }
        );

      };


    const handleUserLeft =
      ({ id }) => {

        setUsers(
          (previousUsers) =>
            previousUsers.filter(
              (user) =>
                user.id !== id
            )
        );

      };


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


    return () => {

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

    };

  }, [socket]);


  /*
    REMOTE DRAWING
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleRemoteDrawing =
      ({ shape }) => {

        if (!shape) {
          return;
        }

        setShapes(
          (previousShapes) => {

            const exists =
              previousShapes.some(
                (item) =>
                  item.id === shape.id
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


    socket.on(
      "whiteboard-draw",
      handleRemoteDrawing
    );


    return () => {

      socket.off(
        "whiteboard-draw",
        handleRemoteDrawing
      );

    };

  }, [socket]);


  /*
    REMOTE CLEAR
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleRemoteClear = () => {

      setShapes([]);

    };


    socket.on(
      "whiteboard-clear",
      handleRemoteClear
    );


    return () => {

      socket.off(
        "whiteboard-clear",
        handleRemoteClear
      );

    };

  }, [socket]);


  /*
    REMOTE CURSOR
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleCursorMove =
      ({
        id,
        name,
        x,
        y
      }) => {

        setUsers(
          (previousUsers) =>
            previousUsers.map(
              (user) => {

                if (
                  user.id === id
                ) {

                  return {
                    ...user,
                    name,
                    x,
                    y
                  };

                }

                return user;

              }
            )
        );

      };


    socket.on(
      "cursor-move",
      handleCursorMove
    );


    return () => {

      socket.off(
        "cursor-move",
        handleCursorMove
      );

    };

  }, [socket]);


  /*
    RESPONSIVE CANVAS
  */

  useEffect(() => {

    const updateSize = () => {

      if (!containerRef.current) {
        return;
      }

      setStageSize({

        width:
          containerRef.current
            .clientWidth,

        height:
          containerRef.current
            .clientHeight

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


  function getPointerPosition() {

    if (!stageRef.current) {
      return null;
    }

    return stageRef.current
      .getPointerPosition();

  }


  /*
    MOUSE DOWN
  */

  function handleMouseDown() {

    const position =
      getPointerPosition();

    if (!position) {
      return;
    }


    if (tool === "pen") {

      setIsDrawing(true);

      const newLine = {

        id:
          `${socket?.id}-${Date.now()}-${Math.random()}`,

        type: "line",

        points: [
          position.x,
          position.y
        ],

        stroke: color,

        strokeWidth: 3

      };


      setShapes(
        (previousShapes) => [
          ...previousShapes,
          newLine
        ]
      );

      return;

    }


    setStartPoint(position);

  }


  /*
    MOUSE MOVE
  */

  function handleMouseMove() {

    const position =
      getPointerPosition();

    if (!position) {
      return;
    }


    /*
      SEND CURSOR
    */

    if (socket?.connected) {

      socket.emit(
        "cursor-move",
        {
          roomId,
          x: position.x,
          y: position.y
        }
      );

    }


    /*
      PEN DRAWING
    */

    if (
      !isDrawing ||
      tool !== "pen"
    ) {
      return;
    }


    setShapes(
      (previousShapes) => {

        if (
          previousShapes.length === 0
        ) {
          return previousShapes;
        }


        const updatedShapes =
          [...previousShapes];

        const lastIndex =
          updatedShapes.length - 1;

        const lastShape =
          updatedShapes[lastIndex];


        if (
          !lastShape ||
          lastShape.type !== "line"
        ) {
          return previousShapes;
        }


        updatedShapes[lastIndex] = {

          ...lastShape,

          points: [
            ...lastShape.points,
            position.x,
            position.y
          ]

        };


        return updatedShapes;

      }
    );

  }


  /*
    MOUSE UP
  */

  function handleMouseUp() {

    if (tool === "pen") {

      setIsDrawing(false);


      setShapes(
        (currentShapes) => {

          const lastShape =
            currentShapes[
              currentShapes.length - 1
            ];

          if (
            socket?.connected &&
            lastShape
          ) {

            socket.emit(
              "whiteboard-draw",
              {
                roomId,
                shape: lastShape
              }
            );

          }

          return currentShapes;

        }
      );


      return;

    }


    const position =
      getPointerPosition();

    if (
      !position ||
      !startPoint
    ) {

      setStartPoint(null);

      return;

    }


    /*
      RECTANGLE
    */

    if (
      tool === "rectangle"
    ) {

      const rectangle = {

        id:
          `${socket?.id}-${Date.now()}-${Math.random()}`,

        type: "rectangle",

        x:
          Math.min(
            startPoint.x,
            position.x
          ),

        y:
          Math.min(
            startPoint.y,
            position.y
          ),

        width:
          Math.abs(
            position.x -
            startPoint.x
          ),

        height:
          Math.abs(
            position.y -
            startPoint.y
          ),

        stroke: color,

        strokeWidth: 3

      };


      setShapes(
        (previousShapes) => [
          ...previousShapes,
          rectangle
        ]
      );


      socket?.emit(
        "whiteboard-draw",
        {
          roomId,
          shape: rectangle
        }
      );

    }


    /*
      TEXT
    */

    if (
      tool === "text"
    ) {

      const textValue =
        window.prompt(
          "Enter your text"
        );


      if (
        textValue &&
        textValue.trim()
      ) {

        const textShape = {

          id:
            `${socket?.id}-${Date.now()}-${Math.random()}`,

          type: "text",

          x: startPoint.x,

          y: startPoint.y,

          text:
            textValue.trim(),

          fill: color,

          fontSize: 22

        };


        setShapes(
          (previousShapes) => [
            ...previousShapes,
            textShape
          ]
        );


        socket?.emit(
          "whiteboard-draw",
          {
            roomId,
            shape: textShape
          }
        );

      }

    }


    setStartPoint(null);

  }


  /*
    CLEAR
  */

  function clearCanvas() {

    setShapes([]);


    socket?.emit(
      "whiteboard-clear",
      {
        roomId
      }
    );

  }


  return (

    <div className="whiteboard-container">

      <Toolbar

        tool={tool}

        setTool={setTool}

        color={color}

        setColor={setColor}

        clearCanvas={clearCanvas}

        connectedUsers={
          users.length
        }

      />


      <div
        className="canvas-container"
        ref={containerRef}
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

        >

          <Layer>

            {shapes.map(
              (shape) => {

                if (
                  shape.type === "line"
                ) {

                  return (

                    <Line

                      key={shape.id}

                      points={
                        shape.points
                      }

                      stroke={
                        shape.stroke
                      }

                      strokeWidth={
                        shape.strokeWidth
                      }

                      lineCap="round"

                      lineJoin="round"

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

                      width={
                        shape.width
                      }

                      height={
                        shape.height
                      }

                      stroke={
                        shape.stroke
                      }

                      strokeWidth={
                        shape.strokeWidth
                      }

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

                      text={
                        shape.text
                      }

                      fill={
                        shape.fill
                      }

                      fontSize={
                        shape.fontSize
                      }

                    />

                  );

                }


                return null;

              }
            )}


            {users.map(
              (user) => {

                if (
                  user.id === socket?.id ||
                  user.x === null ||
                  user.y === null
                ) {
                  return null;
                }


                return (

                  <React.Fragment
                    key={user.id}
                  >

                    <Circle

                      x={user.x}

                      y={user.y}

                      radius={6}

                      fill="#2563eb"

                    />


                    <Text

                      x={
                        user.x + 10
                      }

                      y={
                        user.y - 20
                      }

                      text={
                        user.name
                      }

                      fontSize={13}

                      fill="#1e40af"

                    />

                  </React.Fragment>

                );

              }
            )}

          </Layer>

        </Stage>

      </div>

    </div>

  );

}


export default Whiteboard;