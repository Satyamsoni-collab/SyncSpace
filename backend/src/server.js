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

const PORT = process.env.PORT || 5001;

});


server.listen(PORT, () => {

  console.log(
    `SyncSpace backend running on http://localhost:${PORT}`
  );

});