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

import "./whiteboard.css";


function Whiteboard() {

  const socket = useSocket();

  const stageRef = useRef(null);


  const [roomId] = useState(
    "syncspace-demo"
  );


  const [userName] = useState(() => {

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
    useState("#000000");


  const [shapes, setShapes] =
    useState([]);


  const [isDrawing, setIsDrawing] =
    useState(false);


  const [startPoint, setStartPoint] =
    useState(null);


  const [users, setUsers] =
    useState([]);


  /*
    Join room after Socket.io
    connection is available.
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
    Receive current room users.
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


        setUsers(roomUsers);

      };


    const handleUserJoined = ({ user }) => {

  if (!user) {
    return;
  }

  setUsers((previousUsers) => {

    const newUserId =
      user.socketId || user.id;

    const exists =
      previousUsers.some((item) => {

        if (!item) {
          return false;
        }

        return (
          (item.socketId || item.id) ===
          newUserId
        );

      });

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

  });

};


    const handleUserDisconnected =
      ({ user }) => {

        console.log(
          "User disconnected:",
          user
        );


        setUsers(
          (previousUsers) =>
            previousUsers.filter(
              (item) =>
                item.socketId !==
                user.socketId
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
    Receive remote drawing.
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleRemoteDrawing =
      ({ shape }) => {

        console.log(
          "Remote drawing:",
          shape
        );


        setShapes(
          (previousShapes) => [
            ...previousShapes,
            shape
          ]
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
    Receive remote clear.
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleRemoteClear =
      () => {

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
    Receive remote cursor.
  */

  useEffect(() => {

    if (!socket) {
      return;
    }


    const handleCursorMove = (cursorData) => {

  setUsers((previousUsers) =>
    previousUsers.map((user) => {

      const userId =
        user.socketId || user.id;

      if (userId === cursorData.id) {

        return {
          ...user,
          id: cursorData.id,
          x: cursorData.x,
          y: cursorData.y,
          name:
            cursorData.name ||
            user.userName ||
            user.name ||
            "User"
        };

      }

      return user;

    })
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
    Get mouse position.
  */

  function getPointerPosition() {

    if (!stageRef.current) {
      return null;
    }


    return stageRef.current
      .getPointerPosition();

  }


  /*
    Mouse Down.
  */

  function handleMouseDown() {

    const position =
      getPointerPosition();


    if (!position) {
      return;
    }


    /*
      Freehand pen.
    */

    if (tool === "pen") {

      setIsDrawing(true);


      const newLine = {

        id:
          `${socket?.id}-${Date.now()}`,

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
      Rectangle and text
      remember starting point.
    */

    setStartPoint(position);

  }


  /*
    Mouse Move.
  */

  function handleMouseMove() {

    const position =
      getPointerPosition();


    if (!position) {
      return;
    }


    /*
      Send cursor location.
    */

    if (socket) {

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
      Continue freehand drawing.
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


        const lastShape =
          updatedShapes[
            updatedShapes.length - 1
          ];


        if (
          lastShape.type !== "line"
        ) {

          return previousShapes;

        }


        lastShape.points = [
          ...lastShape.points,
          position.x,
          position.y
        ];


        return updatedShapes;

      }
    );

  }


  /*
    Mouse Up.
  */

  function handleMouseUp() {

    /*
      Pen.
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
      Rectangle.
    */

    if (
      tool === "rectangle"
    ) {

      const rectangle = {

        id:
          `${socket?.id}-${Date.now()}`,

        type: "rectangle",

        x: Math.min(
          startPoint.x,
          position.x
        ),

        y: Math.min(
          startPoint.y,
          position.y
        ),

        width: Math.abs(
          position.x -
          startPoint.x
        ),

        height: Math.abs(
          position.y -
          startPoint.y
        ),

        stroke: color,

        strokeWidth: 2

      };


      setShapes(
        (previousShapes) => [
          ...previousShapes,
          rectangle
        ]
      );


      if (socket) {

        socket.emit(
          "whiteboard-draw",
          {
            roomId,
            shape: rectangle
          }
        );

      }

    }


    /*
      Text.
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
            `${socket?.id}-${Date.now()}`,

          type: "text",

          x: startPoint.x,

          y: startPoint.y,

          text:
            textValue.trim(),

          fill: color,

          fontSize: 20

        };


        setShapes(
          (previousShapes) => [
            ...previousShapes,
            textShape
          ]
        );


        if (socket) {

          socket.emit(
            "whiteboard-draw",
            {
              roomId,
              shape: textShape
            }
          );

        }

      }

    }


    setStartPoint(null);

  }


  /*
    Clear canvas.
  */

  function clearCanvas() {

    setShapes([]);


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
    Number of users.
  */

  const connectedUsers =
    users.length;


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
  {shapes.map((shape) => {
    if (shape.type === "line") {
      return (
        <Line
          key={shape.id}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          lineCap="round"
          lineJoin="round"
        />
      );
    }

    if (shape.type === "rectangle") {
      return (
        <Rect
          key={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );
    }

    if (shape.type === "text") {
      return (
        <Text
          key={shape.id}
          x={shape.x}
          y={shape.y}
          text={shape.text}
          fill={shape.fill}
          fontSize={shape.fontSize}
        />
      );
    }

    return null;
  })}

  {users
  .filter((user) => user)
  .map((user) => {

    const x =
      typeof user.x === "number"
        ? user.x
        : null;

    const y =
      typeof user.y === "number"
        ? user.y
        : null;

    if (x === null || y === null) {
      return null;
    }

    return (
      <React.Fragment
        key={
          user.socketId ||
          user.id ||
          Math.random()
        }
      >
        <Circle
          x={x}
          y={y}
          radius={5}
          fill="blue"
        />

        <Text
          x={x + 8}
          y={y - 8}
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
  })}
</Layer>  

        </Stage>

      </div>

    </div>

  );

}


export default Whiteboard;