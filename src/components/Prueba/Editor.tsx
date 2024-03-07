import { useRef, useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Tabla from './Tabla';
import EditorQuill from './EditorQuill';
import SelectTheme from '../Web/SelectTheme';
import fosilJson from '../../fossil.json';
import lithoJson from '../../lithologic.json';
import contacts from '../../contacts.json';

const Grid = () => {

  const { project } = useParams(); // Sala de proyecto
  const [socket, setSocket] = useState(null);
  const isPageActive = useRef(true); // Indica si la página está activa para reconectar con el socket


  const [data, setData] = useState([]);
  const [header, setHeader] = useState([]);

  const [fossils, setFossils] = useState([]);
  const [modalData, setModalData] = useState({ index: null, insertIndex: null, x: 0.5 });
  const [scale, setScale] = useState(1);

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
  const [formFosil, setFormFosil] = useState({ id:'', upper: 0, lower: 0, fosilImg: '', x: 0, fosilImgCopy: ''});

  const changeformFosil = (e) => {
    const { name, value } = e.target;
    setFormFosil(prevState => ({
      ...prevState,
      [name]: value,
    }));

  }


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

    // setPolygons(prev => {
    //   const newData = { ...prev };
    //   newData[formData.index][name] = value;
    //   return newData;
    // });
  }

  const handleClickRow = (index, column) => {
    setFormData({
      index: index,
      column: column,
      file: data[index].Litologia.file,
      ColorFill: data[index].Litologia.ColorFill,
      colorStroke: data[index].Litologia.colorStroke,
      zoom: data[index].Litologia.zoom,
      tension: data[index].Litologia.tension,
      height: data[index].Litologia.height,
      initialHeight: data[index].Litologia.height,
      rotation: data[index].Litologia.rotation,
      text: data[index][column],
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

  const [editingUsers, setEditingUsers] = useState({});

  // Escucha de mensajes del socket
  useEffect(() => {
    if (socket) {

      socket.onmessage = (event) => {
        const shapeN = JSON.parse(event.data);
        console.log(shapeN)

        switch (shapeN.action) {
          case 'data': {
            console.log(shapeN)
            //const { Litologia, 'Estructura fosil': estructuraFosil, ...rest } = shapeN.data;
            setData(shapeN.data)
            //setPolygons(Litologia)
            setHeader(shapeN.config)
            setFossils(shapeN.fosil)
            setEditingUsers(shapeN.sectionsEditing)
            break;
          }
          case 'editingUser': {
            setEditingUsers(prevState => ({
              ...prevState,
              [shapeN.value]: { "name": shapeN.userName, "color": shapeN.color }

            }));
            break;
          }
          case 'deleteEditingUser': {
            setEditingUsers(prevState => {
              console.log("elimando user")
              const newState = { ...prevState };
              if (newState.hasOwnProperty(shapeN.value)) {
                delete newState[shapeN.value];
              } else {
                console.log("El elemento a eliminar no existe en el estado");
              }

              return newState;
            });
            break;
          }
          case 'añadir': {
            setData(prev => {
              const newData = [...prev];
              newData.splice(shapeN.rowIndex, 0, shapeN.value);
              return newData;
            });

            break;
          }
          case 'añadirEnd':
            setData(prev => [...prev, shapeN.value]);
            break
          case 'columns':
            setHeader(shapeN.columns)
            break
          case 'addFosil':
            setFossils(prev => ({ ...prev, [shapeN.idFosil]: shapeN.value }));
            break
          case 'addCircle':
            setData(prev => {
              const newData = [...prev];
              newData[shapeN.rowIndex] = {
                ...newData[shapeN.rowIndex],
                Litologia: {
                  ...newData[shapeN.rowIndex].Litologia,
                  ["circles"]: shapeN.value
                }
              };
              return newData;
            });
            break
          case 'delete': {
            setData(prev => {
              const newData = [...prev];
              newData.splice(shapeN.rowIndex, 1);
              return newData;
            });
            break;
          }
          case 'editPolygon':
            setData(prev => {
              const newData = [...prev];
              newData[shapeN.rowIndex] = {
                ...newData[shapeN.rowIndex],
                Litologia: {
                  ...newData[shapeN.rowIndex].Litologia,
                  [shapeN.key]: shapeN.value
                }
              };
              return newData;
            });
            break;
          case 'editText':
            setData(prev => {
              const newData = [...prev];
              newData[shapeN.rowIndex] = { ...newData[shapeN.rowIndex], [shapeN.key]: shapeN.value };
              return newData;
            });
            break
          case 'editFosil':
            setFossils(prev => {
              const newFossils = { ...prev };
              newFossils[shapeN.idFosil] = shapeN.value;
              return newFossils;
            }  

            );
            setSideBarState({
              sideBar: false,
              sideBarMode: ""
            })
            break
          case 'deleteFosil':
            setFossils((prevFossils) => {
              const newFossils = { ...prevFossils };
              delete newFossils[shapeN.idFosil];
              console.log(newFossils)
              return newFossils;
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



  //--------- Funciones Socket ------------//

  const handleAddFosil = () => {
    socket.send(JSON.stringify({
      action: 'addFosil',
      data: {
        "upper": Number(formFosil.upper),
        "lower": Number(formFosil.lower),
        "fosilImg": formFosil.fosilImg,
        "x": formFosil.x
      }
    }));
  };

  const openModalPoint = (index, insertIndex, x) => {
    (document.getElementById('modalPoint') as HTMLDialogElement).showModal();
    console.log(index, x)
    setModalData({ index, insertIndex, x });
  };

  // Actualiza un punto
  const updateCirclePoint = (index, editIndex, x) => {

    //const update = polygons[index]["circles"]
    //update[insertIndex].x = x;

    socket.send(JSON.stringify({
      action: 'editCircle',
      data: {
        "rowIndex": index,
        "editIndex": editIndex,
        "x": x,
      }
    }));

  }

  const handleDeleteFosil = () => {
    socket.send(JSON.stringify({
      action: 'deleteFosil',
      data: {
        "idFosil": formFosil.id,
        "upper": Number(formFosil.upper),
        "lower": Number(formFosil.lower),
        "fosilImg": formFosil.fosilImg,
        "x": formFosil.x
      }
    }));
  }

  const handleFosilEdit = () => {

    socket.send(JSON.stringify({
      action: 'editFosil',
      data: {
        "idFosil": formFosil.id,
        "upper": Number(formFosil.upper),
        "lower": Number(formFosil.lower),
        "fosilImg": formFosil.fosilImgCopy,
        "x": formFosil.x
      }
    }));
  }


  // Añade un nuevo punto 
  const addCircles = (rowIndex: number, insertIndex: number, point: number) => {
    console.log(rowIndex, insertIndex, point)
    // const update = polygons[rowIndex]["circles"]

    // update.splice(insertIndex, 0, newCircle);

    socket.send(JSON.stringify({
      action: 'addCircle',
      data: {
        "rowIndex": rowIndex,
        "insertIndex": insertIndex,
        "point": point
      }
    }));

  };

  // Elimina un punto
  const deleteCirclePoint = (index, deleteIndex) => {

    //const update = polygons[index]["circles"]
    //update.splice(insertIndex, 1);

    socket.send(JSON.stringify({
      action: 'deleteCircle',
      data: {
        "rowIndex": index,
        "deleteIndex": deleteIndex

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

  const [selectedContactIndex, setSelectedContactIndex] = useState(null);

  const sendActionCell = (row, column) => {
    if (socket) {
      socket.send(JSON.stringify({
        action: 'editingUser',
        data: {
          section: `[${row},${column}]`
        }
      }));
    }
  }

  const openModal = () => {

    (document.getElementById('modal') as HTMLDialogElement).showModal();

  };

  
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

          <div className="navbar bg-base-200">
            <div className="flex-none">

              <div className="dropdown dropdown-end">

                <div className="tooltip tooltip-bottom" onClick={config} data-tip="Configuración">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25" />
                    </svg>
                  </div>

                </div>

                <div className="dropdown dropdown-end">

<div className="tooltip tooltip-bottom" onClick={openModal} data-tip="Exportar PDF">

  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">

    <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">

      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3" />

    </svg>

  </div>

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


            </div>
          </div>

          <Tabla
            // Data 
            openModal={openModal}
            data={data}
            header={header}
            scale={scale}

            addCircles={addCircles}
            setSideBarState={setSideBarState}

            fossils={fossils}
            setFormFosil={setFormFosil}

            openModalPoint={openModalPoint}
            handleClickRow={handleClickRow}
            sendActionCell={sendActionCell}
            editingUsers={editingUsers}
           
          
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
          <label htmlFor="my-drawer"
            onClick={() => {
              socket.send(JSON.stringify({
                action: 'deleteEditingUser',
                data: {
                  section: `[${formData.index},${header.indexOf(formData.column)}]`
                }
              }));
            }}
            aria-label="close sidebar" className="drawer-overlay"></label>
          {
            (() => {
              switch (sideBarState.sideBarMode) {
                case "config":

                  const list = ["Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "Ambiente Depositacional", "Descripcion"]
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className='pb-6 hidden lg:block'>Configuración</li>

                      <li>
                        <details open>
                          <summary>De la tabla</summary>
                          <ul>
                            <li>
                              <details open={false}>
                                <summary>Escala</summary>
                                <ul>
                                  <li>
                                    <label className="inline-flex items-center">
                                      <input type="checkbox" value="10" checked={scale === 10}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="form-checkbox h-5 w-5 text-indigo-600" />
                                      <span className="ml-2">1:10</span>
                                    </label>
                                  </li>
                                  <li>
                                    <label className="inline-flex items-center">
                                      <input type="checkbox" value="5" checked={scale === 5}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="form-checkbox h-5 w-5 text-indigo-600"
                                      />
                                      <span className="ml-2">1:20</span>
                                    </label>
                                  </li>
                                  <li>
                                    <label className="inline-flex items-center">
                                      <input type="checkbox" value="4" checked={scale === 4}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="form-checkbox h-5 w-5 text-indigo-600"
                                      />
                                      <span className="ml-2">1:25</span>
                                    </label>
                                  </li>
                                  <li>
                                    <label className="inline-flex items-center">
                                      <input type="checkbox" value="2" checked={scale === 2}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="form-checkbox h-5 w-5 text-indigo-600"
                                      />
                                      <span className="ml-2">1:50</span>
                                    </label>
                                  </li>
                                  <li>
                                    <label className="inline-flex items-center">
                                      <input type="checkbox" value="1" checked={scale === 1}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="form-checkbox h-5 w-5 text-indigo-600"
                                      />
                                      <span className="ml-2">1:100</span>
                                    </label>
                                  </li>
                                  <li>
                                    <label className="inline-flex items-center">
                                      <input type="checkbox" value="0.5" checked={scale === 0.5}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="form-checkbox h-5 w-5 text-indigo-600"
                                      />
                                      <span className="ml-2">1:200</span>
                                    </label>
                                  </li>
                                </ul>
                              </details>
                            </li>


                            <li>
                              <details open={false}>
                                <summary>Visibilidad de columnas</summary>
                                <ul>
                                  {list.map((key) => {
                                    if (key !== "Espesor" && key !== "Litologia") {
                                      return (
                                        <li key={key} >
                                          <label className="inline-flex items-center">
                                            <input
                                              type="checkbox"
                                              id={key}
                                              name={key}
                                              checked={header.includes(key) ? true : false}
                                              onChange={(e) => handleColumns(e, key)}
                                              className="form-checkbox h-5 w-5 text-indigo-600"
                                            />
                                            <span className="ml-2">{key}</span>
                                          </label>
                                        </li>
                                      );
                                    }
                                  })}
                                </ul>
                              </details>
                            </li>
                          </ul>
                        </details>
                      </li>

                      <li>
                        <details open>
                          <summary>De la sala</summary>
                          <ul>
                            <li><SelectTheme /></li>
                          </ul>
                        </details>
                      </li>

                      {/* {list.map((key) => {
                        if (key !== "Espesor" && key !== "Litologia") {
                          return (
                            <li key={key} className="py-2">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  id={key}
                                  name={key}
                                  checked={header.includes(key) ? true : false}
                                  onChange={(e) => handleColumns(e, key)}
                                  className="form-checkbox h-5 w-5 text-indigo-600"
                                />
                                <span className="ml-2">{key}</span>
                              </label>
                            </li>
                          );
                        }
                      })} */}

                    </ul>)

                case "añadirCapa":
                  return (

                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Añadir capa</li>

                      <li><input type="number" name='height' onChange={handleChangeLocal} value={formData.height} /></li>

                      <li>
                        <button className='btn' disabled={formData.height < 5} onClick={() => addShape(0, formData.height)} >Insertar fila encima</button>
                      </li>
                      <li className="flex flex-row">
                        <button className='btn w-3/5' disabled={formData.height < 5} onClick={() => addShape(formData.initialHeight, formData.height)}>Inserta en fila</button>
                        <input type="number" className='w-2/5' name="initialHeight" min="0" max={data.length - 1} onChange={handleChangeLocal} value={formData.initialHeight} />
                      </li>
                      <li>
                        <button className='btn' disabled={formData.height < 5} onClick={() => addShape(-1, formData.height)}>Insertar fila debajo</button>
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
                          <select className="select select-bordered w-full max-w-xs" name='fosilImg' value={formFosil.fosilImg} onChange={changeformFosil}>
                            <option value={""} disabled >Elige el tipo de fósil</option>
                            {Object.keys(fosilJson).map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </li>
                        <li>
                          {formFosil.fosilImg === "" ? null : <img
                            alt="None"
                            src={`../src/assets/fosiles/${fosilJson[formFosil.fosilImg]}.svg`} />}

                        </li>
                        <li>
                          límite superior (metros):
                          <input
                            type="number"
                            name='upper'
                            value={formFosil.upper}
                            onChange={changeformFosil}
                          />
                        </li>
                        <li>
                          Límite inferior (metros):
                          <input
                            type="number"
                            name='lower'
                            value={formFosil.lower}
                            onChange={changeformFosil}
                          />
                        </li>

                        <button className="btn btn-primary" disabled={formFosil.fosilImg === ""} onClick={handleAddFosil}> Confirmar </button>

                      </div>
                    </ul>
                  );
                case "editFosil":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Editando fósil</li>
                      <li>
                        <select className="select select-bordered w-full max-w-xs" name='fosilImgCopy' value={formFosil.fosilImgCopy} onChange={changeformFosil}>
                          <option  value={""} disabled>Selecciona un fósil</option>
                          {Object.keys(fosilJson).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </li>
                      <li>

                        <div className="flex w-full">
                          <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">  <img
                            alt="None"
                            src={`../src/assets/fosiles/${formFosil.fosilImg ? fosilJson[formFosil.fosilImg] : fosilJson[1]}.svg`} />
                          </div>
                          <div className="divider divider-horizontal">

                            <svg className="w-10 h-10 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                          </div>
                          <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">   <img
                            alt="None"
                            src={`../src/assets/fosiles/${fosilJson[formFosil.fosilImgCopy]}.svg`} /></div>
                        </div>


                      </li>
                      <li>
                        límite superior (metros):
                        <input
                          type="number"
                          name='upper'
                          value={formFosil.upper}
                          onChange={changeformFosil}
                        />
                      </li>
                      <li>
                        Límite inferior (metros):
                        <input
                          type="number"
                          name='lower'
                          value={formFosil.lower}
                          onChange={changeformFosil}
                        />
                      </li>
                      <li> <button className="btn btn-primary" onClick={handleFosilEdit}>Confirmar edición</button></li>
                      <li><button className="btn btn-error" onClick={handleDeleteFosil}>Eliminar fósil</button></li>
                    </ul>)
                case "polygon":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Editando polígono</li>

                      <li>
                        <details open={false}>
                          <summary>Contacto inferior</summary>
                          <ul>
                            {Object.values(contacts).map((contact, index) => (
                              <li key={index} style={{ backgroundColor: 'white', padding: '10px', marginBottom: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedContactIndex === index}
                                    onChange={() => setSelectedContactIndex(index)}
                                    style={{ marginRight: '8px' }}
                                  />
                                  <svg width="150" height="20">
                                    {contact.dash && (
                                      <line
                                        x1="0"
                                        y1="15"
                                        x2="150"
                                        y2="15"
                                        stroke="black"
                                        strokeWidth={contact.lineWidth > 2 ? contact.lineWidth : 1}
                                        strokeDasharray={`${contact.dash}`}
                                      />
                                    )}
                                    {('dash2' in contact) && contact.dash2 && (
                                      <line
                                        x1="0"
                                        y1="10"
                                        x2="150"
                                        y2="10"
                                        stroke="black"
                                        strokeWidth={contact.lineWidth2 ?? 1}
                                        strokeDasharray={`${contact.dash2}`}
                                      />
                                    )}
                                    {contact.question && (
                                      <text x="75" y="15" textAnchor="middle" dominantBaseline="middle" fontSize="20" fill="red">?</text>
                                    )}
                                    {contact.arcs && (
                                      <path
                                        d="M 0,15 Q 5,5 10,15 Q 15,25 20,15 Q 25,5 30,15 Q 35,25 40,15 Q 45,5 50,15 Q 55,25 60,15 Q 65,5 70,15 Q 75,25 80,15 Q 85,5 90,15 Q 95,25 100,15 Q 105,5 110,15 Q 115,25 120,15 Q 125,5 130,15 Q 135,25 140,15 Q 145,5 150,15" fill="none" stroke="black" strokeWidth="1" />
                                    )}
                                  </svg>
                                </label>
                              </li>
                            ))}
                          </ul>

                        </details>
                      </li>


                      <li className='flex flex-row'>
                        <p>Tamaño de capa: </p>
                        <input type="number" name='height' value={formData.height} onChange={handleChangeLocal} />
                        <button className="btn" name='height' value={formData.height} disabled={formData.height === formData.initialHeight || formData.height < 5} onClick={handleChange}> Cambiar </button>
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
                              "rowIndex": Number(formData.index)
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
