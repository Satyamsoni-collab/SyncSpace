export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  clearCanvas
}) {
  return (
    <div className="toolbar">

      <button
        className={tool === "pen" ? "active" : ""}
        onClick={() => setTool("pen")}
      >
        ✏️ Pen
      </button>

      <button
        className={tool === "rectangle" ? "active" : ""}
        onClick={() => setTool("rectangle")}
      >
        ▭ Rectangle
      </button>

      <button
        className={tool === "text" ? "active" : ""}
        onClick={() => setTool("text")}
      >
        T Text
      </button>

      <label>
        Color:
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
      </label>

      <button onClick={clearCanvas}>
        🗑 Clear
      </button>

    </div>
  );
}