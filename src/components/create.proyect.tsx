import { useState } from 'react';
//import './Form.css';

const ParticipantForm = () => {
  //esta ruta lo que hace es generar una nueva room
  //me puse en corte baneador compulsivo 💀💀 y todos estan baneados
  //si se quiere crear acceder a un proyecto que no esta creado no permitira conexiones a el socket
  //con esta ruta se crea un room y puse la opcion de añadir participantes para comenzar, todo esta guardado en la bd
  const [roomName, setRoomName] = useState('');
  const [participants, setParticipants] = useState([{ email: '', role: 0 }]);
  const [message, setMessage] = useState('')

  const addParticipant = () => {
    setParticipants([...participants, { email: '', role: 0 }]);
  };

  const removeParticipant = (index) => {
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
  };

  const handleRoomNameChange = (e) => {
    setRoomName(e.target.value);
  };

  const handleParticipantChange = (e, index) => {
    const { name, value } = e.target;
    const updatedParticipants = [...participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      [name]: name === 'role' ? parseInt(value) : value,
    };
    setParticipants(updatedParticipants);
  };

  async function handleSubmit() {
    console.log(JSON.stringify(participants));
    const response = await fetch(`http://localhost:3001/rooms/${roomName}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ participants }),
    });

    const data = await response.json();
    console.log(response.status, data);

    if (response.status === 200) {
      setMessage("Sala " + roomName + " creada con éxito")
    }
    else
      if (response.status === 500) {

        setMessage("Error al crear la sala")
      }
  }

  return (
    <div>
      <div className="flex w-full">
        <div className="grid h-full w-1/2 flex-grow card bg-base-300 rounded-box place-items-center p-4 ">

          <h1 className="text-5xl font-bold">Crea un nuevo proyecto</h1>
          
            <div className="flex p-6 w-full">
              <div className="form-control w-full max-w-xs mr-2">
                <label className="label-text">Nombre de la sala:</label>
                <input
                  className="input input-bordered w-full max-w-xs"
                  placeholder="Nombre Sala"
                  type="text"
                  id="roomName"
                  value={roomName}
                  onChange={handleRoomNameChange}
                />
              </div>
              
              <div className="form-control w-full max-w-xs">
                <label className="label-text">Localización:</label>
                <input
                  className="input input-bordered w-full max-w-xs"
                  placeholder="Chile, Temuco"
                  type="text"
                  id="location"
                  value=""
                  // onChange={}
                />
              </div>
            </div>

            <div className="flex px-6 w-full">
              <div className="form-control w-full max-w-xs mr-2">
                <label className="label-text">Latitude:</label>
                <input
                  className="input input-bordered w-full max-w-xs"
                  placeholder="Ingrese Latitud"
                  type="number"
                  id="latitude"
                  value=''
                  // onChange={}
                />
              </div>
              
              <div className="form-control w-full max-w-xs">
                <label className="label-text"> longitude:</label>
                <input
                  className="input input-bordered w-full max-w-xs"
                  placeholder="Ingrese Longitud"
                  type='number'
                  id="longitude"
                  value=""
                  // onChange={}
                />
              </div>
            </div>
            
            <div className="form-control mt-6">
                <button className="btn btn-neutral" onClick={handleSubmit}>Crear Sala</button>
              </div>
            
              <p>{message}</p>
          
        </div>

        <div className="divider divider-horizontal"></div>

        {/* Mapa */}
        <div className="grid h-full w-1/2 flex-grow card bg-base-300 rounded-box place-items-center">

          <figure className="p-5">
            <img src="https://developers.google.com/static/codelabs/maps-platform/maps-platform-101-js/img/e52623cb8578d625.png" alt="Shoes" className="rounded-xl" />
          </figure>

        </div>
      </div>


    </div>
    // <div className="login-container">
    // <form>
    //   <div style={{ marginBottom: '10px' }}>
    //     <label htmlFor="roomName">Nombre de la sala:</label>
    //     <input
    //       type="text"
    //       id="roomName"
    //       value={roomName}
    //       onChange={handleRoomNameChange}
    //     />
    //   </div>
    //   {participants.map((participant, index) => (
    //     <div key={index}>
    //       <div>
    //         <input
    //           type="text"
    //           name="email"
    //           value={participant.email}
    //           onChange={(e) => handleParticipantChange(e, index)}
    //           placeholder="Email"
    //         />
    //       </div>
    //       <div>
    //         <select
    //           name="role"
    //           value={participant.role}
    //           onChange={(e) => handleParticipantChange(e, index)}
    //         >
    //           <option value={0}>Seleccionar rol</option>
    //           <option value={1}>Editor</option>
    //           <option value={2}>Lector</option>
    //         </select>
    //         <button type="button" onClick={() => removeParticipant(index)}>
    //           Eliminar
    //         </button>
    //       </div>
    //       <div style={{ marginBottom: '10px' }}></div>
    //     </div>
    //   ))}
    //   <button type="button" onClick={addParticipant}>
    //     Agregar participante
    //   </button>
    //   <button type="button" onClick={handleSubmit}>
    //     Enviar
    //   </button>
    //   <p>{message}</p>
    // </form>
    // </div>
  );
};

export default ParticipantForm;