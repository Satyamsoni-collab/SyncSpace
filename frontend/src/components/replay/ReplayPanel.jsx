import React, {
  useEffect,
  useState,
  useCallback
} from "react";

import "./replay.css";

function ReplayPanel({ roomId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    if (!roomId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/workspace-events/${encodeURIComponent(
          roomId
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load workspace history"
        );
      }

      const result = await response.json();

      setEvents(
        Array.isArray(result.events)
          ? result.events
          : []
      );

    } catch (error) {
      console.error(
        "Replay fetch error:",
        error
      );

      setError(
        "Unable to load workspace history."
      );

    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "join":
        return "👋";

      case "leave":
        return "🚪";

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

  const getEventTitle = (eventType) => {
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
        return "Workspace activity";
    }
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="replay-panel">

      {/* HEADER */}

      <div className="replay-header">

        <div className="replay-title">

          <div className="replay-title-icon">
            📜
          </div>

          <div>
            <h2>
              Workspace History
            </h2>

            <p>
              Track collaboration activity in this room
            </p>
          </div>

        </div>

        <button
          className="replay-refresh-button"
          onClick={fetchEvents}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="replay-spinner"></span>
              Loading
            </>
          ) : (
            <>
              ↻ Refresh
            </>
          )}
        </button>

      </div>


      {/* ROOM INFORMATION */}

      <div className="replay-room-bar">

        <div className="replay-room-info">

          <span className="replay-room-dot"></span>

          <span>
            Room
          </span>

          <strong>
            {roomId}
          </strong>

        </div>

        <div className="replay-event-count">

          {events.length}

          {" "}

          {events.length === 1
            ? "event"
            : "events"}

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="replay-error">

          <span>
            ⚠️
          </span>

          <div>
            <strong>
              Unable to load history
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            onClick={fetchEvents}
          >
            Try Again
          </button>

        </div>
      )}


      {/* LOADING */}

      {loading && events.length === 0 && (
        <div className="replay-loading">

          <span className="replay-spinner large"></span>

          <p>
            Loading workspace history...
          </p>

        </div>
      )}


      {/* EMPTY */}

      {!loading &&
        !error &&
        events.length === 0 && (

          <div className="replay-empty">

            <div className="replay-empty-icon">
              📭
            </div>

            <h3>
              No activity yet
            </h3>

            <p>
              Start drawing or editing code and
              your workspace activity will appear here.
            </p>

          </div>

        )}


      {/* EVENTS */}

      {!error &&
        events.length > 0 && (

          <div className="replay-events">

            {events.map((event, index) => (

              <div
                className="replay-event"
                key={
                  event._id ||
                  `${event.eventType}-${event.createdAt}-${index}`
                }
              >

                {/* Timeline */}

                <div className="replay-timeline">

                  <div className="replay-event-icon">
                    {getEventIcon(
                      event.eventType
                    )}
                  </div>

                  {index !== events.length - 1 && (
                    <div className="replay-timeline-line"></div>
                  )}

                </div>


                {/* EVENT CONTENT */}

                <div className="replay-event-content">

                  <div className="replay-event-top">

                    <div className="replay-event-user">

                      <span className="replay-avatar">
                        {(event.userName || "G")
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <strong>
                        {event.userName || "Guest"}
                      </strong>

                    </div>

                    <span className="replay-event-time">
                      {formatTime(
                        event.createdAt
                      )}
                    </span>

                  </div>


                  <div className="replay-event-title">

                    {getEventTitle(
                      event.eventType
                    )}

                  </div>


                  {/* EXTRA EVENT INFORMATION */}

                  {event.eventType ===
                    "code-change" &&
                    event.data?.language && (

                      <div className="replay-event-detail">

                        Language:

                        <strong>
                          {" "}
                          {event.data.language}
                        </strong>

                      </div>

                    )}


                  {event.eventType ===
                    "whiteboard-draw" &&
                    event.data?.type && (

                      <div className="replay-event-detail">

                        Tool:

                        <strong>
                          {" "}
                          {event.data.type}
                        </strong>

                      </div>

                    )}

                </div>

              </div>

            ))}

          </div>

        )}

    </div>
  );
}

export default ReplayPanel;