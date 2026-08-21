import http from "http";
import { setupWSConnection } from "@y/websocket-server/utils.js";

const server = http.createServer();

server.on("upgrade", (request, socket, head) => {
  setupWSConnection(socket, request, head);
});

server.listen(1234, () => {
  console.log("Yjs WebSocket server running on ws://localhost:1234");
});