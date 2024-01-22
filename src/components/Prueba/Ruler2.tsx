import React from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';

const Ruler = ({ x, y, width, height, isInverted = false }) => {

  const marks = [];
  for (let i = 0; i <= height; i += 50) {
    // Calculamos la posición dependiendo de si está invertido o no
    const position =  i;
    // El texto se ajusta en función de si está invertido
    const text = isInverted ? `${(height - i) / 100} m` : `${i / 100} m`;

    if (i % 100 === 0) {
      marks.push(
        <Line
          key={`line-${i}`}
          points={[x + width - 20, y + position, x + width, y + position]}
          stroke="black"
          strokeWidth={2}
        />,
        <Text
          key={`text-${i}`}
          x={x + width - 45}
          y={y + position - 5}
          text={text}
          fontSize={12}
          fill="black"
        />
      );
    } else {
      // Línea más pequeña cada 50 píxeles
      marks.push(
        <Line
          key={`line-${i}`}
          points={[x + width - 10, y + position, x + width, y + position]}
          stroke="black"
          strokeWidth={1}
        />
      );
    }
  }

  return (
    <> 
      <Rect x={x} y={y} width={width} height={height} fill="white" stroke="black" />
     {marks}
    </>
  );
};

export default Ruler;
