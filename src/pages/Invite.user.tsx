import { useState } from 'react';
import { useParams } from 'react-router-dom';
//import './Form.css';

const AddUserToRoom = () => {
  //esta ruta lo que hace es invitar un usuario a la room
  //me puse en corte baneador compulsivo 💀💀 y todos estan baneados
  //la unica forma de entrar a un room es que seas parte de el y esto hace esta ruta 
  const { project } = useParams();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [room, setRoom] = useState(project);
  const [message, setMessage] = useState('');

  async function handleAddUser() {
   
    console.log(JSON.stringify({
      email: email,
      role: parseInt(role),
      }));

    const response = await fetch(`http://localhost:3001/rooms/${room}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
        email: email,
        role: parseInt(role),
        }),
      });

      const data = await response.json();
      console.log(response.status, data);

      if(response.status===200){
        setMessage("Usuario agregado con éxito")
      }else
      if(response.status===400){
        setMessage("Sala no existe")
      }else
      if(response.status===403){
        setMessage("No estás autorizado para invitar personas a esta sala")
      }
  };

  return (
    

    <div className="login-container">

<div className="dropdown mb-72">
  <div tabIndex={0} role="button" className="btn m-1">
    Theme
    <svg width="12px" height="12px" className="h-2 w-2 fill-current opacity-60 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
  </div>
  <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52">
    <li><input type="radio" name="theme-dropdown" className="theme-controller btn btn-sm btn-block btn-ghost justify-start" aria-label="Default" value="default"/></li>
    <li><input type="radio" name="theme-dropdown" className="theme-controller btn btn-sm btn-block btn-ghost justify-start" aria-label="Retro" value="retro"/></li>
    <li><input type="radio" name="theme-dropdown" className="theme-controller btn btn-sm btn-block btn-ghost justify-start" aria-label="Cyberpunk" value="cyberpunk"/></li>
    <li><input type="radio" name="theme-dropdown" className="theme-controller btn btn-sm btn-block btn-ghost justify-start" aria-label="Valentine" value="valentine"/></li>
    <li><input type="radio" name="theme-dropdown" className="theme-controller btn btn-sm btn-block btn-ghost justify-start" aria-label="Aqua" value="aqua"/></li>
  </ul>
</div>

      <h2>Agregar Usuario a Sala</h2>
      <input
        type="text"
        placeholder="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <input
        type="text"
        placeholder="Correo Electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="number"
        placeholder="Rol"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <button onClick={handleAddUser}>Agregar Usuario</button>
      <p>{message}</p>
    </div>
  );
};

export default AddUserToRoom;