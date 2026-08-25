import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}));

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
  ROOM STRUCTURE

  roomId -> {
    users: Map,
    code: "",
    language: "javascript"
  }
*/

const rooms = new Map();


app.get("/", (req, res) => {

  res.json({
    status: "online",
    message: "SyncSpace server is running"
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
      userName || "Guest";


    if (!rooms.has(roomId)) {

      rooms.set(roomId, {
        users: new Map(),

        code:
`// Start collaborating here

console.log("Hello from SyncSpace");`,

        language: "javascript"
      });

    }


    const room = rooms.get(roomId);


    room.users.set(socket.id, {
      id: socket.id,
      name: socket.data.userName
    });


    /*
      Send current editor state
      to newly joined user
    */

    socket.emit("editor-state", {

      code: room.code,

      language: room.language

    });


    /*
      Send all users to new user
    */

    socket.emit(
      "room-users",
      Array.from(room.users.values())
    );


    /*
      Send updated count
      to everyone
    */

    io.to(roomId).emit(
      "user-count",
      room.users.size
    );


    /*
      Notify others
    */

    socket.to(roomId).emit(
      "user-joined",
      {
        id: socket.id,
        name: socket.data.userName
      }
    );


    console.log(
      `${socket.data.userName} joined ${roomId}`
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
        {
          shape
        }
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
    CODE CHANGE

    Save the latest room state
    and send it to everyone else.
  */

  socket.on(
    "code-change",
    ({
      roomId,
      code,
      language
    }) => {

      if (!roomId) {
        return;
      }


      const room =
        rooms.get(roomId);


      if (!room) {
        return;
      }


      room.code = code;
      room.language = language;


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
    DISCONNECT
  */

  socket.on("disconnect", () => {

    const roomId =
      socket.data.roomId;


    if (!roomId) {

      console.log(
        "User disconnected:",
        socket.id
      );

      return;

    }


    const room =
      rooms.get(roomId);


    if (room) {

      room.users.delete(
        socket.id
      );


      socket.to(roomId).emit(
        "user-left",
        {
          id: socket.id
        }
      );


      io.to(roomId).emit(
        "user-count",
        room.users.size
      );


      if (room.users.size === 0) {

        /*
          We keep the room state for now.
          This allows future users
          to reconnect without server crash.
        */

        console.log(
          `Room ${roomId} is now empty`
        );

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