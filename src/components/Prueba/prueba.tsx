

import { useRef, useState, useCallback, useEffect } from "react";
import Grid, { Cell as DefaultCell, useSelection, useEditable } from "@rowsncolumns/grid";
import { Rect, Text, Group, Circle } from "react-konva";
import HeaderKonva from "../PruebasKonva/HeaderKonva";
import CellText from "../PruebasKonva/CellText";
import Polygon2 from "./Polygon2";
import Json from '../../lithologic.json';
import fosilJson from '../../fossil.json';
import SelectTheme from "../Web/SelectTheme";
import { useParams } from "react-router-dom";
import Fosil from "../Editor/Fosil";
import { Html } from "react-konva-utils";

// Componente de Celda Personalizado
const Cell = ({ rowIndex, columnIndex, x, y, width, height, value }) => {

  return (
    <>
      {/* <Rect x={x} y={y} height={height} width={width} fill={fill} stroke="grey" strokeWidth={0.5} /> */}
      {/* <Text x={x} y={y} height={height} width={width} text={value} fontStyle="normal" verticalAlign="middle" align="center" /> */}
      <Polygon2
        x={value.x}
        y={value.y}
        Width={value.width}
        Height={value.height}
        Tension={value.tension}
        //circles={dataCircle}
        setCircles={() => console.log("Cambio de circulos")}
        onClick={() => console.log("Click en poligono")}
        ColorFill={value.ColorFill}
        ColorStroke={value.colorStroke}
        Zoom={value.zoom} 
        Rotation={value.rotation}
        File={value.file}
        circles={value.circles}
      />

      {/* <Circle x={x} y={y} radius={10} fill="red" stroke="grey" strokeWidth={0.5} draggable /> */}
    </>
  );
};

