
import React, { useState } from 'react';
import './Login.css';

function Register() {
  const [Correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorreo(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  async function handleLogin() {
   
    const response = await fetch("http://localhost:3001/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
     //  email: "hex@mail.com",
         email : Correo,
         name : username,
         password : password,
     //  password: "12345678",
        }),
      });

      const data = await response.json();
      console.log(data);
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form>
        <div className="form-group">
          <label htmlFor="Correo">Correo:</label>
          <input
            type="email"
            id="Correo"
            name="Correo"
            value={Correo}
            onChange={handleUsernameChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Nombre de usuario:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={username}
            onChange={handleUserNameChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="button" onClick={handleLogin}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

export default Register;
