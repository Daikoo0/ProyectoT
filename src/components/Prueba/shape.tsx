import React, { useState } from 'react';
//import { createRoot } from 'react-dom/client';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';

import Json from '../../fossil.json';

const URLImage = ({ image }) => {
  const [img] = useImage(image.src);
  return (
    <Image
      image={img}
      x={image.x}
      y={image.y}
      offsetX={img ? img.width / 2 : 0}
      offsetY={img ? img.height / 2 : 0}
      width={50}
      height={60}
      draggable
    />
  );
};

const App = () => {
  const dragUrl = React.useRef(null);
  const stageRef = React.useRef(null);
  const [images, setImages] = React.useState([]);

  // Seleccion de patron / Pattern
  const [selectedFosil, setSelectedFosil] = useState<string>(Object.keys(Json)[0]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFosil(event.target.value);
  };

  return (

    <div>
        <label>Seleccionar opción de fósil: </label>
        <select value={selectedFosil} onChange={handleOptionChange}>
        {Object.keys(Json).map(option => (
            <option key={option} value={option}>{option}</option>
        ))}
        </select>
      
        <div className='a'>
          Try to trag and image into the stage:
      <br />
      <img
        alt="lion"
        src={`./src/assets/fosiles/${Json[selectedFosil]}.svg`}
        draggable="true"
        onDragStart={(e) => {
            
          dragUrl.current = "./src/assets/fosiles/"+Json[selectedFosil]+".svg";
        }}
      />
      </div>
      <div
        onDrop={(e) => {
          e.preventDefault();
          // register event position
          
          stageRef.current.setPointersPositions(e);
          console.log(stageRef.current.getPointerPosition())
          
          
          // add image
          setImages(
            images.concat([
              {
                ...stageRef.current.getPointerPosition(),
                src: dragUrl.current,
              },
            ])
          );
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ border: '1px solid grey' }}
          ref={stageRef}
        >
          <Layer>
            {images.map((image) => {
              console.log(image);
              return <URLImage image={image} />;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default App;





