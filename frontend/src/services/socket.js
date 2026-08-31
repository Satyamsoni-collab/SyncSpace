import { io } from "socket.io-client";

// Backend is running on port 5001
const SOCKET_URL = "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export function connectToServer(roomId, userName) {
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("join-room", {
    roomId,
    userName,
  });
}

export function leaveRoom(roomId) {
  if (!socket.connected) {
    return;
  }

  socket.emit("leave-room", {
    roomId,
  });
}