import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage,Rect } from 'react-konva';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import myPatternImage from '../assets/601.png'
//import Ruler from './Ruler.tsx'
import Json from '../lithologic.json';
import { io } from 'socket.io-client';
import useImage from 'use-image';

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
  //const imageURL = new URL(`../assets/601.png`, import.meta.url).href

  //const [image3] = useImage(myPatternImage);
  const image3 = new window.Image();
  image3.src = `./src/assets/601.png`;
  
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(window.innerHeight / 2);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState<number | null>(null);
  const [image,setImage] = useState(new window.Image());
  image.src = myPatternImage;

   const [polygons, setPolygons] = useState<{ points: Point[]; image: HTMLImageElement }[]>([
    { points: initialPoints, image : image3 },
  ]);

  const [isConnected, setIsConnected] = useState(false);



  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('polygons', (data => { 
      console.log(data.polygons)
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
        for (const point of points.points) {
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
      const updatedPolygons = polygons.map((polygon, index) => {
        if (index !== polygonIndex) return polygon;
  
        const updatedPoints = [...polygon.points];
        updatedPoints[pointIndex] = { x: e.target.x(), y: polygon.points[pointIndex].y }; // Solo actualizamos la coordenada x
        return { ...polygon, points: updatedPoints };
      });
      
      setPolygons(updatedPolygons);
    }
  };
  

  const handlePolygonClick = (polygonIndex: number) => {
    setSelectedPolygonIndex(polygonIndex);
  };

  //const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  const handleAddPolygon = () => {
    const lastPolygon = polygons[polygons.length - 1] || { points: initialPoints };
    const verticalSpacing = lastPolygon.points[5].y - lastPolygon.points[0].y;
    const newPolygon: Point[] = [
      { x: 100, y: lastPolygon.points[0].y + verticalSpacing }, // Punto inicial izquierdo superior
      { x: 200, y: lastPolygon.points[0].y + verticalSpacing }, // Punto inicial derecho superior
      { x: 200, y: lastPolygon.points[0].y + verticalSpacing + 20 }, // Nuevo punto editable
      { x: 200, y: lastPolygon.points[0].y + verticalSpacing + 40 }, // Nuevo punto editable
      { x: 200, y: lastPolygon.points[0].y + verticalSpacing + 80 }, // Nuevo punto editable
      { x: 200, y: lastPolygon.points[0].y + verticalSpacing + 100 }, // Punto inicial derecho inferior
      { x: 100, y: lastPolygon.points[0].y + verticalSpacing + 100 }, // Punto inicial izquierdo inferior
    ];
    //const newSelectedImage = selectedImage ? new window.Image() : new window.Image();
    console.log([...polygons, { points: newPolygon, image : image3 }])
    setPolygons([...polygons, { points: newPolygon, image : image3 }]);
    
    socket.emit('polygons', {
          polygons: [...polygons, { points: newPolygon, image : image3 }],
      })

  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFileName = e.target.value;
    setSelectedImage(Json[selectedFileName]);

    if (selectedPolygonIndex !== null) {
      const updatedPolygons = polygons.map((polygon, index) => {
        if (index !== selectedPolygonIndex) return polygon;

       const image = new window.Image();
       image.src = `./src/assets/${Json[selectedFileName]}.png`;
       // const imageURL = new URL(`../assets/${Json[selectedFileName]}.png`, import.meta.url).href
      //  const [image] = useImage(imageURL);
      image.onload = () => {
        const updatedPolygon = { ...polygon, image: image };
        const updatedPolygons = [...polygons];
        updatedPolygons[selectedPolygonIndex] = updatedPolygon;
        setPolygons(updatedPolygons);
        console.log(image.src)
      }
        image.onerror = () => {
          console.error(`Error loading image: ${Json[selectedFileName]}.png`);
        };

        return polygon;
      });

      setPolygons(updatedPolygons);
    }
  };

  
  const opcionesArray = Object.keys(Json).map((key) => ({ value: key, label: Json[key] }));
  
  return (
    <DndProvider backend={HTML5Backend}>
      <h2>{isConnected ? 'CONECTADO' : 'NO CONECTADO'}</h2>
      <button onClick={handleAddPolygon}>Agregar capa</button>
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <Stage width={stageWidth} height={stageHeight}>
        <Layer>
       
            {polygons.map((polygon, polygonIndex) => (
              <React.Fragment key={polygonIndex}>
                <Line
                  points={polygon.points.flatMap((p) => [p.x, p.y])}
                  closed
                  //fill={selectedImage ? `url(#pattern${polygonIndex})` : 'transparent'}
                  fillPatternImage={polygon.image} 
                 // fillPatternImage={polygon.image ? fillPatterns[polygon.image.src] : undefined} 
                  stroke="red"
                  shadowBlur={10}
                  strokeWidth={2}
                  onClick={() => handlePolygonClick(polygonIndex)}
                />
                {polygon.points.map((point, pointIndex) => (
                  <DraggableCircle
                    key={`${polygonIndex}-${pointIndex}`}
                    x={point.x}
                    y={point.y}
                    radius={6}
                    fill={pointIndex >= 2 && pointIndex <= 4 ? 'blue' : 'green'}
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
      <select id="opcionesSelect" onChange={handleSelectChange}>
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