import express from "express";

import WorkspaceEvent from "../models/WorkspaceEvent.js";


const router =
  express.Router();


/*
  GET ALL EVENTS
  FOR A ROOM
*/

router.get(
  "/:roomId",

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
        "Workspace events error:",
        error
      );


      res.status(500).json({

        success:
          false,

        message:
          "Failed to load workspace history"

      });

    }

  }
);


export default router;