import { Rect, Line, Text } from 'react-konva';

const Ruler = ({ x, y, width, height, isInverted = false, scale }) => {

  const marks = [];
  for (let i = 0; i <= height; i += 50 * scale) { // Ajustar el paso de las marcas según la escala
    // Calcula la posición y el texto teniendo en cuenta la escala
    const position = i;
    const text = isInverted ? `${(height - i) / (100 * scale)} m` : `${i / (100 * scale)} m`;

    if (i % (100 * scale) === 0) {
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
