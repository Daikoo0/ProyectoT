import { useRef, useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Navbar_Editor from './Navbar_Editor';
import Tabla from './Tabla';
import SelectTheme from '../Web/SelectTheme';
import fosilJson from '../../fossil.json';
import lithoJson from '../../lithologic.json';
import contacts from '../../contacts.json';
import limestones from '../../limestones.json';
import mudgraingravel from '../../mudgraingravel.json';
import { useAuth } from '../../provider/authProvider';
import IconSvg from '../Web/IconSVG';
import EditorQuill from './EditorQuill';
import Ab from './pdfFunction';
import { useDynamicSvgImport } from "../../utils/dynamicSvgImport";
import { useTranslation } from 'react-i18next';
import LangSelector from '../Web/LanguageComponent';


const Grid = () => {
  const { t } = useTranslation(['Editor', 'Description', 'Patterns']);
  const { token } = useAuth();
  const { project } = useParams(); // Sala de proyecto
  const [socket, setSocket] = useState(null);
  const isPageActive = useRef(true);
  const [data, setData] = useState([]);
  const [header, setHeader] = useState([]);
  const [fossils, setFossils] = useState([]);
  const [facies, setFacies] = useState({});
  const [modalData, setModalData] = useState({ index: null, insertIndex: null, x: 0.5, name: 'none' });
  const [scale, setScale] = useState(1);
  const [alturaTd, setAlturaTd] = useState(null);
  const [messageFacie, setMessageFacie] = useState('');
  const [infoProject, setInfoProject] = useState();
  const [tokenLink, setTokenLink] = useState({ editor: '', reader: '' });
  var contactsSvg = []
  {
    Object.keys(contacts).map((contact) => {
      const { loading, SvgIcon } = useDynamicSvgImport(contact, "contacts");
      var description = t(contact, { ns: 'Description' }) // contacts[contact].description;
      contactsSvg.push({ loading, SvgIcon, contact, description });
    })
  }

  const initialFormData = {
    index: null,
    column: null,
    File: 'Sin Pattern', //patternOption
    ColorFill: '#ffffff',
    ColorStroke: '#000000',
    Zoom: 100,
    Tension: 0.5,
    initialHeight: 0,
    Height: 0,
    Rotation: 0,
    text: '',
    Contact: "111",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formFosil, setFormFosil] = useState({ id: '', upper: 0, lower: 0, fosilImg: '', x: 0, fosilImgCopy: '' });
  const [formFacies, setFormFacies] = useState({ facie: '', y1: 0, y2: 0, y1prev: 0, y2prev: 0 });

  const changeformFosil = (e) => {
    const { name, value } = e.target;
    setFormFosil(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }

  const changeformFacie = (e) => {
    const { name, value } = e.target;
    setFormFacies(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value)

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

    console.log(formData)

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
    const { Litologia } = data[index]; // Extraer Litologia una vez

    setFormData({
      index: index,
      column: column,
      File: Litologia.File,
      ColorFill: Litologia.ColorFill,
      ColorStroke: Litologia.ColorStroke,
      Zoom: Litologia.Zoom,
      Tension: Litologia.Tension,
      Height: Litologia.Height,
      initialHeight: Litologia.Height,
      Rotation: Litologia.Rotation,
      text: data[index][column], // Mantén esto porque depende de column
      Contact: Litologia.Contact,
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
      const newSocket = new WebSocket(`${import.meta.env.VITE_SOCKET_URL}/ws/${project}?token=${token}`);
      setSocket(newSocket);
      //${import.meta.env.VITE_SOCKET_URL}

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

            setFacies(shapeN.facies)
            setHeader(shapeN.config.header)
            setFossils(shapeN.fosil)
            setIsInverted(shapeN.config.isInverted)
            setEditingUsers(shapeN.sectionsEditing)
            setInfoProject(shapeN.projectInfo)
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
            // if (data.length > 0) {
            setData(prev => {
              const newData = [...prev];
              newData.splice(shapeN.rowIndex, 0, shapeN.value);
              return newData;
            });
            // } else {
            //   setData(shapeN.value)
            // }
            break;
          }
          case 'añadirEnd':
            setData(prev => [...prev, shapeN.value]);
            break
          case 'columns':
            setHeader(shapeN.columns)
            break
          case 'isInverted':
            setIsInverted(shapeN.isInverted)
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
                  ["Circles"]: shapeN.value
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
          case 'deleteFacie':
            setFacies(prevFacies => {
              if (prevFacies[shapeN.facie]) {
                const newFacies = { ...prevFacies };
                delete newFacies[shapeN.facie];
                return newFacies;
              }
              return prevFacies;
            });
            break
          case 'deleteFacieSection':
            setFacies(prevFacies => {
              const faciesCopy = { ...prevFacies };
              faciesCopy[shapeN.facie].splice(shapeN.index, 1);
              return faciesCopy;
            });
            break

          case 'addFacieSection':
            setFacies(prevFacies => {
              const faciesCopy = { ...prevFacies };
              if (!faciesCopy.hasOwnProperty(shapeN.facie)) {
                faciesCopy[shapeN.facie] = [];
              }
              faciesCopy[shapeN.facie].push({ y1: shapeN.y1, y2: shapeN.y2 });
              return faciesCopy;
            });
            break;
          case 'addFacie':
            if (!facies.hasOwnProperty(shapeN.facie)) {
              setFacies(prevFacies => ({
                ...prevFacies,
                [`${shapeN.facie}`]: shapeN.sections || [],
              }));
            }
            break;
          case 'tokenLink':
            console.log(shapeN)
            setTokenLink({
              editor: shapeN.editor,
              reader: shapeN.reader
            })
            break
          case 'error':
            if (shapeN.message === 'Access denied') {
              console.error('Acceso denegado');
              socket.close();  // Cerrar el socket
              isPageActive.current = false;  // Desactivar reconexión
            }
            return
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

  const handleAddFosil = (event) => {
    event.preventDefault();
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

  const openModalPoint = (index, insertIndex, x, name) => {
    (document.getElementById('modalPoint') as HTMLDialogElement).showModal();
    console.log(index, x)
    setModalData({ index, insertIndex, x, name });
  };

  // Actualiza un punto
  const updateCirclePoint = (index, editIndex, x, name) => {

    //const update = polygons[index]["circles"]
    //update[insertIndex].x = x;

    console.log(index, editIndex, x, name)

    socket.send(JSON.stringify({
      action: 'editCircle',
      data: {
        "rowIndex": index,
        "editIndex": editIndex,
        "x": x,
        "name": name,
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



  const handleDeleteFacieSection = (index) => {

    socket.send(JSON.stringify({
      action: 'deleteFacieSection',
      data: {
        "facie": formFacies.facie,
        "index": index,
      }
    }));

  }

  const handleAddFacieSection = () => {

    let isInsideInterval = false;
    const faciesCopy = { ...facies };
    let coincidences = [];

    for (const key in faciesCopy) {
      const intervalArray = faciesCopy[key];
      for (let i = 0; i < intervalArray.length; i++) {
        const interval = intervalArray[i];
        if ((formFacies.y1 >= interval.y1 && formFacies.y1 <= interval.y2) || (formFacies.y2 >= interval.y1 && formFacies.y2 <= interval.y2)) {
          isInsideInterval = true;
          coincidences.push(key)
        }
        if ((interval.y1 >= formFacies.y1 && interval.y1 <= formFacies.y2) || (interval.y2 >= formFacies.y1 && interval.y2 <= formFacies.y2)) {
          isInsideInterval = true;
          coincidences.push(key)
        }
      }
    }
    if (isInsideInterval) {
      const uniqueValues = [...new Set(coincidences)];
      setMessageFacie(`El intervalo ingresado coincide con un tramo en la facie ${uniqueValues.join(", ")}`)
    } else {
      // faciesCopy[formFacies.facie].push({ y1: formFacies.y1, y2: formFacies.y2 })
      // setFacies(faciesCopy);
      setMessageFacie('')
      socket.send(JSON.stringify({
        action: 'addFacieSection',
        data: {
          "facie": formFacies.facie,
          "y1": Number(formFacies.y1),
          "y2": Number(formFacies.y2),
        }
      }));
    }


  }

  const handleDeleteFacie = () => {

    setSideBarState({
      sideBar: false,
      sideBarMode: ""
    })

    // if (facies[formFacies.facie]) {
    //   const newFacies = { ...facies };
    //   delete newFacies[formFacies.facie];
    //   setFacies(newFacies);
    // }

    socket.send(JSON.stringify({
      action: 'deleteFacie',
      data: {
        "facie": formFacies.facie,
      }
    }));

  }

  const handleAddFacie = () => {

    //    const faciesCopy = { ...facies };
    // if (!faciesCopy.hasOwnProperty(formFacies.facie)) {
    //   setFacies(prevFacies => ({
    //     ...prevFacies,
    //     [`${formFacies.facie}`]: [],
    //   }));
    // }

    socket.send(JSON.stringify({
      action: 'addFacie',
      data: {
        "facie": formFacies.facie,
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

    openModalPoint(rowIndex, insertIndex, point, 'none');

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

  const [pdfData, setPdfData] = useState({});

  const openModal = () => {

    (document.getElementById('modal') as HTMLDialogElement).showModal();
    var copyData = data
    var copyHeader = [...header]
    var indexes = Array.from({ length: data.length }, (_, index) => index);
    Ab(copyData, copyHeader, 'C3', 'portrait', "", scale, fossils, infoProject, indexes, '_____________', '_____________', '_____________', '_____________')
    const initialPdfData = {
      columnWidths: {},
      data: copyData,
      header: copyHeader,
      format: 'C3',
      orientation: 'portrait',
      customWidthLit: "",
      scale: scale,
      fossils: fossils,
      infoProject: infoProject,
      indexesM: indexes,
      oEstrat: '_____________',
      oLev: '_____________',
      etSec: '_____________',
      date: '_____________'
    };
    setPdfData(initialPdfData)

  };

  const [isInverted, setIsInverted] = useState(false)


  return (
    <>
      <div className="drawer drawer-end auto-cols-max">
        <input id="my-drawer" type="checkbox" className="drawer-toggle"
          checked={sideBarState.sideBar}
          onChange={() => {
            setSideBarState({
              sideBar: false,
              sideBarMode: ""
            })
            setMessageFacie('')
          }
          }
        />

        {/* Contenido */}
        <div className="drawer-content">

          {/* Header */}
          <Navbar_Editor
            config={config}
            openModal={openModal}
            setSideBarState={setSideBarState}
            setFormData={setFormData}
            socket={socket}
            t={t}
            infoProject={infoProject}
            initialFormData={initialFormData}
            tokenLink={tokenLink}
          />

          <Tabla
            // Data
            setPdfData={setPdfData}
            pdfData={pdfData}
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
            isInverted={isInverted}
            alturaTd={alturaTd}
            setAlturaTd={setAlturaTd}
            setFormFacies={setFormFacies}
            facies={facies}
          />
        </div>

        <>
          <dialog id="modalPoint" className="modal">
            <div className="modal-box border border-accent">
              <form method="dialog" onSubmit={() => updateCirclePoint(modalData.index, modalData.insertIndex, modalData.x, modalData.name)}>
                <h2>Tamaño de grano</h2>
                <br></br>
                <div className="flex flex-col w-full lg:flex-row">
                  <div className="grid flex-grow h-32 card rounded-box place-items-center">
                    <p>Mud/Sand/Gravel</p>
                    <select className='select select-accent' disabled={!mudgraingravel[modalData.name]} value={modalData.name} onChange={(e) => { setModalData(prevData => ({ ...prevData, name: e.target.value, x: mudgraingravel[e.target.value] })); }}>

                      {Object.keys(mudgraingravel).map((item) =>
                        <option className="bg-base-100 text-base-content" key={item} value={item} >{item}</option>
                      )}
                    </select>
                  </div>
                  <div className="divider lg:divider-horizontal"></div>
                  <div className="grid flex-grow h-32 card rounded-box place-items-center">
                    <p>Limestones</p>
                    <select className='select select-accent' disabled={!limestones[modalData.name]} value={modalData.name} onChange={(e) => { setModalData(prevData => ({ ...prevData, name: e.target.value, x: limestones[e.target.value] })); }}>

                      {Object.keys(limestones).map((item) =>
                        <option className="bg-base-100 text-base-content" key={item} value={item}>{item}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* <input type="range" min={0.51} max={0.95} className="range" step={0.04} onChange={(e) => { setModalData(prevData => ({ ...prevData, x: parseFloat(e.target.value) })); }} value={modalData.x} /> */}

                <button className="btn btn-primary">Aceptar</button>
              </form>

              <div className="flex justify-center space-x-4">

                <form method="dialog" onSubmit={() => deleteCirclePoint(modalData.index, modalData.insertIndex)}>
                  <button className="btn btn-error">Eliminar punto</button>
                </form>

                <form method="dialog" onSubmit={() => setModalData({ index: null, insertIndex: null, x: 0.51, name: 'none' })}>
                  <button className="btn">Cerrar</button>
                </form>
              </div>

            </div>
          </dialog>
        </>

        {/* SideBar */}
        <div className="drawer-side z-[200]">
          <label htmlFor="my-drawer"
            onClick={() => {
              if (socket && formData.index !== null) {
                socket.send(JSON.stringify({
                  action: 'deleteEditingUser',
                  data: {
                    section: `[${formData.index},${header.indexOf(formData.column)}]`,
                    name: editingUsers[`[${formData.index},${header.indexOf(formData.column)}]`]?.name,
                  }
                }));
              }
            }}
            aria-label="close sidebar" className="drawer-overlay"></label>
          {
            (() => {
              switch (sideBarState.sideBarMode) {
                case "config":

                  const list = ["Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "AmbienteDepositacional", "Descripcion"]
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className='pb-6 hidden lg:block'>{t("config")}</li>

                      <li>
                        <details open>
                          <summary>{t("config_t")}</summary>
                          <ul>
                            <li>
                              <details open={false}>
                                <summary>{t("scale")}</summary>
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
                                <summary>{t("position_r")}</summary>
                                <ul>
                                  <li>

                                    <input type="checkbox" className="toggle toggle-success"
                                      checked={isInverted}
                                      onChange={(e) => {
                                        if (socket) {
                                          //  setIsInverted(!isInverted)
                                          socket.send(JSON.stringify({
                                            action: 'isInverted',
                                            data: {
                                              "isInverted": e.target.checked
                                            }
                                          }));
                                        }
                                      }} />{isInverted ? <p>{t("inverted")}</p> : <p>{t("notinverted")}</p>}

                                  </li>
                                </ul>
                              </details>
                            </li>
                            <li>
                              <details open={false}>
                                <summary>{t("visibility")}</summary>
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
                                            <span className="ml-2">{t("" + key)}</span>
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
                          <summary>{t("sala")}</summary>
                          <ul>
                            <li><SelectTheme /></li>
                            <li><LangSelector /></li>
                          </ul>
                        </details>
                      </li>
                    </ul>)

                case "añadirCapa":
                  return (

                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">{t("add")}</li>

                      <li className='mb-2' >
                        <p>
                          <input type="number" name='Height' onChange={handleChangeLocal} value={formData.Height} />
                          cm
                        </p>
                      </li>

                      <li className='mb-2'>
                        <button className='btn' disabled={formData.Height < 5 || formData.Height > 2000} onClick={() => addShape((isInverted ? -1 : 0), formData.Height)}><p>{t("add_t")}</p></button>
                      </li>
                      <li className="flex flex-row">
                        <button className='btn w-3/5' disabled={formData.Height < 5 || formData.Height > 2000} onClick={() => addShape((isInverted ? data.length - formData.initialHeight : formData.initialHeight), formData.Height)}><p>{t("add_index")}</p></button>
                        <input type="number" className='w-2/5' name="initialHeight" min="0" max={data.length - 1} onChange={handleChangeLocal} value={formData.initialHeight} />
                      </li>
                      <li className='mt-2'>
                        <button className='btn' disabled={formData.Height < 5 || formData.Height > 2000} onClick={() => addShape((isInverted ? 0 : -1), formData.Height)}><p>{t("add_b")}</p></button>
                      </li>
                    </ul>
                  );
                case "fosil":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">{t("fossils")}</li>

                      <div className="grid h-100 card bg-base-300 rounded-box place-items-center">
                        <li>{t("add_fossils")}</li>
                        <form onSubmit={handleAddFosil}>
                          <li>
                            <select required className="select select-bordered w-full max-w-xs" name='fosilImg' value={formFosil.fosilImg} onChange={changeformFosil}>
                              <option className="bg-base-100 text-base-content" value={""} disabled><p>{t("fossils_type")}</p></option>
                              {Object.keys(fosilJson).map(option => (
                                <option className="bg-base-100 text-base-content" key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </li>
                          <li>

                            {formFosil.fosilImg === "" ? null :
                              <IconSvg
                                iconName={fosilJson[formFosil.fosilImg]}
                                folder='fosiles'
                                svgProp={{ width: 50, height: 50 }}
                              />
                            }

                          </li>
                          <li>
                            <label>{t("lim_sup")}</label>
                            <input
                              type="number"
                              name='upper'
                              value={formFosil.upper}
                              min={0}
                              max={formFosil.lower}
                              required
                              onChange={changeformFosil}
                            />
                          </li>
                          <li>
                            <label>{t("lim_sup")}</label>
                            <input
                              type="number"
                              name='lower'
                              value={formFosil.lower}
                              min={0}
                              max={alturaTd}
                              required
                              onChange={changeformFosil}
                            />
                          </li>

                          <button type='submit' className="btn btn-primary"
                            disabled={formFosil.lower > alturaTd || formFosil.upper > alturaTd}>
                            <p>{t("confirm")}</p>
                          </button>
                        </form>
                      </div>
                    </ul>
                  );
                case "editFosil":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">{t("fossil_edit")}</li>
                      <li>
                        <select className="select select-bordered w-full max-w-xs" name='fosilImgCopy' value={formFosil.fosilImgCopy} onChange={changeformFosil}>
                          <option className="bg-base-100 text-base-content" value={""} disabled><p>{t("fossil_select")}</p></option>
                          {Object.keys(fosilJson).map(option => (
                            <option className="bg-base-100 text-base-content" key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </li>
                      <li>

                        <div className="flex w-full">
                          <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">
                            <IconSvg
                              iconName={formFosil.fosilImg ? fosilJson[formFosil.fosilImg] : fosilJson[1]}
                              folder='fosiles'
                              svgProp={{ width: 50, height: 50 }}
                            />
                          </div>
                          <div className="divider divider-horizontal">
                            <svg className="w-10 h-10 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                          </div>
                          <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">

                            <IconSvg
                              iconName={fosilJson[formFosil.fosilImgCopy]}
                              folder='fosiles'
                              svgProp={{ width: 50, height: 50 }}
                            />

                          </div>
                        </div>


                      </li>
                      <li>
                        <label>{t("lim_sup")}</label>
                        <input
                          type="number"
                          name='upper'
                          value={formFosil.upper}
                          onChange={changeformFosil}
                        />
                      </li>
                      <li>
                        <label>{t("lim_inf")}</label>
                        <input
                          type="number"
                          name='lower'
                          value={formFosil.lower}
                          onChange={changeformFosil}
                        />
                      </li>
                      <li>
                        <button className="btn btn-primary" onClick={handleFosilEdit}
                          disabled={formFosil.lower > alturaTd || formFosil.upper > alturaTd}>
                          <p>{t("confirm_edit")}</p>
                        </button>
                      </li>
                      <li><button className="btn btn-error" onClick={handleDeleteFosil}><p>{t("delete_fossil")}</p></button></li>
                    </ul>)
                case "polygon":
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">{t("editing_p")}</li>
                      <li>
                        <details open={false}>
                          <summary>{t("c_inf")}</summary>
                          <ul>
                            {contactsSvg.map((items, index) => {
                              return (
                                <li key={`contact-${index}`} className='bg-neutral-content' style={{ padding: '10px', marginBottom: '10px' }}>

                                  <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                      type="checkbox"
                                      value={items.contact}
                                      name='Contact'
                                      checked={formData.Contact == items.contact ? true : false}
                                      onChange={handleChange}
                                      style={{ marginRight: '8px' }}
                                    />

                                    {items.loading ?

                                      <svg xmlns="http://www.w3.org/2000/svg" width="150" height="20" viewBox="0 0 200 200"><circle className="stroke-primary" fill="none" strokeOpacity="1" strokeWidth=".5" cx="100" cy="100" r="0"><animate attributeName="r" calcMode="spline" dur="1.3" values="1;80" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-width" calcMode="spline" dur="1.3" values="0;25" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" calcMode="spline" dur="1.3" values="1;0" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate></circle></svg>
                                      :
                                      items.SvgIcon && (

                                        <items.SvgIcon {...{ width: "150", height: "20" }} />

                                      )}

                                    <div className="dropdown dropdown-hover dropdown-left dropdown-end">
                                      {/* <div tabIndex={0} role="button" className="btn m-1"> */}
                                      <svg tabIndex={0} role="button" className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                      </svg>
                                      {/* </div> */}
                                      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li><a>{items.description}</a></li>
                                      </ul>
                                    </div>
                                  </label>


                                </li>
                              )
                            }

                            )}
                          </ul>

                        </details>
                      </li>


                      <li className='flex flex-row'>
                        <p>{t("tam_cap")}</p>
                        <input type="number" name='Height' value={formData.Height} onChange={handleChangeLocal} />
                        <button className="btn" name='Height' value={formData.Height} disabled={formData.Height === formData.initialHeight || formData.Height < 5 || formData.Height > 2000} onClick={handleChange}><p>{t("change")}</p></button>
                      </li>

                      <li>
                        <p>{t("op_pattern")}</p>
                        <select name={"File"} value={formData.File} onChange={handleChange} className='select select-bordered w-full max-w-xs'>
                          {Object.keys(lithoJson).map(option => (
                            <option className="bg-base-100 text-base-content" key={option} value={option}>
                              {t(option, { ns: "Patterns" })}
                            </option>

                          ))}
                        </select>
                      </li>

                      <li>
                        <p>{t("color_cap")}<input type="color" name={"ColorFill"} value={formData.ColorFill} onChange={handleChangeLocal} onBlur={handleChange} /></p>
                      </li>
                      <li>
                        <p>{t("color_pattern")}<input type="color" name={"ColorStroke"} value={formData.ColorStroke} onChange={handleChangeLocal} onBlur={handleChange} /> </p>
                      </li>

                      <li>
                        <p>{t("zoom")}</p>
                        <input
                          type="range"
                          name='Zoom'
                          min={100}
                          max={400}
                          defaultValue={formData.Zoom}
                          onMouseUp={handleChange}
                        />
                      </li>

                      <li>
                        <p>{t("tension")} </p>
                        <input
                          type="range"
                          name='Tension'
                          min={0}
                          max={2.5}
                          step={0.1}
                          defaultValue={formData.Tension}
                          onMouseUp={handleChange}
                        />
                      </li>

                      <li>
                        <p>{t("rotation")}</p>
                        <input
                          type="range"
                          name='Rotation'
                          min={0}
                          max={180}
                          defaultValue={formData.Rotation}
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
                          setSideBarState({
                            sideBar: false,
                            sideBarMode: ""
                          })
                        }}><p>{t("delete_layer")}</p></button>
                      </li>
                    </ul>

                  );
                case "text":
                  return (
                    <>
                      <div className="p-4 w-80 min-h-full bg-base-200 text-base-content">
                        <p className="menu-title">{t("edit_text")}</p>


                        <EditorQuill
                          Text={formData.text}
                          SetText={(html: string) => setFormData(prevState => ({
                            ...prevState,
                            text: html,
                          }))}
                        />

                        <button
                          className='btn btn-primary w-full my-6'
                          onClick={() => {
                            socket.send(JSON.stringify({
                              action: 'editText',
                              data: {
                                "key": formData.column,
                                "value": formData.text,
                                "rowIndex": Number(formData.index)
                              }
                            }));
                          }}>
                          {t("send")}
                        </button>
                      </div>
                    </>
                  );
                case "addFacie":
                  return (
                    <>
                      <div className="p-4 w-80 min-h-full bg-base-200 text-base-content shadow-xl rounded-lg">
                        <p className="menu-title text-lg font-bold mb-4">{t("add_facie")}</p>
                        <p className="mb-1 font-medium text-sm">{t("e_facies")}</p>
                        <ul className="list-disc list-inside">
                          {Object.keys(facies).map((key, index) => (
                            <li key={index}>{key} - {index}</li>
                          ))}
                        </ul>

                        <div className="mb-4 ">
                          <label htmlFor="nombre" className="block text-sm font-medium">{t("facie_name")}</label>
                          <input type='text' name='facie' onChange={changeformFacie} className="input input-bordered w-full mt-1" />
                        </div>
                        <button className="btn btn-primary w-full" onClick={handleAddFacie}>
                          <p>{t("new_facie_confirm")}</p>
                        </button>
                      </div>
                    </>
                  );
                case "facieSection":
                  return (
                    <>
                      <div className="p-4 w-80 min-h-full bg-base-200 text-base-content">
                        <p className="menu-title">{t("editing_facie")} {formFacies.facie}</p>
                        <div className="p-4">
                          <p className="text-lg font-semibold mb-2">{t("tramos_facie")}</p>
                          <ul className="list-disc list-inside space-y-2">
                            {Object.values(facies[formFacies.facie]).map((value, index) => (
                              <>
                                <li key={index} className="flex items-center justify-between">
                                  <span>{value["y1"]}cm - {value["y2"]}cm</span>
                                  <button className="btn btn-error" onClick={() => {
                                    handleDeleteFacieSection(index)
                                  }}>
                                    <p>{t("delete_facie_sec")}</p>
                                  </button>
                                </li>

                              </>
                            ))}
                          </ul>

                          <p className="text-lg font-semibold mt-4 mb-2">{t("add_tramo_facie")}</p>
                          <ul className="list-disc list-inside space-y-2">
                            <li className="flex items-center">
                              <span>{t("lim_sup")}</span>
                              <input
                                type="number"
                                name="y1"
                                value={formFacies.y1}
                                onChange={changeformFacie}
                                className="form-input ml-2"
                              />
                            </li>
                            <li className="flex items-center">
                              <span>{t("lim_inf")}</span>
                              <input
                                type="number"
                                name="y2"
                                value={formFacies.y2}
                                onChange={changeformFacie}
                                className="form-input ml-2"
                              />
                            </li>
                          </ul>

                          <button className="btn btn-primary mt-4 w-full" onClick={handleAddFacieSection}>
                            <p>{t("confirm_new_t")}</p>
                          </button>

                          {messageFacie !== '' && (<>
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mt-3 rounded relative" role="alert">
                              <strong className="font-bold">Error: </strong>
                              <span className="block sm:inline">{messageFacie}</span>
                            </div></>)}

                        </div>

                        <button className="btn btn-error mt-4 w-full" onClick={handleDeleteFacie}>
                          <p>{t("delete_facie")}</p>
                        </button>
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

        </div >

      </div >
    </>
  );
}


export default Grid;
