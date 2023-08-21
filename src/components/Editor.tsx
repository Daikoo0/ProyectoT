import React, { useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

//import ShapeComponent from './shape';
//import Konva from './konva';
import Json from '../lithologic.json';
import Polygon from './Polygon';
import Grids from './Grids';
import './Editor.css'

const CoordinateInputs: React.FC = () => {

    //Figuras 
    const [shapes, setShapes] = useState([]); 

    // Coordenadas
    const [x, setX] = useState<number>(0);
    const [y, setY] = useState<number>(0);
  
    // Opciones de Pattern
    const [selectedOption, setSelectedOption] = useState<string>(Object.keys(Json)[0]);

    // Color 
    const [initialColorFill] = useState('#ffffff'); 
    const [initialColorStroke] = useState('#000000');

    const [ColorFill, setColorFill] = useState(initialColorFill);
    const [ColorStroke, setColorStroke] = useState(initialColorStroke);

    // Index Figura
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null); 
    
    // Posicion Poligono
    const [lastPositionSI, setLastPositionSI] = useState({ x: 100, y:100 })
    const [lastPositionID, setLastPositionID] = useState({ x: 200, y:200 });
   
    // const blockSnapSize =  initialPoints[2].y - initialPoints[0].y;
    const blockSnapSize = 100;

    // Cambios en los inputs
    const handleXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setX(Number(event.target.value));
    };

    const handleYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setY(Number(event.target.value));
    };

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].file = Json[event.target.value];
          updatedShapes[selectedShapeIndex].fileOption = event.target.value;
          setShapes(updatedShapes);
        }
    };

    const handleColorChangeFill = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColorFill(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].colorfill = event.target.value;
          setShapes(updatedShapes);
        }
    };

    const handleColorChangeStroke = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColorStroke(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].colorstroke = event.target.value;
          setShapes(updatedShapes);
        }
    };

    // Agregar Figura, se genera una posicion aleatoria, se agrega al array de figuras
    const handleAddShape = () => {
        
        
        setShapes(prevShapes => [...prevShapes, 
            {   x1: lastPositionSI.x, y1: lastPositionSI.y, 
                x2: lastPositionID.x, y2: lastPositionID.y,  
                colorfill: initialColorFill, 
                colorstroke: initialColorStroke, 
                file: Json[selectedOption], 
                fileOption:selectedOption }]);

        setLastPositionID({ x: lastPositionID.x, y: lastPositionID.y + 100 })
        setLastPositionSI({ x: lastPositionSI.x, y: lastPositionSI.y + 100 })
      
    };
    
    const handleShapeClick = (index) => {
        setSelectedShapeIndex(index);
        setX(shapes[index].x);
        setY(shapes[index].y);
        setColorFill(shapes[index].colorfill);
        setColorStroke(shapes[index].colorstroke);
        setSelectedOption(shapes[index].fileOption);
    };

    const handleShapeonDrag = ( index, pos) => {
        shapes[index].x = pos.x;
        shapes[index].y = pos.y;
        setX(pos.x);
        setY(pos.y);
        setSelectedShapeIndex(index);
        setColorFill(shapes[index].colorfill);
        setColorStroke(shapes[index].colorstroke);

        setSelectedOption(shapes[index].fileOption);

    };

    const handleContainerDrag = (polygonIndex: number, e: any) => {
        const updatedPolygons = [...shapes];
       // const shape = updatedPolygons[polygonIndex];
        const dragOffsetY = e.target.y() - updatedPolygons[polygonIndex].y1;

        // Check for collision with the dragged area
        const dragMaxY = updatedPolygons[polygonIndex].y2 + dragOffsetY;
        const dragMinY = updatedPolygons[polygonIndex].y1 + dragOffsetY;
      
        for (let i = 0; i < updatedPolygons.length; i++) {
          if (i !== polygonIndex) {
            const minY = updatedPolygons[i].y1;
            const maxY = updatedPolygons[i].y2;
      
            // Check if polygons are adjacent without any gap
            if ((maxY >= dragMinY && maxY <= dragMaxY) && (minY >= dragMinY && minY <= dragMaxY)) {
              const adjustment = dragOffsetY > 0 ? -blockSnapSize : blockSnapSize;
            
              updatedPolygons[i].y1 += adjustment;
              updatedPolygons[i].y2 += adjustment;
            
            }
          }
        }
        updatedPolygons[polygonIndex].y1 += dragOffsetY;
        updatedPolygons[polygonIndex].y2 += dragOffsetY;
        //console.log(updatedPolygons)
 
        
        setShapes(updatedPolygons);

        const coordA = shapes.reduce((maxCoords, objeto) => {
            return {
              x1: Math.max(maxCoords.x1, objeto.x1),
              x2: Math.max(maxCoords.x2, objeto.x2),
              y1: Math.max(maxCoords.y1, objeto.y1),
              y2: Math.max(maxCoords.y2, objeto.y2),
            };
          }, { x1: -Infinity, x2: -Infinity, y1: -Infinity, y2: -Infinity });

        
        setLastPositionSI({ x: coordA.x1, y: coordA.y1+100 })
        setLastPositionID({ x: coordA.x2, y: coordA.y2+100 })

      };

    return (
      <div id="Editor">
         <div id="sidebar">
         <div id="controls">
        <div>
            <label>Pos X: </label>
            <input type="number" value={x} onChange={handleXChange} />
        </div>
        <div>
            <label>Pos Y: </label>
            <input type="number" value={y} onChange={handleYChange} />
        </div>
        <div>
            <label>Seleccionar opción de Pattern: </label>
            <select value={selectedOption} onChange={handleOptionChange}>
            {Object.keys(Json).map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
            </select>
        </div>
        <div>
            <label>Seleccionar color Fill: </label>
            <input type="color" value={ColorFill} onChange={handleColorChangeFill} />
        </div>
        <div>
            <label>Seleccionar color Stroke: </label>
            <input type="color" value={ColorStroke} onChange={handleColorChangeStroke} />
        </div>
        <div>
            <button onClick={handleAddShape}>Agregar Figura</button>
        </div>
        </div>
        </div>
        <div id="gridContainer">

        <Stage width={window.innerWidth} height={window.innerHeight}>
        <Grids polygons={shapes} />
        <Layer>
        
            {shapes.map((shape, index) => (
                <Polygon
                  key={index}
                  x1={shape.x1}
                  y1={shape.y1}
                  x2={shape.x2}
                  y2={shape.y2}
                  ColorFill={shape.colorfill}
                  ColorStroke={shape.colorstroke}
                  File = {shape.file}
                  onClick={() => handleShapeClick(index)}
                  onDrag={(pos) => {handleShapeonDrag(index, pos)}}
                />
                
            ))} 
            {shapes.map((shape, index) => (
                <Rect
                  key={index}
                  //x={shape.x1} // lado izquerdo poligono
                  //y={shape.y1}
                  x={shape.x1}
                  y={shape.y1}
                  width={25}
                  height={100}
                 // height={shape.x2-shape.x1}
                  fill="yellow"
                  opacity={0.5}
                  draggable
                  onDragStart={(e) => setLastPositionID({ x: lastPositionID.x, y: e.target.y() })}
                  onDragMove={(e) => {
                    const posY = Math.round(e.target.y() / blockSnapSize) * blockSnapSize;
                    e.target.y(posY);
                    handleContainerDrag(index, e); 
                  }}
              //   onDragEnd={(e) => handleContainerDrag(index, e)}
                  dragBoundFunc={(pos) => ({
                        x: 100,
                        y: pos.y, 
                  })}
                />
            ))} 
            
           {/* {shapes.map((shape, index) => (
                <ShapeComponent
                  key={index}
                  x={shape.x}
                  y={shape.y}
                  ColorFill={shape.colorfill}
                  ColorStroke={shape.colorstroke}
                  File = {shape.file}
                  onClick={() => handleShapeClick(index)}
                  onDrag={(pos) => {handleShapeonDrag(index, pos)}}
                />
            ))}    */}
           {/* {shapes.map((shape, index) => (
                <Konva
                  key={index}
                  ColorFill={shape.colorfill}
                  ColorStroke={shape.colorstroke}
                  File = {shape.file}
                  onClick={() => handleShapeClick(index)}
                  onDrag={(pos) => {handleShapeonDrag(index, pos)}}
                />
            ))} */}
        </Layer>
        </Stage>
        </div>
        
        </div>
    );
};

export default CoordinateInputs;