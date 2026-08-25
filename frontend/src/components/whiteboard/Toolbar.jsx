function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  clearCanvas,
  undoCanvas,
  connectedUsers,
  connected
}) {

  return (

    <div className="toolbar">


      <div className="toolbar-left">

        <button
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


        <button
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


        <button
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


        <button
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



      <div className="toolbar-right">


        <button
          className="action-button"
          onClick={undoCanvas}
        >
          ↩ Undo
        </button>


        <button
          className="clear-button"
          onClick={clearCanvas}
        >
          🗑 Clear
        </button>


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


        <div className="user-count">

          👥 {connectedUsers}

        </div>


      </div>


    </div>

  );

}


export default Toolbar;