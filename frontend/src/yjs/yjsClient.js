import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const ydoc = new Y.Doc();

const roomName = "syncspace-demo";

const provider = new WebsocketProvider(
  "ws://localhost:1234",
  roomName,
  ydoc
);

const sharedState = ydoc.getMap("sharedState");

provider.on("status", (event) => {
  console.log("Yjs connection:", event.status);
});

export { ydoc, provider, sharedState };