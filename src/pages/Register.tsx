import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import SelectTheme from '../components/Web/SelectTheme';
import api from '../api/ApiClient';

function Register() {

  const [message, setMessage] = useState('');

  const [registerForm, setRegisterForm] = useState({ name: '', lastname: '', email: '', password: '', passwordConfirm: '' });

  const navigate = useNavigate();


  const handleRegister = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prevState => ({
      ...prevState,
      [name]: value,
    }));

  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post('/users/register', registerForm);

      if (response.status === 201) {
        setMessage("Usuario creado")
        navigate('/login');
      } else
        if (response.status === 409) {
          setMessage("Este usuario ya existe")
        } else
          if (response.status === 400 && response.data.message === "Key: 'RegisterUser.Email' Error:Field validation for 'Email' failed on the 'email' tag") {
            setMessage("Email inválido")
          } else
            if (response.status === 400 && response.data.message === "Key: 'RegisterUser.Password' Error:Field validation for 'Password' failed on the 'min' tag") {
              setMessage("Contraseña muy corta")
            } else
              if (response.status === 400) {
                setMessage("Email y contraseña incorrectos")
              }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessage("Error al registrar usuario. Por favor, inténtelo de nuevo.");
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Registrate</h1>
          <div className="form-control mt-6">
            <label className="label-text">Elige un tema:</label>
            <SelectTheme />
          </div>
        </div>

        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleLogin} >

            <div className="form-control w-4/5 max-w-xs">
              <label className="label-text">Nombres:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="Enter your name"
                name="name"
                value={registerForm.name}
                required
                onChange={handleRegister}
              />
            </div>

            <div className="form-control w-4/5 max-w-xs">
              <label className="label-text">Apellidos:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="Enter your lastname"
                name="lastname"
                value={registerForm.lastname}
                required
                onChange={handleRegister}
              />
            </div>

            <div className="form-control w-4/5 max-w-xs">
              <label className="label-text">Correo Electronico:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="name@uct.cl"
                type="email"
                name="email"
                value={registerForm.email}
                required
                onChange={handleRegister}
              />
            </div>

            <div className="form-control w-4/5 max-w-xs">
              <label className="label-text">Contraseña:</label>

              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="••••••••"
                type="password"
                name="password"
                value={registerForm.password}
                required
                onChange={handleRegister}
              />
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="Confirmar contraseña"
                type="password"
                name="passwordConfirm"
                value={registerForm.passwordConfirm}
                required
                onChange={handleRegister}
              />

            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">
                Crear mi usuario
              </button>
            </div>
            <p className="mt-5 text-center text-sm">
              Ya estas registrado?{' '}
              <a className="link link-primary font-semibold" onClick={() => navigate("/login")}>
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
