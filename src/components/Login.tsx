import React, { useState } from 'react';
import { useTheme } from '../Context/theme-context';
import { useNavigate } from "react-router-dom";
import './Form.css';

function Login() {
  const [Correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { setTheme, availableThemes } = useTheme();
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorreo(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  async function handleLogin() {

    const response = await fetch("http://localhost:3001/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email: Correo,
        password: password,
      }),
    });

    const data = await response.json();
    console.log(response.status, data);

    if (response.status === 200) {
      setMessage("Sesión iniciada");
      navigate('/home');
    }
    else {
      setMessage("Usuario o contraseña incorrecta")
    }

  };

  return (
    
      <div className="hero-content flex-col lg:flex-row-reverse">

        <div className="text-center">
          <h1 className="text-5xl font-bold">Inicia sesión</h1>
          <div className="form-control mt-6">
            <label className="label-text">Elige un tema:</label>
            <select className="select select-primary w-full max-w-xs" onChange={handleThemeChange}>
              {availableThemes.map(theme => (
                <option key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body">
            <div className="form-control w-4/5 max-w-xs">
              <label className="label-text">Correo:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="name@uct.cl"
                type="email"
                id="Correo"
                name="Correo"
                value={Correo}
                onChange={handleUsernameChange}
              />
            </div>
            <div className="form-control w-4/5 max-w-xs">
              <label className="label-text">Contraseña:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="••••••••"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
              />
              <a href="#"  className="link link-primary text-left">Olvidaste la contraseña?</a>
              
            </div>
            <div className="form-control mt-6">
              <button type="button" className="btn btn-primary" onClick={handleLogin}>
                Iniciar Sesión
              </button>
              <p className="mt-5 text-center text-sm">
                Not a member?{' '}
                <a href="/register" className="link link-primary font-semibold">
                  Crea una nueva
                </a>
              </p>  

            </div>
            
            <p>{message}</p>
          </form>
        </div>
      </div>
   
  );
}

export default Login;
