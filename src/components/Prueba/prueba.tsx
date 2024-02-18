import { useRef, useState, useCallback, useEffect } from "react";
import Grid, { useSelection, useEditable } from "@rowsncolumns/grid";
import { Rect, Group } from "react-konva";
import HeaderKonva from "../PruebasKonva/HeaderKonva";
//import CellText from "../PruebasKonva/CellText";
//import Polygon2 from "./Polygon2";
import Polygon3 from "./Polygon3";
import Json from '../../lithologic.json';
import fosilJson from '../../fossil.json';
import SelectTheme from "../Web/SelectTheme";
import { useParams } from "react-router-dom";
import Fosil from "../Editor/Fosil";
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';
import 'react-quill/dist/quill.snow.css';
import { Html } from "react-konva-utils";
import Contacts from '../../contacts.json';
import Ruler from "./Ruler2";


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
  const [scale, setScale] = useState(1);
  const { project } = useParams(); // Sala de proyecto
  const [socket, setSocket] = useState(null); // Instancia del socket
  const isPageActive = useRef(true); // Indica si la página está activa para reconectar con el socket

  //-----------------// GRID //-----------------//
  const gridRef = useRef(null);
  const headerGridRef = useRef(null);

  // Dimensiones de la grilla
  const width = window.innerWidth - 15;
  const height = window.innerHeight - 200;

  // Número de filas y columnas
  const [rowCount, setRowCount] = useState(0);
  const [columnCount, setColumnCount] = useState(0);

  // Número de filas congeladas (Fijas)
  // const frozenRows = 1; // Header congelado

  // Estado para el ancho de las columnas
  const [columnWidthMap, setColumnWidthMap] = useState({});

  //-----------------// Datos //-----------------//
  const [data, setData] = useState({});
  const [Header, setHeader] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [fossils, setFossils] = useState([]);
  //---------------// regla // --------------//

  const [isInverted, setIsInverted] = useState(false);

  //---------------// Menu de la derecha //---------------//
  // const [sideBar, setSideBar] = useState<boolean>(false);
  // const [sideBarMode, setSideBarMode] = useState<string>("");
  const [insertValue, setinsertValue] = useState(0);
  const [insertHeight, setinsertHeight] = useState(20);

  const [sideBarState, setSideBarState] = useState({
    sideBar: false,
    sideBarMode: ""
  });
  //----------------// Menu derecha contactos //------------------------//

  const [selectedContact, setSelectedContact] = useState('')
  const [selectedPolygon, setSelectedPolygon] = useState<number>(0);

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
  const contacts = () => {
    setSideBarState({
      sideBar: true,
      sideBarMode: "contacts"
    })
  }

  const addContact = () => {
    const newPolygons = polygons
    var circleTop = newPolygons[selectedPolygon].circles[newPolygons[selectedPolygon].circles.length - 2]
    newPolygons[selectedPolygon].lowerContact = selectedContact
    if (newPolygons[selectedPolygon + 1]) {
      var circleBottom = newPolygons[selectedPolygon + 1].circles[2]
      newPolygons[selectedPolygon].lowerLimit = Math.max(circleTop.x, circleBottom.x)
      newPolygons[selectedPolygon + 1].upperLimit = Math.max(circleTop.x, circleBottom.x)
      newPolygons[selectedPolygon + 1].upperContact = selectedContact
    } else {
      newPolygons[selectedPolygon].lowerLimit = circleTop.x
    }
    setPolygons(newPolygons)

    console.log(polygons[selectedPolygon])
    console.log(polygons[selectedPolygon + 1])
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


  //---------------// useEffect Socket //---------------//
  // Conexion y desconexion del socket
  useEffect(() => {

    const connectWebSocket = () => {
      const newSocket = new WebSocket(`ws://${import.meta.env.VITE_SOCKET_URL}/ws/${project}`);
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

          case 'añadir': {
            const { Litologia, 'Estructura fosil': estructuraFosil, ...rest } = shapeN.data;
            setPolygons(Litologia)
            setData(rest)
            break;
          }
          case 'polygon':
            setPolygons(prev => {
              const newData = { ...prev };
              newData[shapeN.rowIndex] = shapeN.polygon;
              return newData;
            });
            break
          case 'añadirEnd':
            console.log(shapeN.rowIndex)
            setPolygons(prev => {
              const newData = { ...prev };
              newData[shapeN.rowIndex] = shapeN.value;
              return newData;
            });
            break

          case 'delete': {
            const { Litologia, 'Estructura fosil': estructuraFosil, ...rest } = shapeN.data;
            setPolygons(Litologia)
            setData(rest)
            break;
          }
          case 'addCircle':
            setPolygons(prev => {
              const newData = { ...prev };
              newData[shapeN.rowIndex]["circles"] = shapeN.newCircle;
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
            setHeader(shapeN.columns)
            setColumnCount(shapeN.columns.length)
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



  // const handleScaleChange = (newScale) => {
  //   setScale(newScale);
  // };

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

            <div onClick={() => setSideBarState({ sideBar: true, sideBarMode: "añadirCapa" })} className="dropdown dropdown-end" >
              <div className="tooltip tooltip-bottom" data-tip="Agregar capa">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                  </svg>
                </div>
              </div>
            </div>

            {/* <div className="dropdown dropdown-right">
              <div tabIndex={0} role="button" className="btn m-1">
                <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                </svg>

              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><button onClick={() => addShape(0)} type="button">Insertar filas encima</button></li>
                
                <li>
                  <button onClick={() => addShape(insertValue)} type="button">Insertar filas</button>
                  <input onChange={(e) => setinsertValue(Number(e.target.value))} value={insertValue} type="number" id="inputNumber" name="inputNumber" min="0" max={rowCount} />
                </li>

                <li><button onClick={() => addShape(-1)} type="button">Insertar filas debajo</button></li>
              </ul>
            </div> */}


            <div onClick={exportarDivAPdf} className="dropdown dropdown-end" >
              <div className="tooltip tooltip-bottom" data-tip="Agregar capa">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3" />
                  </svg>
                </div>
              </div>

            </div>

            <div className="tooltip tooltip-bottom" onClick={contacts} data-tip="Contacto">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                cambiar contacto
              </div>
            </div>

            <select value={scale} className="select select-primary w-full max-w-xs" onChange={(e) => setScale(Number(e.target.value))}>
              <option value={10}>1:10</option>
              <option value={5}>1:20</option>
              <option value={4}>1:25</option>
              <option value={2}>1:50</option>
              <option value={1}>1:100</option>
              <option value={0.5}>1:200</option>
              <option value={0.4}>1:250</option>
              <option value={0.2}>1:500</option>

            </select>

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
      if (Header[columnIndex] === "Espesor") return false;
      return true;
    },

    onDelete: (activeCell) => {
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


  const addShape = (row, height) => {

    socket.send(JSON.stringify({
      action: 'añadir',
      data: {
        "height": height,
        "rowIndex": row
      }
    }));
  }

  const mergedCells = [
    {
      top: 0,
      left: Header.indexOf("Estructura fosil"),
      right: Header.indexOf("Estructura fosil"),
      bottom: rowCount - 1,
    },
    {
      top: 0,
      left: Header.indexOf("Espesor"),
      right: Header.indexOf("Espesor"),
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



  const Editor = ({ placeholder, text }) => {
    const [editorHtml, setEditorHtml] = useState(text);

    const handleChange = html => {
      console.log(html)
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

        {/* Boton para mandar editor html por socket */}
        <button onClick={() => {
          socket.send(JSON.stringify({
            action: 'editText',
            data: {
              "key": Header[activeCell.columnIndex],
              "value": editorHtml,
              "rowIndex": activeCell.rowIndex
            }
          }));
          gridRef.current.resizeColumns([activeCell.columnIndex]);
        }}>Enviar</button>
      </div>
    );
  };

  Editor.modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' },
      { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean'], [{ 'align': ["right", "center", "justify"] }]
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  };

  Editor.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'background', 'color', 'align'
  ];

  /* 
   * PropType validation
   */
  Editor.propTypes = {
    placeholder: PropTypes.string,
  };

  // Update polygons[rowIndex][circles]
  const updateCircles = (rowIndex: number, insertIndex: number, newCircle: any) => {
    console.log(rowIndex, insertIndex, newCircle)
    const update = polygons[rowIndex]["circles"]

    update.splice(insertIndex, 0, newCircle);

    socket.send(JSON.stringify({
      action: 'addCircle',
      data: {
        "rowIndex": rowIndex,
        "newCircle": update
      }
    }));

  };

  const [modalData, setModalData] = useState({ index: null, insertIndex: null, x: 0.51 });

  const openModalPoint = (index, insertIndex, x) => {
    (document.getElementById('modalPoint') as HTMLDialogElement).showModal();
    console.log(index, x)
    setModalData({ index, insertIndex, x });
  };

  const updateCirclePoint = (index, insertIndex, x) => {
    console.log("se envio:", index, insertIndex, x)

    const update = polygons[index]["circles"]
    update[insertIndex].x = x;

    // setPolygons(prev => {
    //   const newData = { ...prev };
    //   newData[index]["circles"] = update;
    //   return newData;
    // });

    socket.send(JSON.stringify({
      action: 'addCircle',
      data: {
        "rowIndex": index,
        "newCircle": update
      }
    }));

  }

  const deleteCirclePoint = (index, insertIndex) => {
    console.log("se envio:", index, insertIndex)

    const update = polygons[index]["circles"]
    update.splice(insertIndex, 1);

    setPolygons(prev => {
      const newData = { ...prev };
      newData[index]["circles"] = update;
      return newData;
    });

    // socket.send(JSON.stringify({
    //   action: 'addCircle',
    //   data: {
    //     "rowIndex": index,
    //     "newCircle": update
    //   }
    // }));

  }


  const handlePolygonChange = (event, nombre, index) => {

    var val = event.target.value;

    if (nombre === "file") {
      val = Json[String(event.target.value)]
      console.log(val)
    }
    const updatedPolygon = polygons[index];
    updatedPolygon[nombre] = val;

    socket.send(JSON.stringify({
      action: 'polygon',
      data: {
        "rowIndex": index,
        "newPolygon": updatedPolygon,
      }
    }));


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
                  key={`${scale}-${rowCount}`}
                  ref={gridRef} // Referencia para manipular la grilla principal desde otros componentes
                  width={width} // Ancho Stage
                  height={height} // Altura Stage
                  columnCount={columnCount} // Número total de columnas
                  rowCount={rowCount} // Número total de filas
                  mergedCells={mergedCells}
                  // showScrollbar={false}
                  columnWidth={(index) => columnWidthMap[index] || 200} // Ancho de las columnas, obtenido del estado
                  activeCell={activeCell}
                  rowHeight={(index) => {
                    if (polygons[index]) {
                      const baseHeight = polygons[index]["height"];
                      return baseHeight * scale;
                    } else {
                      return 200;
                    }
                    
                  }}
                  itemRenderer={(props) => {
                    if (polygons[props.rowIndex]) {
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
                              Tension={polygons[props.rowIndex]["tension"]}
                              circles={processedCircles}
                              rowIndex={props.rowIndex}
                              setCircles={updateCircles}
                              openModalPoint={openModalPoint}
                              upperContact={polygons[props.rowIndex]["upperContact"]}
                              lowerContact={polygons[props.rowIndex]["lowerContact"]}
                              //    lowerLimit={polygons[props.rowIndex]["lowerLimit"]}
                              upperLimit={polygons[props.rowIndex]["upperLimit"]}
                              ColorFill={polygons[props.rowIndex]["ColorFill"]}
                              ColorStroke={polygons[props.rowIndex]["colorStroke"]}
                              File={polygons[props.rowIndex]["file"]}
                              Rotation={polygons[props.rowIndex]["rotation"]}
                              Zoom={polygons[props.rowIndex]["zoom"]}
                              selected={activeCell?.rowIndex === props.rowIndex && activeCell?.columnIndex === props.columnIndex}
                            />

                            <Rect
                              x={props.x - 10}
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
                                  setSideBarState={setSideBarState}
                                  setIdClickFosil={setIdClickFosil}
                                />

                              )) : <></>}
                          </Group>

                        )
                      }
                      else if (Header[props.columnIndex] === "Espesor") {

                        return (
                          <Group
                            onClick={() => {
                              setSideBarState({
                                sideBar: true,
                                sideBarMode: "Espesor"
                              })
                            }}
                          >
                            <Ruler
                              key={`Espesor`}
                              x={props.x}
                              y={props.y}
                              width={props.width}
                              height={props.height}
                              scale={scale}
                              isInverted={isInverted}

                            />
                          </Group>
                        )
                      }

                      else {
                        const borderWidth = 2;
                        const x = props.x;
                        const y = props.y;
                        const width = props.width;
                        const height = props.height;

                        const htmlContent = data[Header[props.columnIndex]][props.rowIndex];

                        return (

                          <Html
                            divProps={{
                              style: {
                                zIndex: 0,
                                top: `${y}px`,
                                left: `${x}px`,
                                position: "absolute",
                                width: `${width}px`,
                                height: `${height}px`,
                                background: "white",
                                border: `${borderWidth}px solid black`,
                              }
                            }}
                          >
                            <div className="ql-editor" style={{ minHeight: "100%", minWidth: "100%" }}
                              dangerouslySetInnerHTML={{ __html: htmlContent }}
                              onClick={() =>
                                setSideBarState({
                                  sideBar: true,
                                  sideBarMode: "text"
                                })
                              }>


                            </div>
                          </Html>




                          // <CellText
                          //   value={data[Header[props.columnIndex]][props.rowIndex]}
                          //   {...props}
                          // />




                        );
                      }
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

        <>
          <dialog id="modalPoint" className="modal">
            <div className="modal-box">
              <form method="dialog" onSubmit={() => updateCirclePoint(modalData.index, modalData.insertIndex, modalData.x)}>
                <input type="range" min={0.51} max={0.95} className="range" step={0.04} onChange={(e) => { setModalData(prevData => ({ ...prevData, x: parseFloat(e.target.value) })); }} value={modalData.x} />
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


                </div>
                <button className="btn btn-primary">Submit</button>
              </form>

              <div className="modal-action">
                <form method="dialog" onSubmit={() => deleteCirclePoint(modalData.index, modalData.insertIndex)}>
                  <button className="btn btn-error">Delete</button>
                </form>
              </div>

              <div className="modal-action">
                <form method="dialog" onSubmit={() => setModalData({ index: null, insertIndex: null, x: 0.51 })}>
                  <button className="btn">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        </>



        {/* //-----------------// SIDEBAR //-----------------//*/}

        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          {
            (() => {
              switch (sideBarState.sideBarMode) {
                case "añadirCapa":
                  return (

                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Añadir capa</li>

                      <li><input onChange={(e) => setinsertHeight(Number(e.target.value))} value={insertHeight} type="number" min="20" /></li>

                      <li>
                        <button onClick={() => addShape(0, insertHeight)} type="button">Insertar filas encima</button>
                      </li>
                      <li className="flex flex-row">
                        <button onClick={() => addShape(insertValue, insertHeight)} type="button">Insertar filas</button>
                        <input onChange={(e) => setinsertValue(Number(e.target.value))} value={insertValue} type="number" id="inputNumber" name="inputNumber" min="0" max={rowCount} />
                      </li>
                      <li>
                        <button onClick={() => addShape(-1, insertHeight)} type="button">Insertar filas debajo</button>
                      </li>
                    </ul>
                  );

                case "polygon":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Editando polígono</li>
                      {/* <input type="range" min={0.51} max={0.95} className="range" step={0.04} onChange={(e) => { console.log(e.target.value) }} />
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

                      </div> */}

                      <li>
                        <p>Seleccionar opción de Pattern: </p>
                        <select onChange={(e) => handlePolygonChange(e, "file", activeCell.rowIndex)} className='select select-bordered w-full max-w-xs'>
                          {Object.keys(Json).map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </li>


                      <li>
                        <p>Seleccionar color Fill: <input type="color" onChange={(e) => handlePolygonChange(e, "ColorFill", activeCell.rowIndex)} /> </p>
                      </li>

                      <li>
                        <p>Seleccionar color Stroke:<input type="color" onChange={(e) => handlePolygonChange(e, "colorStroke", activeCell.rowIndex)} /></p>

                      </li>

                      <li>
                        <p>Tension de lineas: </p>
                        <input
                          type="range"
                          min={0}
                          max={2.5}
                          step={0.1}
                          defaultValue={polygons[activeCell.rowIndex]["tension"]}
                          //value={sliderTension}
                          //    onChange={(e) => handlePolygonChange(e, "tension", activeCell.rowIndex)} 
                          onMouseUp={(e) => handlePolygonChange(e, "tension", activeCell.rowIndex)}
                        />
                      </li>

                      <li>
                        <p>Cambiar alto de capa seleccionada: </p>
                        <input type="number" onChange={(e) => handlePolygonChange(e, "height", activeCell.rowIndex)} />
                      </li>

                      <li>
                        <p>Valor Zoom:</p>
                        <input
                          type="range"
                          min={50}
                          max={300}
                          defaultValue={polygons[activeCell.rowIndex]["zoom"]}
                          //  onChange={handleSliderZoom}
                          onMouseUp={(e) => handlePolygonChange(e, "zoom", activeCell.rowIndex)}
                        />
                      </li>

                      <li>
                        <p>Valor Rotacion: </p>
                        <input
                          type="range"
                          min={0}
                          max={180}
                          defaultValue={polygons[activeCell.rowIndex]["rotation"]}
                          // value={sliderRotation}
                          //onChange={handleSliderRotation}
                          onMouseUp={(e) => handlePolygonChange(e, "rotation", activeCell.rowIndex)}
                        />
                      </li>

                      <li>
                        <button className="btn btn-primary" onClick={() => {
                          socket.send(JSON.stringify({
                            action: 'delete',
                            data: {
                              "rowIndex": activeCell.rowIndex
                            }
                          }));

                        }}>Eliminar capa</button>
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
                      <Editor
                        placeholder={'Write something...'}
                        text={data[Header[activeCell.columnIndex]][activeCell.rowIndex]}

                      />
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

                case "contacts":

                  return (

                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Agregar/cambiar contacto</li>
                      <li>
                        Selecciona una capa
                        <select className="select select-bordered w-full max-w-xs" value={selectedPolygon} onChange={(e) => { setSelectedPolygon(Number(e.target.value)) }}>
                          <option disabled selected>Selecciona una capa</option>
                          {Object.keys(polygons).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </li>
                      <li>
                        Selecciona un contacto para la capa
                        <select className="select select-bordered w-full max-w-xs" value={selectedContact} onChange={(e) => { setSelectedContact(String(e.target.value)) }}>
                          <option disabled selected>Selecciona un contacto</option>
                          {Object.keys(Contacts).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </li>
                      <li><button onClick={addContact}>Aceptar</button></li>

                    </ul>)

                case "Espesor":

                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Invertir regla</li>
                      <li><button onClick={() => setIsInverted(false)}>Hacia abajo</button></li>
                      <li><button onClick={() => setIsInverted(true)}>Hacia arriba</button></li>
                    </ul>
                  )


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
