import { useRef, useState, useEffect } from 'react';
import Tabla from './Tabla'; // Asegúrate de importar el componente correctamente
import { useParams } from "react-router-dom";
import SelectTheme from '../Web/SelectTheme';

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
                  <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
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



  return (
    <>
      <OptionsBar />
      <div className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={sideBarState.sideBar} onClick={() => setSideBarState({
          sideBar: false,
          sideBarMode: ""
        })} />
        <div id="este" className="drawer-content">
          <Tabla data={data} header={header} lithology={polygons} scale= {2} setCircles={updateCircles}/>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          {
            (() => {
              switch (sideBarState.sideBarMode) {
                case "config":

                  // const list = ["Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "Ambiente Depositacional", "Descripcion"]
                  return (
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                      <li className="menu-title">Configuración</li>
                      {/* {list.map((key) => {
                        if (key != "Espesor" && key != "Litologia") {
                          return (
                            <li key={key}>
                              <div style={{ display: 'flex' }}>
                                <input
                                  type="checkbox"
                                  id={key}
                                  name={key}
                                // checked={Header.includes(key) ? true : false}
                                //   onChange={(e) => handleColumns(e, key)}
                                />
                                <label htmlFor={key} style={{ whiteSpace: 'nowrap' }}>
                                  {key}
                                </label>
                              </div>
                            </li>
                          );
                        }
                      }
                      )} */}
                      {/* <div className="flex flex-col">
                        <div className="flex mb-2"> */}
                          
                        {/* </div>
                      </div> */}
                    </ul>)

                default:
                  return (
                    <div className="drawer drawer-mobile">
                      a
                    </div>
                  );
              }
            })()
          }

        </div>

      </div>
    </>
  );
}

export default Grid;
