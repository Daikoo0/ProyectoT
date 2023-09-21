
import { useState, useEffect } from 'react';

const Home = () => {
    
    const [proyectos] = useState([]);

    async function fetchData() {
     /*   try {
                const response = await fetch("http://localhost:3001/Users", {
                method: "GET",
                headers: {
                "Content-Type": "application/json"
        },
        credentials: "include",
      });

        const data = await response.json();
        setProyectos(data); // Actualiza el estado con los datos obtenidos
        } catch (error) {
        console.error('Error al obtener datos:', error);
        }*/
    };

    useEffect(() => {
         fetchData();
    },[proyectos]);
  

  return (
    <div>
      <h1> Proyectos del usuario</h1>
      <ul>
        {proyectos.map((proyecto) => (
          <li key={proyecto.id}>
            <h2>{proyecto.nombre}</h2>
            <p>{proyecto.descripcion}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
