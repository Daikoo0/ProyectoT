import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="">
      <h1>Proyectos del usuario</h1>
        <div className="overflow-x-auto">
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
      
      <button className="btn btn-neutral" onClick={handleAddRoom}>Crear Sala</button>

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
