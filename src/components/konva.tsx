import { useState } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import myPatternImage from '../assets/612.png';
import RulerComponent from './Ruler';
import Ruler from '@scena/ruler';

const App = () => {

  const [image] = useState(new window.Image());
  image.src = myPatternImage;


  const [circles, setCircles] = useState([
    { x: 100, y: 100, radius: 5 },
    { x: 200, y: 100, radius: 5 },
    { x: 200, y: 200, radius: 5 },
    { x: 100, y: 200, radius: 5 },
  ]);

  const circlesToPoints = (circles) => {
    return circles.map((circle) => [circle.x, circle.y]).flat();
  };

  const [polygonPoints, setPolygonPoints] = useState(circlesToPoints(circles));

  const addEventToCircle = (index) => {
    return {
      onMouseEnter: () => {
        const updatedCircles = [...circles];
        updatedCircles[index].radius = 20;
        setCircles(updatedCircles);
      },
      onMouseLeave: () => {
        const updatedCircles = [...circles];
        updatedCircles[index].radius = 5;
        setCircles(updatedCircles);
      },
      onDragMove: (e) => {
        const updatedCircles = [...circles];
        updatedCircles[index].x = e.target.x();
        updatedCircles[index].y = e.target.y();
        setCircles(updatedCircles);
        setPolygonPoints(circlesToPoints(updatedCircles));
      },
    };
  };

  const handlePolygonClick = (e) => {
    const mousePos = e.target.getStage().getPointerPosition();
    const x = mousePos.x;
    const y = mousePos.y;
    const points = polygonPoints;
    for (let i = 0; i < points.length / 2; i++) {
      const s_x = points[i * 2];
      const s_y = points[i * 2 + 1];
      const e_x = points[(i * 2 + 2) % points.length];
      const e_y = points[(i * 2 + 3) % points.length];

      if (
        ((s_x <= x && x <= e_x) || (e_x <= x && x <= s_x)) &&
        ((s_y <= y && y <= e_y) || (e_y <= y && y <= s_y))
      ) {
        const point = { x, y, radius: 5 };
        const updatedCircles = [...circles];
        updatedCircles.splice(i + 1, 0, point);
        setCircles(updatedCircles);
        setPolygonPoints(circlesToPoints(updatedCircles));
        break;
      }
    }
  };

  return (
    <div>
    <RulerComponent/>
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {circles.map((circle, index) => (
          <Circle
            key={index}
            x={circle.x}
            y={circle.y}
            radius={circle.radius}
            stroke="#ff0000"
            strokeWidth={1}
            draggable
            {...addEventToCircle(index)}
          />
        ))}
        <Line
          points={polygonPoints}
          //fill="#ff000088"
          stroke="#ff0000"
          strokeWidth={1}
          fillPatternImage={image}
          closed
          dash={[]}
          onClick={handlePolygonClick}
        />
      </Layer>
    </Stage>
    </div>
  );
};

export default App;
