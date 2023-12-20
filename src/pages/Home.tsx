import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Web/Narbar';
import MapProject from '../components/Web/MapProject';
import TableData from '../components/Web/TableData';

const Home = () => {

  const [item, setItem] = useState('tabla'); 
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [proyectMap, setProyectMap] = useState([]);

  async function fetchData() {
    try {
        const response = await fetch("http://localhost:3001/users/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });

        const result = await response.json();
        console.log(result);

        setProyectos(result.projects);

    } catch (error) {
        console.error('Error al obtener datos:', error);

    }
  };

  async function fetchMapData() {
    if (proyectMap.length > 0) return;
    try {
      const response = await fetch("http://localhost:3001/search/public", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      });

      const result = await response.json();

      setProyectMap(result.projects);
      console.log(response);

    } catch (error) {
      console.error('Error al obtener datos:', error);

    }
  };

useEffect(() => {
    fetchData();
}, []);


  return (

    <>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content justify-center">

          <Navbar logohidden={false} />

          {/* Contenido */}
          <main className="flex-1 p-4">
            {/* PROYECTOS */}
            <div className="overflow-x-auto bg-base-200 rounded-box p-4 h-full">

              {item === 'tabla' && <TableData Data={proyectos} /> }
              {item === 'mapa' && 
                <div className='h-full'>
                  <MapProject Data={proyectMap}/>
                </div>
              }
            </div>

          </main>


        </div>
        <div className="drawer-side">

          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>

          <ul className="menu px-4 w-80 min-h-full bg-base-200 text-base-content">

            {/* Sidebar content here */}


            <li className='pb-6 hidden lg:block'><a className="btn btn-ghost text-xl">Proyecto T</a></li>

            <button className="btn btn-neutral hidden lg:block" onClick={() => navigate(`/create`)}>Crear Sala</button>

            <li className="menu-title">Proyecto</li>
            <li onClick={() => setItem('tabla')   }><a>All Projects </a></li>
            <li><a>Your Projects</a></li>
            <li><a>Shared with you</a></li>
            <li className="menu-title">Busqueda</li>
            <li onClick={() => {setItem('mapa'); fetchMapData()}}><a>Proyectos Publicos</a></li>
            <li className="menu-title">Organización</li>
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
            <li><a>Item 3</a></li>
          </ul>

        </div>
      </div>
    </>
  );

};


export default Home;
