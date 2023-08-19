//import { useRef } from 'react';
import { Rect } from 'react-konva';
import { useRef,useState, useEffect } from 'react';
import useImage from 'use-image';

const ShapeComponent = ({ x, y, ColorFill, ColorStroke, File, onClick, onDrag }) => {
    
    const shapeRef = useRef(null);

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
 
 

    return (
        <>
        <Rect
            ref={shapeRef}
            x={x}
            y={y}
            width={500}
            height={400}
            //fill={ColorFill}
            stroke={'black'}
            fillPatternImage={image}
            onClick={onClick}
            dragBoundFunc = {onDrag}
            draggable 
        />
        </>
      );
    };

export default ShapeComponent;