const App = () => {
  // Estados y Refs
  // Estado para los datos de la grilla
  const [data, setData] = useState({
    // Estructura inicial de los datos
    "3,4": "texto del polygon2",
    "4,2": "Contenido de la celda",
    "2,2": "Cocos"
  });

  const setCircles = (index, circles, send, socket) => {
    const updatedShapes = [...shapes];
    updatedShapes[index].polygon.circles = circles;
    setShapes(updatedShapes);
    if (send) {
      console.log("Send: Circulos")
      //  sendSocket("polygon", index);
      //socket.send(JSON.stringify(updatedShapes[index]));
    }
  }

  // const [polygons, setPolygons] = useState({
  //   "2,1": <Polygon2 x={100} y={100} Width={100} Height={300} Tension={1} onClick={""} />
  // });
  const [polygons, setPolygons] = useState({
    "2,5": 
    { x: 100,
      y : 100,  Width: 100,  Height: 100,  Tension: 1,  onClick: "",  
    setCircles: "a", 
    ColorFill: "#ccc",  ColorStroke: "#ccc",  Zoom: 100,  Rotation: 0,  File: 0, 
    circles: [
      {
        "x": 100,
        "y": 100,
        "radius": 5,
        "movable": false
      },
      {
        "x": 100 + 100,
        "y": 100,
        "radius": 5,
        "movable": true,
      },
      {
        "x": 100 + 100,
        "y": 100 + 100,
        "radius": 5,
        "movable": true
      },
      {
        "x": 100,
        "y": 100 + 100,
        "radius": 5,
        "movable": false
      }
    ]} 

  });


  //---------------// CAPAS Y GRID //---------------//
  // Alto de la capa
  const [initialHeight] = useState(100);
  const [heightShape, setHeight] = useState<number>(initialHeight);

  const [lastPositionID, setLastPositionID] = useState({ x: 1000, y: 110 });
  //Figuras / Poligonos 
  const [Header, setHeader] = useState([]);
  const [shapes, setShapes] = useState([]);

  // Index / ID de la Figura / Poligono
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null); // 0,1,2,3...
  const [selectedShapeID, setSelectedShapeID] = useState(null);

  const width = 1700;
  const height = 800;


  const [rowCount, setRowCount] = useState(1);
  const [columnCount, setColumnCount] = useState(0);

  const gridRef = useRef(null);
  const frozenRows = 1;

  // Estado para el ancho de las columnas
  const [columnWidthMap, setColumnWidthMap] = useState({});

  // Referencia a la grilla principal


  const getCellValue = useCallback(
    ({ rowIndex, columnIndex }) => {
      const key = Header[columnIndex];
      return data[key] && data[key][rowIndex];
    },
    [data]
  );

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
  const [socket, setSocket] = useState(null);
  const isPageActive = useRef(true);

  const [isOpen, setIsOpen] = useState(false);
  const [fosils, setFosils] = useState([]);


  // const [config, setConfig] = useState(
  //   {
  //     action: 'settingsRoom',
  //     config: {
  //       columns: {
  //         'Arcilla-Limo-Arena-Grava': { enabled: true },
  //         'Sistema': { enabled: true },
  //         'Edad': { enabled: true },
  //         'Formación': { enabled: true },
  //         'Miembro': { enabled: true },
  //         'Estructuras y/o fósiles': { enabled: true, content: [], optional: true, vertical: false },// aqui
  //         'Facie': { enabled: true },
  //         'Ambiente depositacional': { enabled: true },
  //         'Descripción': { enabled: true }
  //       },
  //       scale: 50,
  //       // fosiles : { content: [], optional : true, vertical : false} 
  //     }
  //   }
  // )

  const HandleUndo = () => {
    console.log("deshacer")
    socket.send(JSON.stringify({ action: "undo" }));
  };

  const handleOptionChangeF = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFosil(String(event.target.value));
    console.log(event.target.value)
  };


  // contenido inicial de las columnas (borrar)
  // const [initialTexts] = useState({
  //   'Arcilla-Limo-Arena-Grava': { content: "vacío", optional: false, vertical: false },
  //   'Sistema': { content: "vacío", optional: true, vertical: true },
  //   'Edad': { content: "vacío", optional: true, vertical: true },
  //   'Formación': { content: "vacío", optional: true, vertical: true },
  //   'Miembro': { content: "vacío", optional: true, vertical: true },
  //   'Facie': { content: "vacío", optional: true, vertical: false },
  //   'Ambiente depositacional': { content: "vacío", optional: true, vertical: false },
  //   'Descripción': { content: "vacío", optional: true, vertical: false }
  // });


  const handleCheckBox = (e, column) => {

    // const prevConfigState = { ...config };

    // if (e.target.checked) {

    //   prevConfigState.config.columns[column].enabled = true;
    //   setConfig(prevConfigState);
    //   socket.send(JSON.stringify(prevConfigState));

    // } else {
    //   prevConfigState.config.columns[column].enabled = false;
    //   setConfig(prevConfigState);
    //   socket.send(JSON.stringify(prevConfigState));
    // }

  }

  const dragUrl = useRef(null);

  // Seleccion de patron / Pattern
  const [selectedFosil, setSelectedFosil] = useState<string>(Object.keys(fosilJson)[0]);
  const [sideBar, setSideBar] = useState<boolean>(false);

  //const [newWidth, setNewWidth] = useState(100);


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

  const SliderDrop = () => {
    if (selectedShapeIndex !== null) {
      //socket.send(JSON.stringify(shapes[selectedShapeIndex]));

      //sendSocket("polygon", selectedShapeIndex);

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
      //sendSocket("polygon", selectedShapeIndex);
    }
  }


  const handleChangeHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(Number(event.target.value));
    const newHeight = Number(event.target.value);

  }

  // Evento de seleccion de patron
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
    if (selectedShapeIndex !== null) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].polygon.file = Json[event.target.value];
      updatedShapes[selectedShapeIndex].polygon.fileOption = event.target.value;

      //sendSocket("polygon", selectedShapeIndex);
    }
  };

  // Evento de cambio color de relleno
  const handleColorChangeFill = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorFill(event.target.value);
    if (selectedShapeIndex !== null) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].polygon.colorfill = event.target.value;

      // sendSocket("polygon", selectedShapeIndex);
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
      //sendSocket("polygon", selectedShapeIndex);
      //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
      //setShapes(updatedShapes);
    }
  };

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

                {/* {Object.keys(initialTexts).map((key) => {
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
                          
                                          })} */}
              </ul>
            </div>

            <div onClick={addShape} className="dropdown dropdown-end" >
              {/* onClick={(e) => addShape(rowCount,lastPositionID.x - (columnWidthMap[1] || 200),lastPositionID.y,heightShape,(columnWidthMap[1] || 200))} */}
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

  // Instancia del socket cuando se monta el componente
  useEffect(() => {
    // Función para conectar el WebSocket
    const connectWebSocket = () => {
      const newSocket = new WebSocket(`ws://localhost:3001/ws/${project}`);
      setSocket(newSocket);

      newSocket.onopen = () => {
        console.log('Socket connected.');
      };

      newSocket.onclose = () => {
        console.log('Socket closed.');
        if (isPageActive.current) {
          console.log('Attempting to reconnect in 3 second...');
          setTimeout(() => {
            if (isPageActive.current) {
              connectWebSocket();
            }
          }, 3000);
        }
      };
    };

    connectWebSocket();

    return () => {
      isPageActive.current = false; // Indica que la página ya no está activa
      if (socket) {
        socket.close();
      }
    };
  }, [project]);

  useEffect(() => {
    if (socket) {
      // Recibe la información del socket
      socket.onmessage = (event) => {
        //console.log(event.data);
        const shapeN = JSON.parse(event.data);
        console.log(shapeN)

        switch (shapeN.action) {
          case 'data':
            setData(shapeN.data)
            setHeader(shapeN.config)
            setColumnCount(shapeN.config.length)
            break;

          case 'editText':
            setData(prev => {
              const newData = { ...prev };
              const key = shapeN.key;
              newData[key] = { ...newData[key], [shapeN.rowIndex]: shapeN.value };

              return newData;
            });
            break
          case 'añadir':

            console.log(shapeN.rowIndex)
            var stenf = `${shapeN.rowIndex},5`;
            setPolygons(prevPolygons => {

              const newdata = { ...prevPolygons, [stenf]: shapeN.Polygon }
              return newdata
            });

            // setPolygons(prev => {
            //   const newData = { ...prev };
            //   const id = shapeN.id;
            //   newData[id] = { ...newData[id], [5]: shapeN.value };

            //   return newData;
            // });

            break
          case 'fosil':

            break

          default:
            // Manejar cualquier situación no contemplada
            break;
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
        socket.close(),
          document.removeEventListener("keydown", handleKeyDown);

      };
    }
  }, [socket]);

  useEffect(() => {

    console.log(shapes, "todo")

    console.log(polygons, "todo polygons")

    if (Object.values(polygons).length > 0) {

      const coordA = Object.values(polygons).reduce((previousValue, currentValue) => {
        console.log(previousValue.y,currentValue.y)
        console.log(previousValue.x,currentValue.x)
        return {
           x: Math.max(previousValue.y, currentValue.y),
           y: Math.max(previousValue.y, currentValue.y),
        };
      }, { x: -Infinity,  y: -Infinity });

      if (coordA.y === -1000) {
        //setLastPositionSI({ x: 100, y: 100 })
        setLastPositionID({ x: 200, y: 200 })
      } else {
        console.log(coordA)
        //    setLastPositionSI({ x: coordA.x1, y: coordA.y2 })
        setLastPositionID({ x: coordA.x, y: coordA.y + 100 })
      }


    }

  }, [polygons]);

  // Funciones de selección y edición (del primer código)
  const { activeCell, selections, setActiveCell, ...selectionProps } = useSelection({
    gridRef,
    rowCount,
    columnCount,
    getValue: getCellValue,
    // Otras funciones opcionales como onFill, onSelect, etc.
  });

  const { editorComponent, editingCell, isEditInProgress, ...editableProps } = useEditable({
    rowCount,
    columnCount,
    gridRef,
    selections,
    activeCell,
    getValue: getCellValue,

    onSubmit: (value, { rowIndex, columnIndex }, nextActiveCell) => {
      console.log('On submit');
      console.log(data);

      // Actualizar el estado con el nuevo valor, local
      // setData(prev => {
      //   const newData = { ...prev };
      //   const key = Header[columnIndex];
      //   newData[key] = { ...newData[key], [rowIndex]: value };

      //   return newData;
      // });
      console.log(Header[columnIndex], value, rowIndex)
      // Enviar el nuevo valor al socket
      socket.send(JSON.stringify({
        action: 'editText',
        data: {
          "key": Header[columnIndex],
          "value": value,
          "rowIndex": rowIndex
        }
      }));

      gridRef.current.resizeColumns([columnIndex]);

      // Seleccionar la siguiente celda
      if (nextActiveCell) {
        setActiveCell(nextActiveCell);
      }
    },
    canEdit: ({ rowIndex, columnIndex }) => {
      console.log('Can edit', columnIndex, rowIndex);
      console.log(data)
      if (rowIndex === 0) return false;
      if (Header[columnIndex] === "Litologia") return false;
      if (Header[columnIndex] === "Estructura fosil") return false;
      return true;
    },
    onDelete: (activeCell, selections) => {
      // console.log(selections);
      // if (selections.length) {
      //   const newValues = selections.reduce((acc, { bounds: sel }) => {
      //     for (let i = sel.top; i <= sel.bottom; i++) {
      //       for (let j = sel.left; j <= sel.right; j++) {
      //         acc[`${i},${j}`] = "";
      //       }
      //     }
      //     return acc;
      //   }, {});
      //   setData((prev) => ({ ...prev, ...newValues }));
      //   const selectionBounds = selections[0].bounds;

      //   gridRef.current.resetAfterIndices(
      //     {
      //       columnIndex: selectionBounds.left,
      //       rowIndex: selectionBounds.top,
      //     },
      //     true
      //   );
      // } else 
      if (activeCell) {
        socket.send(JSON.stringify({
          action: 'editText',
          data: {
            "key": Header[activeCell.columnIndex],
            "value": "",
            "rowIndex": activeCell.rowIndex
          }
        }));
        gridRef.current.resetAfterIndices(activeCell);
      }
    },
    isHiddenRow: () => false, // Add this property
    isHiddenColumn: () => false, // Add this property
  });

  // Manejo de redimensionamiento de columnas (del segundo código)
  const handleResize = (columnIndex, newWidth) => {
    // Actualiza el estado para reflejar el nuevo ancho de la columna
    setColumnWidthMap(prevWidthMap => ({
      ...prevWidthMap,
      [columnIndex]: newWidth
    }));

    // Asegúrate de que ambos, la grilla principal y el encabezado, se actualizan
    gridRef.current.resizeColumns([columnIndex]);
    //headerGridRef.current.resizeColumns([columnIndex]);
  };

  const {
    nextFocusableCell,
    makeEditable,
    setValue,
    hideEditor,
    showEditor,
    submitEditor,
    cancelEditor,
    ...safeProps
  } = editableProps;

  // Por Modificar 
  const addShape = () => {
    setRowCount(prevRowCount => {
      console.log(lastPositionID,"addshape")
      const newCount = prevRowCount + 1
      socket.send(JSON.stringify({
        action: "añadir",
        data: {
          rowIndex: newCount,
          x: lastPositionID.x,
          y: lastPositionID.y,
          height: 100,
          width: 100
        }
      }));
      return newCount;
    });

  }

  // Renderizado de la Grilla
  return (
    <>
      <div className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={sideBar} onClick={() => setSideBar(false)} />
        <div className="drawer-content">

          <main className="flex-1 p-4">
            <OptionsBar />


            <div style={{ display: "flex", flexDirection: "column", position: "absolute" }}>

              <Grid
                ref={gridRef} // Referencia para manipular la grilla principal desde otros componentes
                width={width} // Ancho Stage
                height={height} // Altura Stage
                columnCount={columnCount} // Número total de columnas
                rowCount={rowCount} // Número total de filas
                frozenRows={frozenRows}
                columnWidth={(index) => columnWidthMap[index] || 200} // Ancho de las columnas, obtenido del estado
                rowHeight={(index) => {
                  if (index === 0) return 110;
                  return 100;
                }}
                //rowHeight={() => 40} // Altura de las filas en la grilla principal
                activeCell={activeCell}
                //frozenColumns={frozenColumns} // Número de columnas congeladas
                //itemRenderer={Cell} // Renderizador personalizado para las celdas de la grilla
                itemRenderer={(props) => {
                  //console.log(props)
                  if (props.rowIndex === 0) {

                    // Renderizar el Encabezado para la primera fila
                    return (

                      <HeaderKonva
                        value={Header[props.columnIndex]}
                        onResize={handleResize}
                        {...props}
                      />

                    )


                  } else {

                    if (Header[props.columnIndex] === "Estructura fosil" && props.rowIndex === 1) {


                      <Group x={400} y={100} heightShape={lastPositionID.y - 200} width={150} style={{ border: '1px solid red' }}>
                        <Rect
                          key={`header-fosils`}
                          x={0}
                          y={0}
                          width={150}
                          heightShape={lastPositionID.y - 200}
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

                              // const prevConfigState = { ...config };
                              // prevConfigState.config.columns['Estructuras y/o fósiles'].content.push({
                              //   'x': e.nativeEvent.offsetX,
                              //   'y': e.nativeEvent.offsetY,
                              //   'src': dragUrl.current
                              // });

                              // setConfig(prevConfigState);
                              // socket.send(JSON.stringify(prevConfigState));
                              // // sendConfig(copia, true, socket);
                              // console.log(config)
                            }}

                          >

                          </div>
                        </Html>
                        {/* {config.config.columns['Estructuras fosiles'].content.map((img, index) => (
                                                  <>
                                                    <Fosil img={img} index={index} />
                                                  </>
                                                ))} */}

                      </Group>


                    } else

                      // Renderizar celdas normales para el resto de la grilla
                      if (Header[props.columnIndex] === "Litologia") {

                        console.log(`${props.rowIndex+1},${props.columnIndex}`);
                        return (
                          <Cell
                            value={polygons[`${props.rowIndex+1},${props.columnIndex}`] ? polygons[`${props.rowIndex+1},${props.columnIndex}`] : "a"}
                            x={props.x}
                            y={props.y}
                            width={props.width}
                            height={props.height}
                            {...props}
                          />
                        );

                      } else if (Header[props.columnIndex] !== "Estructura fosil") {
                        //const puntero = 
                        return (
                          // <DefaultCell
                          //   value={data[Header[props.columnIndex]][props.rowIndex]}

                          //   fill="white" // Color de celda
                          //   stroke="blue" // Color del borde 
                          //   fontSize={12} // Tamaño de fuente	
                          //   align="center" // left: Izquierda, center: Centro, right: Derecha
                          //   wrap="word" // word, char, none
                          //   verticalAlign="middle" // top: Arriba, middle: Centro, bottom: Abajo
                          //   fontStyle="normal" //
                          //   padding={5} // Espacio entre el texto y el borde de la celda
                          //   elipsis={true} // Si el texto es más largo que el ancho de la celda, se muestra el texto completo o no
                          //   //'direction',
                          //   // 'fontFamily',
                          //   // 'fontSize',
                          //   // 'fontStyle',
                          //   // 'fontVariant',
                          //   // 'padding',
                          //   // 'align',
                          //   // 'verticalAlign',
                          //   // 'lineHeight',
                          //   // 'text',
                          //   // 'width',
                          //   // 'height',
                          //   // 'wrap',
                          //   // 'ellipsis',
                          //   // 'letterSpacing',

                          //   {...props}
                          // />
                          <CellText
                            value={data[Header[props.columnIndex]][props.rowIndex]}
                            {...props}
                          />
                        );
                      }
                    // <Cell
                    //   value={data[`${props.rowIndex},${props.columnIndex}`]}
                    //   height={props.height}
                    //   x={props.x}
                    //   y={props.y} 
                    //   width={props.width}
                    //   {...props}
                    // />

                  }
                }}
                //{...selectionProps} // Propiedades del hook useSelection
                //{...editableProps} // Editar lo que esta en la celda
                {...safeProps}
                //showFillHandle={!isEditInProgress} // Mostrar el controlador de relleno si no se está editando

                //Permite el cuadro azul que muestra la selección
                onKeyDown={(...args) => {
                  selectionProps.onKeyDown(...args);
                  editableProps.onKeyDown(...args);
                }}
                onMouseDown={(...args) => {
                  selectionProps.onMouseDown(...args);
                  editableProps.onMouseDown(...args);
                }}
              />
              {editorComponent}

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
                  <input type="number" value={heightShape} onChange={handleChangeHeight} />
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
          </main>
        </div>
      </div>
    </>
  );
};

export default App;
