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
  Store active users.

  Structure:

  roomId -> Map of socketId -> user information
*/
const rooms = new Map();


app.get("/", (req, res) => {
  res.json({
    message: "SyncSpace Socket.io server is running"
  });
});


io.on("connection", (socket) => {

  console.log("User connected:", socket.id);


  /*
    USER JOINS ROOM
  */

  socket.on("join-room", ({ roomId, userName }) => {

    if (!roomId) {
      return;
    }


    socket.join(roomId);

    socket.data.roomId = roomId;

    socket.data.userName =
      userName || `User-${socket.id.substring(0, 5)}`;


    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }


    const roomUsers = rooms.get(roomId);


    roomUsers.set(socket.id, {
      id: socket.id,
      name: socket.data.userName,
      x: 0,
      y: 0
    });


    /*
      Send existing users to the new user
    */

    const existingUsers =
      Array.from(roomUsers.values()).filter(
        (user) => user.id !== socket.id
      );


    socket.emit("room-users", existingUsers);


    /*
      Tell everyone else that a new user joined
    */

    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      name: socket.data.userName,
      x: 0,
      y: 0
    });


    console.log(
      `${socket.data.userName} joined room ${roomId}`
    );
  });


  /*
    WHITEBOARD DRAWING EVENT
  */

  socket.on("whiteboard-draw", ({ roomId, shape }) => {

    if (!roomId || !shape) {
      return;
    }


    /*
      Send drawing to everyone except sender
    */

    socket.to(roomId).emit("whiteboard-draw", {
      shape
    });
  });


  /*
    CLEAR WHITEBOARD
  */

  socket.on("whiteboard-clear", ({ roomId }) => {

    if (!roomId) {
      return;
    }


    socket.to(roomId).emit("whiteboard-clear");
  });


  /*
    CURSOR MOVEMENT
  */

  socket.on("cursor-move", ({ roomId, x, y }) => {

    if (!roomId) {
      return;
    }


    const roomUsers = rooms.get(roomId);

    if (roomUsers && roomUsers.has(socket.id)) {

      const user = roomUsers.get(socket.id);

      user.x = x;
      user.y = y;
    }


    socket.to(roomId).emit("cursor-move", {
      id: socket.id,
      name: socket.data.userName,
      x,
      y
    });
  });


  /*
    USER DISCONNECT
  */

  socket.on("disconnect", () => {

    const roomId = socket.data.roomId;


    if (!roomId) {
      return;
    }


    const roomUsers = rooms.get(roomId);


    if (roomUsers) {

      roomUsers.delete(socket.id);


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