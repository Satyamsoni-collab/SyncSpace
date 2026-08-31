import "dotenv/config";

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { socketHandler } from "./socket/socketHandler.js";

import connectDatabase from "./config/database.js";

import authRoutes from "./routes/authRoutes.js";

import Workspace from "./models/Workspace.js";
import WorkspaceEvent from "./models/WorkspaceEvent.js";


const app = express();


/*
  CONNECT DATABASE
*/

connectDatabase();


/*
  MIDDLEWARE
*/

app.use(
  cors({
    origin: "http://localhost:5173",

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],

    credentials: true
  })
);


app.use(
  express.json()
);


/*
  AUTH ROUTES
*/

app.use(
  "/api/auth",
  authRoutes
);


/*
  CREATE HTTP SERVER
*/

const server =
  http.createServer(app);


/*
  SOCKET.IO SERVER
*/

const io =
  new Server(
    server,
    {
      cors: {
        origin:
          "http://localhost:5173",

        methods: [
          "GET",
          "POST"
        ],

        credentials: true
      }
    }
  );


/*
  PORT
*/

const PORT =
  process.env.PORT || 5000;


/*
  DEFAULT CODE
*/

const defaultCode =
`// Start collaborating here

console.log("Hello from SyncSpace");`;


/*
  SERVER HEALTH CHECK
*/

app.get(
  "/",

  (req, res) => {

    res.json({

      status:
        "online",

      message:
        "SyncSpace server is running"

    });

  }
);


/*
  GET WORKSPACE EVENTS

  Main route:

  /api/workspace/:roomId/events
*/

app.get(
  "/api/workspace/:roomId/events",

  async (req, res) => {

    try {

      const {
        roomId
      } = req.params;


      const events =
        await WorkspaceEvent
          .find({
            roomId
          })
          .sort({
            createdAt: -1
          });


      res.status(200).json({

        success:
          true,

        count:
          events.length,

        events

      });

    } catch (error) {

      console.error(
        "Get workspace events error:",
        error
      );


      res.status(500).json({

        success:
          false,

        message:
          "Unable to get workspace events"

      });

    }

  }
);


/*
  ALTERNATIVE EVENT ROUTE

  Supports old ReplayPanel URL:

  /api/workspace-events/:roomId
*/

app.get(
  "/api/workspace-events/:roomId",

  async (req, res) => {

    try {

      const {
        roomId
      } = req.params;


      const events =
        await WorkspaceEvent
          .find({
            roomId
          })
          .sort({
            createdAt: -1
          });


      res.status(200).json({

        success:
          true,

        count:
          events.length,

        events

      });

    } catch (error) {

      console.error(
        "Get workspace events error:",
        error
      );


      res.status(500).json({

        success:
          false,

        message:
          "Unable to get workspace events"

      });

    }

  }
);


/*
  SOCKET CONNECTION
*/

