function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  clearCanvas,
  connectedUsers
}) {

  return (

    <div className="toolbar">

      <div className="tool-group">

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
          ✏️ Pen
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
          ▭ Rectangle
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
          T Text
        </button>

      </div>


      <div className="toolbar-actions">

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


        <button
          className="clear-button"
          onClick={clearCanvas}
        >
          🗑 Clear
        </button>


        <div className="user-count">

          👥 {connectedUsers}
          {" "}
          {connectedUsers === 1
            ? "User"
            : "Users"}

        </div>

      </div>

    </div>

  );

}


export default Toolbar;