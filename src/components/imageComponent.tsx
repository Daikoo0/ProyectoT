import React, { useState, useEffect ,useRef } from 'react';
import { Stage, Layer, Line, Circle, Image ,Rect } from 'react-konva';
import useImage from 'use-image';

function URLImage() {

    const imageURL = new URL(`../assets/601.png`, import.meta.url).href

      const [image] = useImage(imageURL);
  
    return (
        <Stage width={100} height={100}>
        <Layer>
        <Rect
        x={20}
        y={50}
        width={100}
        height={100}
        fillPatternImage={image}
        shadowBlur={10}
      />
      </Layer>
      </Stage>
    );
  }
  export default URLImage;