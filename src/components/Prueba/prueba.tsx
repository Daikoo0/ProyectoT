import { useRef, useState, useCallback, useEffect } from "react";
import Grid, { Cell as DefaultCell, useSelection, useEditable } from "@rowsncolumns/grid";
import { Rect, Text, Group, Circle } from "react-konva";
import HeaderKonva from "../PruebasKonva/HeaderKonva";
import Polygon2 from "./Polygon2";
import Json from '../../lithologic.json';
import fosilJson from '../../fossil.json';
import SelectTheme from "../Web/SelectTheme";
import { useParams } from "react-router-dom";

// Componente de Celda Personalizado
const Cell = ({ rowIndex, columnIndex, x, y, width, height, value }) => {
  //const text = `${rowIndex}x${columnIndex}`;
  const fill = "white";
  // Aquí puedes añadir más lógica según tus necesidades
  return (
    <>
      {/* <Rect x={x} y={y} height={height} width={width} fill={fill} stroke="grey" strokeWidth={0.5} /> */}
      {/* <Text x={x} y={y} height={height} width={width} text={value} fontStyle="normal" verticalAlign="middle" align="center" /> */}
      <Polygon2
        x={x}
        y={y}
        Width={width}
        Height={height}
        Tension={0.5}
        //circles={dataCircle}
        setCircles={() => console.log("Cambio de circulos")}
        onClick={() => console.log("Click en poligono")}

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
    "3,1": <Polygon2 x={100} y={100} Width={100} Height={100} Tension={1} onClick={""}/>,
    "3,4": "texto del polygon2",
    "4,2": "Contenido de la celda",
    "2,2": "Cocos"
  });

  
  //---------------// CAPAS Y GRID //---------------//
  // Alto de la capa
  const [initialHeight] = useState(100);
  const [heightShape, setHeight] = useState<number>(initialHeight);

  const [lastPositionID, setLastPositionID] = useState({ x: 200, y: 200 });

   //Figuras / Poligonos 
   const [shapes, setShapes] = useState([]);

   // Index / ID de la Figura / Poligono
   const [selectedShapeIndex, setSelectedShapeIndex] = useState(null); // 0,1,2,3...
   const [selectedShapeID, setSelectedShapeID] = useState(null);

  const width = 1700;
  const height = 800;

  //const rowCount = 5;

  const [rowCount, setRowCount] = useState(shapes.length);
  const columnCount = 8;

  const gridRef = useRef(null);
  const frozenRows = 1;

  // Estado para el ancho de las columnas
  const [columnWidthMap, setColumnWidthMap] = useState({});

  // Referencia a la grilla principal


  const getCellValue = useCallback(
    ({ rowIndex, columnIndex }) => data[`${rowIndex},${columnIndex}`],
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

  const HandleUndo = () => {
    console.log("deshacer")
    socket.send(JSON.stringify({ action: "undo" }));
  };

  const handleOptionChangeF = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFosil(String(event.target.value));
    console.log(event.target.value)
  };


    // contenido inicial de las columnas (borrar)
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

    const dragUrl = useRef(null);
  
    // Seleccion de patron / Pattern
    const [selectedFosil, setSelectedFosil] = useState<string>(Object.keys(fosilJson)[0]);
  
  //const [newWidth, setNewWidth] = useState(100);

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
          console.log("shapeN")

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
        } else if (shapeN.action === 'heightShape') {
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
        //setLastPositionSI({ x: 100, y: 100 })
        setLastPositionID({ x: 200, y: 200 })
      } else 
      {
        console.log(coordA)
    //    setLastPositionSI({ x: coordA.x1, y: coordA.y2 })
        setLastPositionID({ x: coordA.x2, y: coordA.y2 + 100 })
      }


    }

  }, [shapes]);

  // Funciones de selección y edición (del primer código)
  const { activeCell, selections, setActiveCell, ...selectionProps } = useSelection({
    gridRef,
    rowCount,
    columnCount,
    getValue: ({ rowIndex, columnIndex }) => data[`${rowIndex},${columnIndex}`],
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
      console.log(data)
      setData((prev) => ({ ...prev, [`${rowIndex},${columnIndex}`]: value }));
      gridRef.current.resizeColumns([columnIndex]);

      /* Select the next cell */
      if (nextActiveCell) {
        setActiveCell(nextActiveCell);
      }
    },
    canEdit: ({ rowIndex, columnIndex }) => {
      console.log('Can edit', columnIndex, rowIndex);
      if (rowIndex === 0) return false;
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
        setData((prev) => {
          return {
            ...prev,
            [`${activeCell.rowIndex},${activeCell.columnIndex}`]: "",
          };
        });
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


  const addShape = () => {
console.log("dadsdsa")
    const send = {
      action: "añadir",
      id : rowCount,
      x : lastPositionID.x - (columnWidthMap[1] || 200),
      y : lastPositionID.y,
      height : height,
      width : width,
    }
    console.log(send)
    socket.send(JSON.stringify(send));

  }

  // Renderizado de la Grilla
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header Grid */}
      {/* <Grid
        ref={headerGridRef} // Referencia para manipular el encabezado desde otros componentes
        columnCount={columnCount} // Número total de columnas
        rowCount={1} // Solo una fila para el encabezado
        width={width} // Ancho del encabezado, normalmente igual al de la grilla principal
        height={60} // Altura del encabezado
        columnWidth={(index) => columnWidthMap[index] || 100} // Ancho de la columna, obtenido del estado
        rowHeight={() => 60} // Altura de las filas en el encabezado
        showScrollbar={false} // Esconder la barra de desplazamiento para el encabezado
        itemRenderer={(props) => {
          // Renderizador personalizado para las celdas del encabezado
          return <HeaderKonva
            {...props}
            onResize={handleResize} // Función para manejar el redimensionamiento de las columnas
            frozenColumns={frozenColumns} // Número de columnas congeladas
          />
        }}
        // onScroll={({ scrollLeft }) => {
        //   // Sincronizar el desplazamiento horizontal con la grilla principal
        //   gridRef.current.scrollTo({ scrollLeft });
        // }}
      /> */}

      {/* Main Grid */}
      <OptionsBar/>
      <Grid
        ref={gridRef} // Referencia para manipular la grilla principal desde otros componentes
        width={width} // Ancho Stage
        height={height} // Altura Stage
        columnCount={columnCount} // Número total de columnas
        rowCount={rowCount} // Número total de filas
        frozenRows={frozenRows}
        columnWidth={(index) => columnWidthMap[index] || 200} // Ancho de las columnas, obtenido del estado
        rowHeight={(index) => {
          if (index === 0) return 80;
          return 100;
        }}
        //rowHeight={() => 40} // Altura de las filas en la grilla principal
        activeCell={activeCell}
        //frozenColumns={frozenColumns} // Número de columnas congeladas

        //itemRenderer={Cell} // Renderizador personalizado para las celdas de la grilla
        itemRenderer={(props) => {
          if (props.rowIndex === 0) {

            // Renderizar el Encabezado para la primera fila
            return (
              <HeaderKonva

                onResize={handleResize}
                {...props}
              />
            )
          } else {
            // Renderizar celdas normales para el resto de la grilla

            if (props.columnIndex === 1) {
            
              return (
                <Cell
                  value={data[`${props.rowIndex},${props.columnIndex}`]}
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  {...props}
                />
              );
              
            } else {
              return (
                <DefaultCell
                  value={data[`${props.rowIndex},${props.columnIndex}`]}
                  align="center"
                  fill="white"
                  stroke="blue"
                  fontSize={12}
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
  );
};

export default App;
