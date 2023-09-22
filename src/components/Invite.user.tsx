import { useState } from 'react';

const AddUserToRoom = () => {
  //esta ruta lo que hace es invitar un usuario a la room
  //me puse en corte baneador compulsivo 💀💀 y todos estan baneados
  //la unica forma de entrar a un room es que seas parte de el y esto hace esta ruta 

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [room, setRoom] = useState('');

  async function handleAddUser() {
   
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
      console.log(data);
  };

  return (
    <div>
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
    </div>
  );
};

export default AddUserToRoom;