import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/ApiClient';
import Navbar from '../components/Web/Narbar';
import MapProject from '../components/Web/MapProject';
import TableData from '../components/Web/TableData';
import { useTranslation } from 'react-i18next';
import LangSelector from '../components/Web/LanguageComponent';

const Home = () => {

  const [item, setItem] = useState('tabla');
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [proyectMap, setProyectMap] = useState([]);
  const { t } = useTranslation();

  async function fetchData() {
    try {
      const response = await api.get("/users/projects");
      setProyectos(response.data.projects);

    } catch (error) {
      console.error('Error al obtener datos:', error);

    }
  };

  async function fetchMapData() {
    if (proyectMap.length > 0) return;
    try {
      const response = await api.get("/search/public");

      setProyectMap(response.data.projects);
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
          <LangSelector/>

          {/* Contenido */}
          <main className="flex-1 p-4">
            {/* PROYECTOS */}
            <div className="overflow-x-auto bg-base-200 rounded-box p-4 h-full">

              {item === 'tabla' && <TableData Data={proyectos} refresh={fetchData} />}
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

            {/* Sidebar content here */}


            <li className='pb-6 hidden lg:block'><a className="btn btn-ghost text-xl">Proyecto T</a></li>

            <button className="btn btn-neutral hidden lg:block" onClick={() => navigate(`/create`)}><p>{t("Home.Create_button")}</p></button>

            <li className="menu-title">{t("Home.projects")}</li>
            <li onClick={() => setItem('tabla')}><a>{t("Home.all_p")}</a></li>
            <li><a>{t("Home.your_p")}</a></li>
            <li><a>{t("Home.shared_wup")}</a></li>
            <li className="menu-title">{t("Home.search")}</li>
            <li onClick={() => { setItem('mapa'); fetchMapData() }}><a>{t("Home.public_project")}</a></li>
            <li><a>{t("Home.invitations")}</a></li>
          </ul>

        </div>
      </div>
    </>
  );

};


export default Home;
