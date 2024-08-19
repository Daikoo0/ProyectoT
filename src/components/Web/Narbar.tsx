import SelectTheme from "./SelectTheme";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/authProvider';

const Navbar = ({ logohidden }) => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    try {
      setToken();
      navigate("/", { replace: true });
      
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
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 11 14H9a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 10 19Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a onClick={()=>{navigate(`/myProfile`)}}>Profile</a></li>
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