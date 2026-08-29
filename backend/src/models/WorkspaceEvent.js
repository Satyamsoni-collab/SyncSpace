import mongoose from "mongoose";


const workspaceEventSchema =
  new mongoose.Schema(
    {

      roomId: {
        type: String,
        required: true,
        index: true
      },


      userName: {
        type: String,
        default: "Guest"
      },


      eventType: {
        type: String,
        required: true,
        enum: [

          "join",

          "leave",

          "whiteboard-draw",

          "whiteboard-clear",

          "code-change",

          "language-change"

        ]
      },


      data: {
        type:
          mongoose.Schema.Types.Mixed,

        default:
          {}
      }

    },
    {

      timestamps:
        true

    }
  );


const WorkspaceEvent =
  mongoose.model(
    "WorkspaceEvent",
    workspaceEventSchema
  );


export default WorkspaceEvent;