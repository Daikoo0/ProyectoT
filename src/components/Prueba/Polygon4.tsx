import  { useEffect, useState, useRef } from "react";

const PathComponent = ({ Height, File, ColorFill, ColorStroke, Zoom }) => {
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
      const x = (startX + i * stepX) || 0;
      const y = ((startY - amplitude) + Math.sin((i / steps) * totalLength * frequency) * amplitude) || 0;
      pathData += `L ${x},${y} `;
    }

    // Continúa hacia el borde inferior derecho
    pathData += `L ${endX},${endY} `;

    // Genera la curva inferior
    for (let i = steps; i >= 0; i--) {
      const x = (startX + i * stepX) || 0;
      const y = (endY + Math.sin((i / steps) * totalLength * frequency) * amplitude) || 0;
      pathData += `L ${x},${y} `;
    }

    // Cierra el path volviendo al inicio
    pathData += `L ${startX},${startY - amplitude} Z`;

    return pathData;
  }

  //const [pathData, setPathData] = useState("");

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

  
  const startX = 0;
  const startY = 0 + amplitude;
  const endX = svgWidth / 2;
  const endY = Height;
  const totalLength = endX - startX;


  const pathData = generateWavePathData(
    startX,
    startY,
    endX,
    endY,
    totalLength,
    amplitude,
    resolution
  );
  // useEffect(() => {
  //   const startX = 0;
  //   const startY = 0 + amplitude; // Ajusta para la curva superior
  //   const endX = svgWidth / 2;
  //   const endY = Height;
  //   const totalLength = endX - startX;

  //   const newPathData = generateWavePathData(
  //     startX,
  //     startY,
  //     endX,
  //     endY,
  //     totalLength,
  //     amplitude,
  //     resolution
  //   );
  //   setPathData(newPathData);
  // }, [Height,svgWidth]); 

  const [svgContent, setSvgContent] = useState('');

 
  useEffect(() => {
    if (File === 0) {
        setSvgContent('');
        return;
    }

    // Función para cargar y actualizar el contenido SVG inicial
    const updateSvgContent = (svgText) => {
        let updatedSvg = svgText;
        updatedSvg = updateSvg(updatedSvg, ColorFill, ColorStroke, Zoom);
        setSvgContent(updatedSvg);
    };

    // Si el SVG no está cargado, lo carga
    if (!svgContent) {
        const imageURL = new URL(`../../assets/patrones/${File}.svg`, import.meta.url).href;
        fetch(imageURL)
            .then(response => response.text())
            .then(updateSvgContent);
    } else {
        // Si el SVG ya está cargado, solo actualiza los colores o el zoom
        let updatedSvg = svgContent;
        updatedSvg = updateSvg(updatedSvg, ColorFill, ColorStroke, Zoom);
        setSvgContent(updatedSvg);
    }


}, [File, ColorFill, ColorStroke, Zoom]);

function updateSvg(svgText, colorFill, colorStroke, zoom) {
    // Actualizar colores de relleno y trazo
    let updatedSvg = svgText.replace(/<rect[^>]+fill='[^']+'/g, (match) => {
        return match.replace(/fill='[^']+'/g, `fill='${colorFill}'`);
    }).replace(/<g[^>]+stroke='[^']+'/g, (match) => {
        return match.replace(/stroke='[^']+'/g, `stroke='${colorStroke}'`);
    });

    // Actualizar dimensiones para el zoom si es necesario
    if (zoom) {
        updatedSvg = updatedSvg.replace(/<svg[^>]+/g, (match) => {
            return match.replace(/width="[^"]*"/g, `width="${zoom}"`)
                .replace(/height="[^"]*"/g, `height="${zoom}"`);
        });
    }

    return updatedSvg;
}

const handlePathClick = () => {
  console.log('Se ha hecho click en el path');
};


  const patternId = `pattern-${File}`;

  return (
    <svg ref={svgRef} width="100%" height={Height} overflow='visible'>
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse"  width={Zoom} height={Zoom}>
          <g dangerouslySetInnerHTML={{ __html: svgContent }} />
        </pattern>
      </defs>
      <path d={pathData} 
            fill={`url(#${patternId})`} 
            stroke="black" 
            strokeWidth="1.5"
            pointerEvents = 'stroke' // Detecta eventos de click solo en la línea del path
            onClick={handlePathClick} />
    </svg> 
  );
};

export default PathComponent;
