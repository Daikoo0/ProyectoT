import { useState, useEffect } from "react";
import { MapContainer, TileLayer} from 'react-leaflet';

const Prueba = () => {

  const [proyectos, setProyectos] = useState([]);

  async function fetchData() {
    try {
      const response = await fetch("http://localhost:3001/search/public", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      });

      const result = await response.json();

      setProyectos(result.projects);

    } catch (error) {
      console.error('Error al obtener datos:', error);

    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <MapContainer className={'h-screen w-full'} center={[-38.7027177, -72.5338521]} zoom={13} scrollWheelZoom={true}>

        
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
              
            />
            

      </MapContainer>
    </>
  );
};

export default Prueba;
