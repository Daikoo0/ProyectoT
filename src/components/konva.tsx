import { useState, useEffect } from 'react';
import { Line, Circle } from 'react-konva';
import useImage from 'use-image';

const Polygon = ({ColorFill, ColorStroke, File, onClick, onDrag}) => {
    
    const [svgContent, setSvgContent] = useState('');

    useEffect(() => {
        if(File === 0){
            setSvgContent('');
            return;
        }

        const imageURL = new URL('../assets/'+File+'.svg', import.meta.url).href

        fetch(imageURL)
        .then(response => response.text())
        .then(svgText => {
            
            const manipulatedSvg = svgText
            .replace(/stroke='[^']+'/g, "stroke='"+ColorStroke+"'") // Cambia el color del stroke
            .replace(/fill='[^']+'/g, "fill='"+ColorFill+"'"); // Cambia el color del fill
            
            setSvgContent(manipulatedSvg);
        
        });

    }, [File]);


    useEffect(() => {
          if(File === 0){
              setSvgContent('');
              return;
          }

          setSvgContent(svgContent
              .replace(/stroke='[^']+'/g, "stroke='"+ColorStroke+"'") // Cambia el color del stroke
              .replace(/fill='[^']+'/g, "fill='"+ColorFill+"'")); // Cambia el color del fill
              

    }, [ColorFill, ColorStroke]);

    const [image] = useImage(File === 0 ? null : "data:image/svg+xml;base64," + window.btoa(svgContent));

    // Puntos Iniciales del Poligono
    const [circles, setCircles] = useState([
      { x: 100, y: 100, radius: 5, movable: false},
      { x: 200, y: 100, radius: 5, movable: false},
      { x: 200, y: 200, radius: 5, movable: false},
      { x: 100, y: 200, radius: 5, movable: false},
    ]);

    const circlesToPoints = (circles) => {
      return circles.map((circle) => [circle.x, circle.y]).flat();
    };

    const [polygonPoints, setPolygonPoints] = useState(circlesToPoints(circles));

    const addEventToCircle = (index) => {
      return {
        /*onMouseEnter: () => {
          const updatedCircles = [...circles];
          updatedCircles[index].radius = 20;
          setCircles(updatedCircles);
        },
        onMouseLeave: () => {
          const updatedCircles = [...circles];
          updatedCircles[index].radius = 5;
          setCircles(updatedCircles);
        },*/
        ondragMove: (e) => {
          const updatedCircles = [...circles];
          updatedCircles[index].x = e.target.x();
          setCircles(updatedCircles);
          setPolygonPoints(circlesToPoints(updatedCircles));
          
        },

        // Movimiento en Cualquier dirección
        /*onDragMove: (e) => {
          const updatedCircles = [...circles];
          updatedCircles[index].x = e.target.x();
          updatedCircles[index].y = e.target.y();
          setCircles(updatedCircles);
          setPolygonPoints(circlesToPoints(updatedCircles));
        },*/
        
      };
    };

    const handlePolygonClick = (e) => {
      onClick();
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
          const point = { x, y, radius: 5, movable: true };
          const updatedCircles = [...circles];
          updatedCircles.splice(i + 1, 0, point);
          setCircles(updatedCircles);
          setPolygonPoints(circlesToPoints(updatedCircles));
          break;
        }
      }
    };

    /*const exportToJson = () => {
      const json = StageRef.current.toJSON();
      console.log(json)
    
    }*/


    return (
          <>
            <Line
              points={polygonPoints}
              stroke="#ff0000"
              strokeWidth={1}
              fillPatternImage={image}
              //onClick={onClick}
              //dragBoundFunc = {onDrag}
              closed
              //tension={0.7}
              onClick = {handlePolygonClick}
            />
            {circles.map((circle, index) => (
              <Circle
                key={index}
                x={circle.x}
                y={circle.y}
                radius={circle.radius}
                stroke="#ff0000"
                strokeWidth={1}
                draggable ={circle.movable}
                dragBoundFunc={(pos) => ({ x: pos.x, y: circle.y })}
                {...addEventToCircle(index)}
              />
            ))}
        </>
    );
  };

export default Polygon;

