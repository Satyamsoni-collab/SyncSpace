import React, {
  useEffect,
  useState
} from "react";

import "./replay.css";


function ReplayPanel({
  roomId
}) {

  const [events, setEvents] =
    useState([]);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  const fetchEvents =
    async () => {

      if (!roomId) {
        return;
      }


      try {

        setLoading(true);

        setError("");


        const response =
          await fetch(
            `http://localhost:5000/api/workspace-events/${roomId}`
          );


        if (!response.ok) {

          throw new Error(
            "Failed to load workspace history"
          );

        }


        const result =
          await response.json();


        setEvents(
          result.events || []
        );

      } catch (error) {

        console.error(
          "Replay fetch error:",
          error
        );


        setError(
          "Unable to load workspace history"
        );

      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    fetchEvents();

  }, [
    roomId
  ]);


  const getEventIcon =
    (eventType) => {

      switch (eventType) {

        case "join":
          return "👋";

        case "leave":
          return "👋";

        case "whiteboard-draw":
          return "🎨";

        case "whiteboard-clear":
          return "🧹";

        case "code-change":
          return "💻";

        case "language-change":
          return "🌐";

        default:
          return "⚡";

      }

    };


  const getEventTitle =
    (eventType) => {

      switch (eventType) {

        case "join":
          return "Joined the workspace";

        case "leave":
          return "Left the workspace";

        case "whiteboard-draw":
          return "Updated the whiteboard";

        case "whiteboard-clear":
          return "Cleared the whiteboard";

        case "code-change":
          return "Updated the code";

        case "language-change":
          return "Changed programming language";

        default:
          return eventType;

      }

    };


  const formatTime =
    (date) => {

      if (!date) {
        return "";
      }


      return new Date(
        date
      ).toLocaleString();

    };


  return (

    <div className="replay-panel">


      <div className="replay-header">


        <div>


          <h3>
            Workspace History
          </h3>


          <p>
            Track collaboration activity
          </p>


        </div>


        <button
          className="refresh-button"
          onClick={fetchEvents}
          disabled={loading}
        >

          {loading
            ? "Loading..."
            : "↻ Refresh"}

        </button>


      </div>



      <div className="replay-room">

        Room: <strong>{roomId}</strong>

      </div>



      {error && (

        <div className="replay-error">

          {error}

        </div>

      )}



      {loading && (

        <div className="replay-loading">

          Loading workspace history...

        </div>

      )}



      {!loading &&
        !error &&
        events.length === 0 && (

          <div className="replay-empty">

            <div className="empty-icon">

              📭

            </div>


            <h4>
              No activity yet
            </h4>


            <p>
              Start collaborating and your
              workspace activity will appear here.
            </p>

          </div>

        )}



      <div className="replay-events">


        {events.map(
          (event) => (

            <div
              className="replay-event"
              key={event._id}
            >


              <div className="event-icon">

                {getEventIcon(
                  event.eventType
                )}

              </div>



              <div className="event-content">


                <div className="event-main">

                  <strong>

                    {event.userName ||
                      "Guest"}

                  </strong>


                  <span>

                    {getEventTitle(
                      event.eventType
                    )}

                  </span>

                </div>



                <div className="event-time">

                  {formatTime(
                    event.createdAt
                  )}

                </div>


              </div>


            </div>

          )
        )}


      </div>


    </div>

  );

}


export default ReplayPanel;