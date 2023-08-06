import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import myPatternImage from '../assets/601.png'
import Json from '../lithologic.json';
import { io } from 'socket.io-client';

const port = 3001
const socket = io(`http://localhost:${port}`)

interface Point {
  x: number;
  y: number;
}

const initialPoints: Point[] = [
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 200, y: 120 }, 
  { x: 200, y: 140 }, 
  { x: 200, y: 180 }, 
  { x: 200, y: 200 },
  { x: 100, y: 200 },
];

const EditablePolygon: React.FC = () => {
  const [polygons, setPolygons] = useState<Point[][]>([initialPoints]);
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(window.innerHeight / 2);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState<number | null>(null);
  const [image,setImage] = useState(new window.Image());
  image.src = myPatternImage;

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('polygons', (data => { 
      setPolygons(data.polygons);
    }))
    return () => {
      socket.off('connect');
      socket.off('polygons');
    }
  }, [])

  useEffect(() => {
    image.onload = () => {
      setImage(image); };

    image.src = myPatternImage;

    const calculateStageSize = () => {
      let maxX = 0;
      let maxY = 0;
      for (const points of polygons) {
        for (const point of points) {
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
      }
      setStageWidth(maxX + 100); 
      setStageHeight(maxY + 100);
    };

    calculateStageSize();
    window.addEventListener('resize', calculateStageSize);
    return () => window.removeEventListener('resize', calculateStageSize);
  }, [polygons,image.src]);

  useEffect(() => {
    const imageObj = new window.Image();
    imageObj.onload = () => {
      setImage(imageObj);
    };
    imageObj.src = myPatternImage;
  }, []);

  const handleDragEnd = (polygonIndex: number, pointIndex: number, e: any) => {
    // Solo permitir arrastrar los puntos del medio (índices 2, 3 y 4)
    if (pointIndex >= 2 && pointIndex <= 4) {
      const updatedPolygon = [...polygons[polygonIndex]];
      updatedPolygon[pointIndex] = { x: e.target.x(), y: updatedPolygon[pointIndex].y}; // solo se mueve el eje x
      const updatedPolygons = [...polygons];
      updatedPolygons[polygonIndex] = updatedPolygon;
      socket.emit('polygons', {
        polygons: updatedPolygons,
      })
    }
  };

  const handlePolygonClick = (polygonIndex: number) => {
    setSelectedPolygonIndex(polygonIndex);
  };

  const handleAddPolygon = () => {
    const lastPolygon = polygons[polygons.length - 1];
    const verticalSpacing = lastPolygon[5].y - lastPolygon[0].y;
    const newPolygon: Point[] = [
      { x: 100, y: lastPolygon[0].y + verticalSpacing }, // Punto inicial izquierdo superior
      { x: 200, y: lastPolygon[0].y + verticalSpacing }, // Punto inicial derecho superior
      { x: 200, y: lastPolygon[0].y + verticalSpacing + 20 }, // Nuevo punto editable
      { x: 200, y: lastPolygon[0].y + verticalSpacing + 40 }, // Nuevo punto editable
      { x: 200, y: lastPolygon[0].y + verticalSpacing + 80 }, // Nuevo punto editable
      { x: 200, y: lastPolygon[0].y + verticalSpacing + 100 }, // Punto inicial derecho inferior
      { x: 100, y: lastPolygon[0].y + verticalSpacing + 100 }, // Punto inicial izquierdo inferior
    ];
    //setPolygons([...polygons, newPolygon]);
    socket.emit('polygons', {
      polygons: [...polygons, newPolygon],
    })

  };
  
  const opcionesArray = Object.keys(Json).map((key) => ({ value: key, label: Json[key] }));
  
  return (
    <DndProvider backend={HTML5Backend}>
      <h2>{isConnected ? 'CONECTADO' : 'NO CONECTADO'}</h2>
      <button onClick={handleAddPolygon}>Agregar capa</button>
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <Stage width={stageWidth} height={stageHeight}>
          <Layer>
            {polygons.map((points, polygonIndex) => (
              <React.Fragment key={polygonIndex}>
                <Line
                  points={points.flatMap((p) => [p.x, p.y])}
                  closed
                  fill={selectedPolygonIndex === polygonIndex ? 'green' : undefined}
                  fillPatternImage={image} 
                  
                  stroke="red"
                  shadowBlur={10}
                  strokeWidth={2}
                  onClick={() => handlePolygonClick(polygonIndex)}
                />
                {points.map((point, pointIndex) => (
                  <DraggableCircle
                    key={`${polygonIndex}-${pointIndex}`}
                    x={point.x}
                    y={point.y}
                    radius={6}
                    fill={pointIndex >= 2 && pointIndex <= 4 ? 'blue' : 'green'} // Puntos editables en azul, esquinas fijas en verde
                    onDragEnd={(e) => handleDragEnd(polygonIndex, pointIndex, e)}
                  />
                ))}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
      <div>
      <label htmlFor="opcionesSelect">Selecciona una opción:</label>
      <select id="opcionesSelect">
        {opcionesArray.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.value}
          </option>
        ))}
      </select>
    </div>
    </DndProvider>
  );
};

interface DraggableCircleProps {
  x: number;
  y: number;
  radius: number;
  fill: string;
  onDragEnd: (e: any) => void;
}

const DraggableCircle: React.FC<DraggableCircleProps> = ({ x, y, radius, fill, onDragEnd }) => {
  const [, drag] = useDrag({
    type: 'circle',
    item: { index: 0 },
  });

  return (
    <Circle
      x={x}
      y={y}
      radius={radius}
      fill={fill}
      draggable={fill === 'blue'} // Solo permitir arrastrar los puntos editables (en azul)
      onDragEnd={onDragEnd}
      {...drag}
    />
  );
};

export default EditablePolygon;