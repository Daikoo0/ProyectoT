import { useEffect, useState, useMemo } from "react";

const PathComponent = ({rowIndex, Height, Width, File, ColorFill, ColorStroke, Zoom, circles, addCircles, openModalPoint, setSideBarState, handleClickRow, tension, rotation }) => {

  const amplitude = 4;
  const resolution = 1;

  function generateWavePathData(
    startX,
    startY,
    endX,
    endY,
    totalLength,
    amplitude,
    resolution,
    points
  ) {
    const frequency = 0.3;

    const lengthX = endX - startX;
    const steps = lengthX / resolution;
    const stepX = lengthX / steps;
    const len = points.length;

    // Comienza la curva en la parte superior
    let pathData = `M ${points[0].x},${points[0].y}`;
    let pathDataClick = `M ${points[1].x},${points[1].y}`;

    // Genera la curva superior
    for (let i = 0; i <= steps; i++) {
      const x = (startX + i * stepX) || 0;
      if (x >= points[1].x) break;
      const y = ((startY - amplitude) + Math.sin((i / steps) * totalLength * frequency) * amplitude) || 0;
      pathData += `L ${x},${y} `;
    }

    //let pathData += `M ${points[0].x},${points[0].y} `; // Comienza el path en el primer punto


    for (let n = 1; n < points.length - 1; n++) {
      // Asegurarse de que existan todos los puntos necesarios para calcular los puntos de control
      if (n > 0 && n < points.length - 2) {
        const prevPoint = points[n - 1];
        const currentPoint = points[n];
        const nextPoint = points[n + 1];
        const afterNextPoint = points[n + 2];

        const cp1x = currentPoint.x + ((nextPoint.x - prevPoint.x) / 6) * tension;
        const cp1y = currentPoint.y + ((nextPoint.y - prevPoint.y) / 6) * tension;

        const cp2x = nextPoint.x - ((afterNextPoint.x - currentPoint.x) / 6) * tension;
        const cp2y = nextPoint.y - ((afterNextPoint.y - currentPoint.y) / 6) * tension;

        pathData += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${nextPoint.x},${nextPoint.y} `;
        pathDataClick += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${nextPoint.x},${nextPoint.y} `;
      }
    }


    // Genera la curva inferior
    for (let i = steps; i >= 0; i--) {

      const x = (startX + i * stepX) || 0;
      const y = (endY + Math.sin((i / steps) * totalLength * frequency) * amplitude) || 0;
      if (x <= points[len - 2].x) {
        pathData += `L ${x},${y} `;
      }
    }

    // Cierra el path volviendo al inicio
    pathData += `L ${startX},${startY - amplitude} Z`;

    return [pathData, pathDataClick];
  }

  const points = useMemo(() => {
    const processCircles = (circles, Width, Height) => {
      return circles.map(circle => ({
        ...circle,
        x: circle.x * Width,
        y: circle.y * Height
      }));
    };

    return processCircles(circles, Width, Height);
  }, [circles, Width, Height]);

  //console.log(points)

  const startX = 0;
  const startY = 0 + amplitude;
  const endX = Width;
  const endY = Height;
  const totalLength = endX - startX;


  const [pathData, pathDataClick] = generateWavePathData(
    startX,
    startY,
    endX,
    endY,
    totalLength,
    amplitude,
    resolution,
    points
  );

  const [svgContent, setSvgContent] = useState('');
  

  useEffect(() => {
    if (File === 0) {
      setSvgContent('');
      return;
    }
  
    const loadImage = async () => {
      const imageURL = new URL(`../../assets/patrones/${File}.svg`, import.meta.url).href;
      const response = await fetch(imageURL);
      const svgText = await response.text();
      console.log("cargo svg");
      updateSvgContent(svgText);
    };
  
    loadImage();
  }, [File]); 
  
  useEffect(() => {
   
    if (svgContent && File !== 0) {
      updateSvgContent(svgContent);
    }
  }, [ColorFill, ColorStroke, Zoom]); 
  
  const updateSvgContent = (svgText) => {
    let updatedSvg = svgText;
    updatedSvg = updateSvg(updatedSvg, ColorFill, ColorStroke, Zoom);
    setSvgContent(updatedSvg);
  };

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

  const handlePathClick = (e) => {
    //console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

    //const Mx = e.nativeEvent.offsetX;
    const My = e.nativeEvent.offsetY;

    const updatedCircles = [...points];
    let insertIndex = -1;

    for (let i = 1; i < updatedCircles.length - 2; i++) {
      const start_y = updatedCircles[i].y;
      const end_y = updatedCircles[i + 1].y;

      if ((start_y <= My && My <= end_y) || (end_y <= My && My <= start_y)) {
        insertIndex = i + 1;
        break;
      }
    }

    if (insertIndex !== -1) {
      
      const originalY = (My) / Height;
      //const point = { x: 0.5, y: originalY, radius: 5, movable: true };
      addCircles(rowIndex, insertIndex, originalY)
    
    }

  };


  const patternId = `pattern-${rowIndex}`;

  return (
    <svg width="100%" height={Height} overflow='visible'>

      {/* Patrón SVG */}
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width={Zoom} height={Zoom} patternTransform={`rotate(${rotation})`} >
          <g dangerouslySetInnerHTML={{ __html: svgContent }} />
        </pattern>
      </defs>

      {/* Polygon Path */}
      <path d={pathData}
        fill={`url(#${patternId})`}
        stroke="black"
        strokeWidth="1.5"
        onClick={() => {
          handleClickRow(rowIndex, 'Litologia')
          setSideBarState({
            sideBar: true,
            sideBarMode: "polygon"
          })
        }}
      />

      {/* Line Click */}
      <path d={pathDataClick}
        fill="none"
        stroke="transparent"
        strokeWidth="4"
        //pointerEvents='stroke' 
        onClick={(e) => handlePathClick(e)}
      />

      {/* Círculos */}
      {points.map((points, index) => (
        <circle
          key={index}
          cx={points.x}
          cy={points.y}
          r={6}
          fill={points.movable ? 'purple' : 'blue'}
          onClick={() => {
            if (points.movable) {
                //(document.getElementById('modalPoint') as HTMLDialogElement).showModal();
                openModalPoint(rowIndex, index, circles[index].x, circles[index].name);
            }
        }}
        />
      ))}
    </svg>
  );
};

export default PathComponent;
