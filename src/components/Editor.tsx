import React, { useState } from 'react';
import { Stage, Layer } from 'react-konva';

import ShapeComponent from './shape';
import Json from '../lithologic.json';

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


    // Cambios en los inputs
    const handleXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setX(Number(event.target.value));
    };

    const handleYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setY(Number(event.target.value));
    };

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
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
        const newX = Math.random() * window.innerWidth;
        const newY = Math.random() * window.innerHeight;
        setShapes(prevShapes => [...prevShapes, { x: newX, y: newY, colorfill: initialColorFill, colorstroke: initialColorStroke }]);
      };
    
      // Seleccionar index de la figura 
      const handleShapeClick = (index) => {
        setSelectedShapeIndex(index);
        setX(shapes[index].x);
        setY(shapes[index].y);
        setColorFill(shapes[index].colorfill);
        setColorStroke(shapes[index].colorstroke);
      };



    return (
        <div>
        <div>
            <label>Coordenada X: </label>
            <input type="number" value={x} onChange={handleXChange} />
        </div>
        <div>
            <label>Coordenada Y: </label>
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
        <div>
        <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
            {shapes.map((shape, index) => (
                <ShapeComponent
                  key={index}
                  x={shape.x}
                  y={shape.y}
                  ColorFill={shape.colorfill}
                  ColorStroke={shape.colorstroke}
                  onClick={() => handleShapeClick(index)}
                />
              ))}
        </Layer>
        </Stage>
        </div>
        </div>
    );
};

export default CoordinateInputs;