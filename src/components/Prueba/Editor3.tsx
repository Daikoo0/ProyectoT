import React from 'react';
import ReactDOM from 'react-dom';
import { useState } from 'react';
import Tabla from './Tabla'; // Asegúrate de importar el componente correctamente
import Polygon from './Polygon4';

const Grid = () => {

  
  const [alturas,setAlturas] = useState([100,200,100,250])

  const datosIniciales = {
    nombres: ["Juan", "María", "Pedro", "Ana"],
    edades: [28, 34, 45, 29],
    ciudades: ["Bogotá", "Medellín", "Cali", '<p class="ql-align-justify"><span class="ql-font-monospace">es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500cuando un impresor (N. del T. persona que se dedica a la imprenta)</span></p>'],
    Litologia: [16, <Polygon Height={alturas[1]} />, <Polygon Height={alturas[2]} />, 29],
  };

  const [datos, setDatos] = useState(datosIniciales);



  return (
    <>
      <Tabla datos={datos} alturas={alturas}/>
    </>
  );
}

export default Grid;
