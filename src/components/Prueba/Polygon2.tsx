import { useState } from "react";

export default function App() {
  // Puntos iniciales
  const initialPoints = [
    { name: 'c1', position: [50, 50] },
    { name: 'c2', position: [150, 50] },
    { name: 'c3', position: [150, 150] },
    { name: 'c4', position: [50, 150] }
  ];

  // Crear caminos iniciales entre los puntos
  const createInitialPaths = (points) => {
    let paths = [];
    for (let i = 0; i < points.length; i++) {
      const start = points[i].position;
      const end = points[(i + 1) % points.length].position; // Loop back to the first point after the last point
      const cp1 = [(start[0] + end[0]) / 2, start[1]];
      const cp2 = [(start[0] + end[0]) / 2, end[1]];

      paths.push({ start, cp1, cp2, end });
    }
    return paths;
  };

  const [points, setPoints] = useState(initialPoints);
  const [paths, setPaths] = useState(createInitialPaths(initialPoints));

  const handleSvgClick = (e) => {
    const position = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
    if (points.length > 0) {
      const lastPoint = points[points.length - 1].position;
      const controlPoint1 = [(lastPoint[0] + position[0]) / 2, lastPoint[1]];
      const controlPoint2 = [(lastPoint[0] + position[0]) / 2, position[1]];
      setPaths((prevPaths) => [
        ...prevPaths,
        { start: lastPoint, cp1: controlPoint1, cp2: controlPoint2, end: position }
      ]);
    }
    setPoints((prevPoints) => [
      ...prevPoints,
      {
        name: `c${prevPoints.length + 1}`,
        position
      }
    ]);
  };

  const handlePathClick = (e) => {
    e.stopPropagation();
    console.log("Path clicked!");
    // Agrega aquí tu lógica adicional para manejar el clic en el path
  };

  const handleEntityClick = (e) => e.stopPropagation();
  const handleBtnClick = () => {
    setPaths([]);
    setPoints([]);
  };

  return (
    <div className="App">
      <span>
        {points.length} Point, {paths.length} Path
      </span>
      <button style={{ marginLeft: "10px" }} onClick={handleBtnClick}>
        Clear
      </button>
      <svg width="100%" height="400" onClick={handleSvgClick}>
        {paths.map((path, idx) => (
          <path
            key={idx}
            d={`M ${path.start[0]} ${path.start[1]} C ${path.cp1[0]} ${path.cp1[1]}, ${path.cp2[0]} ${path.cp2[1]}, ${path.end[0]} ${path.end[1]}`}
            stroke="blue"
            strokeWidth="4px"
            fill="none"
            onClick={handlePathClick}
          />
        ))}
        {points.map((point, idx) => (
          <circle
            key={idx}
            cx={point.position[0]}
            cy={point.position[1]}
            r="10"
            stroke="red"
            strokeWidth="3px"
            fill="pink"
            onClick={handleEntityClick}
          />
        ))}
      </svg>
    </div>
  );
}
