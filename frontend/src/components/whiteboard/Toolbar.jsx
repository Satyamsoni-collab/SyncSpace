import React from "react";

function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  clearCanvas,
  undoCanvas,
  canUndo,
  connectedUsers,
  connected
}) {

  return (
    <div className="toolbar">

      {/* LEFT - DRAWING TOOLS */}
      <div className="toolbar-left">

        {/* PEN */}
        <button
          type="button"
          className={
            tool === "pen"
              ? "active"
              : ""
          }
          onClick={() =>
            setTool("pen")
          }
        >
          ✏️
          <span>Pen</span>
        </button>


        {/* RECTANGLE */}
        <button
          type="button"
          className={
            tool === "rectangle"
              ? "active"
              : ""
          }
          onClick={() =>
            setTool("rectangle")
          }
        >
          ▭
          <span>Rectangle</span>
        </button>


        {/* CIRCLE */}
        <button
          type="button"
          className={
            tool === "circle"
              ? "active"
              : ""
          }
          onClick={() =>
            setTool("circle")
          }
        >
          ⭕
          <span>Circle</span>
        </button>


        {/* TEXT */}
        <button
          type="button"
          className={
            tool === "text"
              ? "active"
              : ""
          }
          onClick={() =>
            setTool("text")
          }
        >
          T
          <span>Text</span>
        </button>

      </div>


      {/* CENTER - COLOR */}
      <div className="toolbar-center">

        <label className="color-picker">

          <span>Color</span>

          <input
            type="color"
            value={color}
            onChange={(event) =>
              setColor(
                event.target.value
              )
            }
          />

        </label>

      </div>


      {/* RIGHT - ACTIONS */}
      <div className="toolbar-right">

        {/* UNDO */}
        <button
          type="button"
          className="action-button"
          onClick={undoCanvas}
          disabled={!canUndo}
          title={
            canUndo
              ? "Undo last action"
              : "Nothing to undo"
          }
        >
          ↩ Undo
        </button>


        {/* CLEAR */}
        <button
          type="button"
          className="clear-button"
          onClick={clearCanvas}
          disabled={
            typeof clearCanvas !== "function"
          }
        >
          🗑 Clear
        </button>


        {/* CONNECTION STATUS */}
        <div className="connection-status">

          <span
            className={
              connected
                ? "status-dot online"
                : "status-dot offline"
            }
          ></span>

          {connected
            ? "Live"
            : "Offline"}

        </div>


        {/* USER COUNT */}
        <div className="user-count">

          👥 {connectedUsers}

        </div>

      </div>

    </div>
  );
}


export default Toolbar;