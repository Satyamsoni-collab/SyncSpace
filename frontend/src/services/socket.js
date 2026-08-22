import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false
});

export function connectToServer(roomId, userName) {
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("join-room", {
    roomId,
    userName
  });
}