import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../provider/authProvider';
import SelectTheme from '../components/Web/SelectTheme';
import api from '../api/ApiClient';
import { useTranslation } from 'react-i18next';

function Login() {
  const { setToken } = useAuth();
  const [Correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation("Login");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorreo(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await api.post("/users/login", {
        email: Correo,
        password: password,
      });

      setToken(response.data.token);

      if (response.status === 200) {
        navigate('/home', { replace: true });
      }

    } catch (error) {
      console.error("Error en la solicitud:", error);

      switch (error.response.status) {
        case 401:
          setErrorMessage("Usuario o contraseña incorrecta");
          break;
        case 500:
          setErrorMessage("Error en el servidor");
          break;
        default:
          setErrorMessage("Error en la solicitud");
      }
    }
  }


  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">

        <div className="text-center">
          <h1 className="text-5xl font-bold">{t("iniciar")}</h1>
          <div className="form-control mt-6">
            <label className="label-text">{t("theme")}</label>
            <SelectTheme />
          </div>
        </div>

        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleLogin}>

            {/* Mensaje de error */}
            {errorMessage &&
              <div className="form-control max-w-sm">
                <p className="text-center text-red-500">{errorMessage}</p>
              </div>
            }

            <div className="form-control max-w-sm">
              <label className="label-text">{t("mail")}</label>
              <input
                className="input input-bordered w-full"
                placeholder="name@uct.cl"
                type="email"
                id="Correo"
                name="Correo"
                value={Correo}
                required
                onChange={handleUsernameChange}
              />
            </div>

            <div className="form-control max-w-sm">
              <label className="label-text">{t("pw")}</label>
              <input
                className="input input-bordered w-full"
                placeholder="••••••••"
                type="password"
                id="password"
                name="password"
                value={password}
                required
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit">
                {t("iniciar")}
              </button>
              <p className="mt-5 text-center text-sm">
                {t("member")} {' '}
                <a className="link link-primary font-semibold" onClick={() => navigate("/register")}>
                  {t("c_account")}
                </a>
              </p>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
