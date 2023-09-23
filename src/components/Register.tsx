
import React, { useState } from 'react';
import './Form.css';

function Register() {
  const [Correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');
  const [message, setMessage] = useState('');

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
          email : Correo,
          name : username,
          password : password,
        }),
      });

      const data = await response.json();

      if(response.status===201){
        setMessage("Usuario creado")
      }else
      if(response.status===409){
        setMessage("Este usuario ya existe")
      }else
      if(response.status===400  && data.message==="Key: 'RegisterUser.Email' Error:Field validation for 'Email' failed on the 'email' tag"){
        setMessage("Email inválido")
      }else
      if(response.status===400  && data.message==="Key: 'RegisterUser.Password' Error:Field validation for 'Password' failed on the 'min' tag"){
        setMessage("Contraseña muy corta")
      }else 
      if(response.status===400){
        setMessage("Email y contraseña incorrectos")
      }
      console.log(response.status, data)
  };

  return (
    <div className="login-container">
      <h2>Registrarse</h2>
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
          Crear mi usuario
        </button>
        <p>{message}</p>
      </form>
    </div>
  );
}

export default Register;
