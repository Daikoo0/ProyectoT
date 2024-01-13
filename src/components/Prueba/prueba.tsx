import { useRef, useState, useCallback, useEffect } from "react";
import Grid, { useSelection, useEditable } from "@rowsncolumns/grid";
import { Rect, Group, Stage } from "react-konva";
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
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
//import React from 'react';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';
import 'react-quill/dist/quill.snow.css';


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

  const divRef = useRef(null);

  const handleColumns = (e, key) => {
    if (e.target.checked) {
      socket.send(JSON.stringify({
        action: 'columns',
        data: {
          'column': key,
          'isVisible': true,
        },
      }));
    } else {
      socket.send(JSON.stringify({
        action: 'columns',
        data: {
          'column': key,
          'isVisible': false,
        },
      }));
    }
  }



  const exportarDivAPdf = async () => {
    const divRefCurrent = divRef.current;
    if (divRefCurrent) {
      const pdf = new jsPDF();

      // Supongamos que tienes una función que itera sobre los elementos de texto
      // y los agrega al PDF. Debes crear esta función según la estructura de tu HTML.
      const addTextElementsToPDF = (pdf, element) => {
        // Asumimos que 'element' es el div que contiene el texto que quieres agregar
        const textElements = element.querySelectorAll('.texto-seleccionable'); // Ajusta el selector según sea necesario
        textElements.forEach(el => {
          // Añadir el texto al PDF. Aquí necesitas calcular las posiciones 'x' y 'y' según sea necesario.
          pdf.text(el.textContent, 10, 10);
        });
      };

      // Agrega texto al PDF antes de convertir el div a imagen
      addTextElementsToPDF(pdf, divRefCurrent);

      // Convertir el div a imagen para el contenido no textual (como canvas)
      const dataUrl = await domtoimage.toPng(divRefCurrent);
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        // Calcular la proporción para mantener la relación de aspecto
        const imgWidth = img.width;
        const imgHeight = img.height;
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

        // Agregar la imagen al PDF
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Guardar el PDF
        pdf.save('tuArchivo.pdf');
      };
    }
  };

  const HandleSave = () => {
    console.log("guardando..")
    socket.send(JSON.stringify({ action: "save" }));
    //socket.send(JSON.stringify({action:"delete", id: selectedShapeID}));
  };

  //-----------------// Socket //-----------------//
  const { project } = useParams(); // Sala de proyecto
  const [socket, setSocket] = useState(null); // Instancia del socket
  const isPageActive = useRef(true); // Indica si la página está activa para reconectar con el socket

  //-----------------// GRID //-----------------//
  const gridRef = useRef(null);
  const headerGridRef = useRef(null);

  // Dimensiones de la grilla
  const width = 1700;
  const height = 800;

  // Número de filas y columnas
  const [rowCount, setRowCount] = useState(0);
  const [columnCount, setColumnCount] = useState(0);

  // Número de filas congeladas (Fijas)
  const frozenRows = 1; // Header congelado

  // Estado para el ancho de las columnas
  const [columnWidthMap, setColumnWidthMap] = useState({});

  //-----------------// Datos //-----------------//
  const [data, setData] = useState({});
  const [Header, setHeader] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [fossils, setFossils] = useState([]);

  //---------------// Menu de la derecha //---------------//
  // const [sideBar, setSideBar] = useState<boolean>(false);
  // const [sideBarMode, setSideBarMode] = useState<string>("");

  const [sideBarState, setSideBarState] = useState({
    sideBar: false,
    sideBarMode: ""
  });

  //---------------// Menu de la derecha fosiles //---------------//

  const [upperLimit, setUpperLimit] = useState('');
  const [lowerLimit, setLowerLimit] = useState('');
  const [selectedFosil, setSelectedFosil] = useState<string>(Object.keys(fosilJson)[0]);
  const [relativeX, setRelativeX] = useState<number>(0)
  const [idClickFosil, setIdClickFosil] = useState<number>(0);

  const handleConfirm = () => {
    console.log(upperLimit, lowerLimit);
    socket.send(JSON.stringify({
      action: 'addFosil',
      data: {
        "upperLimit": parseInt(upperLimit),
        "lowerLimit": parseInt(lowerLimit),
        "selectedFosil": selectedFosil,
        "relativeX": relativeX
      }
    }));
  };

  const config = () => {
    setSideBarState({
      sideBar: true,
      sideBarMode: "config"
    })
  }

  const handleDeleteFosil = () => {
    socket.send(JSON.stringify({
      action: 'deleteFosil',
      data: {
        "idFosil": idClickFosil,
      }
    }));
  }

  const handleFosilEdit = () => {

    const foundFossil = fossils.find(fossil => fossil.idFosil === idClickFosil);
    socket.send(JSON.stringify({
      action: 'editFosil',
      data: {
        "idFosil": idClickFosil,
        "upperLimit": parseInt(upperLimit),
        "lowerLimit": parseInt(lowerLimit),
        "selectedFosil": selectedFosil,
        "relativeX": foundFossil.relativeX
      }
    }));
  }

  // Seleccion de patron / Pattern
  const [selectedOption, setSelectedOption] = useState<string>(Object.keys(Json)[0]);

  // Evento de seleccion de patron
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
    //if (selectedShapeIndex !== null) {
    //   const updatedShapes = [...shapes];
    //   updatedShapes[selectedShapeIndex].polygon.file = Json[event.target.value];
    //   updatedShapes[selectedShapeIndex].polygon.fileOption = event.target.value;
    //   sendSocket("polygon", selectedShapeIndex);
    //}
  };

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
          case 'data': {
            const { Litologia, 'Estructura fosil': estructuraFosil, ...rest } = shapeN.data;

            setData(rest)
            setPolygons(Litologia)
            setHeader(shapeN.config)
            setColumnCount(shapeN.config.length)
            setFossils(estructuraFosil)

            break;
          }
          case 'editText':
            setData(prev => {
              const newData = { ...prev };
              const key = shapeN.key;
              newData[key] = { ...newData[key], [shapeN.rowIndex]: shapeN.value };

              return newData;
            });
            break
          
          case 'añadir':{
            const { Litologia, 'Estructura fosil': estructuraFosil, ...rest } = shapeN.data;

            setData(rest)
            setPolygons(Litologia)
 
            break;
          }
          case 'añadirEnd':
            console.log(shapeN.rowIndex)
            setPolygons(prev => {
              const newData = { ...prev };
              newData[shapeN.rowIndex] = shapeN.value;
              return newData;
            });
            break

          case 'addFosil':
            setFossils(prevfossils => [...prevfossils, shapeN]);
            break
          case 'editFosil':
            const updatedFossils = fossils.filter(fossil => fossil.idFosil !== idClickFosil);
            setFossils([...updatedFossils, shapeN]);
            setSideBarState({
              sideBar: false,
              sideBarMode: ""
            })
            break
          case 'deleteFosil':
            const updatedFosils = fossils.filter(fossil => fossil.idFosil !== shapeN.idFosil);
            setFossils(updatedFosils);
            setSideBarState({
              sideBar: false,
              sideBarMode: ""
            })
            break
          case 'columns':
            // const index = Header.indexOf(shapeN.column);
            // // Copia el array para no mutar el estado directamente
            // let newArray = [...Header];

            // if (shapeN.isVisible) {
            //   newArray.push(shapeN.column);
            // } else if(!shapeN.isVisible) {
            //   newArray.splice(index, 1);
            // }
            // console.log(newArray)
            //setHeader(newArray);
            setHeader(shapeN.columns)
            setColumnCount(shapeN.columns.length)
           // setHeader(shapeN.column)
            break
          default:
            console.error(`Acción no reconocida: ${shapeN.action}`);
            break;
        }

      };

      return () => {
        socket.close();
      };
    }
  }, [socket]);



  //---------------// useEffect Varios //---------------//
  const polygonCountRef = useRef(Object.keys(polygons).length);

  useEffect(() => {
    const currentCount = Object.keys(polygons).length;
    if (currentCount !== polygonCountRef.current) {
      setRowCount(currentCount);
      polygonCountRef.current = currentCount;
      console.log(currentCount)
    }
  }, [polygons]);

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
    headerGridRef.current.resizeColumns([columnIndex]);

  };

  const processCircles = (circles, x, y, width, height) => {
    return circles.map(circle => ({
      ...circle,
      x: x + circle.x * width,
      y: y + circle.y * height
    }));
  };

  const OptionsBar = () => {

    return (
      <>
        <div className="navbar bg-base-200">
          <div className="flex-none">

            <button onClick={HandleSave}>Guardar Cambios</button>
            <SelectTheme />
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

              <div className="tooltip tooltip-bottom" onClick={config} data-tip="Configuración">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25" />
                  </svg>
                </div>

              </div>
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

            <div onClick={exportarDivAPdf} className="dropdown dropdown-end" >
              <div className="tooltip tooltip-bottom" data-tip="Agregar capa">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3" />
                  </svg>
                </div>
              </div>

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
      console.log(polygons)

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


  const addShape = () => {
    socket.send(JSON.stringify({
      action: 'añadir',
      data: {
        "height": 200,
        "rowIndex": -1
      }
    }));
  }

  const mergedCells = [
    {
      top: 0,
      left: Header.indexOf("Estructura fosil"),
      right: Header.indexOf("Estructura fosil"),
      bottom: rowCount - 1,
    }
  ];

  //boul 0.95
  //cobb 0.91
  //pebb 0.87
  //gran 0.83
  //vc 0.79
  //c 0.75
  //m 0.71
  //f 0.67
  //vf 0.63
  //site 0.59
  //clay 0.55



  const Editor = ({ placeholder }) => {
    const [editorHtml, setEditorHtml] = useState('');
  
    const handleChange = html => {
      setEditorHtml(html);
  
    };
    return (
      <div>
        <ReactQuill
          onChange={handleChange}
          value={editorHtml}
          modules={Editor.modules}
          formats={Editor.formats}
          bounds={'.ap'}
          placeholder={placeholder}
        />
       
      </div>
    );
  };
  
  /*
   * Quill modules to attach to editor
   * See https://quilljs.com/docs/modules/ for complete options
   */
  Editor.modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  };
  
  /* 
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */
  Editor.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];
  
  /* 
   * PropType validation
   */
  Editor.propTypes = {
    placeholder: PropTypes.string,
  };

  // Renderizado de la Grilla
  return (
    <>
      <OptionsBar />
      <div className="drawer drawer-end">

        <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={sideBarState.sideBar} onClick={() => setSideBarState({
          sideBar: false,
          sideBarMode: ""
        })} />
        <div id="este" className="drawer-content">
          {/* <label htmlFor="my-drawer" className="drawer-button btn btn-primary">Open drawer</label> */}

          <div ref={divRef} style={{ display: "flex", flexDirection: "column" }}>

            <Grid
              ref={headerGridRef} // Referencia para manipular la grilla principal desde otros componentes
              width={width} // Ancho Stage
              height={110} // Altura Stage
              columnCount={columnCount} // Número total de columnas
              rowCount={1} // Número total de filas
              columnWidth={(index) => columnWidthMap[index] || 200} // Ancho de las columnas, obtenido del estado
              rowHeight={() => { return 110; }}
              showScrollbar={false}
              itemRenderer={(props) => {
                
                let highestRelativeX = fossils.length > 0 ?
                  fossils.reduce((max, fossil) => fossil.relativeX > max ? fossil.relativeX : max, fossils[0].relativeX)
                  : 200
                return (
                  <HeaderKonva
                    value={Header[props.columnIndex]}
                    onResize={handleResize}
                    highestRelativeX={highestRelativeX}
                    {...props}
                  />
                )
              }
              }
            />
          </div>

          {rowCount !== 0 ?

            <div ref={divRef} style={{ display: "flex", flexDirection: "column", position: "absolute" }}>
              <>
                <Grid
                  ref={gridRef} // Referencia para manipular la grilla principal desde otros componentes
                  width={width} // Ancho Stage
                  height={height} // Altura Stage
                  columnCount={columnCount} // Número total de columnas
                  rowCount={rowCount} // Número total de filas
                  mergedCells={mergedCells}
                 // showScrollbar={false}
                  columnWidth={(index) => columnWidthMap[index] || 200} // Ancho de las columnas, obtenido del estado
                  rowHeight={(index) => {
                    if (polygons[index]) {
                      return polygons[index]["height"];
                    } else {
                      return 200;
                    }
                  }}
                  activeCell={activeCell}
                  itemRenderer={(props) => {

                    if (Header[props.columnIndex] === "Litologia") {

                      const processedCircles = processCircles(
                        polygons[props.rowIndex]["circles"],
                        props.x,
                        props.y,
                        props.width,
                        props.height
                      );

                      return (
                        <>
                          <Polygon3
                            x={props.x}
                            y={props.y}
                            Width={props.width}
                            Height={props.height}
                            Tension={0}
                            circles={processedCircles}
                          />

                          <Rect
                            x={props.x}
                            y={props.y}
                            height={props.height}
                            width={95}
                            fill={"transparent"}
                            onClick={() => {
                              setSideBarState({
                                sideBar: true,
                                sideBarMode: "polygon"
                              })
                            }}
                          >
                          </Rect>
                        </>
                      );

                    } else if (Header[props.columnIndex] === "Estructura fosil") {

                      return (

                        <Group>
                          <Rect
                            key={`fosils`}
                            x={props.x}
                            y={props.y}
                            width={props.width}
                            //heightShape={heightShape}
                            height={props.height}
                            fill="white"
                            stroke="grey"
                            onClick={(e) => {
                              setSideBarState({
                                sideBar: true,
                                sideBarMode: "fosil"
                              })
                              const clickX = e.evt.clientX;
                              const clickY = e.evt.clientY;
                              const rectX = e.target.x();
                              const rectY = e.target.y();
                              const relativeX = clickX - rectX;
                              const relativeY = clickY - rectY;
                              console.log(`Relative Click Coordinates: X: ${relativeX}), Y: ${relativeY}`);
                              setRelativeX(relativeX)
                            }}
                          />
                          {fossils.length > 0 ?

                            fossils.map((img, index) => (

                              <Fosil img={img} index={index} x={props.x}
                                sideBarState={sideBarState} setSideBarState={setSideBarState}
                                idClickFosil={idClickFosil} setIdClickFosil={setIdClickFosil}
                              />

                            )) : <></>}
                        </Group>

                      )
                    } else {

                      return (
                        // <CellText
                        //   value={data[Header[props.columnIndex]][props.rowIndex]}
                        //   {...props}
                        // />

                        <Rect x={props.x} y={props.y} height={props.height} width={props.width} fill={"white"} stroke="grey" strokeWidth={1}
                        onClick={(e)=>
                          setSideBarState({
                            sideBar: true,
                            sideBarMode: "text"
                          }) 
                        }
                        />
                      );
                    }
                  }
                  }
                  {...safeProps}
                  onScroll={({ scrollLeft }) => {
                    headerGridRef.current.scrollTo({ scrollLeft });
                  }}
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

              </>
            </div>
            : <div></div>
          }
        </div>

        {/* </div> */}



        {/* //-----------------// SIDEBAR //-----------------//*/}

        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          {
            (() => {
              switch (sideBarState.sideBarMode) {
                case "polygon":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Editando polígono</li>
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

                      <input type="range" min={0.51} max={0.95} className="range" step={0.04} />
                      <div className="w-full flex justify-between text-xs">
                        <span className="-rotate-90">s/n</span>
                        <span className="-rotate-90">clay</span>
                        <span className="-rotate-90">silt</span>
                        <span className="-rotate-90">vf</span>
                        <span className="-rotate-90">f</span>
                        <span className="-rotate-90">m</span>
                        <span className="-rotate-90">c</span>
                        <span className="-rotate-90">vc</span>
                        <span className="-rotate-90">grain</span>
                        <span className="-rotate-90">pebb</span>
                        <span className="-rotate-90">cobb</span>
                        <span className="-rotate-90">boul</span>

                        {/* <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span> */}

                      </div>

                      <li>
                        <button className="btn btn-primary" onClick={() => {
                          socket.send(JSON.stringify({
                            action: 'delete',
                            data: {
                              "rowIndex": 0
                            }
                          }));

                        }}>Delete</button>
                      </li>
                    </ul>

                  );
                case "fosil":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Fósiles</li>

                      <div className="grid h-100 card bg-base-300 rounded-box place-items-center">
                        <li>Agregar nuevo fósil:</li>
                        <li>
                          <select className="select select-bordered w-full max-w-xs" value={selectedFosil} onChange={(e) => { setSelectedFosil(String(e.target.value)) }}>
                            <option disabled selected>Elige el tipo de fósil</option>
                            {Object.keys(fosilJson).map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </li>
                        <li>
                          <img
                            alt="None"
                            src={`../src/assets/fosiles/${fosilJson[selectedFosil]}.svg`} />
                        </li>
                        <li>
                          límite superior (metros):
                          <input
                            type="number"
                            value={upperLimit}
                            onChange={(e) => setUpperLimit(e.target.value)}
                          />
                        </li>
                        <li>
                          Límite inferior (metros):
                          <input
                            type="number"
                            value={lowerLimit}
                            onChange={(e) => setLowerLimit(e.target.value)}
                          />
                        </li>
                        <button className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
                      </div>
                    </ul>
                  );
                case "text":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Editando texto</li>
                      <Editor placeholder={'Write something...'}/>
                    </ul>
                  );
                case "editFosil":
                  // onClickFosil();
                  const foundFossil = fossils.find(fossil => fossil.idFosil === idClickFosil);
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Editando fósil</li>
                      <li>
                        <select className="select select-bordered w-full max-w-xs" value={selectedFosil} onChange={(e) => { setSelectedFosil(String(e.target.value)) }}>
                          <option disabled selected>Selecciona un fósil</option>
                          {Object.keys(fosilJson).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </li>
                      <li>

                        <div className="flex w-full">
                          <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">  <img
                            alt="None"
                            src={`../src/assets/fosiles/${foundFossil ? fosilJson[foundFossil.selectedFosil] : fosilJson[1]}.svg`} />
                          </div>
                          <div className="divider divider-horizontal">

                            <svg className="w-10 h-10 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                          </div>
                          <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">   <img
                            alt="None"
                            src={`../src/assets/fosiles/${fosilJson[selectedFosil]}.svg`} /></div>
                        </div>


                      </li>
                      <li>
                        límite superior (metros):
                        <input
                          type="number"
                          placeholder={foundFossil ? foundFossil.upper : null}
                          value={upperLimit}
                          onChange={(e) => setUpperLimit(e.target.value)}
                        />
                      </li>
                      <li>
                        Límite inferior (metros):
                        <input
                          type="number"
                          placeholder={foundFossil ? foundFossil.lower : null}
                          value={lowerLimit}
                          onChange={(e) => setLowerLimit(e.target.value)}
                        />
                      </li>
                      <li> <button className="btn btn-primary" onClick={handleFosilEdit}>Confirmar edición</button></li>
                      <li><button className="btn btn-primary" onClick={handleDeleteFosil}>Eliminar fósil</button></li>
                    </ul>)
                case "config":

                  const list = ["Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "Ambiente Depositacional", "Descripcion"]
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Configuración</li>
                      {list.map((key) => {
                        if (key != "Espesor" && key != "Litologia") {
                          return (
                            <li key={key}>
                              <div style={{ display: 'flex' }}>
                                <input
                                  type="checkbox"
                                  id={key}
                                  name={key}
                                  checked={Header.includes(key) ? true : false}
                                  onChange={(e) => handleColumns(e, key)}
                                />
                                <label htmlFor={key} style={{ whiteSpace: 'nowrap' }}>
                                  {key}
                                </label>
                              </div>
                            </li>
                          );
                        }
                      })}
                    </ul>)

                default:
                  return <></>;
              }
            })()
          }

        </div>

      </div>
    </>
  );

};


export default App;
