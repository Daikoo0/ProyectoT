import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect, Image, Group, Text, Line } from 'react-konva';
import { Html } from "react-konva-utils";
import { useParams } from 'react-router-dom';
//import ShapeComponent from './shape';
//import Konva from './konva';
import Json from '../../lithologic.json';
import Polygon from './Polygon';
import Grid from './Grids';
//import './Editor.css';
import useImage from 'use-image';
import fosilJson from '../../fossil.json';
import SelectTheme from '../Web/SelectTheme';
import Fosil from './Fosil';

const VerticalRuler = ({ x, y, height, unit, scale }) => {
  // El número total de marcas basado en la altura y la unidad de cada marca
  const numberOfMarks = height / unit;

  const marks = [];
  for (let i = 0; i <= numberOfMarks; i++) {
    const yPos = i * unit;
    const isMajorMark = i % scale === 0;

    marks.push(
      <Line
        key={`mark-${i}`}
        points={[x, y + yPos, x - (isMajorMark ? 20 : 10), y + yPos]}
        stroke="black"
      />
    );

    if (isMajorMark) {

      const realValueLabel = i * unit / scale;

      marks.push(
        <Text
          key={`label-${i}`}
          x={x - 50}
          y={y + yPos - 5}
          text={`${realValueLabel}`}
          fontSize={15}
        />
      );
    }
  }

  return (
    <Group>
      <Line points={[x, y, x, y + height]} stroke="black" strokeWidth={2} />
      {marks}
    </Group>
  );
};

