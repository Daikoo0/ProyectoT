import { useRef, useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Tabla from './Tabla';
import EditorQuill from './EditorQuill';
import SelectTheme from '../Web/SelectTheme';
import fosilJson from '../../fossil.json';
import lithoJson from '../../lithologic.json';

const Grid = () => {

  const OptionsBar = () => {

    return (
      <>
        <div className="navbar bg-base-200">
          <div className="flex-none">


            <SelectTheme />
            <div className="dropdown dropdown-end">

              <div className="tooltip tooltip-bottom" onClick={config} data-tip="Configuración">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25" />
                  </svg>
                </div>

              </div>

            </div>

            <div onClick={() => (setSideBarState({ sideBar: true, sideBarMode: "añadirCapa" }), setFormData(initialFormData))} className="dropdown dropdown-end" >
              <div className="tooltip tooltip-bottom" data-tip="Agregar capa">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                  </svg>
                </div>
              </div>
            </div>


            <select value={scale} className="select select-primary w-full max-w-xs" onChange={(e) => setScale(Number(e.target.value))}>
              <option value={10}>1:10</option>
              <option value={5}>1:20</option>
              <option value={4}>1:25</option>
              <option value={2}>1:50</option>
              <option value={1}>1:100</option>
              <option value={0.5}>1:200</option>
              {/* <option value={0.4}>1:250</option>
              <option value={0.2}>1:500</option> */}

            </select>

          </div>
        </div>
      </>)
  }



  const { project } = useParams(); // Sala de proyecto
  const [socket, setSocket] = useState(null);
  const isPageActive = useRef(true); // Indica si la página está activa para reconectar con el socket

  const [data, setData] = useState({});
  const [polygons, setPolygons] = useState([]);
  const [header, setHeader] = useState([]);
  // const [columnCount, setColumnCount] = useState(0);
  // const [fossils, setFossils] = useState([]);

  const initialFormData = {
    index: null,
    column: null,
    file: 'Sin Pattern', //patternOption
    ColorFill: '#ffffff',
    colorStroke: '#000000',
    zoom: 100,
    tension: 0.5,
    initialHeight: 0,
    height: 0,
    rotation: 0,
    text: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [text, setText] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    // send socket 
    socket.send(JSON.stringify({
      action: 'editPolygon',
      data: {
        'rowIndex': formData.index,
        'column': name,
        'value': value,
      },
    }));
  };

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }

  const handleClickRow = (index, column) => {
    setFormData({
      index: index,
      column: column,
      file: polygons[index].file,
      ColorFill: polygons[index].ColorFill,
      colorStroke: polygons[index].colorStroke,
      zoom: polygons[index].zoom,
      tension: polygons[index].tension,
      height: polygons[index].height,
      initialHeight: polygons[index].height,
      rotation: polygons[index].rotation,
      text: !data[column] ? '' : data[column][index],
    });
  };



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
            break;
          }
          case 'añadir': {
            const { Litologia, 'Estructura fosil': estructuraFosil, ...rest } = shapeN.data;
            setPolygons(Litologia)
            setData(rest)
            break;
          }
          case 'añadirEnd':
            setPolygons(prev => {
              const newData = { ...prev };
              newData[shapeN.rowIndex] = shapeN.value;
              return newData;
            });
            break
          case 'columns':
            setHeader(shapeN.columns)
            break
          case 'addFosil':
            setFossils(prevfossils => [...prevfossils, shapeN]);
            break
          case 'addCircle':
            setPolygons(prev => {
              const newData = { ...prev };
              newData[shapeN.rowIndex] = { ...newData[shapeN.rowIndex], circles: [...shapeN.newCircle] };
              return newData;
            });
            break
          case 'delete': {
            const { Litologia, 'Estructura fosil': estructuraFosil, ...rest } = shapeN.data;
            setPolygons(Litologia)
            setData(rest)
            break;
          }
          case 'editPolygon':
            setPolygons(prev => {
              const newData = { ...prev };
              newData[shapeN.rowIndex] = { ...newData[shapeN.rowIndex], [shapeN.column]: shapeN.value };
              return newData;
            });
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



  const [sideBarState, setSideBarState] = useState({
    sideBar: false,
    sideBarMode: ""
  });

  const config = () => {
    setSideBarState({
      sideBar: true,
      sideBarMode: "config"
    })
  }




  const [upperLimit, setUpperLimit] = useState('');
  const [lowerLimit, setLowerLimit] = useState('');
  const [selectedFosil, setSelectedFosil] = useState("");
  const [relativeX, setRelativeX] = useState(0);
  const [idClickFosil, setIdClickFosil] = useState<number>(0);
  const [fossils, setFossils] = useState([]);
  const [modalData, setModalData] = useState({ index: null, insertIndex: null, x: 0.5 });
  const [scale, setScale] = useState(1);

  //--------- Funciones Socket ------------//

  const handleConfirm = () => {
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

  const openModalPoint = (index, insertIndex, x) => {
    (document.getElementById('modalPoint') as HTMLDialogElement).showModal();
    console.log(index, x)
    setModalData({ index, insertIndex, x });
  };

  // Actualiza un punto
  const updateCirclePoint = (index, insertIndex, x) => {

    const update = polygons[index]["circles"]
    update[insertIndex].x = x;

    socket.send(JSON.stringify({
      action: 'addCircle',
      data: {
        "rowIndex": index,
        "newCircle": update
      }
    }));

  }

  // Añade un nuevo punto 
  const addCircles = (rowIndex: number, insertIndex: number, newCircle: any) => {
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

  // Elimina un punto
  const deleteCirclePoint = (index, insertIndex) => {

    const update = polygons[index]["circles"]
    update.splice(insertIndex, 1);

    socket.send(JSON.stringify({
      action: 'addCircle',
      data: {
        "rowIndex": index,
        "newCircle": update
      }
    }));
  }

  const addShape = (row, height) => {

    socket.send(JSON.stringify({
      action: 'añadir',
      data: {
        "height": Number(height),
        "rowIndex": Number(row)
      }
    }));
  }


  return (
    <>

      <div className="drawer drawer-end auto-cols-max">
        <input id="my-drawer" type="checkbox" className="drawer-toggle"
          checked={sideBarState.sideBar}
          onChange={() => setSideBarState({
            sideBar: false,
            sideBarMode: ""
          })}
        />

        {/* Contenido */}
        <div className="drawer-content">
          <OptionsBar />
          <Tabla
            setIdClickFosil={setIdClickFosil}
            fossils={fossils}
            setRelativeX={setRelativeX} data={data}
            header={header}
            lithology={polygons}
            scale={scale}
            addCircles={addCircles}
            setSideBarState={setSideBarState}
            openModalPoint={openModalPoint}
            handleClickRow={handleClickRow}
          />
        </div>

        <>
          <dialog id="modalPoint" className="modal">
            <div className="modal-box">
              <form method="dialog" onSubmit={() => updateCirclePoint(modalData.index, modalData.insertIndex, modalData.x)}>
                <input type="range" min={0.51} max={0.95} className="range" step={0.04} onChange={(e) => { setModalData(prevData => ({ ...prevData, x: parseFloat(e.target.value) })); }} value={modalData.x} />
                <div className="w-full flex justify-between text-xs">

                  <span className="-rotate-90">s/n</span>  {/* sn */}
                  <span className="-rotate-90">clay</span> {/* 0.55 */}
                  <span className="-rotate-90">silt</span> {/* 0.59 */}
                  <span className="-rotate-90">vf</span>   {/* 0.63 */}
                  <span className="-rotate-90">f</span>    {/* 0.67 */}
                  <span className="-rotate-90">m</span>    {/* 0.71 */}
                  <span className="-rotate-90">c</span>    {/* 0.75 */}
                  <span className="-rotate-90">vc</span>   {/* 0.79 */}
                  <span className="-rotate-90">grain</span>{/* 0.83 */}
                  <span className="-rotate-90">pebb</span> {/* 0.87 */}
                  <span className="-rotate-90">cobb</span> {/* 0.91 */}
                  <span className="-rotate-90">boul</span> {/* 0.95 */}

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

        {/* SideBar */}
        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

          {
            (() => {
              switch (sideBarState.sideBarMode) {
                case "config":

                  const list = ["Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "Ambiente Depositacional", "Descripcion"]
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className='pb-6 hidden lg:block'>Configuración</li>
                      {list.map((key) => {
                        if (key != "Espesor" && key != "Litologia") {
                          return (
                            <li key={key}>
                              <div style={{ display: 'flex' }}>
                                <input
                                  type="checkbox"
                                  id={key}
                                  name={key}
                                  checked={header.includes(key) ? true : false}
                                  onChange={(e) => handleColumns(e, key)}
                                />
                                <label htmlFor={key} style={{ whiteSpace: 'nowrap' }}>
                                  {key}
                                </label>
                              </div>
                            </li>
                          );
                        }
                      }
                      )}
                    </ul>)

                case "añadirCapa":
                  return (

                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Añadir capa</li>

                      <li><input type="number" name='height' min="5" onChange={handleChangeLocal} value={formData.height} /></li>

                      <li>
                        <button className='btn' disabled={formData.height <= 5} onClick={() => addShape(0, formData.height)} >Insertar fila encima</button>
                      </li>
                      <li className="flex flex-row">
                        <button className='btn w-3/5' disabled={formData.height <= 5} onClick={() => addShape(formData.initialHeight, formData.height)}>Inserta en fila</button>
                        <input type="number" className='w-2/5' name="initialHeight" min="0" max={Object.keys(polygons).length - 1} onChange={handleChangeLocal} value={formData.initialHeight} />
                      </li>
                      <li>
                        <button className='btn' disabled={formData.height <= 5} onClick={() => addShape(-1, formData.height)}>Insertar fila debajo</button>
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
                            <option value={""} disabled >Elige el tipo de fósil</option>
                            {Object.keys(fosilJson).map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </li>
                        <li>
                          {selectedFosil === "" ? null : <img
                            alt="None"
                            src={`../src/assets/fosiles/${fosilJson[selectedFosil]}.svg`} />}

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
                        <button className="btn btn-primary" disabled={selectedFosil === ""} onClick={handleConfirm}> Confirmar </button>

                      </div>
                    </ul>
                  );
                case "polygon":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Editando polígono</li>

                      <li className='flex flex-row'>
                        <p>Tamaño de capa: </p>
                        <input type="number" name='height' value={formData.height} onChange={handleChangeLocal} />
                        <button className="btn" name='height' value={formData.height} disabled={formData.height === formData.initialHeight} onClick={handleChange}> Cambiar </button>
                      </li>

                      <li>
                        <p>Seleccionar opción de Pattern: </p>
                        <select name={"file"} value={formData.file} onChange={handleChange} className='select select-bordered w-full max-w-xs'>
                          {Object.keys(lithoJson).map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </li>

                      <li>
                        <p>Seleccionar color Fill: <input type="color" name={"ColorFill"} value={formData.ColorFill} onChange={handleChangeLocal} onBlur={handleChange} /> </p>
                      </li>


                      <li>
                        <p>Seleccionar color Stroke:<input type="color" name={"colorStroke"} value={formData.colorStroke} onChange={handleChangeLocal} onBlur={handleChange} /> </p>

                      </li>

                      <li>
                        <p>Valor Zoom:</p>
                        <input
                          type="range"
                          name='zoom'
                          min={100}
                          max={400}
                          defaultValue={formData.zoom}
                          onMouseUp={handleChange}
                        />
                      </li>

                      <li>
                        <p>Tension de lineas: </p>
                        <input
                          type="range"
                          name='tension'
                          min={0}
                          max={2.5}
                          step={0.1}
                          defaultValue={formData.tension}
                          onMouseUp={handleChange}
                        />
                      </li>

                      <li>
                        <p>Valor Rotacion: </p>
                        <input
                          type="range"
                          name='rotation'
                          min={0}
                          max={180}
                          defaultValue={formData.rotation}
                          onMouseUp={handleChange}
                        />
                      </li>

                      <li>
                        <button className="btn btn-error" onClick={() => {
                          setFormData(prevState => ({ ...prevState, index: null }));
                          socket.send(JSON.stringify({
                            action: 'delete',
                            data: {
                              "rowIndex": formData.index
                            }
                          }));

                        }}>Eliminar capa</button>
                      </li>
                    </ul>

                  );

                case "text":
                  return (
                    <>

                      <div className="p-4 w-80 min-h-full bg-base-200 text-base-content">
                        <p className="menu-title">Editando texto</p>

                        <div>
                          <EditorQuill
                            Text={formData.text}
                            SetText={(html: string) => setFormData(prevState => ({
                              ...prevState,
                              text: html,
                            }))}
                          />
                        </div>

                        <button onClick={() => {
                          socket.send(JSON.stringify({
                            action: 'editText',
                            data: {
                              "key": formData.column,
                              "value": formData.text,
                              "rowIndex": formData.index
                            }
                          }));
                        }}>Enviar</button>
                      </div>

                    </>
                  );

                default:
                  return (
                    <div >
                      a
                    </div>)
              }
            })()
          }

        </div>

      </div>
    </>
  );
}

export default Grid;
