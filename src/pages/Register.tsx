import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import SelectTheme from '../components/Web/SelectTheme';
import api from '../api/ApiClient';

function Register() {

  const [errorMessage, setErrorMessage] = useState('');

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
        setErrorMessage("Usuario creado")
        navigate('/login');
      }
    } catch (error) {
      
      switch (error.response.status) {
        case 400:

          switch (error.response.data.message) {
            case "Email already exists":
              setErrorMessage("El correo ya existe");
              break;
            case "Password must be at least 8 characters long":
              setErrorMessage("La contraseña debe tener al menos 8 caracteres");
              break;
            case "Password does not match":
              setErrorMessage("Las contraseñas no coinciden");
              break;
            default:
              setErrorMessage("Error en la solicitud");
              break;
          }
          break;

        case 500:
          setErrorMessage("Error en el servidor");
          break;
        default:
          console.log("a")
          setErrorMessage("Error en la solicitud");
          break;
      }
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

            {errorMessage &&
              <div className="form-control max-w-sm">
                <p className="text-center text-red-500">{errorMessage}</p>
              </div>
            }

            <div className="form-control max-w-sm">
              <label className="label-text">Nombres:</label>
              <input
                className="input input-bordered w-full"
                placeholder="Enter your name"
                name="name"
                value={registerForm.name}
                required
                onChange={handleRegister}
              />
            </div>

            <div className="form-control max-w-sm">
              <label className="label-text">Apellidos:</label>
              <input
                className="input input-bordered w-full"
                placeholder="Enter your lastname"
                name="lastname"
                value={registerForm.lastname}
                required
                onChange={handleRegister}
              />
            </div>

            <div className="form-control max-w-sm">
              <label className="label-text">Correo Electronico:</label>
              <input
                className="input input-bordered w-full"
                placeholder="name@uct.cl"
                type="email"
                name="email"
                value={registerForm.email}
                required
                onChange={handleRegister}
              />
            </div>

            <div className="form-control max-w-sm">
              <label className="label-text">Contraseña:</label>

              <input
                className="input input-bordered w-full"
                placeholder="••••••••"
                type="password"
                name="password"
                value={registerForm.password}
                required
                onChange={handleRegister}
              />
              <input
                className="input input-bordered w-full"
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
