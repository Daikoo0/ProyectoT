import { useState, useEffect } from 'react';
import { Line, Circle } from 'react-konva';
import useImage from 'use-image';

const Polygon = ({x1, y1, x2, y2, ColorFill, ColorStroke, File, onClick, onDrag}) => {

    // Puntos Iniciales del Poligono
    const [circles, setCircles] = useState([
        { x: x1, y: y1, radius: 5, movable: false},
        { x: x2, y: y1, radius: 5, movable: false},
        { x: x2, y: y2, radius: 5, movable: false},
        { x: x1, y: y2, radius: 5, movable: false},
      
    ])

    const [svgContent, setSvgContent] = useState('');


    // Modificar esta webada
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
            .replace(/fill='[^']+'/g, "fill='"+ColorFill+"'")
            .replace(/stroke='[^']+'/g, "stroke='"+ColorStroke+"'"); 
            
            
            setSvgContent(manipulatedSvg);
        
        });

    }, [File]);

    // Modficar esta otra webada
    useEffect(() => {
          if(File === 0){
              setSvgContent('');
              return;
          }

          setSvgContent(svgContent
            .replace(/fill='[^']+'/g, "fill='"+ColorFill+"'")
            .replace(/stroke='[^']+'/g, "stroke='"+ColorStroke+"'")); 
              
              

    }, [ColorFill, ColorStroke]);

    const [image] = useImage(File === 0 ? null : "data:image/svg+xml;base64," + window.btoa(svgContent));

    useEffect(() => {
      const deltaX = x1 - circles[0]?.x || 0;
      const deltaY = y1 - circles[0]?.y || 0;
      const updatedCircles = ([
            ...circles.map(circle => ({
                x: circle.x + deltaX,
                y: circle.y + deltaY,
                radius: circle.radius,
                movable: circle.movable,
            })),
        ]);
        setCircles(updatedCircles)
        setPolygonPoints(circlesToPoints(updatedCircles));

    }, [x1, y1, x2, y2]);
  

    // Pasamos las coordenas de los circulos a x, y
    const circlesToPoints = (circles) => {
        return circles.map((circle) => [circle.x, circle.y]).flat();
    };

    const [polygonPoints, setPolygonPoints] = useState(circlesToPoints(circles));

    // Crear puntos en las lineas 
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

    // Todos los eventos de los circulos
    const addEventToCircle = (index) => {
        return {
          ondragMove: (e) => {
            const updatedCircles = [...circles];
            updatedCircles[index].x = e.target.x();
            setCircles(updatedCircles);
            setPolygonPoints(circlesToPoints(updatedCircles));
            
          },
        };
      };

    const minX = 200;
    const maxX = 450;

    const handleSceneFunc = (ctx, shape) => {
          const points = shape.points();
        
          ctx.beginPath();
          ctx.moveTo(points[0], points[1]);
        
          for (let n = 0; n < points.length - 2; n += 2) {
            const currentPoint = { x: points[n], y: points[n + 1] };
            const nextPoint = { x: points[n + 2], y: points[n + 3] };
        
            const controlPoint = {
              x: currentPoint.x + (nextPoint.x - currentPoint.x) / 2,
              y: currentPoint.y + (nextPoint.y - currentPoint.y) / 2,
            };
        
            ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlPoint.x, controlPoint.y);
          }
          ctx.lineTo(points[points.length - 2], points[points.length - 1]);
          ctx.lineTo(points[0], points[1]);
          ctx.strokeShape(shape);
        };
        

    return(
        <>
            <Line
                points={polygonPoints}
                closed
                fillPatternImage={image} 
                strokeWidth={2.5}
                stroke={'black'}
                onClick = {handlePolygonClick}
                sceneFunc={handleSceneFunc}
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
                dragBoundFunc={(pos) => ({ x: Math.max(Math.min(pos.x, maxX), minX), y: circle.y })}
                {...addEventToCircle(index)}
              />
            ))}
        </>
      
    ); 
};

export default Polygon;