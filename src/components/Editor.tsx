import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

//import ShapeComponent from './shape';
//import Konva from './konva';
import Json from '../lithologic.json';
import Polygon from './Polygon';
import Grids from './Grids';
import './Editor.css'

const CoordinateInputs: React.FC = () => {


  //---------------// POLIGONOS //---------------//
    //Figuras / Poligonos 
    const [shapes, setShapes] = useState([]); 
  
    // Index de la Figura / Poligono
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null); // 0,1,2,3...
    
    // Ultima posicion Poligono // ARREGLAR 
    const [lastPositionSI, setLastPositionSI] = useState({ x: 100, y:100 });
    const [lastPositionID, setLastPositionID] = useState({ x: 200, y:200 });


  //---------------// CAPAS Y GRID //---------------//
    // Alto de la capa
    const [initialHeight] = useState(100);
    const [height, setHeight] = useState<number>(initialHeight);
   
    //const blockSnapSize =  initialPoints[2].y - initialPoints[0].y;

    // Drag para la cuadrado de arrastre, movimiento variable en 100. / Posible Solucion: Cambiarlo a medidas de las grid
    const blockSnapSize = 100;


  //---------------// PATRONES Y EDICION //---------------//

    // Seleccion de patron / Pattern
    const [selectedOption, setSelectedOption] = useState<string>(Object.keys(Json)[0]);

    // Colores Base 
    const [initialColorFill] = useState('#ffffff'); 
    const [initialColorStroke] = useState('#000000');

    // Cambio de Colores de los poligonos 
    const [ColorFill, setColorFill] = useState(initialColorFill); // Relleno 
    const [ColorStroke, setColorStroke] = useState(initialColorStroke); // Trazo 

    // Slider barras
    const [sliderZoom, setSliderZoom] = useState(100); // Zoom
    const [sliderRotation, setSliderRotation] = useState(0); // Rotacion

    
    useEffect(() => {
      
      if(shapes.length>0){

        const coordA = shapes.reduce((maxCoords, objeto) => {
          return {
           x1: Math.max(maxCoords.x1, objeto.x1),
            x2: Math.max(maxCoords.x2, objeto.x2),
            y1: Math.max(maxCoords.y1, objeto.y1),
            y2: Math.max(maxCoords.y2, objeto.y2),
          };
        }, { x1: -Infinity, x2: -Infinity, y1: -Infinity, y2: -Infinity });

    //    console.log('Useeffedd',coordA)
        
        //const lastPolygon = shapes[shapes.length-1];  
        //const lastPolygon = shapes.find(objeto => objeto.y2 === coordA.y2);
        setLastPositionSI({ x: coordA.x1, y: coordA.y2  }) //arreglar
        setLastPositionID({ x: coordA.x2, y: coordA.y2 + 100 })
      }
      
    },[shapes]);
  
    //---------------// EVENTOS //---------------//
    // Evento del slider de zoom 
    const handleSliderZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderZoom(Number(event.target.value));
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].zoom = Number(event.target.value);
          setShapes(updatedShapes);
        }
    };

    // Evento de slider de rotacion
    const handleSliderRotation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderRotation(Number(event.target.value));
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].rotation = Number(event.target.value);
          setShapes(updatedShapes);
        }
    };
  
    // Evento de seleccion de patron
    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].file = Json[event.target.value];
          updatedShapes[selectedShapeIndex].fileOption = event.target.value;
          setShapes(updatedShapes);
        }
    };

    // Evento de cambio color de relleno
    const handleColorChangeFill = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColorFill(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].colorfill = event.target.value;
          setShapes(updatedShapes);
        }
    };

    // Evento de cambio color de trazo 
    const handleColorChangeStroke = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColorStroke(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].colorstroke = event.target.value;
          setShapes(updatedShapes);
        }
    };

    // Evento del cambio del tamaño del poligono
    const handleChangeHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('Se ejecuto')
      setHeight(Number(event.target.value));
      const newHeight = Number(event.target.value);
      if (selectedShapeIndex !== null) {
        const selectedShape = shapes[selectedShapeIndex];
        const deltaY = newHeight - (selectedShape.y2 - selectedShape.y1);
    
        const updatedShapes = shapes.map((shape, index) => {
          if (index === selectedShapeIndex) {
            const newY2 = shape.y1 + newHeight;
            return {
              ...shape,
              y2: newY2,
            };
          } else if (index > selectedShapeIndex) {
            return {
              ...shape,
              y1: shape.y1 + deltaY,
              y2: shape.y2 + deltaY,
            };
          }
    
          return shape;
        });
    
      setShapes(updatedShapes);

      }
    }

    // Generacion de figuras 
    const handleAddShape = () => {

        setShapes(prevShapes => [...prevShapes, 
            {   
                x1: lastPositionSI.x, y1: lastPositionSI.y, 
                x2: lastPositionID.x, y2: lastPositionID.y,  
                colorfill: initialColorFill, 
                colorstroke: initialColorStroke, 
                zoom: sliderZoom,
                rotation: sliderRotation,
                file: 0, 
                fileOption: 0,
                height : initialHeight
              }]);


      //setLastPositionID({ x: lastPositionID.x, y: lastPositionID.y  })
      //setLastPositionSI({ x: lastPositionSI.x, y: lastPositionSI.y  }) //arreglar
            
    };
    
    // Cambia en el editor las configuraciones del poligno seleccionado 
    const handleShapeClick = (index) => {
        console.log(shapes)
        setSelectedShapeIndex(index);
        setColorFill(shapes[index].colorfill);
        setColorStroke(shapes[index].colorstroke);
        setSelectedOption(shapes[index].fileOption);
        setHeight(shapes[index].height);
        setSliderZoom(shapes[index].zoom);
        setSliderRotation(shapes[index].rotation);
        
    };

    // Cambia en el editor las configuraciones del poligno seleccionado 
    const handleShapeonDrag = ( index) => {
        setSelectedShapeIndex(index);
        setColorFill(shapes[index].colorfill);
        setColorStroke(shapes[index].colorstroke);
        setSelectedOption(shapes[index].fileOption);
        setHeight(shapes[index].height);
        setSliderZoom(shapes[index].zoom);
        setSliderRotation(shapes[index].rotation);

    };

    //Movimiento de la barra Drag, poligono
    const handleContainerDrag = (polygonIndex: number, e: any) => {
        //console.log(shapes)
        const updatedPolygons = [...shapes];
       // const shape = updatedPolygons[polygonIndex];
        const dragOffsetY = e.target.y() - updatedPolygons[polygonIndex].y1;

        const dragMaxY = updatedPolygons[polygonIndex].y2 + dragOffsetY;
        const dragMinY = updatedPolygons[polygonIndex].y1 + dragOffsetY;
   
        for (let i = 0; i < updatedPolygons.length; i++) {
          if (i !== polygonIndex) { 
            const minY = updatedPolygons[i].y1;
            const maxY = updatedPolygons[i].y2;
      
            if ((maxY >= dragMinY && maxY <= dragMaxY) && (minY >= dragMinY && minY <= dragMaxY)) { // comprobar si el poligono esta al lado
              const heightIndex = updatedPolygons[polygonIndex].y2 - updatedPolygons[polygonIndex].y1;
              const heightI = updatedPolygons[i].y2 - updatedPolygons[i].y1;

              const adjustment = dragOffsetY > 0 ? -heightIndex : heightIndex;
              
              const aux = dragOffsetY > 0 ? heightI : -heightI;

              updatedPolygons[i].y1 += adjustment;
              updatedPolygons[i].y2 += adjustment;

              updatedPolygons[polygonIndex].y1 += aux
              updatedPolygons[polygonIndex].y2 += aux

             
            }
          }
        }
        //console.log(updatedPolygons)
        setShapes(updatedPolygons); 

        /*const coordA = shapes.reduce((maxCoords, objeto) => {
            return {
              x1: Math.max(maxCoords.x1, objeto.x1),
              x2: Math.max(maxCoords.x2, objeto.x2),
              y1: Math.max(maxCoords.y1, objeto.y1),
              y2: Math.max(maxCoords.y2, objeto.y2),
            };
          }, { x1: -Infinity, x2: -Infinity, y1: -Infinity, y2: -Infinity });

        //console.log(coordA.x1, coordA.y1)
        //console.log(coordA.x2, coordA.y2)
        setLastPositionSI({ x: coordA.x1, y: coordA.y1 +100 }) //arreglar
        setLastPositionID({ x: coordA.x2, y: coordA.y2 +100 })*/

      };

    return (
      <div id="Editor">
         <div id="sidebar">
         <div id="controls">
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
        <div>
            <label>Cambiar alto de capa seleccionada: </label>
            <input type="number" value={height} onChange={handleChangeHeight}/>
        </div>
        <div>
          <p>Valor Zoom: {sliderZoom}</p>
          <input
            type="range"
            min={50}
            max={300}
            value={sliderZoom}
            onChange={handleSliderZoom}
          />
        </div>
        <div>
          <p>Valor Rotacion: {sliderRotation}</p>
          <input
            type="range"
            min={0}
            max={180}
            value={sliderRotation}
            onChange={handleSliderRotation}
          />
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
                  Zoom = {shape.zoom}
                  Rotation = {shape.rotation}
                  File = {shape.file}
                  height={shape.height}
                  onClick={() => handleShapeClick(index)}
                  onDrag={() => {handleShapeonDrag(index)}}
                />
                
            ))} 
            {shapes.map((shape, index) => (
                <Rect
                  key={index}
                  //x={shape.x1} // lado izquerdo poligono
                  //y={shape.y1}
                  x={shape.x1}
                  y={shape.y1}
                  width={80}
                  height={shape.y2 - shape.y1}
                 // height={shape.x2-shape.x1}
                  fill="yellow"
                  opacity={0.5}
                  draggable
                  onClick = {() => handleShapeClick(index)}
                  onDragStart={(e) => setLastPositionID({ x: lastPositionID.x, y: e.target.y() })}
                  onDragMove={(e) => {
                    const posY = Math.round(e.target.y() / 100) * 100; // arreglar
                    e.target.y(posY);
                    handleContainerDrag(index, e); 
                  }}
                  //onDragEnd={(e) => handleContainerDrag(index, e)}
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