const CoordinateInputs: React.FC = () => {
  //---------------// Regla //---------------//
  const unit = 10; // La distancia en la pantalla entre marcas
  const scale = 10; // Cómo se traducen las unidades de pantalla a unidades reales (por ejemplo, 1:10 para cm a mm)

  //---------------// POLIGONOS //---------------//
  //Figuras / Poligonos 
  const [shapes, setShapes] = useState([]);

  // Index / ID de la Figura / Poligono
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null); // 0,1,2,3...
  const [selectedShapeID, setSelectedShapeID] = useState(null);

  // Ultima posicion Poligono // ARREGLAR 
  const [lastPositionSI, setLastPositionSI] = useState({ x: 100, y: 100 });
  const [lastPositionID, setLastPositionID] = useState({ x: 200, y: 200 });

  //---------------// CAPAS Y GRID //---------------//
  // Alto de la capa
  const [initialHeight] = useState(100);
  const [height, setHeight] = useState<number>(initialHeight);

  // contenido inicial de las columnas
  const [initialTexts] = useState({
    'Arcilla-Limo-Arena-Grava': { content: "vacío", optional: false, vertical: false },
    'Sistema': { content: "vacío", optional: true, vertical: true },
    'Edad': { content: "vacío", optional: true, vertical: true },
    'Formación': { content: "vacío", optional: true, vertical: true },
    'Miembro': { content: "vacío", optional: true, vertical: true },
    'Facie': { content: "vacío", optional: true, vertical: false },
    'Ambiente depositacional': { content: "vacío", optional: true, vertical: false },
    'Descripción': { content: "vacío", optional: true, vertical: false }
  });


  //---------------// PATRONES Y EDICION //---------------//

  // Seleccion de patron / Pattern
  const [selectedOption, setSelectedOption] = useState<string>(Object.keys(Json)[0]);

  // Colores Base 
  const [initialColorFill] = useState('#ffffff');
  const [initialColorStroke] = useState('#000000');

  // Cambio de Colores de los poligonos 
  const [ColorFill, setColorFill] = useState(initialColorFill); // Relleno 
  const [ColorStroke, setColorStroke] = useState(initialColorStroke); // Trazo 

  // Slider barras
  const [sliderZoom, setSliderZoom] = useState(100); // Zoom
  const [sliderRotation, setSliderRotation] = useState(0); // Rotacion
  const [sliderTension, setSliderTension] = useState(0); // Tension de lineas

  // websocket instanciacion
  const { project } = useParams();

  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [isOpen, setIsOpen] = useState(false)


  const [config, setConfig] = useState(
    {
      action: 'settingsRoom',
      config: {
        columns: {
          'Arcilla-Limo-Arena-Grava': { enabled: true },
          'Sistema': { enabled: true },
          'Edad': { enabled: true },
          'Formación': { enabled: true },
          'Miembro': { enabled: true },
          'Estructuras y/o fósiles': { enabled: true, content: [], optional: true, vertical: false },// aqui
          'Facie': { enabled: true },
          'Ambiente depositacional': { enabled: true },
          'Descripción': { enabled: true }
        },
        scale: 50,
        // fosiles : { content: [], optional : true, vertical : false} 
      }
    }
  )


  const OptionsBar = () => {

    return (
      <>
        <div className="navbar bg-base-200">
          <div className="flex-none">

            <div className="dropdown dropdown-end">
              <SelectTheme />
            </div>

            <div onClick={HandleUndo} className="dropdown dropdown-end">

              <div className="tooltip tooltip-bottom" data-tip="Deshacer cambio">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7 1 4l3-3m0 12h6.5a4.5 4.5 0 1 0 0-9H2" />
                  </svg>
                </div>
              </div>

            </div>

            <div className="dropdown dropdown-end">

              <div className="tooltip tooltip-bottom" data-tip="Agregar/quitar columna">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                    <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                  </svg>
                </div>

              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">

                {Object.keys(initialTexts).map((key) => {
                  const item = initialTexts[key];
                  if (item.optional) {
                    return (
                      <li key={key}>
                        <div style={{ display: 'flex' }}>
                          <input
                            type="checkbox"
                            id={key}
                            name={key}
                            checked={config.config.columns[key].enabled}
                            onChange={(e) => handleCheckBox(e, key)}
                          />
                          <label htmlFor={key} style={{ whiteSpace: 'nowrap' }}>
                            {key}
                          </label>

                        </div>
                      </li>
                    );
                  }

                })}
              </ul>
            </div>

            <div className="dropdown dropdown-end" onClick={handleAddShape}>

              <div className="tooltip tooltip-bottom" data-tip="Agregar capa">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                  </svg>
                </div>
              </div>

            </div>

            <div className="dropdown dropdown-end" >
              <div className="tooltip tooltip-bottom" data-tip="Arrástralo">
                <img
                  alt="lion"
                  src={`../src/assets/fosiles/${fosilJson[selectedFosil]}.svg`}
                  draggable="true"
                  onDragStart={(e) => {

                    dragUrl.current = '../../assets/fosiles/' + fosilJson[selectedFosil] + '.svg';
                    console.log(selectedFosil)
                  }}

                />
              </div>
            </div>

            <div className="dropdown dropdown-end" >

              <select className="select select-bordered w-full max-w-xs" value={selectedFosil} onChange={handleOptionChangeF}>
                <option disabled selected>Añadir fósil</option>
                {Object.keys(fosilJson).map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>



          </div>
        </div>
      </>
    );
  };


  const sendConfig = (cconfig, send, socket) => {
    const prevConfigState = { ...config };

    prevConfigState.config = cconfig;

    setConfig(prevConfigState)
    if (send) {

      socket.send(JSON.stringify(prevConfigState));
    }
  }

  // Instancia del socket cuando se monta el componente
  useEffect(() => {
    const newSocket = new WebSocket(`ws://localhost:3001/ws/${project}`);
    setSocket(newSocket);

    newSocket.onclose = () => {
      console.log('reconecting... Reconnect will be attempted in 1 second.');
      setTimeout(() => {
        setSocket(new WebSocket(`ws://localhost:3001/ws/${project}`));
      }, 1000);
    };

    return () => {
      newSocket.close();
    };
  }, [project]);

  useEffect(() => {
    if (socket) {
      // Recibe la información del socket
      socket.onmessage = (event) => {
        //console.log(event.data);
        const shapeN = JSON.parse(event.data);
        console.log(shapeN)

        // action='añadir', id, polygon, text
        if (shapeN.action === 'añadir') {

          setShapes(prevShapes => [...prevShapes, shapeN]);

          // action='polygon', id, polygon
        } else if (shapeN.action === 'polygon') {
          setShapes(prevShapes =>
            prevShapes.map(shape =>
              shape.id === shapeN.id ? { ...shape, polygon: shapeN.polygon } : shape
            )
          );
          // action='text', id, text
        } else if (shapeN.action === 'text') {
          setShapes(prevShapes =>
            prevShapes.map(shape =>
              shape.id === shapeN.id ? { ...shape, text: shapeN.text } : shape
            )
          );

          // action='config', config
        } else if (shapeN.action === 'settingsRoom') {

          //console.log(shapeN)
          setConfig(shapeN);

          // action='delete', id, 
        } else if (shapeN.action === 'delete') {
          setShapes(prevShapes =>
            prevShapes.filter(shape => shape.id !== shapeN.id)
          );
        } else if (shapeN.action === 'height') {
          console.log(shapeN)
        }
      };

      //use efect mio detecta si se presiona el control Z
      const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "z") {
          HandleUndo();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      // Limpiar la conexión WebSocket cuando el componente se desmonta
      return () => {
        socket.close(), socket.send(JSON.stringify({ action: 'close' })), document.removeEventListener("keydown", handleKeyDown);

      };
    }
  }, [socket]);

  useEffect(() => {

    if (shapes.length > 0) {

      const coordA = shapes.reduce((maxCoords, objeto) => {
        return {
          x1: Math.max(maxCoords.x1, objeto.polygon.x1),
          x2: Math.max(maxCoords.x2, objeto.polygon.x2),
          y1: Math.max(maxCoords.y1, objeto.polygon.y1),
          y2: Math.max(maxCoords.y2, objeto.polygon.y2),
        };
      }, { x1: -Infinity, x2: -Infinity, y1: -Infinity, y2: -Infinity });

      if (coordA.y2 === -1000) {
        setLastPositionSI({ x: 100, y: 100 })
        setLastPositionID({ x: 200, y: 200 })
      } else {
        console.log(coordA)
        setLastPositionSI({ x: coordA.x1, y: coordA.y2 })
        setLastPositionID({ x: coordA.x2, y: coordA.y2 + 100 })
      }


    }

  }, [shapes]);

  //---------------// EVENTOS //---------------//
  // Evento de save undo delete
  // Evento undo
  const HandleUndo = () => {
    console.log("deshacer")
    socket.send(JSON.stringify({ action: "undo" }));
  };

  // Evento save
  const HandleSave = () => {
    console.log("guardando..")
    socket.send(JSON.stringify({ action: "save" }));
    //socket.send(JSON.stringify({action:"delete", id: selectedShapeID}));
  };

  const HandleTesting = () => {
    const updatedPolygons = [...shapes];
    const { text, ...polygonsintext } = updatedPolygons[1]
    polygonsintext.action = "test"

    socket.send(JSON.stringify(polygonsintext));


  };

  // Evento delete
  const HandleDelete = () => {

    const mockEvent = {
      target: {
        value: '0',
      }
    } as React.ChangeEvent<HTMLInputElement>;

    handleChangeHeight(mockEvent);
    // if (selectedShapeIndex !== null) {
    //   const updatedShapes = [...shapes];
    //   updatedShapes[selectedShapeIndex].polygon.x1 = -1000; 
    //   updatedShapes[selectedShapeIndex].polygon.x2 = -1000; 
    //   socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
    // }
    // //socket.send(JSON.stringify({action:"delete", id: selectedShapeID, y1: shapes[selectedShapeIndex].polygon.y1, y2: shapes[selectedShapeIndex].polygon.y2} ));

  }

  //---------// SLIDER //---------//
  // Evento del slider de zoom 
  const handleSliderZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderZoom(Number(event.target.value));
    if (selectedShapeIndex !== null) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].polygon.zoom = Number(event.target.value);
      //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
      setShapes(updatedShapes);
    }
  };

  // Evento de slider de rotacion
  const handleSliderRotation = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderRotation(Number(event.target.value));
    if (selectedShapeIndex !== null) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].polygon.rotation = Number(event.target.value);
      //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
      setShapes(updatedShapes);
    }
  };

  // Evento de slider de tension
  const handleSliderTension = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderTension(Number(event.target.value));
    if (selectedShapeIndex !== null) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].polygon.tension = Number(event.target.value);
      // //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
      // setShapes(updatedShapes);
      sendSocket("polygon", selectedShapeIndex);
    }
  }

  // Evento de seleccion de patron
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
    if (selectedShapeIndex !== null) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].polygon.file = Json[event.target.value];
      updatedShapes[selectedShapeIndex].polygon.fileOption = event.target.value;

      sendSocket("polygon", selectedShapeIndex);
    }
  };

  // Evento de cambio color de relleno
  const handleColorChangeFill = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorFill(event.target.value);
    if (selectedShapeIndex !== null) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].polygon.colorfill = event.target.value;

      sendSocket("polygon", selectedShapeIndex);
      //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
      //setShapes(updatedShapes);
    }
  };

  // Evento de cambio color de trazo 
  const handleColorChangeStroke = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorStroke(event.target.value);
    if (selectedShapeIndex !== null) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].polygon.colorstroke = event.target.value;
      sendSocket("polygon", selectedShapeIndex);
      //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
      //setShapes(updatedShapes);
    }
  };

  // Crea los circulos de los poligonos
  const setCircles = (index, circles, send, socket) => {
    const updatedShapes = [...shapes];
    updatedShapes[index].polygon.circles = circles;
    setShapes(updatedShapes);
    if (send) {
      console.log("Send: Circulos")
      sendSocket("polygon", index);
      //socket.send(JSON.stringify(updatedShapes[index]));
    }
  }

  // Crea los textos de los poligonos
  const setText = (index, text, send, socket) => {
    const updatedShapes = [...shapes];
    updatedShapes[index].text = text;
    setShapes(updatedShapes);
    if (send) {
      console.log("Send: text")

      sendSocket("text", index);

      //socket.send(JSON.stringify(updatedShapes[index]));
    }
  }

  const sendSocket = (send, index) => {
    const updatedPolygons = [...shapes];
    const { text, ...polygonsintext } = updatedPolygons[index]
    //console.log(polygonsintext)
    //console.log(text)
    if (send === "polygon") {
      polygonsintext.action = "polygon"

      console.log(polygonsintext)

      if (polygonsintext.polygon.y1 === polygonsintext.polygon.y2) {
        polygonsintext.polygon.x1 = -1000
        polygonsintext.polygon.x2 = -1000
        polygonsintext.polygon.y1 = -1000
        polygonsintext.polygon.y2 = -1000
        socket.send(JSON.stringify(polygonsintext))

      } else {
        socket.send(JSON.stringify(polygonsintext))
      }

    }
    else if (send === "text") {
      const send = {
        action: "text",
        id: updatedPolygons[index].id,
        text: updatedPolygons[index].text,
      }
      //console.log(send)
      socket.send(JSON.stringify(send));
    }

  }

  // Envía la información al soltar el control deslizante
  const SliderDrop = () => {
    if (selectedShapeIndex !== null) {
      //socket.send(JSON.stringify(shapes[selectedShapeIndex]));

      sendSocket("polygon", selectedShapeIndex);

    }
  };

  // Evento del cambio del tamaño del poligono
  const handleChangeHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(Number(event.target.value));
    const newHeight = Number(event.target.value);

    // const send ={
    //   action: "height",
    //   id: selectedShapeIndex,
    //   circles : shapes[selectedShapeIndex].polygon.circles,
    //   newHeight : newHeight,
    // }
    // socket.send(JSON.stringify(send));

    if (selectedShapeIndex !== null) {
      const selectedShapeId = shapes[selectedShapeIndex].id;

      const deltaY = newHeight - (shapes[selectedShapeIndex].polygon.y2 - shapes[selectedShapeIndex].polygon.y1);

      const updatedShapes = shapes.map((shape) => {
        // Cambio de la altura del polígono seleccionado
        if (shape.id === selectedShapeId) {
          const newY2 = shape.polygon.y1 + newHeight;

          if (newY2 < shape.polygon.y2) {

            const filteredCircles = shape.polygon.circles.filter((circle, index) => {
              return index < 2 || index >= shape.polygon.circles.length - 2 || circle.y <= newY2;
            });

            return {
              ...shape,
              polygon: {
                ...shape.polygon,
                y2: newY2,
                circles: filteredCircles,
              }
            };

          } else {
            return {
              ...shape,
              polygon: {
                ...shape.polygon,
                y2: newY2,
              }
            };
          }
        } else if (shape.polygon.y1 >= shapes[selectedShapeIndex].polygon.y2) {
          // Cambio de posición del resto de figuras por debajo
          return {
            ...shape,
            polygon: {
              ...shape.polygon,
              y1: shape.polygon.y1 + deltaY,
              y2: shape.polygon.y2 + deltaY,
            }
          };
        }

        return shape;
      });

      setShapes(updatedShapes);
    }
  };


  //////////////-----------MODIFICADO-----------------//////////////
  // Generacion de figuras, envio a backend 
  const handleAddShape = () => {

    const NewShape =
    {
      action: "añadir",
      id: shapes.length,
      polygon: {
        x1: lastPositionSI.x, y1: lastPositionSI.y,
        x2: lastPositionID.x, y2: lastPositionID.y,
        colorfill: initialColorFill,
        colorstroke: initialColorStroke,
        zoom: sliderZoom,
        rotation: sliderRotation,
        tension: sliderTension,
        file: 0,
        fileOption: 0,
        height: initialHeight,
        circles: [
          { x: lastPositionSI.x, y: lastPositionSI.y, radius: 5, movable: false },
          { x: lastPositionID.x, y: lastPositionSI.y, radius: 5, movable: true },
          { x: lastPositionID.x, y: lastPositionID.y, radius: 5, movable: true },
          { x: lastPositionSI.x, y: lastPositionID.y, radius: 5, movable: false },
        ]
      },
      text: initialTexts
    }

    socket.send(JSON.stringify(NewShape));


  };

  // Cambia en el editor las configuraciones del poligno seleccionado 
  const handleShapeClick = (index) => {
    console.log(shapes)
    setSelectedShapeIndex(index);
    setSelectedShapeID(shapes[index].id)
    setColorFill(shapes[index].polygon.colorfill);
    setColorStroke(shapes[index].polygon.colorstroke);
    setSelectedOption(shapes[index].polygon.fileOption);
    setHeight(shapes[index].polygon.y2 - shapes[index].polygon.y1);
    setSliderZoom(shapes[index].polygon.zoom);
    setSliderRotation(shapes[index].polygon.rotation);
    setIsOpen(true);
    // setSideBar(true)
  };

  //    Cambia en el editor las configuraciones del poligno seleccionado 
  // const handleShapeonDrag = ( index) => {
  //     setSelectedShapeIndex(index);
  //     setColorFill(shapes[index].colorfill);
  //     setColorStroke(shapes[index].colorstroke);
  //     setSelectedOption(shapes[index].fileOption);
  //     setHeight(shapes[index].y2 - shapes[index].y1);
  //     setSliderZoom(shapes[index].zoom);
  //     setSliderRotation(shapes[index].rotation);

  // };

  const dragItem = useRef(null);
  //const dragOverItem = useRef(null);

  const dragStart = (position) => {
    console.log('start: ', position)
    dragItem.current = position;
    //e.dataTransfer.setData('text/plain', e.target.innerHTML);
  };


  //Movimiento de la barra Drag, poligono
  const handleContainerDrag = (polygonId: number, e: any) => {
    const updatedPolygons = [...shapes];
    const draggedPolygon = updatedPolygons.find(polygon => polygon.id === polygonId);

    if (draggedPolygon) {
      const dragOffsetY = e.target.y() - draggedPolygon.polygon.y1;

      if (dragOffsetY !== 0) {
        for (const targetPolygon of updatedPolygons) {
          if (targetPolygon.id !== polygonId) {
            const heightIndex = draggedPolygon.polygon.y2 - draggedPolygon.polygon.y1;
            const heightI = targetPolygon.polygon.y2 - targetPolygon.polygon.y1;
            const adjustment = dragOffsetY > 0 ? -heightIndex : heightIndex;
            const aux = dragOffsetY > 0 ? heightI : -heightI;

            // Arriba
            const dragOffsetY2 = e.target.y() - targetPolygon.polygon.y1;
            if (dragOffsetY2 < 0 && draggedPolygon.polygon.y1 >= targetPolygon.polygon.y1) {
              console.log("Cambio", targetPolygon.id);

              targetPolygon.polygon.y1 += adjustment;
              targetPolygon.polygon.y2 += adjustment;

              draggedPolygon.polygon.y1 += aux;
              draggedPolygon.polygon.y2 += aux;
            }
            // Abajo
            else if (dragOffsetY2 > 0 && targetPolygon.polygon.y2 >= draggedPolygon.polygon.y2) {
              console.log("Cambio", targetPolygon.id);

              targetPolygon.polygon.y1 += adjustment;
              targetPolygon.polygon.y2 += adjustment;

              draggedPolygon.polygon.y1 += aux;
              draggedPolygon.polygon.y2 += aux;
            }
          }
        }
        setShapes(updatedPolygons);
      }
    }
  };

  const handleCheckBox = (e, column) => {

    const prevConfigState = { ...config };

    if (e.target.checked) {

      prevConfigState.config.columns[column].enabled = true;
      setConfig(prevConfigState);
      socket.send(JSON.stringify(prevConfigState));

    } else {
      prevConfigState.config.columns[column].enabled = false;
      setConfig(prevConfigState);
      socket.send(JSON.stringify(prevConfigState));
    }

  }


  const [isListOpen, setIsListOpen] = useState(false);

  const handleListToggle = () => {
    setIsListOpen(!isListOpen);
  };

  const URLImage = ({ image }) => {
    const [img] = useImage(image.src);
    return (
      <Image
        image={img}
        x={image.x}
        y={image.y}
        offsetX={img ? img.width / 2 : 0}
        offsetY={img ? img.height / 2 : 0}
        width={50}
        height={60}
        draggable
      />
    );
  };

  const dragUrl = React.useRef(null);
  const stageRef = React.useRef(null);

  // Seleccion de patron / Pattern
  const [selectedFosil, setSelectedFosil] = useState<string>(Object.keys(fosilJson)[0]);
  const [sideBar, setSideBar] = useState<boolean>(false);

  const handleOptionChangeF = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFosil(String(event.target.value));
    console.log(event.target.value)
  };


  interface ImageComponentProps {
    imageNames: any;
    x: number;
    y: number;
    width: number;
    height: number
  }

  const ImageComponent: React.FC<ImageComponentProps> = (props) => {
    const groupRef = useRef(null);

    var a = []
    props.imageNames.map((imageName, index) => {
      const [img] = useImage(imageName.src);
      const b = <Image
        image={img}
        x={imageName.x}
        y={imageName.y}
        offsetX={img ? img.width / 2 : 0}
        offsetY={img ? img.height / 2 : 0}
      />;
      a.push(b)
    });

    const MyKonvaComponent =
      <Group x={props.x} y={props.y} ref={groupRef}>

        <Html
          groupProps={{ x: 0, y: 0 }}
          divProps={{
            style: {
              width: props.width,
              height: props.height,
              overflow: 'hidden',
              background: 'none',
              outline: 'none',
              border: 'none',
              padding: '0px',
              margin: '0px',
            },
          }}
        >
          <div
            style={{
              width: 100,
              height: lastPositionID.y,
              background: 'none',
              border: 'none',
              padding: '0px',
              margin: '0px',
              outline: 'none',
              overflow: 'auto',
              fontSize: '18px',
              fontFamily: 'sans-serif',
              color: 'black',
            }}
            onDrop={(e) => {
              e.preventDefault();
              const copia = { ...config };
              copia.config.columns['Estructuras y/o fósiles'].content.push({
                'x': e.nativeEvent.offsetX,
                'y': e.nativeEvent.offsetY,
                'src': dragUrl.current
              });

              setConfig(copia);
              socket.send(JSON.stringify(copia));
              //sendConfig(copia, true, socket);
            }}

          />
        </Html>
        {a}
      </Group>

    return (
      MyKonvaComponent
    );
  };

  const ImageFosil = ({ image }) => {
    const [img] = useImage(image.src);
    return (
      <Image
        image={img}
        x={image.x}
        y={image.y}
        offsetX={img ? 30 / 2 : 0}
        offsetY={img ? 30 / 2 : 0}
        width={30}
        height={30}
        draggable
      />
    );
  };


  return (
    <>
      <OptionsBar />
      <div className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={sideBar} onClick={() => setSideBar(false)} />
        <div className="drawer-content">
          <main className="flex-1 p-4">
            <div className='a'> <button onClick={HandleSave}>Guardar Cambios</button></div>

            <div id="gridContainer" onDragOver={(e) => e.preventDefault()}>

              <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
                <Layer>

                {shapes.length > 0 && (
                  <>
                  <Rect
                    key={`header-fosils`}
                    x={400}
                    y={0}
                    width={150}
                    height={100}
                    fill="white"
                    stroke="black"
                  />

                  {'Estructuras y/o fósiles'.split(' ').map((word, index) => (
                    <Text
                      key={`text-'Estructuras y/o fósiles'-${index}`}
                      x={420}
                      y={100 / 5 + index * 14 * 1.5}
                      text={word}
                      fontSize={14}
                      fill="black"
                    />

                  ))}

               </>   )}

{shapes.length > 0 && (

                    <Group x={400} y={100} height={lastPositionID.y - 200} width={150} style={{ border: '1px solid red' }}>
                      <Rect
                        key={`header-fosils`}
                        x={0}
                        y={0}
                        width={150}
                        height={lastPositionID.y - 200}
                        fill="transparent"
                        stroke="black"
                      />

                      <Html
                        groupProps={{ x: 0, y: 0 }}
                        divProps={{
                          style: {
                            width: 150,
                            overflow: 'hidden',
                            background: 'none',
                            outline: 'none',
                            border: 'red',
                            padding: '0px',
                            margin: '0px',
                            color: 'red',
                            //  backgroundColor : 'blue'
                          },
                        }}
                      >
                        <div
                          style={{
                            width: 150,
                            height: lastPositionID.y - 200,
                            background: 'none',
                            border: 'none',
                            padding: '0px',
                            margin: '0px',
                            outline: 'none',
                            overflow: 'auto',
                            fontSize: '18px',
                            fontFamily: 'sans-serif',
                          }}
                          onDrop={(e) => {
                            e.preventDefault();

                            const prevConfigState = { ...config };
                            prevConfigState.config.columns['Estructuras y/o fósiles'].content.push({
                              'x': e.nativeEvent.offsetX,
                              'y': e.nativeEvent.offsetY,
                              'src': dragUrl.current
                            });

                            setConfig(prevConfigState);
                            socket.send(JSON.stringify(prevConfigState));
                            // sendConfig(copia, true, socket);
                            console.log(config)
                          }}

                        >


                        </div>



                      </Html>
                      {config.config.columns['Estructuras y/o fósiles'].content.map((img, index) => (
                        <>
                          <Fosil img={img} index={index} />
                        </>
                      ))}

                    </Group>
                  )}


                  {shapes.map((shape, index) => (
                    <>
                      <Grid
                        key={shape.polygon.id}
                        polygon={shape}
                        text={shape.text}
                        setText={(text, send) => setText(index, text, send, socket)}
                        config={config}
                        sendConfig={(config, send) => sendConfig(config, send, socket)}
                        dragUrl={dragUrl}
                      />

                      <Polygon
                        key={shape.polygon.id}
                        x1={shape.polygon.x1}
                        y1={shape.polygon.y1}
                        x2={shape.polygon.x2}
                        y2={shape.polygon.y2}
                        ColorFill={shape.polygon.colorfill}
                        ColorStroke={shape.polygon.colorstroke}
                        Zoom={shape.polygon.zoom}
                        Rotation={shape.polygon.rotation}
                        Tension={shape.polygon.tension}
                        File={shape.polygon.file}
                        circles={shape.polygon.circles}
                        setCircles={(circles, send) => setCircles(index, circles, send, socket)}
                        onClick={() => handleShapeClick(index)}
                      />
                      <Rect
                        key={shape.polygon.id}
                        x={shape.polygon.x1}
                        y={shape.polygon.y1}
                        width={80}
                        height={shape.polygon.y2 - shape.polygon.y1}
                        opacity={0.5}
                        draggable
                        onClick={() => {handleShapeClick(index)
                          setSideBar(true)
                        }}
                        onDragStart={() => dragStart(shape.id)}
                        onDragMove={(e) => {
                          handleContainerDrag(shape.id, e);
                          e.target.y(shape.polygon.y1);
                        }}
                        dragBoundFunc={(pos) => ({
                          x: 100,
                          y: pos.y,
                        })}
                      />
                    </>
                  ))}
                  {shapes.length > 0 && (

                    <VerticalRuler x={100} y={100} height={lastPositionID.y - 200} unit={unit} scale={scale} />


                  )}


                </Layer>
              </Stage>

            </div>
          </main>
        </div>

        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            {/* Sidebar content here */}

            <li className="menu-title">Proyecto</li>
            <li>
              <p>Seleccionar opción de Pattern: </p>
              <select value={selectedOption} onChange={handleOptionChange} className='select select-bordered w-full max-w-xs'>
                {Object.keys(Json).map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </li>

            <li>
              <p>Seleccionar color Fill: <input type="color" value={ColorFill} onChange={handleColorChangeFill} /> </p>
            </li>

            <li>
              <p>Seleccionar color Stroke:<input type="color" value={ColorStroke} onChange={handleColorChangeStroke} /></p>

            </li>

            <li>
              <p>Tension de lineas: {sliderTension}</p>
              <input
                type="range"
                min={0}
                max={2.5}
                step={0.1}
                value={sliderTension}
                onChange={handleSliderTension}
                onMouseUp={SliderDrop}
              />
            </li>

            <li>
              <p>Cambiar alto de capa seleccionada: </p>
              <input type="number" value={height} onChange={handleChangeHeight} />
            </li>

            <li>
              <p>Valor Zoom: {sliderZoom}</p>
              <input
                type="range"
                min={50}
                max={300}
                value={sliderZoom}
                onChange={handleSliderZoom}
                onMouseUp={SliderDrop}
              />
            </li>

            <li>
              <p>Valor Rotacion: {sliderRotation}</p>
              <input
                type="range"
                min={0}
                max={180}
                value={sliderRotation}
                onChange={handleSliderRotation}
                onMouseUp={SliderDrop}
              />
            </li>

          </ul>

        </div>
      </div>




    </>
  );
};

export default CoordinateInputs;