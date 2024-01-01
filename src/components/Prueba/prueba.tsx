import { useRef, useState, useCallback, useEffect } from "react";
import Grid, { useSelection, useEditable } from "@rowsncolumns/grid";
import { Rect, Group } from "react-konva";
import HeaderKonva from "../PruebasKonva/HeaderKonva";
import CellText from "../PruebasKonva/CellText";
import Polygon2 from "./Polygon2";
import Polygon3 from "./Polygon3";
import Json from '../../lithologic.json';
import fosilJson from '../../fossil.json';
import SelectTheme from "../Web/SelectTheme";
import { useParams } from "react-router-dom";
import Fosil from "../Editor/Fosil";
import { Html } from "react-konva-utils";

// Componente de Celda Personalizado
// const Cell = ({ rowIndex, columnIndex, x, y, width, height, value }) => {

//   return (
//     <>
//       {/* <Rect x={x} y={y} height={height} width={width} fill={fill} stroke="grey" strokeWidth={0.5} /> */}
//       {/* <Text x={x} y={y} height={height} width={width} text={value} fontStyle="normal" verticalAlign="middle" align="center" /> */}
//       <Polygon2
//         x={value.x}
//         y={value.y}
//         Width={value.width}
//         Height={value.height}
//         Tension={value.tension}
//         //circles={dataCircle}
//         setCircles={() => console.log("Cambio de circulos")}
//         onClick={() => console.log("Click en poligono")}
//         ColorFill={value.ColorFill}
//         ColorStroke={value.colorStroke}
//         Zoom={value.zoom}
//         Rotation={value.rotation}
//         File={value.file}
//         circles={value.circles}
//       />
//     </>
//   );
// };

const Cell = ({ rowIndex, columnIndex, x, y, width, height, value }) => {
  //const text = `${rowIndex}x${columnIndex}`;
  //const fill = "white";
  // Aquí puedes añadir más lógica según tus necesidades
  return (
    <>
      {/* <Rect x={x} y={y} height={height} width={width} fill={fill} stroke="grey" strokeWidth={0.5} /> */}
      {/* <Text x={x} y={y} height={height} width={width} text={value} fontStyle="normal" verticalAlign="middle" align="center" /> */}
      <Polygon3
        x={x}
        y={y}
        Width={width}
        Height={height}
        Tension={0.5}
        setCircles={() => console.log("Cambio de circulos")}
        onClick={() => console.log("Click en poligono")}

      />

      {/* <Circle x={x} y={y} radius={10} fill="red" stroke="grey" strokeWidth={0.5} draggable /> */}
    </>
  );
};

