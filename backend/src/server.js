import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = 5000;

/*
  roomId -> Map(socketId -> user)
*/
const rooms = new Map();

app.get("/", (req, res) => {
  res.json({
    message: "SyncSpace backend is running"
  });
});

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  /*
    JOIN ROOM
  */

  socket.on("join-room", ({ roomId, userName }) => {

    if (!roomId) {
      return;
    }

    socket.join(roomId);

    socket.data.roomId = roomId;

    socket.data.userName =
      userName ||
      `User-${socket.id.substring(0, 5)}`;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const roomUsers = rooms.get(roomId);

    const user = {
      id: socket.id,
      name: socket.data.userName,
      x: null,
      y: null
    };

    roomUsers.set(socket.id, user);

    /*
      Send complete user list
      to everyone in room
    */

    io.to(roomId).emit(
      "room-users",
      Array.from(roomUsers.values())
    );

    /*
      Notify other users
    */

    socket.to(roomId).emit(
      "user-joined",
      user
    );

    console.log(
      `${socket.data.userName} joined room ${roomId}`
    );

  });


  /*
    WHITEBOARD DRAWING
  */

  socket.on(
    "whiteboard-draw",
    ({ roomId, shape }) => {

      if (!roomId || !shape) {
        return;
      }

      socket.to(roomId).emit(
        "whiteboard-draw",
        { shape }
      );

    }
  );


  /*
    CLEAR WHITEBOARD
  */

  socket.on(
    "whiteboard-clear",
    ({ roomId }) => {

      if (!roomId) {
        return;
      }

      socket.to(roomId).emit(
        "whiteboard-clear"
      );

    }
  );


  /*
    CURSOR MOVEMENT
  */

  socket.on(
    "cursor-move",
    ({ roomId, x, y }) => {

      if (!roomId) {
        return;
      }

      const roomUsers = rooms.get(roomId);

      if (
        roomUsers &&
        roomUsers.has(socket.id)
      ) {

        const user =
          roomUsers.get(socket.id);

        user.x = x;
        user.y = y;

      }

      socket.to(roomId).emit(
        "cursor-move",
        {
          id: socket.id,
          name: socket.data.userName,
          x,
          y
        }
      );

    }
  );


  /*
    REAL-TIME CODE EDITOR
  */

  socket.on(
    "code-change",
    ({ roomId, code, language }) => {

      if (!roomId) {
        return;
      }

      socket.to(roomId).emit(
        "code-change",
        {
          code,
          language
        }
      );

    }
  );


  /*
    USER DISCONNECT
  */

  socket.on("disconnect", () => {

    const roomId =
      socket.data.roomId;

    if (!roomId) {
      return;
    }

    const roomUsers =
      rooms.get(roomId);

    if (roomUsers) {

      roomUsers.delete(socket.id);

      /*
        Send updated user count
      */

      io.to(roomId).emit(
        "room-users",
        Array.from(roomUsers.values())
      );

      socket.to(roomId).emit(
        "user-left",
        {
          id: socket.id
        }
      );

      if (roomUsers.size === 0) {
        rooms.delete(roomId);
      }

    }

    console.log(
      "User disconnected:",
      socket.id
    );

  });

});


server.listen(PORT, () => {

  console.log(
    `SyncSpace backend running on http://localhost:${PORT}`
  );

});