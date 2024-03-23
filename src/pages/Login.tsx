import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../provider/authProvider';
import SelectTheme from '../components/Web/SelectTheme';
import api from '../api/ApiClient';

function Login() {
  const { setToken } = useAuth();
  const [Correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorreo(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

async function handleLogin() {
  try {
    const response = await api.post("/users/login", {
      email: Correo,
      password: password,
    });
 
    setToken(response.data.token);
   
    if (response.status === 200) {
      setMessage("Sesión iniciada");
      navigate('/home', { replace: true });
    }
    else {
      setMessage("Usuario o contraseña incorrecta");
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    setMessage("Error al iniciar sesión. Por favor, inténtelo de nuevo.");
  }
}


  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">

        <div className="text-center">
          <h1 className="text-5xl font-bold">Inicia sesión</h1>
          <div className="form-control mt-6">
            <label className="label-text">Elige un tema:</label>
            <SelectTheme/>
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
    </div>
  );
}

export default Login;
