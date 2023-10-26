
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    
    const [proyectos, setProyectos] = useState([]);
    const navigate = useNavigate();

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
          console.log('Datos recibidos:', result);
  
          if (result.Proyects && Array.isArray(result.Proyects)) {
              setProyectos(result.Proyects);
          } else {
              throw new Error("No se encontraron proyectos o los datos no están en el formato esperado.");
          }
      } catch (error) {
          console.error('Error al obtener datos:', error);
          
      }
  };
  
  
    useEffect(() => {
         fetchData();
    },[]);

    const handleEdit = (sala) => {
      navigate(`/editor/${sala}`); 
    };

    const handleAddRoom = () => {
      navigate(`/create`); 
    };
  
    const handleInvite = (sala) => {
      navigate(`/invite/${sala}`); 
    };

    return (
      <div>
      <h1>Proyectos del usuario</h1>
      <div className="contenedor-proyectos-scroll">
        {proyectos.map((proyecto, index) => (
          <div key={index} className="proyecto">
            <span>{proyecto}</span>
            <button onClick={() => handleEdit(proyecto)}>Editar</button>
            <button onClick={() => handleInvite(proyecto)}>Agregar Usuario</button> 
          </div>
        ))}
      </div>
      <button onClick={handleAddRoom}>Crear Sala</button>
    </div>
    );
  };


export default Home;
