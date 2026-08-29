import mongoose from "mongoose";


const workspaceSchema =
  new mongoose.Schema(
    {

      roomId: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },


      whiteboardData: {
        type: Array,
        default: []
      },


      code: {
        type: String,
        default:
`// Start collaborating here

console.log("Hello from SyncSpace");`
      },


      language: {
        type: String,
        default: "javascript"
      }


    },
    {

      timestamps: true

    }
  );


const Workspace =
  mongoose.model(
    "Workspace",
    workspaceSchema
  );


export default Workspace;