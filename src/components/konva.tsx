import { useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Ruler from './Ruler.tsx'
import myPatternImage from '../assets/601.png';


function Konva() {
  const [image] = useState(new window.Image());
  image.src = myPatternImage;

 
  return (
    <div>
      <Ruler/>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect
            x={30}
            y={377.95}
            width={400}
            height={264}
            fillPatternImage={image} 
            draggable
          />
        </Layer>
        
      </Stage>
    </div>
  );
  
}

export default Konva;
