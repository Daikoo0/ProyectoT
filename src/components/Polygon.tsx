import { useState, useEffect } from 'react';
import { Line, Circle } from 'react-konva';
import useImage from 'use-image';

const Polygon = ({x1, y1, x2, y2, ColorFill, ColorStroke, Zoom, Rotation, File, circles, setCircles, onClick, onDrag}) => {


    // Puntos del Poligono
    //const [circles, setCircles] = useState(circlesA);

    const [svgContent, setSvgContent] = useState('');

    const circlesToPoints = (circles) => {
      return circles.map((circle) => [circle.x, circle.y]).flat();
    };
    
    const [polygonPoints, setPolygonPoints] = useState(circlesToPoints(circles));

    // Cambio SVG 
    useEffect(() => {
        if(File === 0){
            setSvgContent('');
            return;
        }

        const imageURL = new URL('../assets/'+File+'.svg', import.meta.url).href

        fetch(imageURL)
        .then(response => response.text())
        .then(svgText => {
            
          const lines = svgText.split('\n');
          const updatedLines = lines.map((line) => {
            if (line.includes('<rect') && line.includes('fill=')) {
              return line.replace(/fill='[^']+'/g, `fill='${ColorFill}'`);
            } else if (line.includes('<g') && line.includes('stroke=')) {
              return line.replace(/stroke='[^']+'/g, `stroke='${ColorStroke}'`);
            }
            return line;
          });

          const updatedSvgContent = updatedLines.join('\n');
          setSvgContent(updatedSvgContent);
        
        });

    }, [File]);

    // Cambio Color Con svg Cargado 
    useEffect(() => {
          if(File === 0){
              setSvgContent('');
              return;
          }

          const lines = svgContent.split('\n');
          const updatedLines = lines.map((line) => {
            if (line.includes('<rect') && line.includes('fill=')) {
              return line.replace(/fill='[^']+'/g, `fill='${ColorFill}'`);
            } else if (line.includes('<g') && line.includes('stroke=')) {
              return line.replace(/stroke='[^']+'/g, `stroke='${ColorStroke}'`);
            }
            return line;
            });

          const updatedSvgContent = updatedLines.join('\n');
          setSvgContent(updatedSvgContent);

    }, [ColorFill, ColorStroke]);

    // Cambio SVG Zoom
    useEffect(() => {
     
          if(File === 0){
            setSvgContent('');
            return;
          }

          const lines = svgContent.split('\n');
          const updatedLines = lines.map((line) => {
          if (line.includes('<svg') && line.includes('width=') && line.includes('height=')) {
            return line.replace(/width="[^"]*"/g, `width="${Zoom}"`)
                 .replace(/height="[^"]*"/g, `height="${Zoom}"`);
          }
          return line;
          });
  
          const updatedSvgContent = updatedLines.join('\n');
          setSvgContent(updatedSvgContent);


    }, [Zoom]);

    const [image] = useImage(File === 0 ? null : "data:image/svg+xml;base64," + window.btoa(svgContent));


    //  Traslado del poligono completo 
    useEffect(() => {
     
      const deltaX = x1 - circles[0]?.x || 0;
      const deltaY = y1 - circles[0]?.y || 0;

      const deltaY2 = y2 - circles[circles.length - 1]?.y || 0;
      
      if(deltaY == deltaY2){
     
        const updatedCircles = ([
            ...circles.map(circle => ({
                x: circle.x + deltaX,
                y: circle.y + deltaY,
                radius: circle.radius,
                movable: circle.movable,
            })),
        ]);
       
        setCircles(updatedCircles)
        //setPolygonPoints(circlesToPoints(updatedCircles));

      }else{

        const updatedCircles = [...circles]; 
      
        updatedCircles[updatedCircles.length - 2].y = y2 
        updatedCircles[updatedCircles.length - 1].y = y2 
        console.log(y2)
      
        setCircles(updatedCircles);
     //   setPolygonPoints(circlesToPoints(updatedCircles));
      }

    }, [x1,y1, x2, y2]);

    useEffect(() => {

      setPolygonPoints(circlesToPoints(circles));

    },[circles]);
    
    // Cambio de altura del poligono
    // useEffect(() => {
    //   const deltaY2 = y2 - circles[circles.length - 1]?.y || 0;
    //   console.log('altura y2',deltaY2)
    //   const updatedCircles = [...circles]; 
      
    //   updatedCircles[updatedCircles.length - 2].y = y2 
    //   updatedCircles[updatedCircles.length - 1].y = y2 
     
    //   setCircles(updatedCircles);
    //   setPolygonPoints(circlesToPoints(updatedCircles));
      
    // }, [y2]);
  

    // Pasamos las coordenas de los circulos a x, y
   


    // Crear puntos en las lineas 
    const handlePolygonClick = (e) => {
      onClick();
      const mousePos = e.target.getStage().getPointerPosition();
      const x = mousePos.x;
      const y = mousePos.y;
    
      const updatedCircles = [...circles]; 
      let insertIndex = -1;
    
      for (let i = 0; i < updatedCircles.length - 1; i++) {
        const s_x = updatedCircles[i].x;
        const s_y = updatedCircles[i].y;
        const e_x = updatedCircles[i + 1].x;
        const e_y = updatedCircles[i + 1].y;
    
        if (
          ((s_x <= x && x <= e_x) || (e_x <= x && x <= s_x)) &&
          ((s_y <= y && y <= e_y) || (e_y <= y && y <= s_y))
        ) {
          insertIndex = i + 1;
          break;
        }
      }
    
      if (insertIndex !== -1) {
        const point = { x, y, radius: 5, movable: true };
        updatedCircles.splice(insertIndex, 0, point);
    
        setCircles(updatedCircles);
        setPolygonPoints(circlesToPoints(updatedCircles));
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

    // const handleSceneFunc = (ctx, shape) => {
    //       const points = shape.points();
    //       ctx.beginPath();
    //       ctx.moveTo(points[0], points[1]);

    //       for (let n = 0; n < points.length - 2; n += 2) {
    //         const currentPoint = { x: points[n], y: points[n + 1] };
    //         const nextPoint = { x: points[n + 2], y: points[n + 3] };
        
    //         const controlPoint = {
    //           x: currentPoint.x + (nextPoint.x - currentPoint.x) / 2,
    //           y: currentPoint.y + (nextPoint.y - currentPoint.y) / 2,
    //         };
        
    //         ctx.quadraticCurveTo(currentPoint.x, currentPoint.y , controlPoint.x, controlPoint.y );
    //       }
    //       ctx.lineTo(points[points.length - 2], points[points.length - 1]);
    //       ctx.lineTo(points[0], points[1]);
    
    //       if(image){
    //           ctx.fillStyle = ctx.createPattern(image, 'repeat');
              
    //           const radians = (Rotation * Math.PI) / 180;
          
    //           ctx.rotate(radians);

    //       }else{
    //           ctx.fillStyle = 'white';
    //       }
         
    //       ctx.fill();
    //       ctx.strokeShape(shape);
          
    //     };

        const handleSceneFunc = (ctx, shape) => {
          const tension = 1;
          const points = shape.points();
          ctx.beginPath();
          ctx.moveTo(points[0], points[1]);
          ctx.lineTo(points[2], points[3]);
        
          for (let n = 0; n < points.length - 2; n += 2) {
              const prevPoint = { x: points[n - 2], y: points[n - 1] };
              const currentPoint = { x: points[n], y: points[n + 1] };
              const nextPoint = { x: points[n + 2], y: points[n + 3] };
              const afterNextPoint = { x: points[n + 4], y: points[n + 5] };
          
              const cp1x = currentPoint.x + ((nextPoint.x - prevPoint.x) / 6) * tension;
              const cp1y = currentPoint.y + ((nextPoint.y - prevPoint.y) / 6) * tension;
          
              const cp2x = nextPoint.x - ((afterNextPoint.x - currentPoint.x) / 6) * tension;
              const cp2y = nextPoint.y - ((afterNextPoint.y - currentPoint.y) / 6) * tension;
              
              ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextPoint.x, nextPoint.y);
          }
      
          ctx.lineTo(points[points.length - 2], points[points.length - 1]);
          ctx.lineTo(points[0], points[1]);
          ctx.fill();
          ctx.strokeShape(shape);

          if(image){
            ctx.fillStyle = ctx.createPattern(image, 'repeat');
              
            const radians = (Rotation * Math.PI) / 180;
          
            ctx.rotate(radians);

          }else{
            ctx.fillStyle = 'white';
          }
         
          ctx.fill();
          ctx.strokeShape(shape);
            
        };
        

    return(
        <>
            <Line
                points={polygonPoints}
                closed
                strokeWidth={2.5}
                stroke={'black'}
                //fillPatternImage={image}
                //fillPatternRotation={Rotation}
                onClick = {handlePolygonClick}
                sceneFunc={handleSceneFunc}
            />
            {circles.map((circle, index) => (
              <Circle
              //  key={index}
                key={`circle-${index}`}
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