import { useState, useMemo } from 'react';
import Tabla from './Tabla'; // Asegúrate de importar el componente correctamente
import Polygon from './Polygon4';
import generarPDF from './pdf'; // Asegúrate de importar la función correctamente
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


  const [alturas, setAlturas] = useState([100, 200, 100, 250])

  const datosIniciales = {
    nombres: ["Juan", "María", "Pedro", "Ana"],
    edades: [28, 34, 45, 29],
    ciudades: ["Bogotá", "Medellín", "Cali", '<p class="ql-align-justify"><span class="ql-font-monospace">es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500cuando un impresor (N. del T. persona que se dedica a la imprenta)</span></p>'],
    Litologia: [<Polygon Height={alturas[0]} File={'602'} ColorFill={'none'} ColorStroke={'red'} Zoom={200} />,
    <Polygon Height={alturas[1]} File={'601'} ColorFill={'none'} ColorStroke={'green'} Zoom={200} />,
    <Polygon Height={alturas[2]} File={'730'} ColorFill={'none'} ColorStroke={'purple'} Zoom={200} />,
    <Polygon Height={alturas[3]} File={'722'} ColorFill={'none'} ColorStroke={'black'} Zoom={200} />],
    fosiles: [[], [], [], []]
  };

  const [datos, setDatos] = useState(datosIniciales);

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

  const columnas = useMemo(() => Object.keys(datos), [datos]);

  const [columnasVisibles, setColumnasVisibles] = useState(() =>
    columnas.reduce((acc, columna) => {
      acc[columna] = true;
      return acc;
    }, {})
  );

  const columnasVisiblesFiltradas = useMemo(() =>
  columnas.filter(columna => columnasVisibles[columna]),
  [columnas, columnasVisibles]
);

  const toggleColumna = (columna) => {
    setColumnasVisibles((prevState) => ({
      ...prevState,
      [columna]: !prevState[columna],
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
          <Tabla datos={datos} alturas={alturas} columnasVisiblesFiltradas={columnasVisiblesFiltradas} />
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          {
            (() => {
              switch (sideBarState.sideBarMode) {
                case "config":

                  const list = ["Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "Ambiente Depositacional", "Descripcion"]
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
                          {columnas.map((columna) => (
                            <label key={columna} className="mr-2">
                              <input
                                type="checkbox"
                                checked={columnasVisibles[columna]}
                                onChange={() => toggleColumna(columna)}
                              /> {columna}
                            </label>
                          ))}
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
