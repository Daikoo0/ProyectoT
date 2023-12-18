import { useState, useEffect } from "react";
import { Marker } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';

import Map from '../../components/Web/Map';

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

    <Map>
      <MarkerClusterGroup>
        {proyectos === null ? null : proyectos.map((proyecto, index) => (
          <Marker key={index} position={[proyecto.Lat, proyecto.Long]} />
        ))}
      </MarkerClusterGroup>;
    </Map>



  );
};

export default Prueba;
