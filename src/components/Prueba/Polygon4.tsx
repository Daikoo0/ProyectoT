import { svg } from "leaflet";
import React, { useEffect, useState, useRef } from "react";

const PathComponent = ({ Height }) => {
  const amplitude = 8; // Amplitud de la onda
  const resolution = 1; // Resolución de la onda
  const [svgWidth, setSvgWidth] = useState(0); 
  const svgRef = useRef<SVGSVGElement>(null);

  function generateWavePathData(
    startX,
    startY,
    endX,
    endY,
    totalLength,
    amplitude,
    resolution
  ) {
    const desiredCycles = totalLength / 30;
    const frequency = (2 * Math.PI * desiredCycles) / totalLength;

    const lengthX = endX - startX;
    const steps = lengthX / resolution;
    const stepX = lengthX / steps;
    
    // Comienza la curva en la parte superior
    let pathData = `M ${startX},${startY - amplitude} `;

    // Genera la curva superior
    for (let i = 0; i <= steps; i++) {
      const x = startX + i * stepX;
      const y = (startY - amplitude) + Math.sin((i / steps) * totalLength * frequency) * amplitude;
      pathData += `L ${x},${y} `;
    }

    // Continúa hacia el borde inferior derecho
    pathData += `L ${endX},${endY} `;

    // Genera la curva inferior
    for (let i = steps; i >= 0; i--) {
      const x = startX + i * stepX;
      const y = endY + Math.sin((i / steps) * totalLength * frequency) * amplitude;
      pathData += `L ${x},${y} `;
    }

    // Cierra el path volviendo al inicio
    pathData += `L ${startX},${startY - amplitude} Z`;

    return pathData;
  }

  const [pathData, setPathData] = useState("");

  useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current) {
        setSvgWidth(svgRef.current.clientWidth);
      }
    };

    updateWidth(); // Actualiza el ancho inicialmente

    // Crea un observer para escuchar cambios en el tamaño del SVG
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    if (svgRef.current) {
      resizeObserver.observe(svgRef.current);
    }

    // Limpieza al desmontar el componente
    return () => {
      if (svgRef.current) {
        resizeObserver.unobserve(svgRef.current);
      }
    };
  }, []); 

  useEffect(() => {
    const startX = 0;
    const startY = 0 + amplitude; // Ajusta para la curva superior
    const endX = svgWidth / 2;
    const endY = Height;
    const totalLength = endX - startX;

    const newPathData = generateWavePathData(
      startX,
      startY,
      endX,
      endY,
      totalLength,
      amplitude,
      resolution
    );
    setPathData(newPathData);
  }, [Height,svgWidth]); 

  return (
    <svg ref={svgRef} width="100%" height={Height + 100} overflow='visible'>
      <path d={pathData} fill="blue" stroke="black" strokeWidth="2" />
    </svg> 
  );
};

export default PathComponent;
