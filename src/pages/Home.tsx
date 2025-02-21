import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/ApiClient';
import Navbar from '../components/Web/Narbar';
import MapProject from '../components/Web/MapProject';
import TableData from '../components/Web/TableData';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../provider/authProvider';

const Home = () => {
  const [item, setItem] = useState('tablaAll');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [proyectosPropios, setProyectosPropios] = useState([]);
  const [proyectosCompartidos, setProyectosCompartidos] = useState([]);
  const [proyectMap, setProyectMap] = useState([]);
  const { t } = useTranslation("Home");

  async function fetchData() {
    try {
      const response = await api.get("/users/projects");
      const allProjects = response.data.projects;

      // Filtrar proyectos propios y compartidos
      console.log(response.data.projects)
      const propios = allProjects.filter(proyecto => proyecto.ProjectInfo.Members.Owner === user.email);
      const compartidos = allProjects.filter(proyecto => proyecto.ProjectInfo.Members.Owner  !== user.email);

      setProyectos(allProjects);
      setProyectosPropios(propios);
      setProyectosCompartidos(compartidos);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  async function fetchMapData() {
    if (proyectMap.length > 0) return;
    try {
      const response = await api.get("/search/public");
      setProyectMap(response.data.projects);
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
          <main className="flex-1 p-4">
            <div className="overflow-x-auto bg-base-200 rounded-box p-4 h-full">
              {item === 'tablaAll' && <TableData Data={proyectos} refresh={fetchData} />}
              {item === "tabla_your_p" && <TableData Data={proyectosPropios} refresh={fetchData} />}
              {item === "tabla_shared" && <TableData Data={proyectosCompartidos} refresh={fetchData} />}
              {item === 'mapa' &&
                <div className='h-full'>
                  <MapProject Data={proyectMap} />
                </div>
              }
            </div>
          </main>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu px-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className='pb-6 hidden lg:block'><a className="btn btn-ghost text-xl">StrataScope</a></li>
            <button className="btn btn-neutral hidden lg:block" onClick={() => navigate(`/create`)}><p>{t("Create_button")}</p></button>
            <li className="menu-title">{t("projects")}</li>
            <li onClick={() => setItem('tablaAll')}><a>{t("all_p")}</a></li>
            <li onClick={() => setItem('tabla_your_p')}><a>{t("your_p")}</a></li>
            <li onClick={() => setItem("tabla_shared")}><a>{t("shared_wup")}</a></li>
            <li className="menu-title">{t("search")}</li>
            <li onClick={() => { setItem('mapa'); fetchMapData() }}><a>{t("public_project")}</a></li>
            <li><a>{t("invitations")}</a></li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Home;
