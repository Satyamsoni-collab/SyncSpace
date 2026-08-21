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

import { useSocket } from "../../context/SocketContext";
import { sharedState } from "../../yjs/yjsClient";

import "./whiteboard.css";


function Whiteboard() {

  const socket = useSocket();

  const stageRef = useRef(null);


  const [roomId] = useState("syncspace-demo");


  const [userName] = useState(() => {

    const savedName =
      localStorage.getItem("syncspace-user-name");

    if (savedName) {
      return savedName;
    }

    const newName =
      `User-${Math.floor(Math.random() * 1000)}`;

    localStorage.setItem(
      "syncspace-user-name",
      newName
    );

    return newName;

  });


  const [tool, setTool] = useState("pen");

  const [color, setColor] = useState("#000000");

  const [shapes, setShapes] = useState([]);

  const [isDrawing, setIsDrawing] = useState(false);

  const [startPoint, setStartPoint] = useState(null);

  const [users, setUsers] = useState([]);


  /*
  ========================================
  YJS
  ========================================
  */

  useEffect(() => {

    const loadShapesFromYjs = () => {

      const savedShapes =
        sharedState.get("shapes");

      if (savedShapes) {
        setShapes(savedShapes);
      }

    };

    loadShapesFromYjs();

    const handleYjsChange = () => {
      loadShapesFromYjs();
    };

    sharedState.observe(handleYjsChange);

    return () => {
      sharedState.unobserve(handleYjsChange);
    };

  }, []);


  /*
  ========================================
  SOCKET CONNECTION
  ========================================
  */

  useEffect(() => {

    if (!socket) {
      return;
    }

    const handleConnect = () => {

      console.log(
        "Connected to server:",
        socket.id
      );

      socket.emit(
        "join-room",
        {
          roomId,
          userName
        }
      );

    };


    if (socket.connected) {
      handleConnect();
    } else {
      socket.on(
        "connect",
        handleConnect
      );
    }


    return () => {

      socket.off(
        "connect",
        handleConnect
      );

    };

  }, [
    socket,
    roomId,
    userName
  ]);


  /*
  ========================================
  ROOM USERS
  ========================================
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleRoomUsers =
      (roomUsers) => {

        console.log(
          "Room users:",
          roomUsers
        );

        setUsers(
          Array.isArray(roomUsers)
            ? roomUsers
            : []
        );

      };


    const handleUserJoined =
      ({ user }) => {

        if (!user) {
          return;
        }


        setUsers(
          (previousUsers) => {

            const newUserId =
              user.socketId ||
              user.id;


            const exists =
              previousUsers.some(
                (item) => {

                  if (!item) {
                    return false;
                  }

                  const itemId =
                    item.socketId ||
                    item.id;

                  return itemId === newUserId;

                }
              );


            if (exists) {
              return previousUsers;
            }


            return [
              ...previousUsers,
              {
                ...user,

                x:
                  typeof user.x === "number"
                    ? user.x
                    : undefined,

                y:
                  typeof user.y === "number"
                    ? user.y
                    : undefined
              }
            ];

          }
        );

      };


    const handleUserDisconnected =
      ({ user }) => {

        if (!user) {
          return;
        }


        const disconnectedId =
          user.socketId ||
          user.id;


        setUsers(
          (previousUsers) => {

            return previousUsers.filter(
              (item) => {

                if (!item) {
                  return false;
                }


                const itemId =
                  item.socketId ||
                  item.id;


                return itemId !== disconnectedId;

              }
            );

          }
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
      "user-disconnected",
      handleUserDisconnected
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
        "user-disconnected",
        handleUserDisconnected
      );

    };

  }, [socket]);


  /*
  ========================================
  REMOTE DRAWING
  ========================================
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

            const alreadyExists =
              previousShapes.some(
                (item) =>
                  item &&
                  item.id === shape.id
              );


            if (alreadyExists) {
              return previousShapes;
            }


            const updatedShapes = [
              ...previousShapes,
              shape
            ];


            sharedState.set(
              "shapes",
              updatedShapes
            );


            return updatedShapes;

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
  ========================================
  REMOTE CLEAR
  ========================================
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleRemoteClear = () => {

      setShapes([]);

      sharedState.set(
        "shapes",
        []
      );

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
  ========================================
  REMOTE CURSOR
  ========================================
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleCursorMove =
      (cursorData) => {

        if (!cursorData) {
          return;
        }


        const cursorId =
          cursorData.id;


        if (!cursorId) {
          return;
        }


        /*
        Don't update our own cursor
        */

        if (
          socket.id === cursorId
        ) {
          return;
        }


        setUsers(
          (previousUsers) => {

            return previousUsers.map(
              (user) => {

                if (!user) {
                  return user;
                }


                const userId =
                  user.socketId ||
                  user.id;


                if (
                  userId === cursorId
                ) {

                  return {
                    ...user,

                    socketId:
                      cursorId,

                    id:
                      cursorId,

                    x:
                      cursorData.x,

                    y:
                      cursorData.y,

                    userName:
                      cursorData.name ||
                      user.userName ||
                      user.name ||
                      "User"

                  };

                }


                return user;

              }
            );

          }
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
  ========================================
  POINTER POSITION
  ========================================
  */

  function getPointerPosition() {

    if (!stageRef.current) {
      return null;
    }


    return stageRef.current
      .getPointerPosition();

  }


  /*
  ========================================
  MOUSE DOWN
  ========================================
  */

  function handleMouseDown() {

    const position =
      getPointerPosition();


    if (!position) {
      return;
    }


    /*
    PEN
    */

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


    /*
    RECTANGLE / TEXT
    */

    setStartPoint(position);

  }


  /*
  ========================================
  MOUSE MOVE
  ========================================
  */

  function handleMouseMove() {

    const position =
      getPointerPosition();


    if (!position) {
      return;
    }


    /*
    ========================================
    SEND OUR CURSOR
    ========================================
    */

    if (socket) {

      socket.emit(
        "cursor-move",
        {
          roomId,

          id:
            socket.id,

          name:
            userName,

          x:
            position.x,

          y:
            position.y
        }
      );

    }


    /*
    ========================================
    PEN DRAWING
    ========================================
    */

    if (!isDrawing) {
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
  ========================================
  MOUSE UP
  ========================================
  */

  function handleMouseUp() {

    /*
    PEN
    */

    if (tool === "pen") {

      setIsDrawing(false);


      setShapes(
        (currentShapes) => {

          if (
            currentShapes.length === 0
          ) {

            return currentShapes;

          }


          const lastShape =
            currentShapes[
              currentShapes.length - 1
            ];


          if (socket) {

            socket.emit(
              "whiteboard-draw",
              {
                roomId,

                shape:
                  lastShape
              }
            );

          }


          sharedState.set(
            "shapes",
            [...currentShapes]
          );


          return currentShapes;

        }
      );


      return;

    }


    /*
    END POSITION
    */

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
    ========================================
    RECTANGLE
    ========================================
    */

    if (
      tool === "rectangle"
    ) {

      const rectangle = {

        id:
          `${socket?.id}-${Date.now()}-${Math.random()}`,

        type:
          "rectangle",

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

        stroke:
          color,

        strokeWidth:
          2

      };


      setShapes(
        (previousShapes) => {

          const updatedShapes = [
            ...previousShapes,
            rectangle
          ];


          sharedState.set(
            "shapes",
            updatedShapes
          );


          return updatedShapes;

        }
      );


      if (socket) {

        socket.emit(
          "whiteboard-draw",
          {
            roomId,

            shape:
              rectangle
          }
        );

      }

    }


    /*
    ========================================
    TEXT
    ========================================
    */

    if (
      tool === "text"
    ) {

      const textValue =
        window.prompt(
          "Enter text"
        );


      if (
        textValue &&
        textValue.trim()
      ) {

        const textShape = {

          id:
            `${socket?.id}-${Date.now()}-${Math.random()}`,

          type:
            "text",

          x:
            startPoint.x,

          y:
            startPoint.y,

          text:
            textValue.trim(),

          fill:
            color,

          fontSize:
            20

        };


        setShapes(
          (previousShapes) => {

            const updatedShapes = [
              ...previousShapes,
              textShape
            ];


            sharedState.set(
              "shapes",
              updatedShapes
            );


            return updatedShapes;

          }
        );


        if (socket) {

          socket.emit(
            "whiteboard-draw",
            {
              roomId,

              shape:
                textShape
            }
          );

        }

      }

    }


    setStartPoint(null);

  }


  /*
  ========================================
  CLEAR CANVAS
  ========================================
  */

  function clearCanvas() {

    setShapes([]);

    sharedState.set(
      "shapes",
      []
    );


    if (socket) {

      socket.emit(
        "whiteboard-clear",
        {
          roomId
        }
      );

    }

  }


  /*
  ========================================
  CONNECTED USERS
  ========================================
  */

  const connectedUsers =
    users.length;


  /*
  ========================================
  RENDER
  ========================================
  */

  return (

    <div className="whiteboard-container">

      <Toolbar

        tool={tool}

        setTool={setTool}

        color={color}

        setColor={setColor}

        clearCanvas={clearCanvas}

        connectedUsers={
          connectedUsers
        }

      />


      <div className="canvas-container">

        <Stage

          ref={stageRef}

          width={
            window.innerWidth
          }

          height={
            window.innerHeight - 60
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

            {/* DRAWING */}

            {shapes.map(
              (shape, index) => {

                if (
                  shape.type === "line"
                ) {

                  return (

                    <Line

                      key={
                        `shape-line-${shape.id}-${index}`
                      }

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
                  shape.type === "rectangle"
                ) {

                  return (

                    <Rect

                      key={
                        `shape-rect-${shape.id}-${index}`
                      }

                      x={
                        shape.x
                      }

                      y={
                        shape.y
                      }

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

                    />

                  );

                }


                if (
                  shape.type === "text"
                ) {

                  return (

                    <Text

                      key={
                        `shape-text-${shape.id}-${index}`
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


            {/* ========================================
                REMOTE CURSORS
            ======================================== */}

            {users.map(
              (user, index) => {

                if (!user) {
                  return null;
                }


                const userId =
                  user.socketId ||
                  user.id;


                /*
                Don't show our own cursor
                */

                if (
                  userId === socket?.id
                ) {

                  return null;

                }


                const x =
                  typeof user.x === "number"
                    ? user.x
                    : null;


                const y =
                  typeof user.y === "number"
                    ? user.y
                    : null;


                if (
                  x === null ||
                  y === null
                ) {

                  return null;

                }


                const userKey =
                  userId ||
                  `remote-user-${index}`;


                return (

                  <React.Fragment
                    key={
                      `cursor-${userKey}`
                    }
                  >

                    {/* BLUE DOT */}

                    <Circle

                      x={x}

                      y={y}

                      radius={7}

                      fill="blue"

                    />


                    {/* USER NAME */}

                    <Text

                      x={
                        x + 12
                      }

                      y={
                        y - 10
                      }

                      text={
                        user.userName ||
                        user.name ||
                        "User"
                      }

                      fontSize={14}

                      fill="blue"

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