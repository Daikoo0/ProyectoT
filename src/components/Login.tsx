
import React, { useState } from 'react';
import './Form.css';

function Login() {
  const [Correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorreo(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  async function handleLogin() {
   
    const response = await fetch("http://localhost:3001/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
         email : Correo,
         password : password,
        }),
      });

      const data = await response.json();
      console.log(response.status, data);

      if(response.status===200){
        setMessage("Sesión iniciada")
      }
      else{
        setMessage("Usuario o contraseña incorrecta")
      }
   
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
        <p>{message}</p>
      </form>
    </div>
  );
}

export default Login;