io.on(
  "connection",

  (socket) => {

    console.log(
      "User connected:",
      socket.id
    );


    /*
      JOIN ROOM
    */

    socket.on(
      "join-room",

      async ({
        roomId,
        userName
      }) => {

        try {

          if (!roomId) {

            return;

          }


          /*
            NORMALIZE ROOM ID
          */

          roomId =
            String(roomId)
              .trim();


          /*
            LEAVE PREVIOUS ROOM
          */

          const previousRoomId =
            socket.data.roomId;


          if (
            previousRoomId &&
            previousRoomId !== roomId
          ) {

            socket.leave(
              previousRoomId
            );

          }


          /*
            SAVE USER DATA
          */

          socket.data.roomId =
            roomId;


          socket.data.userName =
            userName || "Guest";


          /*
            JOIN SOCKET ROOM
          */

          socket.join(
            roomId
          );


          /*
            GET OR CREATE WORKSPACE

            upsert prevents duplicate
            workspace creation.
          */

          let workspace;

          try {

            workspace =
              await Workspace.findOneAndUpdate(

                {
                  roomId
                },

                {
                  $setOnInsert: {

                    roomId,

                    whiteboardData:
                      [],

                    code:
                      defaultCode,

                    language:
                      "javascript"

                  }

                },

                {

                  new:
                    true,

                  upsert:
                    true,

                  setDefaultsOnInsert:
                    true

                }

              );

          } catch (databaseError) {

            /*
              Handle rare duplicate-key
              race condition.
            */

            if (
              databaseError.code === 11000
            ) {

              workspace =
                await Workspace.findOne({
                  roomId
                });

            } else {

              throw databaseError;

            }

          }


          /*
            SEND SAVED WORKSPACE STATE

            Restores:

            - Whiteboard
            - Code
            - Language
          */

          socket.emit(
            "workspace-state",

            {

              whiteboardData:
                workspace?.whiteboardData || [],

              code:
                workspace?.code ||
                defaultCode,

              language:
                workspace?.language ||
                "javascript"

            }

          );


          /*
            SEND EDITOR STATE

            Supports CodeEditor.
          */

          socket.emit(
            "editor-state",

            {

              code:
                workspace?.code ||
                defaultCode,

              language:
                workspace?.language ||
                "javascript"

            }

          );


          /*
            GET CURRENT USER COUNT
          */

          const roomSockets =
            io.sockets.adapter.rooms.get(
              roomId
            );


          const userCount =
            roomSockets
              ? roomSockets.size
              : 1;


          /*
            UPDATE USER COUNT
          */

          io.to(roomId).emit(
            "user-count",
            userCount
          );


          /*
            NOTIFY OTHER USERS
          */

          socket.to(roomId).emit(
            "user-joined",

            {

              id:
                socket.id,

              name:
                socket.data.userName

            }

          );


          /*
            SAVE JOIN EVENT
          */

          try {

            await WorkspaceEvent.create({

              roomId,

              userName:
                socket.data.userName,

              eventType:
                "join",

              data: {

                socketId:
                  socket.id

              }

            });

          } catch (eventError) {

            console.error(
              "Join event save error:",
              eventError
            );

          }


          console.log(
            `${socket.data.userName} joined room ${roomId}`
          );

        } catch (error) {

          console.error(
            "Join room error:",
            error
          );


          socket.emit(
            "room-error",

            {

              message:
                "Unable to join workspace"

            }

          );

        }

      }
    );


    /*
      WHITEBOARD DRAWING
    */

    socket.on(
      "whiteboard-draw",

      async ({
        roomId,
        shape
      }) => {

        try {

          if (
            !roomId ||
            !shape
          ) {

            return;

          }


          roomId =
            String(roomId)
              .trim();


          /*
            SEND DRAWING TO OTHER USERS
          */

          socket.to(roomId).emit(
            "whiteboard-draw",

            {
              shape
            }
          );


          /*
            SAVE DRAWING TO DATABASE
          */

          await Workspace.findOneAndUpdate(

            {
              roomId
            },

            {

              $push: {

                whiteboardData:
                  shape

              }

            },

            {

              new:
                true,

              upsert:
                true

            }

          );


          /*
            SAVE EVENT
          */

          try {

            await WorkspaceEvent.create({

              roomId,

              userName:
                socket.data.userName ||
                "Guest",

              eventType:
                "whiteboard-draw",

              data: {

                shapeId:
                  shape.id || null,

                type:
                  shape.type ||
                  "drawing"

              }

            });

          } catch (eventError) {

            console.error(
              "Whiteboard event save error:",
              eventError
            );

          }

        } catch (error) {

          console.error(
            "Whiteboard draw error:",
            error
          );

        }

      }
    );


    /*
      WHITEBOARD COMPLETE STATE

      Used by Undo.

      The frontend sends the complete
      board after removing the last shape.

      This updates:

      1. MongoDB
      2. Other connected users
    */

    socket.on(
      "whiteboard-state",

      async ({
        roomId,
        shapes
      }) => {

        try {

          if (!roomId) {

            return;

          }


          if (
            !Array.isArray(shapes)
          ) {

            return;

          }


          roomId =
            String(roomId)
              .trim();


          /*
            SAVE COMPLETE WHITEBOARD
            TO MONGODB
          */

          await Workspace.findOneAndUpdate(

            {
              roomId
            },

            {

              $set: {

                whiteboardData:
                  shapes

              }

            },

            {

              new:
                true,

              upsert:
                true

            }

          );


          /*
            SEND COMPLETE BOARD TO
            OTHER USERS
          */

          socket.to(roomId).emit(
            "whiteboard-state",

            {

              shapes

            }

          );


          /*
            SAVE UNDO EVENT
          */

          try {

            await WorkspaceEvent.create({

              roomId,

              userName:
                socket.data.userName ||
                "Guest",

              eventType:
                "whiteboard-draw",

              data: {

                action:
                  "undo",

                shapeCount:
                  shapes.length

              }

            });

          } catch (eventError) {

            console.error(
              "Whiteboard state event save error:",
              eventError
            );

          }


          console.log(
            `${socket.data.userName || "Guest"} updated whiteboard state in room ${roomId}`
          );

        } catch (error) {

          console.error(
            "Whiteboard state error:",
            error
          );

        }

      }
    );


    /*
      WHITEBOARD CLEAR
    */

    socket.on(
      "whiteboard-clear",

      async ({
        roomId
      }) => {

        try {

          if (!roomId) {

            return;

          }


          roomId =
            String(roomId)
              .trim();


          /*
            CLEAR DATABASE
          */

          await Workspace.findOneAndUpdate(

            {
              roomId
            },

            {

              $set: {

                whiteboardData:
                  []

              }

            },

            {

              new:
                true,

              upsert:
                true

            }

          );


          /*
            NOTIFY OTHER USERS
          */

          socket.to(roomId).emit(
            "whiteboard-clear"
          );


          /*
            SAVE EVENT
          */

          try {

            await WorkspaceEvent.create({

              roomId,

              userName:
                socket.data.userName ||
                "Guest",

              eventType:
                "whiteboard-clear",

              data:
                {}

            });

          } catch (eventError) {

            console.error(
              "Clear event save error:",
              eventError
            );

          }

        } catch (error) {

          console.error(
            "Whiteboard clear error:",
            error
          );

        }

      }
    );


    /*
      CURSOR MOVEMENT
    */

    socket.on(
      "cursor-move",

      ({
        roomId,
        x,
        y
      }) => {

        if (!roomId) {

          return;

        }


        socket.to(roomId).emit(
          "cursor-move",

          {

            id:
              socket.id,

            name:
              socket.data.userName ||
              "Guest",

            x,

            y

          }

        );

      }
    );


    /*
      CODE CHANGE
    */

    socket.on(
      "code-change",

      async ({
        roomId,
        code,
        language
      }) => {

        try {

          if (!roomId) {

            return;

          }


          roomId =
            String(roomId)
              .trim();


          /*
            SAVE CODE
          */

          await Workspace.findOneAndUpdate(

            {
              roomId
            },

            {

              $set: {

                code:
                  code || "",

                language:
                  language ||
                  "javascript"

              }

            },

            {

              new:
                true,

              upsert:
                true

            }

          );


          /*
            SEND CODE TO OTHER USERS
          */

          socket.to(roomId).emit(
            "code-change",

            {

              code,

              language

            }

          );


          /*
            SAVE EVENT
          */

          try {

            await WorkspaceEvent.create({

              roomId,

              userName:
                socket.data.userName ||
                "Guest",

              eventType:
                "code-change",

              data: {

                language:
                  language ||
                  "javascript"

              }

            });

          } catch (eventError) {

            console.error(
              "Code event save error:",
              eventError
            );

          }

        } catch (error) {

          console.error(
            "Code change error:",
            error
          );

        }

      }
    );


    /*
      LEAVE ROOM
    */

    socket.on(
      "leave-room",

      async ({
        roomId
      }) => {

        try {

          if (!roomId) {

            return;

          }


          roomId =
            String(roomId)
              .trim();


          /*
            NOTIFY OTHER USERS
          */

          socket.to(roomId).emit(
            "user-left",

            {

              id:
                socket.id

            }

          );


          /*
            LEAVE SOCKET ROOM
          */

          socket.leave(
            roomId
          );


          socket.data.roomId =
            null;


          /*
            GET UPDATED USER COUNT
          */

          const roomSockets =
            io.sockets.adapter.rooms.get(
              roomId
            );


          const userCount =
            roomSockets
              ? roomSockets.size
              : 0;


          io.to(roomId).emit(
            "user-count",
            userCount
          );


          /*
            SAVE LEAVE EVENT
          */

          try {

            await WorkspaceEvent.create({

              roomId,

              userName:
                socket.data.userName ||
                "Guest",

              eventType:
                "leave",

              data: {

                socketId:
                  socket.id

              }

            });

          } catch (eventError) {

            console.error(
              "Leave event save error:",
              eventError
            );

          }


          console.log(
            `${socket.data.userName} left room ${roomId}`
          );

        } catch (error) {

          console.error(
            "Leave room error:",
            error
          );

        }

      }
    );


    /*
      DISCONNECT
    */

    socket.on(
      "disconnect",

      async () => {

        try {

          const roomId =
            socket.data.roomId;


          if (!roomId) {

            console.log(
              "User disconnected:",
              socket.id
            );

            return;

          }


          /*
            NOTIFY OTHER USERS
          */

          socket.to(roomId).emit(
            "user-left",

            {

              id:
                socket.id

            }

          );


          /*
            SOCKET.IO AUTOMATICALLY
            REMOVES DISCONNECTED SOCKET
          */

          setTimeout(() => {

            const roomSockets =
              io.sockets.adapter.rooms.get(
                roomId
              );


            const userCount =
              roomSockets
                ? roomSockets.size
                : 0;


            io.to(roomId).emit(
              "user-count",
              userCount
            );

          }, 0);


          /*
            SAVE LEAVE EVENT
          */

          try {

            await WorkspaceEvent.create({

              roomId,

              userName:
                socket.data.userName ||
                "Guest",

              eventType:
                "leave",

              data: {

                socketId:
                  socket.id

              }

            });

          } catch (eventError) {

            console.error(
              "Disconnect event save error:",
              eventError
            );

          }


          console.log(
            "User disconnected:",
            socket.id
          );

        } catch (error) {

          console.error(
            "Disconnect error:",
            error
          );

        }

      }
    );

  }
);


/*
  START SERVER
*/

server.listen(

  PORT,

  () => {

    console.log(
      `SyncSpace backend running on http://localhost:${PORT}`
    );

  }

);
