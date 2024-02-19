import { useRef, useState, useEffect } from 'react';
import Tabla from './Tabla'; // Asegúrate de importar el componente correctamente
import { useParams } from "react-router-dom";
import SelectTheme from '../Web/SelectTheme';
import fosilJson from '../../fossil.json';

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
            // setColumnCount(shapeN.config.length)
            // setFossils(estructuraFosil)
            break;
          }
          case 'columns':
            setHeader(shapeN.columns)
          //  setColumnCount(shapeN.columns.length)
            break
            case 'addFosil':
              setFossils(prevfossils => [...prevfossils, shapeN]);
              break
          case 'addCircle':
            setPolygons(prev => {
              const newData = { ...prev };
              newData[shapeN.rowIndex]["circles"] = shapeN.newCircle;
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

  const [upperLimit, setUpperLimit] = useState('');
  const [lowerLimit, setLowerLimit] = useState('');
  const [selectedFosil, setSelectedFosil] = useState<string>(Object.keys(fosilJson)[0]);
  const [relativeX, setRelativeX] = useState(0);
  const [idClickFosil, setIdClickFosil] = useState<number>(0);

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
  
  const [fossils, setFossils] = useState([]);

  return (
    <>
      
      <div className="drawer drawer-end  ">
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
          <Tabla setIdClickFosil={setIdClickFosil} fossils={fossils} setRelativeX={setRelativeX} data={data} header={header} lithology={polygons} scale={0.5} setCircles={updateCircles} setSideBarState={setSideBarState}/>
        </div>

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
                        <button className="btn btn-primary" onClick={handleConfirm}>Confirmar</button>
                      
                      </div>
                    </ul>
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
