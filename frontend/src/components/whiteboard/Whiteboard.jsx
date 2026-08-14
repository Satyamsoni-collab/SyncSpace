import { useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Text } from "react-konva";
import Toolbar from "./Toolbar";
import "./whiteboard.css";

function Whiteboard() {

  const stageRef = useRef(null);

  const [tool, setTool] = useState("pen");

  const [color, setColor] = useState("#000000");

  const [shapes, setShapes] = useState([]);

  const [isDrawing, setIsDrawing] = useState(false);

  const [startPoint, setStartPoint] = useState(null);


  // Get mouse position
  const getPointerPosition = () => {

    const stage = stageRef.current;

    if (!stage) {
      return null;
    }

    return stage.getPointerPosition();
  };


  // Mouse Down
  const handleMouseDown = () => {

    const position = getPointerPosition();

    if (!position) {
      return;
    }


    // PEN
    if (tool === "pen") {

      setIsDrawing(true);

      const newLine = {

        id: Date.now(),

        type: "line",

        points: [
          position.x,
          position.y
        ],

        stroke: color,

        strokeWidth: 3
      };


      setShapes((previousShapes) => [
        ...previousShapes,
        newLine
      ]);
    }


    // RECTANGLE / TEXT
    else {

      setStartPoint(position);

    }
  };


  // Mouse Move
  const handleMouseMove = () => {

    if (!isDrawing) {
      return;
    }


    const position = getPointerPosition();

    if (!position) {
      return;
    }


    setShapes((previousShapes) => {
      const updatedShapes = [...previousShapes];
      const lastIndex = updatedShapes.length - 1;
      const lastShape = updatedShapes[lastIndex];

      if (!lastShape || lastShape.type !== "line" || !Array.isArray(lastShape.points)) {
        return previousShapes;
      }

      updatedShapes[lastIndex] = {
        ...lastShape,
        points: [...lastShape.points, position.x, position.y]
      };

      return updatedShapes;

    });

  };


  // Mouse Up
  const handleMouseUp = () => {

    if (tool === "pen") {

      setIsDrawing(false);

      return;
    }


    const position = getPointerPosition();

    if (!position || !startPoint) {
      return;
    }


    // RECTANGLE
    if (tool === "rectangle") {

      const rectangle = {

        id: Date.now(),

        type: "rectangle",

        x: Math.min(
          startPoint.x,
          position.x
        ),

        y: Math.min(
          startPoint.y,
          position.y
        ),

        width: Math.abs(
          position.x - startPoint.x
        ),

        height: Math.abs(
          position.y - startPoint.y
        ),

        stroke: color,

        strokeWidth: 2
      };


      setShapes((previousShapes) => [
        ...previousShapes,
        rectangle
      ]);
    }


    // TEXT
    if (tool === "text") {

      const textValue =
        window.prompt("Enter text");


      if (textValue && textValue.trim()) {

        const textShape = {

          id: Date.now(),

          type: "text",

          x: startPoint.x,

          y: startPoint.y,

          text: textValue,

          fill: color,

          fontSize: 20
        };


        setShapes((previousShapes) => [
          ...previousShapes,
          textShape
        ]);
      }
    }


    setStartPoint(null);

  };


  // Clear canvas
  const clearCanvas = () => {

    setShapes([]);

  };


  return (

    <div className="whiteboard-container">

      <Toolbar

        tool={tool}

        setTool={setTool}

        color={color}

        setColor={setColor}

        clearCanvas={clearCanvas}

      />


      <div className="canvas-container">

        <Stage

          ref={stageRef}

          width={window.innerWidth / 2 - 20}

          height={window.innerHeight - 150}

          onMouseDown={handleMouseDown}

          onMouseMove={handleMouseMove}

          onMouseUp={handleMouseUp}

        >

          <Layer>

            {shapes.map((shape) => {

              // LINE

              if (shape.type === "line") {

                return (

                  <Line

                    key={shape.id}

                    points={shape.points}

                    stroke={shape.stroke}

                    strokeWidth={shape.strokeWidth}

                    lineCap="round"

                    lineJoin="round"

                  />

                );

              }


              // RECTANGLE

              if (shape.type === "rectangle") {

                return (

                  <Rect

                    key={shape.id}

                    x={shape.x}

                    y={shape.y}

                    width={shape.width}

                    height={shape.height}

                    stroke={shape.stroke}

                    strokeWidth={shape.strokeWidth}

                  />

                );

              }


              // TEXT

              if (shape.type === "text") {

                return (

                  <Text

                    key={shape.id}

                    x={shape.x}

                    y={shape.y}

                    text={shape.text}

                    fill={shape.fill}

                    fontSize={shape.fontSize}

                  />

                );

              }


              return null;

            })}

          </Layer>

        </Stage>

      </div>

    </div>

  );
}

export default Whiteboard;