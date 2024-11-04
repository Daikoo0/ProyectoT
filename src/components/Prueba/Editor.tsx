import { useRef, useState, useEffect, useMemo } from 'react';
import { useParams } from "react-router-dom";
import Navbar_Editor from './Navbar_Editor';
import Tabla from './Tabla';
import fosilJson from '../../fossil.json';
import limestones from '../../limestones.json';
import mudgraingravel from '../../mudgraingravel.json';
import { useAuth } from '../../provider/authProvider';
import { useTranslation } from 'react-i18next';
import { arrayMove } from '@dnd-kit/sortable';
import { ProjectInfo, DataInfo, Fosil, Col, Muestra, Facies, User, EditingUser, formData, formFosil, formMuestra, formFacies } from './types';
import Config from './sidebar/Config';
import AddCapa from './sidebar/AddCapa';
import AddFossil from './sidebar/AddFossil';
import EditFossil from './sidebar/EditFossil';
import AddMuestra from './sidebar/AddMuestra';
import EditMuestra from './sidebar/EditMuestra';
import EditPolygon from './sidebar/EditPolygon';
import EditText from './sidebar/EditText';
import AddFacie from './sidebar/AddFacie';
import FacieSection from './sidebar/FacieSection';

const initialFormData: formData = {
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

const Grid = () => {
  const { t } = useTranslation(['Editor', 'Description', 'Patterns']);
  const { token } = useAuth();
  const { project } = useParams(); // Sala de proyecto
  const [socket, setSocket] = useState(null);
  const [modalData, setModalData] = useState({ index: null, insertIndex: null, x: 0.5, name: 'none' });
  const [scale, setScale] = useState(1);
  const [alturaTd, setAlturaTd] = useState(null);
  const [tokenLink, setTokenLink] = useState({ editor: '', reader: '' });
  const [isInverted, setIsInverted] = useState(false);
  const [messageFacie, setMessageFacie] = useState('');

  // Referencias
  const tableref = useRef(null);
  const isPageActive = useRef(true);

  // Datos
  const [infoProject, setInfoProject] = useState<ProjectInfo>();
  const [data, setData] = useState<DataInfo[]>([]);
  const [fossils, setFossils] = useState<Record<string, Fosil>>({});
  const [muestras, setMuestras] = useState<Record<string, Muestra>>({});
  const [facies, setFacies] = useState<Record<string, Facies[]>>({});
  const [header, setHeader] = useState<Col[]>([]);

  // Formularios
  const [formData, setFormData] = useState<formData>(initialFormData);
  const [formFosil, setFormFosil] = useState<formFosil>({ id: '', upper: 0, lower: 0, fosilImg: '', x: 0, fosilImgCopy: '' });
  const [formMuestra, setFormMuestra] = useState<formMuestra>({ id: '', upper: 0, lower: 0, muestraText: '', x: 0, muestraTextCopy: '' });
  const [formFacies, setFormFacies] = useState<formFacies>({ facie: '', y1: 0, y2: 0, y1prev: 0, y2prev: 0 });

  // Usuarios
  const [editingUsers, setEditingUsers] = useState<Record<string, EditingUser>>({});
  const [users, setUsers] = useState<Record<string, User>>({});

  

  const sortedOptions = useMemo(() => {
    return Object.keys(fosilJson)
      .map(option => ({
        key: option,
        value: t(option, { ns: "Fossils" }) // Obtiene la traducción
      }))
      .sort((a, b) => a.value.localeCompare(b.value)); // Ordena las opciones por el valor traducido
  }, [fosilJson, t]);

  const changeformFosil = (e) => {
    const { name, value } = e.target;
    setFormFosil(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }

  const changeFormMuestra = (e) => {
    const { name, value } = e.target;
    setFormMuestra(prevState => ({
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
    console.log(name, value, e.target)

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
    console.log(name, value)
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
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
      text: data[index].Columns[column], // Mantén esto porque depende de column
      Contact: Litologia.Contact,
    });
  };


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
            setHeader(shapeN.config.Columns)
            setFossils(shapeN.fosil)
            setMuestras(shapeN.muestras)
            setIsInverted(shapeN.config.IsInverted)
            setEditingUsers(shapeN.userEditing)
            setUsers(shapeN.users)
            setInfoProject(shapeN.projectInfo)
            break;
          }
          case 'userConnected': {
            setUsers(prevState => ({
              ...prevState,
              [shapeN.id]: { name: shapeN.mail, color: shapeN.color }
            }));

            break;
          }
          case 'userDisconnected': {
            const userID = shapeN.id;

            setEditingUsers(prevState => {
              const safePrevState = prevState || {};
              return Object.fromEntries(
                Object.entries(safePrevState).filter(([_, value]) => value.id !== userID)
              );
            });

            setUsers(prevState => {
              const { [userID]: _, ...newState } = prevState;
              return newState;
            });

            break;
          }
          case 'editingUser': {
            setEditingUsers(prevState => ({
              ...prevState,
              [shapeN.value]: shapeN.data
            }));
            break;
          }
          case 'deleteEditingUser': {
            console.log(shapeN.value)
            setEditingUsers(prevState => {
              const newState = { ...prevState };
              if (newState.hasOwnProperty(shapeN.value)) {
                delete newState[shapeN.value];
              } else {
                return;
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
            setFacies(shapeN.facies)
            setFossils(shapeN.fosil)
            setMuestras(shapeN.muestras)
            break
          case 'addFosil':
            setFossils(prev => ({ ...prev, [shapeN.idFosil]: shapeN.value }));
            break
          case 'addMuestra':
            setMuestras(prev => ({ ...prev, [shapeN.idMuestra]: shapeN.value }));
            console.log(muestras, shapeN)
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
            setData(prev =>
              prev.map((item, index) =>
                index === shapeN.rowIndex
                  ? {
                    ...item,
                    Columns: {
                      ...item.Columns,
                      [shapeN.key]: shapeN.value
                    }
                  }
                  : item
              )
            );
            break;
          case 'editFosil':
            setFossils(prev => {
              const newFossils = { ...prev };
              newFossils[shapeN.idFosil] = shapeN.value;
              return newFossils;
            });
            setSideBarState({
              sideBar: false,
              sideBarMode: ""
            })
            break
          case 'editMuestra':
            setMuestras(prev => {
              const newMuestra = { ...prev };
              newMuestra[shapeN.idMuestra] = shapeN.value;
              return newMuestra;
            });
            setSideBarState({
              sideBar: false,
              sideBarMode: ""
            })
            break;
          case 'deleteFosil':
            setFossils((prevFossils) => {
              const newFossils = { ...prevFossils };
              delete newFossils[shapeN.idFosil];
              console.log(newFossils)
              return newFossils;
            });
            break
          case 'deleteMuestra':
            setMuestras((prevMuestras) => {
              const newMuestra = { ...prevMuestras };
              delete newMuestra[shapeN.idMuestra];
              return newMuestra;
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
          case 'addColumn':
            setHeader(prev => [...prev, shapeN.column]);
            break;
          case 'deleteColumn':
            setHeader(prev => prev.filter(col => col.Name !== shapeN.column));
            break;

          case 'tokenLink':
            console.log(shapeN)
            setTokenLink({
              editor: shapeN.editor,
              reader: shapeN.reader
            })
            break;
          case 'drop':
            console.log(shapeN.activeId, shapeN.overId)
            setData((data) => {
              return arrayMove(data, shapeN.activeId, shapeN.overId);
            });
            break;
          case 'error':
            console.error(shapeN.message);
            socket.close();  // Cerrar el socket
            isPageActive.current = false;  // Desactivar reconexión
            return
          case "close":
            console.info(shapeN.message);
            socket.close();
            isPageActive.current = false; // Desactivar reconexión
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

  const handleAddMuestra = (event) => {
    event.preventDefault();
    socket.send(JSON.stringify({
      action: 'addMuestra',
      data: {
        "upper": Number(formMuestra.upper),
        "lower": Number(formMuestra.lower),
        "muestraText": formMuestra.muestraText,
        "x": formMuestra.x
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

  const handleDeleteMuestra = () => {
    socket.send(JSON.stringify({
      action: 'deleteMuestra',
      data: {
        "idMuestra": formMuestra.id,
        "upper": Number(formMuestra.upper),
        "lower": Number(formMuestra.lower),
        "muestraText": formMuestra.muestraText,
        "x": formMuestra.x
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
        "fosilImg": formFosil.fosilImg,   //.fosilImgCopy,
        "x": formFosil.x
      }
    }));
  }

  const handleMuestraEdit = () => {

    socket.send(JSON.stringify({
      action: 'editMuestra',
      data: {
        "idMuestra": formMuestra.id,
        "upper": Number(formMuestra.upper),
        "lower": Number(formMuestra.lower),
        "muestraText": formMuestra.muestraText,
        "x": formMuestra.x
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
        if ((formFacies.y1 > interval.y1 && formFacies.y1 < interval.y2) || (formFacies.y2 > interval.y1 && formFacies.y2 < interval.y2)) {
          isInsideInterval = true;
          coincidences.push(key)
        }
        if ((interval.y1 > formFacies.y1 && interval.y1 < formFacies.y2) || (interval.y2 > formFacies.y1 && interval.y2 < formFacies.y2)) {
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
    socket.send(JSON.stringify({
      action: 'deleteCircle',
      data: {
        "rowIndex": index,
        "deleteIndex": deleteIndex

      }
    }));
  }

  // Añade una nueva capa
  const addShape = (row, height) => {
    socket.send(JSON.stringify({
      action: 'añadir',
      data: {
        "height": Number(height),
        "rowIndex": Number(row)
      }
    }));
  }

  // Usuario editando celda
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

  const handleDeletePolygon = () => {
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
  }

  const handleEditText = () => {
    socket.send(JSON.stringify({
      action: 'editText',
      data: {
        "key": formData.column,
        "value": formData.text,
        "rowIndex": Number(formData.index)
      }
    }));
  }

  const [pdfData, setPdfData] = useState({});

  const handleAddColumn = (columnName) => {
    socket.send(JSON.stringify({ action: 'addColumn', data: { name: columnName } }))
  }

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
            //    openModal={openModal}
            setSideBarState={setSideBarState}
            setFormData={setFormData}
            socket={socket}
            t={t}
            infoProject={infoProject}
            initialFormData={initialFormData}
            tokenLink={tokenLink}
            setTokenLink={setTokenLink}
            users={users}
            tableref={tableref}
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
            muestras={muestras}
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
            socket={socket}
            tableref={tableref}
            setFormMuestra={setFormMuestra}
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
                  <button
                    className="btn btn-error"
                    disabled={modalData.insertIndex <= 1 || modalData.insertIndex >= data[modalData.index]?.Litologia?.Circles?.length - 1}>
                    Eliminar punto
                  </button>
                </form>
                <form method="dialog" onSubmit={() => setModalData({ index: null, insertIndex: null, x: 0.51, name: 'none' })}>
                  <button className="btn">Cerrar</button>
                </form>
              </div>

            </div>
          </dialog>
        </>

        {/* SideBar */}
        <div className="drawer-side z-[1003]">
          <label htmlFor="my-drawer"
            onClick={() => {
              if (socket && formData.index !== null) {
                socket.send(JSON.stringify({
                  action: 'deleteEditingUser',
                  data: {
                    section: `[${formData.index},${header.indexOf(formData.column) + 1}]`,
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
                  return (
                    <Config socket={socket} header={header} isInverted={isInverted} scale={scale} setScale={setScale} setHeader={setHeader} />
                  );
                case "añadirCapa":
                  return (
                    <AddCapa handleChangeLocal={handleChangeLocal} formData={formData} lengthData={data.length} handleAddColumn={handleAddColumn} addShape={addShape} />
                  );
                case "fosil":
                  return (
                    <AddFossil handleAddFosil={handleAddFosil} formFosil={formFosil} sortedOptions={sortedOptions} changeformFosil={changeformFosil} alturaTd={alturaTd} />
                  );
                case "editFosil":
                  return (
                    <EditFossil formFosil={formFosil} sortedOptions={sortedOptions} changeformFosil={changeformFosil} handleFosilEdit={handleFosilEdit} handleDeleteFosil={handleDeleteFosil} alturaTd={alturaTd} />
                  );
                case "muestra":
                  return (
                    <AddMuestra handleAddMuestra={handleAddMuestra} formMuestra={formMuestra} alturaTd={alturaTd} changeFormMuestra={changeFormMuestra} />
                  );
                case "editMuestra":
                  return (
                    <EditMuestra formMuestra={formMuestra} changeFormMuestra={changeFormMuestra} handleMuestraEdit={handleMuestraEdit} alturaTd={alturaTd} handleDeleteMuestra={handleDeleteMuestra} />
                  )
                case "polygon":
                  return (
                    <EditPolygon handleDeletePolygon={handleDeletePolygon} handleChangeLocal={handleChangeLocal} formData={formData} handleChange={handleChange}/>
                  );
                case "text":
                  return (
                    <EditText setFormData={setFormData} handleEditText={handleEditText} formData={formData} />
                  );
                case "addFacie":
                  return (
                    <AddFacie changeformFacie={changeformFacie} handleAddFacie={handleAddFacie} facies={facies} />
                  );
                case "facieSection":
                  return (
                    <FacieSection messageFacie={messageFacie} facies={facies} formFacies={formFacies} handleDeleteFacieSection={handleDeleteFacieSection} changeformFacie={changeformFacie} handleAddFacieSection={handleAddFacieSection} handleDeleteFacie={handleDeleteFacie} />
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
