import { useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import myPatternImage from '../assets/sand_glauconitic.png';

function Konva() {
  const [image] = useState(new window.Image());
  image.src = myPatternImage;

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={20}
          y={50}
          width={400}
          height={500}
          fillPatternImage={image} 
        />
      </Layer>
    </Stage>
  );
}

export default Konva;
