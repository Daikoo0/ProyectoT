import { useEffect, useState, useMemo } from "react";
import { atSideBarState } from "../../state/atomEditor";
import { useSetRecoilState } from "recoil";
import contacts from '../../contacts.json';
import { Circles } from "./types";

interface LithologyProps {
  isInverted: boolean;
  rowIndex: number;
  Height: number;
  Width: number;
  File: number;
  ColorFill: string;
  ColorStroke: string;
  Zoom: number;
  circles: Circles[];
  addCircles: (rowIndex: number, insertIndex: number, point: number) => void;
  openModalPoint: (index, insertIndex, x, name) => void;
  handleClickRow: (rowIndex: number, entityType: string) => void;
  tension: number;
  rotation: number;
  contact: string;
  prevContact: string;
  zindex: number;

}


const Lithology: React.FC<LithologyProps> = ({ isInverted, rowIndex, Height, Width, File, ColorFill, ColorStroke, Zoom, circles, addCircles, openModalPoint, handleClickRow, tension, rotation, contact, prevContact, zindex }) => {

  const amplitude = 4;
  const resolution = 1;

  const setAtSideBar = useSetRecoilState(atSideBarState);

  const functionContact = (startXX, endXX, endYY, contact, up) => {
    var maxWidth = up ? (startXX - endXX) : (endXX - startXX); // ancho disponible
    var patternWidth = contacts[contact].width;
    var numCurves = Math.floor(maxWidth / patternWidth); // número de curvas que caben
    var totalCurvesWidth = numCurves * patternWidth;
    var spaceLeft = maxWidth - totalCurvesWidth;
    const path = up ? contacts[contact]?.invertedPath : contacts[contact].path
    var newPathData = ""
    let maxValidValue = 0;
    var startIndex = 0;

    if (contact === "95" || contact === "106" || contact === "85") {
      if (up) {
        let scaledPath = "";
        let scaleFactor = maxWidth / patternWidth;

        for (let j = 0; j < path?.length; j++) {
          const partes = path[j].match(/[LC]|\-?\d+/g);
          const tipo = partes[0]; // "L" o "C"
          let newSegment = "";
          if (tipo === "L") {
            const numero1 = (parseFloat(partes[1]) * scaleFactor);
            const numero2 = parseFloat(partes[2]) + Height;
            newSegment = `L ${numero1} ${numero2}`;
          } else if (tipo === "C") {
            const numero1 = (parseFloat(partes[1]) * scaleFactor);
            const numero2 = parseInt(partes[2]) + Height;
            const numero3 = (parseFloat(partes[3]) * scaleFactor);
            const numero4 = parseFloat(partes[4]) + Height;
            const numero5 = (parseFloat(partes[5]) * scaleFactor);
            const numero6 = parseFloat(partes[6]) + Height;
            newSegment = `C ${numero1} ${numero2} ${numero3} ${numero4} ${numero5} ${numero6}`;
          } else {
            newSegment = path[j];
          }
          newPathData += `${newSegment} `;
        }
        newPathData += scaledPath;
      }

    } else {
      if (up) {
        for (let i = 0; i < path?.length; i++) {
          const partes = path[i].match(/[LC]|\-?\d+/g);
          const tipo = partes[0];
          var value = 0;
          if (tipo === "L") {
            value = parseFloat(partes[1]);
          } else if (tipo === "C") {
            value = Math.min(parseFloat(partes[5]), parseFloat(partes[3]), parseFloat(partes[1]));
          }

          if (value < spaceLeft && value >= maxValidValue) {
            maxValidValue = value;
            startIndex = i;
            break;
          }
        }

        // console.log(maxValidValue,spaceLeft)

        //        newPathData += `L ${startXX-maxValidValue} ${Height}`

        for (let i = (startIndex + 1); i < path?.length - (contact === "104" ? 2 : 0); i++) {
          const partes = path[i].match(/[LC]|\-?\d+/g);
          const tipo = partes[0];
          let newSegment = "";
          if (i === startIndex) {
            newSegment += `L ${partes[1]} ${partes[2]}`
          }
          if (tipo === "L") {
            const numero1 = (parseFloat(partes[1]) + (startXX - maxValidValue));
            const numero2 = parseFloat(partes[2]) + Height;
            newSegment = `L ${numero1} ${numero2}`;
          } else if (tipo === "C") {
            // Sumamos curveStartX al primer, tercer y sexto número de "C"
            const numero1 = (parseFloat(partes[1]) + (startXX - maxValidValue));
            const numero2 = parseInt(partes[2]) + Height;
            const numero3 = (parseFloat(partes[3]) + (startXX - maxValidValue));
            const numero4 = parseFloat(partes[4]) + Height;
            const numero5 = (parseFloat(partes[5]) + (startXX - maxValidValue));
            const numero6 = parseFloat(partes[6]) + Height;
            newSegment = `C ${numero1} ${numero2} ${numero3} ${numero4} ${numero5} ${numero6}`;
          } else {
            newSegment = path[i];
          }
          newPathData += `${newSegment} `;
        }
      }

      for (let i = 0; i < numCurves; i++) {
        const curveStartX = up ? ((startXX - spaceLeft) - ((i + 1) * patternWidth)) : (startXX + ((i) * patternWidth));
        // newPathData += `L ${curveStartX} ${startYY} `
        for (let j = 0; j < path?.length; j++) {
          const partes = path[j].match(/[LC]|\-?\d+/g);
          const tipo = partes[0]; // "L" o "C"
          let newSegment = "";
          if (tipo === "L") {
            // Sumamos curveStartX al primer número de "L"
            const numero1 = (parseFloat(partes[1]) + curveStartX);
            const numero2 = parseFloat(partes[2]) + (up ? Height : 0);
            newSegment = `L ${numero1} ${numero2}`;
          } else if (tipo === "C") {
            // Sumamos curveStartX al primer, tercer y sexto número de "C"
            const numero1 = (parseFloat(partes[1]) + curveStartX);
            const numero2 = parseInt(partes[2]) + (up ? Height : 0);
            const numero3 = (parseFloat(partes[3]) + curveStartX);
            const numero4 = parseFloat(partes[4]) + (up ? Height : 0);
            const numero5 = (parseFloat(partes[5]) + curveStartX);
            const numero6 = parseFloat(partes[6]) + (up ? Height : 0);
            newSegment = `C ${numero1} ${numero2} ${numero3} ${numero4} ${numero5} ${numero6}`;
          } else {
            // Si no coincide, devolvemos el segmento sin modificaciones.
            newSegment = path[j];
          }
          // Añadimos el segmento modificado a newPathData
          newPathData += `${newSegment} `;
        }

      }

      if (!up) {
        for (let i = 0; i < path?.length; i++) {
          const partes = path[i].match(/[LC]|\-?\d+/g);
          const tipo = partes[0];
          var value = 0;
          if (tipo === "L") {
            value = parseFloat(partes[1]); // tomar la parte [1] de "L"
          } else if (tipo === "C") {
            value = parseFloat(partes[5]); // tomar la parte [5] de "C"
          }
          if (value <= spaceLeft && value >= maxValidValue) {
            //   maxValidValue = value;
            startIndex = i;
            break;
          }
        }

        for (let i = 0; i < (startIndex + 1); i++) {
          //  newPathData += path[i]; // Concatenamos cada string
          const partes = path[i].match(/[LC]|\-?\d+/g);
          const tipo = partes[0]; // "L" o "C"
          let newSegment = "";
          if (tipo === "L") {
            // Sumamos curveStartX al primer número de "L"
            const numero1 = (parseFloat(partes[1]) + (totalCurvesWidth));
            const numero2 = parseFloat(partes[2]);
            newSegment = `L ${numero1} ${numero2}`;
          } else if (tipo === "C") {
            // Sumamos curveStartX al primer, tercer y sexto número de "C"
            const numero1 = (parseFloat(partes[1]) + (totalCurvesWidth));
            const numero3 = (parseFloat(partes[3]) + (totalCurvesWidth));
            const numero5 = (parseFloat(partes[5]) + (totalCurvesWidth));
            newSegment = `C ${numero1} ${partes[2]} ${numero3} ${partes[4]} ${numero5} ${partes[6]}`;
          } else {
            // Si no coincide, devolvemos el segmento sin modificaciones.
            newSegment = path[i];
          }
          // Añadimos el segmento modificado a newPathData
          newPathData += `${newSegment} `;
        }
      }
    }
    newPathData += ` L ${endXX} ${endYY} `;
    return newPathData;
  }

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
    } else if (contacts[prevContact]?.new) {

      const startXX = points[0].x; // coordenada X del primer punto
      const endXX = points[1].x; // coordenada X del último punto
      const endYY = points[1].y; // coordenada Y del último punto
      pathData += functionContact(startXX, endXX, endYY, prevContact, false);

      // const startYY = points[0].y; // coordenada Y del primer punto
      // const startXX = points[0].x; // coordenada X del primer punto
      // const endXX = points[1].x; // coordenada X del último punto
      // const endYY = points[1].y; // coordenada Y del último punto

      // var maxWidth = endXX - startXX; // ancho disponible
      // var curveWidth = 20; // ancho que ocupa cada curva
      // var numCurves = Math.floor(maxWidth / curveWidth); // número de curvas que caben

      // var totalCurvesWidth = numCurves * curveWidth;
      // var spaceLeft = maxWidth - totalCurvesWidth;

      // const numbersToRepeat = [5, 20]; // Números a repetir
      // var resultArray = [];

      // for (let i = 0; i < numCurves; i++) {
      //   resultArray.push(numbersToRepeat[i % numbersToRepeat.length]);
      // }

      // // Iniciar el pathData desde startXX y startYY
      // pathData += `M ${startXX} ${startYY} `;

      // // Dibujar las curvas hacia la derecha
      // for (let i = 0; i < numCurves; i++) {
      //   const curveStartX = (startXX + 1) + (i * curveWidth); // Posición de inicio de cada curva

      //   pathData += `
      //         L ${curveStartX} ${startYY}
      //         C ${curveStartX + 9} ${startYY} ${curveStartX} ${startYY + resultArray[i]} ${curveStartX + 9} ${startYY + resultArray[i]}
      //         C ${curveStartX + 20} ${startYY + resultArray[i]} ${curveStartX + 9} ${startYY} ${curveStartX + 20} ${startYY}
      //     `;
      // }

      // pathData += ` L ${endXX} ${endYY}`;

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
    } else if (contacts[contact]?.new) {

      const startXX = points[len - 2].x; // coordenada X del primer punto
      const endXX = points[len - 1].x; // coordenada X del último punto
      const endYY = points[len - 1].y; // coordenada Y del último punto
      pathData += functionContact(startXX, endXX, endYY, contact, true);

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
    <svg width={Width} height={Height} opacity={0.99} id={File.toString()} //id={`svg-${rowIndex}`}
      overflow='visible'
      className={`relative z-[${zindex}]`}
    // style={{
    //   transform: isInverted ? "scaleY(-1)" : "none",
    // }}
    >

      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width={Zoom} height={Zoom} patternTransform={`rotate(${rotation})`}  >
          <g dangerouslySetInnerHTML={{ __html: svgContent }} />
        </pattern>
      </defs>

      <path d={pathData}
        fill={File > 1 ? `url(#${patternId})` : "white"}
        //  fill="transparent"
        className="stroke-current text-base-content cursor-pointer"
        //className="stroke-base-content"-
        strokeWidth="0.8"
        onClick={() => {
          handleClickRow(rowIndex, 'Litologia')
          setAtSideBar({
            isOpen: true,
            entityType: "lithology", actionType: "edit"
          })
        }}
      />

      {File === 1 && (
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


      {/* <line x1="0" y1={Height} x2={points[points.length - 2].x} y2={Height} className={ColorFill !== "#ffffff" ? `` : "stroke-base-100"} strokeWidth={2} /> */}

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
          transform={isInverted ? `scale(-1, 1) translate(-${Width / 2},20)` : ""}
        >{isInverted ? "¿" : "?"}  </text>
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
              openModalPoint(rowIndex, index, circles[index].X, circles[index].Name);
            }
          }}
          className="no-print"
        />
      ))}


    </svg>


  );
};

export default Lithology;
