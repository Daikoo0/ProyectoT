import { useEffect, useState, useMemo } from "react";
import contacts from '../../contacts.json';

const PathComponent = ({ isInverted, rowIndex, Height, Width, File, ColorFill, ColorStroke, Zoom, circles, addCircles, openModalPoint, setSideBarState, handleClickRow, tension, rotation, contact, prevContact }) => {

  const amplitude = 4;
  const resolution = 1;
 
  function generateWavePathData(
    startX,
    startY,
    endX,
    totalLength,
    amplitude,
    resolution,
    points
  ) {
    const frequency = 0.3
    const lengthX = endX - startX;
    const steps = lengthX / resolution;
    const stepX = lengthX / steps;
    const len = points.length;

    // Comienza la curva en la parte superior
    let pathData = `M ${points[0].x},${points[0].y}`;
    let pathDataClick = `M ${points[1].x},${points[1].y}`;
    let pathUpperCurve = `M ${points[0].x},${points[0].y}`;
    let pathLowerCurve = `M ${points[points.length - 2].x},${points[points.length - 2].y}`;

    // Genera la curva superior

    if (contacts[prevContact]?.arcs) {
      const startY = 0 + amplitude; // Establecer la altura inicial para comenzar desde la mitad hacia arriba
      for (let i = 0; i <= steps; i++) {
        const x = (startX + i * stepX) || 0;
        if (x >= points[1].x) break;
        // Ajustar la fase de la función seno para comenzar desde la mitad hacia arriba
        const y = ((startY - amplitude) + Math.sin(((i + steps / 2) / steps) * totalLength * frequency) * amplitude) || 0;
        pathData += `L ${x},${y} `;
        pathUpperCurve += `L ${x},${y} `;
      }
    } else {
      pathData += `L ${points[1].x},${points[1].y} `;
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
    if (contacts[contact].arcs) {
      for (let i = steps; i >= 0; i--) {
        const x = (startX + i * stepX) || 0;
        // Ajustar la fase de la función seno para comenzar desde la mitad hacia arriba
        const y = (Height + Math.sin(((i + steps / 2) / steps) * totalLength * frequency) * amplitude) || 0;
        if (x <= points[len - 2].x) {
          pathData += `L ${x},${y} `;
          pathLowerCurve += `L ${x},${y} `;
        }
      }
    } else {
      pathData += `L ${points[len - 1].x},${points[len - 1].y} `;
    }


    // Cierra el path volviendo al inicio
    pathData += `L ${startX},${startY - amplitude} Z`;

    return [pathData, pathDataClick, pathLowerCurve, pathUpperCurve];
  }

  const points = useMemo(() => {
    const processCircles = (circles, Width, Height) => {
      return circles.map(circle => ({
        ...circle,
        x: circle.X * Width,
        y: circle.Y * Height
      }));
    };

    return processCircles(circles, Width, Height);
  }, [circles, Width, Height]);

  //console.log(points)

  const startX = 0;
  const startY = 0 + amplitude;
  const endX = Width;
  const totalLength = endX - startX;

  const [pathData, pathDataClick, pathUpperCurve, pathLowerCurve] = generateWavePathData(
    startX,
    startY,
    endX,
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
    <svg width={Width} height={Height} 
    overflow='visible'
      style={{
        transform: isInverted ? "scaleY(-1)" : "none",
        transformOrigin: "center",
        opacity : "0.99"
      }}
    >

      {/* Patrón SVG */}
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width={Zoom} height={Zoom} patternTransform={`rotate(${rotation})`} >
          <g dangerouslySetInnerHTML={{ __html: svgContent }} />
        </pattern>
      </defs>

      {/* Polygon Path */}
      <path d={pathData}
        fill={`url(#${patternId})`}
        className="stroke-current text-base-content"
        strokeWidth="0.8"
        onClick={() => {
          handleClickRow(rowIndex, 'Litologia')
          setSideBarState({
            sideBar: true,
            sideBarMode: "polygon"
          })
        }}
      />

      {File === 0 && (
        <>
          <line
            x1={0}
            y1={0}
            x2={points[points.length - 2].x}
            y2={points[points.length - 2].y}
            className="stroke-current text-base-content"
            strokeWidth={1}
            stroke="black"
          />

          <line
            x1={points[1].x}
            y1={0}
            x2={points[points.length - 1].x}
            y2={points[points.length - 1].y}
            className="stroke-current text-base-content"
            strokeWidth={1}
            stroke="black"
          />
        </>
      )}


      <line x1="0" y1={Height} x2={points[points.length - 2].x} y2={Height} className={ColorFill !== "#ffffff" ? `` : "stroke-base-100"} strokeWidth={2} />

      {(!contacts[contact].arcs && contacts[contact].lineWidth2) ? (
        <>
          <line x1="0" y1={Height} x2={points[1].x} y2={Height} className={ColorFill === "#ffffff" ? "stroke-base-100" : `stroke-bg-${ColorFill}`} strokeWidth={0.5} />
        </>
      ) : (
        <>
        </>
      )}

      {contacts[contact].arcs ?
        <>
          <path className="pa" d={pathUpperCurve}
            stroke="black"
            fill="transparent"
            strokeWidth="1"
          />
        </> : <></>}

      {contacts[prevContact].arcs ?
        <>
          <path className="pa" d={pathLowerCurve}
            fill="transparent"
            stroke="black"
            strokeWidth="1"
          />
        </> : <></>}


      {contacts[contact].dash && !contacts[contact].dash2 ?
        <>
          <line className="pa" x1="0" y1={Height} x2={points[points.length - 2].x} y2={Height} stroke="black" strokeWidth={contacts[contact].lineWidth} strokeDasharray={eval(contacts[contact].dash)} />
        </> : <></>}

      {contacts[prevContact].dash && !contacts[prevContact].dash2 && prevContact !== "119" && prevContact !== "1110" ?
        <>
          <line className="pa" x1="0" y1={points[1].y} x2={points[1].x} y2={points[1].y} stroke="black" strokeWidth={contacts[prevContact].lineWidth} strokeDasharray={contacts[prevContact].dash} />
        </> : <></>}


      {contacts[contact].dash2 ?
        <>
          <line className="pa" x1="0" y1={Height} x2={points[points.length - 2].x} y2={Height} stroke="black" strokeWidth={contacts[contact].lineWidth2} strokeDasharray={contacts[contact].dash2} />
          <line className="pa" x1="0" y1={Height - 5} x2={points[points.length - 2].x} y2={Height - 5} stroke="black" strokeWidth={contacts[contact].lineWidth} strokeDasharray={contacts[contact].dash} />
        </> : <></>}

      {/* Line Click */}
      <path className="pa" d={pathDataClick}
        fill="none"
        stroke="transparent"
        strokeWidth="4"
        //pointerEvents='stroke' 
        onClick={(e) => handlePathClick(e)}
      />

      {contacts[contact].question ? <>
        <text x={(points[points.length - 2].x + points[points.length - 1].x) / 2} y={Height} fontSize="30" fontWeight={700} overflow={'visible'} fill="black"
        // style={{transformOrigin: "center"}}
        transform={isInverted? `scale(-1, 1) translate(-${Width/2},20)`:""}
            >{isInverted? "¿" : "?"}  </text>
      </> : <></>
      }

      {/* Círculos */}
      {points.map((points, index) => (
        <circle
          key={index}
          cx={points.x}
          cy={points.y}
          r={6}
          opacity={0.4}
          fill={points.Movable ? 'purple' : 'transparent'}
          onClick={() => {
            if (points.Movable) {
              //(document.getElementById('modalPoint') as HTMLDialogElement).showModal();
              openModalPoint(rowIndex, index, circles[index].X, circles[index].Name);
            }
          }}
        />
      ))}
    </svg>
  );
};

export default PathComponent;
