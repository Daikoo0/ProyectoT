import SelectTheme from "./SelectTheme";
import { useNavigate } from 'react-router-dom';

const Navbar = ({ logohidden }) => {

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await fetch('http://localhost:3001/users/logout', {
        method: 'POST', 
        credentials: 'include', // Incluye las cookies en la solicitud
      });

      navigate('/login');

    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };


  return (
    <>
      {/* NAVBAR */}
      <div className="navbar bg-base-200">
        <div className="flex-1">

          {logohidden ?
            <a className="btn btn-ghost text-xl px-4 w-80" onClick={() => navigate(`/home`)}>Proyecto T</a>
            :
            <>
              <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-primary drawer-button lg:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </label>
              <a className="btn btn-ghost text-xl lg:hidden">Proyecto T</a>
            </>}

        </div>

        <div className="flex-none">

          <div className="dropdown dropdown-end">
            <SelectTheme />
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-52 bg-base-100 shadow">
              <div className="card-body">
                <span className="font-bold text-lg">8 Items</span>
                <span className="text-info">Subtotal: $999</span>

              </div>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 11 14H9a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 10 19Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>Profile</a></li>
              <li><a>Settings</a></li>
              <li><a onClick={logout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;