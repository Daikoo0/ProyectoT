import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Web/Narbar';

const Home = () => {

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

      setProyectos(result.projects);

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

  return (


    <div>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content justify-center">

          <Navbar logohidden={false} />

          {/* Contenido */}
          <main className="flex-1 p-4">
            {/* PROYECTOS */}
            <div className="overflow-x-auto bg-base-200 rounded-box p-4 h-full">
              <h1>Proyectos del usuario</h1>

              <button className="btn btn-neutral lg:hidden" onClick={handleAddRoom}>Crear Sala</button>
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>
                      <label>
                        {proyectos===null? null : <input type="checkbox" className="checkbox" />}
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
                  {proyectos === null ?
                    <tr>
                      <td>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-bold">No Projects</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    : proyectos.map((data, index) => (
                      <tr key={index}>
                        <th>
                          <label>
                            <input type="checkbox" className="checkbox" />
                          </label>
                        </th>
                        <td>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-bold">{data.Name}</div>
                              <div className="text-sm opacity-50">{data.Owner}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {data.Location}
                          <br />
                          <span className="badge badge-ghost badge-sm">{data.Lat}, {data.Long}</span>
                        </td>
                        <td>{data.CreationDate}</td>
                        <td>{data.Description}</td>
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
        <div className="drawer-side">

          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>

          <ul className="menu px-4 w-80 min-h-full bg-base-200 text-base-content">

            {/* Sidebar content here */}


            <li className='pb-6 hidden lg:block'><a className="btn btn-ghost text-xl">Proyecto T</a></li>

            <button className="btn btn-neutral hidden lg:block" onClick={handleAddRoom}>Crear Sala</button>

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
      </div>



      <div className='flex'>
        {/* SIDEBAR */}
        {/* <div className="hidden md:block max-h-full p-4">
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
        </div> */}




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
