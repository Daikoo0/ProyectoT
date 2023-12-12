import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../Context/theme-context';


const Home = () => {

  const { setTheme, availableThemes } = useTheme();
  const [proyectos, setProyectos] = useState([]);
  const navigate = useNavigate();

  async function fetchData() {
    try {
      const response = await fetch("http://localhost:3001/users/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      });

      const result = await response.json();
      console.log('Datos recibidos:', result);

      if (result.Proyects && Array.isArray(result.Proyects)) {
        setProyectos(result.Proyects);
      } else {
        throw new Error("No se encontraron proyectos o los datos no están en el formato esperado.");
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);

    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (sala) => {
    navigate(`/editor/${sala}`);
  };

  const handleAddRoom = () => {
    navigate(`/create`);
  };

  const handleInvite = (sala) => {
    navigate(`/invite/${sala}`);
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  return (


    <div>
      {/* NAVBAR */}
      <div className="navbar bg-base-100 rounded-box">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Proyecto T</a>
        </div>

        <div className="flex-none">

          <div className="dropdown dropdown-end">
            <select className="select select-primary w-full max-w-xs" onChange={handleThemeChange}>
              {availableThemes.map(theme => (
                <option key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              ))}
            </select>
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
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 11 14H9a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 10 19Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>Profile</a></li>
              <li><a>Settings</a></li>
              <li><a>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>


      <div className='flex'>
        {/* SIDEBAR */}
        <div className="hidden md:block max-h-full p-4">
          <ul className="menu bg-base-200 w-56 h-full rounded-box">
          <button className="btn btn-neutral" onClick={handleAddRoom}>Crear Sala</button>
        
            <li className="menu-title">Proyecto</li>
            <li><a>All Projects </a></li>
            <li><a>Your Projects</a></li>
            <li><a>Shared with you</a></li>
            <li className="menu-title">Organización</li>
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
            <li><a>Item 3</a></li>
          </ul>
        </div>

        <main className="flex-1 p-4">
          {/* PROYECTOS */}
          <div className="overflow-x-auto bg-base-200 rounded-box p-4 h-full">
          <h1>Proyectos del usuario</h1>
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <th>Titulo Proyecto</th>
                  <th>Localizacion</th>
                  <th>Ultimo Cambio</th>
                  <th>Descripcion</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* rows */}
                {proyectos.map((data) => (
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold">{data}</div>
                          <div className="text-sm opacity-50">data.Propietario</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      Chile, Temuco
                      <br />
                      <span className="badge badge-ghost badge-sm">52.4801256, 62.1858301</span>
                    </td>
                    <td>23/04/2023</td>
                    <td>No se que poner</td>
                    <th>
                      <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(data)}>Editar</button>
                      <button className="btn btn-ghost btn-xs" onClick={() => handleInvite(data)}>Co-Autores</button>
                      <button className="btn btn-ghost btn-xs">Eliminar</button>
                    </th>
                  </tr>
                ))}
              </tbody>
              {/* foot */}
              <tfoot>
                <tr>
                  <th></th>
                  <th>Titulo Proyecto</th>
                  <th>Localizacion</th>
                  <th>Ultimo Cambio</th>
                  <th>Descripcion</th>
                  <th></th>
                </tr>
              </tfoot>

            </table>
          
          </div>

          </main>


      </div>






    </div>



  );



  // const dashboardData = {
  //   totalClients: 6389,
  //   accountBalance: 46760.89,
  //   newSales: 376,
  //   pendingContacts: 35,
  //   recentTransactions: [
  //     { client: 'Hans Burger', amount: 863.45, status: 'Approved', date: '6/10/2020' },
  //     { client: 'Jolina Angelie', amount: 369.95, status: 'Pending', date: '6/10/2020' },
  //     // ...más transacciones
  //   ],
  // };

  // return (
  //   <div className="bg-gray-100 min-h-screen p-10">
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  //       {/* Tarjetas de estadísticas */}
  //       <div className="bg-white p-5 rounded shadow">
  //         <div className="text-gray-500">Total Clients</div>
  //         <div className="text-3xl font-bold">{dashboardData.totalClients}</div>
  //       </div>
  //       {/* Repetir para las demás estadísticas */}
  //     </div>

  //     {/* Tabla de transacciones recientes */}
  //     <div className="mt-8">
  //       <div className="bg-white p-5 rounded shadow">
  //         <div className="font-bold text-lg mb-4">Proyectos del usuario</div>
  //         <table className="min-w-full">
  //           <thead>
  //             <tr>
  //               <th className="border-b-2 border-gray-300 p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
  //                 Client
  //               </th>
  //               <th className="border-b-2 border-gray-300 p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
  //                 Amount
  //               </th>
  //               <th className="border-b-2 border-gray-300 p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
  //                 Status
  //               </th>
  //               <th className="border-b-2 border-gray-300 p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
  //                 Date
  //               </th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {dashboardData.recentTransactions.map((transaction, index) => (
  //               <tr key={index}>
  //                 <td className="border-b border-gray-300 p-4 text-sm text-gray-700">
  //                   {transaction.client}
  //                 </td>
  //                 <td className="border-b border-gray-300 p-4 text-sm text-gray-700">
  //                   ${transaction.amount.toFixed(2)}
  //                 </td>
  //                 <td className={`border-b border-gray-300 p-4 text-sm font-semibold ${transaction.status === 'Approved' ? 'text-green-600' : 'text-orange-500'}`}>
  //                   {transaction.status}
  //                 </td>
  //                 <td className="border-b border-gray-300 p-4 text-sm text-gray-700">
  //                   {transaction.date}
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   </div>
  // );
};


export default Home;
