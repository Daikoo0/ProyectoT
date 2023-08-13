//import { useRef } from 'react';
import { Rect } from 'react-konva';
import { useState, useEffect } from 'react';
import useImage from 'use-image';

const ShapeComponent = ({ x, y, ColorFill, ColorStroke, onClick }) => {
    //const shapeRef = useRef<any>(null);
    const imageURL = new URL(`../assets/pattern.svg`, import.meta.url).href
    
  
    const [svgContent, setSvgContent] = useState('');

    useEffect(() => {

        fetch(imageURL)
        .then(response => response.text())
        .then(svgText => {
            
            const manipulatedSvg = svgText
            .replace(/stroke='[^']+'/g, "stroke='"+ColorStroke+"'") // Cambia el color del stroke
            .replace(/fill='[^']+'/g, "fill='"+ColorFill+"'"); // Cambia el color del fill
            
            setSvgContent(manipulatedSvg);
        
        });

    }, []);

    useEffect(() => {

        setSvgContent(svgContent
            .replace(/stroke='[^']+'/g, "stroke='"+ColorStroke+"'") // Cambia el color del stroke
            .replace(/fill='[^']+'/g, "fill='"+ColorFill+"'")); // Cambia el color del fill
            
           

    }, [ColorFill, ColorStroke]);

    const [image] = useImage("data:image/svg+xml;base64," + window.btoa(svgContent));
 
    return (
        <Rect
          x={x}
          y={y}
          width={50}
          height={50}
          //fill={ColorFill}
          //stroke={ColorStroke}
          fillPatternImage={image}
          shadowBlur={5}
          onClick={onClick}
          draggable
        />
      );
    };

export default ShapeComponent;
