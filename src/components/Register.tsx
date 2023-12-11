
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../Context/theme-context';
//import './Form.css';

function Register() {
  const [Correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const { setTheme, availableThemes } = useTheme();
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorreo(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  async function handleLogin() {

    const response = await fetch("http://localhost:3001/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email: Correo,
        name: username,
        password: password,
        passwordConfirm: passwordConfirm,
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      setMessage("Usuario creado")
      navigate('/');
    } else
      if (response.status === 409) {
        setMessage("Este usuario ya existe")
      } else
        if (response.status === 400 && data.message === "Key: 'RegisterUser.Email' Error:Field validation for 'Email' failed on the 'email' tag") {
          setMessage("Email inválido")
        } else
          if (response.status === 400 && data.message === "Key: 'RegisterUser.Password' Error:Field validation for 'Password' failed on the 'min' tag") {
            setMessage("Contraseña muy corta")
          } else
            if (response.status === 400) {
              setMessage("Email y contraseña incorrectos")
            }
    console.log(response.status, data)
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Registrate</h1>
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
              <label className="label-text">Nombre de usuario:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="username"
                id="username"
                name="username"
                value={username}
                onChange={handleUserNameChange}
              />
            </div>

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
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="Confirmar contraseña"
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={password}
                onChange={handlePasswordConfirmChange}
              />

            </div>
            <div className="form-control mt-6">
              <button type="button" className="btn btn-primary" onClick={handleLogin}>
                Crear mi usuario
              </button>
            </div>
            <p className="mt-5 text-center text-sm">
              Ya estas registrado?{' '}
              <a href="/" className="link link-primary font-semibold">
                Inicia sesión
              </a>
            </p>
            <p>{message}</p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