const App = () => {
  //-----------------// Socket //-----------------//
  const { project } = useParams(); // Sala de proyecto
  const [socket, setSocket] = useState(null); // Instancia del socket
  const isPageActive = useRef(true); // Indica si la página está activa para reconectar con el socket



  //-----------------// GRID //-----------------//
  const gridRef = useRef(null);

  // Dimensiones de la grilla
  const width = 1700;
  const height = 800;

  // Número de filas y columnas
  const [rowCount, setRowCount] = useState(1);
  const [columnCount, setColumnCount] = useState(0);

  // Número de filas congeladas (Fijas)
  const frozenRows = 1; // Header congelado

  // Estado para el ancho de las columnas
  const [columnWidthMap, setColumnWidthMap] = useState({});



  //-----------------// Datos //-----------------//
  const [data, setData] = useState({});
  const [Header, setHeader] = useState([]);
  const [polygons, setPolygons] = useState([
    {
      "x": 0,
      "y": 0,
      "radius": 5,
      "movable": false
    },
    {
      "movable": true,
      "x": 0.95,
      "y": 0,
      "radius": 5
    },
    {
      "x": 0.6,
      "y": 0.3,
      "radius": 5,
      "movable": true 
    },
    {
      "x": 0.95,
      "y": 0,
      "radius": 5,
      "movable": true
    },
    {
      "x": 0,
      "y": 0,
      "radius": 5,
      "movable": false
    }
  ]);


  //---------------// Varios //---------------//

  const [selectedFosil, setSelectedFosil] = useState<string>(Object.keys(fosilJson)[0]);
  const dragUrl = useRef(null);

  //---------------// useEffect Socket //---------------//
  // Conexion y desconexion del socket
  useEffect(() => {

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
      isPageActive.current = false;
      if (socket) {
        socket.close();
      }
    };
  }, [project]);

  // Escucha de mensajes del socket
  useEffect(() => {
    if (socket) {

      socket.onmessage = (event) => {
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

      return () => {
        socket.close();
      };
    }
  }, [socket]);



  //---------------// useEffect Varios //---------------//
  // useEffect(() => {

  //   if (Object.values(polygons).length > 0) {

  //     const coordA = Object.values(polygons).reduce((previousValue, currentValue) => {
  //       console.log(previousValue.y, currentValue.y)
  //       console.log(previousValue.x, currentValue.x)
  //       return {
  //         x: Math.max(previousValue.y, currentValue.y),
  //         y: Math.max(previousValue.y, currentValue.y),
  //       };
  //     }, { x: -Infinity, y: -Infinity });

  //     if (coordA.y === -1000) {
  //       //setLastPositionSI({ x: 100, y: 100 })
  //       setLastPositionID({ x: 200, y: 200 })
  //     } else {
  //       console.log(coordA)
  //       //    setLastPositionSI({ x: coordA.x1, y: coordA.y2 })
  //       setLastPositionID({ x: coordA.x, y: coordA.y + 100 })
  //     }
  //   }
  // }, [polygons]);



  // Obtener datos de la celda
  const getCellValue = useCallback(
    ({ rowIndex, columnIndex }) => {
      const key = Header[columnIndex];
      return data[key] && data[key][rowIndex];
    },
    [data]
  );

  // Manejo de redimensionamiento de columnas
  const handleResize = (columnIndex, newWidth) => {
    setColumnWidthMap(prevWidthMap => ({
      ...prevWidthMap,
      [columnIndex]: newWidth
    }));
    gridRef.current.resizeColumns([columnIndex]);
  };


  const handleOptionChangeF = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFosil(String(event.target.value));
    console.log(event.target.value)
  };

  const OptionsBar = () => {

    return (
      <>
        <div className="navbar bg-base-200">
          <div className="flex-none">

            <div className="dropdown dropdown-end">
              <SelectTheme />
            </div>

            <div className="dropdown dropdown-end">

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





  //-----------------// Funcionalidades y Componentes GRID //-----------------//
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

      // Enviar al socket
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
    isHiddenRow: () => false,
    isHiddenColumn: () => false,
  });

  // Extraer propiedades que no son necesarias para el Grid
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
      // console.log(lastPositionID, "addshape")
      console.log(data["Litologia"])
      const newCount = prevRowCount + 1
      socket.send(JSON.stringify({
        action: "añadir",
        data: {
          rowIndex: newCount,
          x: 0,//lastPositionID.x,
          y: 0,//lastPositionID.y,
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
          activeCell={activeCell}
          //frozenColumns={frozenColumns} // Número de columnas congeladas
          itemRenderer={(props) => {
            console.log(props.rowIndex)

            console.log(data["Litologia"])
            if (props.rowIndex === 0) {

              // Renderizar el Encabezado para la primera fila
              return (
                <HeaderKonva
                  value={Header[props.columnIndex]}
                  onResize={handleResize}
                  {...props}
                />
              )

            } else if (Header[props.columnIndex] === "Estructura fosil" && props.rowIndex === data["Litologia"].length) {
              
              <Group heightShape={props.y} width={150} style={{ border: '1px solid red' }}>
                <Rect
                  key={`header-fosils`}
                  x={0}
                  y={0}
                  width={150}
                  heightShape={data["Litologia"].length}
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
                      height: data["Litologia"].length,
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
                    }}

                  >
                  </div>
                </Html>
              </Group>
            } else if (Header[props.columnIndex] === "Litologia") {
              // Modificar esto
              return (
                <Cell
                  value={polygons[`${props.rowIndex + 1},${props.columnIndex}`] ? polygons[`${props.rowIndex + 1},${props.columnIndex}`] : "a"}
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  {...props}
                />
              );

            } else {
              return (
                <CellText
                  value={data[Header[props.columnIndex]][props.rowIndex]}
                  {...props}
                />
              );
            }
          }
          }
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
    </>
  );
};

export default App;
