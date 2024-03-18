import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const TableData = ({ Data }) => {

    const navigate = useNavigate();
    const [selectproject, setSelectProject] = useState(null);
    const [filteredItem, setFilteredItem] = useState(null);
    const [message, setMessage] = useState('');
    const [usuarios, setUsuarios] = useState([{ email: '', rol: '' }]);

    // Manejar cambios en los campos de correo y rol
    const handleCorreoChange = (index, value) => {
        const nuevosUsuarios = [...usuarios];
        nuevosUsuarios[index].email = value;
        setUsuarios(nuevosUsuarios);
    };

    const filterById = (id) => {
        const result = Data.find(item => item.ID === id);
        setFilteredItem(result);
        setSelectProject(id)
    };

    const handleRolChange = (index, value) => {
        const nuevosUsuarios = [...usuarios];
        nuevosUsuarios[index].rol = value;
        setUsuarios(nuevosUsuarios);
    };

    // Agregar nuevo usuario
    const agregarUsuario = () => {
        setUsuarios([...usuarios, { email: '', rol: '' }]);
    };

    const eliminarUsuario = (index) => {
        const nuevosUsuarios = [...usuarios];
        nuevosUsuarios.splice(index, 1);
        setUsuarios(nuevosUsuarios);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(selectproject)
        console.log(usuarios)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${selectproject}/invite`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({usuarios}),
        });

        const data = await response.json();
        console.log(response.status, data);

        if (response.status === 200) {
            setMessage("Usuario agregado con éxito")
        } else
            if (response.status === 400) {
                setMessage("Sala no existe")
            } else
                if (response.status === 403) {
                    setMessage("No estás autorizado para invitar personas a esta sala")
                }
    };

    return (
        <>
            {/* Modal para agregar usuarios */}
            <dialog id="my_modal_2" className="modal">
                <div className="modal-box w-9/12 max-w-2xl ">


                    <h1>Invita a mas usuarios</h1>

                    {filteredItem && (
                        <div className='my-2'>
                            <p>Owner: {filteredItem.Members[0]}</p>
                            {filteredItem.Members[1].length > 0 && (
                                <p>Editor: {filteredItem.Members[1].join(', ')}</p>
                            )}

                            {filteredItem.Members[2].length > 0 && (
                                <p>Lector: {filteredItem.Members[2].join(', ')} </p>
                            )}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>
                        {usuarios.map((usuario, index) => (
                            <div key={index}>
                                <div className="flex place-items-center">
                                    <div className="form-control w-full max-w-xs mr-2">
                                        {index > 0 ? null : <label className="label-text">Correo del usuario:</label>}
                                        <input
                                            className="input input-bordered w-full max-w-xs"
                                            placeholder="Ingrese el correo del usuario"
                                            type="email"
                                            value={usuario.email}
                                            required
                                            onChange={(e) => handleCorreoChange(index, e.target.value)}
                                        />
                                    </div>

                                    <div className="form-control w-full max-w-xs">
                                        {index > 0 ? null : <label className="label-text">Rol del usuario:</label>}
                                        <select
                                            className='select select-bordered w-full max-w-xs'
                                            value={usuario.rol}
                                            onChange={(e) => handleRolChange(index, e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccione un rol</option>
                                            <option value="1">Editor</option>
                                            <option value="2">Lector</option>
                                        </select>
                                    </div>

                                    {usuarios.length > 1 && (
                                        <button className="btn btn-circle btn-outline btn-error btn-sm" onClick={() => eliminarUsuario(index)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 " fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="mt-6">
                            <button className="btn btn-sm" type="button" onClick={agregarUsuario}>
                                Agregar Usuario
                            </button>
                            <button className="btn btn-sm" type="submit">Invitar Usuarios</button>
                        </div>
                    </form>
                    <p>{message}</p>
                </div>
                <form method="dialog" className="modal-backdrop" onClick={() => setUsuarios([{ email: '', rol: '' }])}>
                    <button>close</button>
                </form>
            </dialog>

            {/* Tabla de  */}

            <h1>Proyectos del usuario</h1>

            <button className="btn btn-neutral lg:hidden" onClick={() => navigate('/create')}>Crear Sala</button>
            <table className="table">
                {/* head */}
                <thead>
                    <tr>
                        <th>
                            <label>
                                {Data === null ? null : <input type="checkbox" className="checkbox" />}
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
                    {Data === null ?
                        <tr>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="font-bold">No Projects</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        : Data.map((data, index) => (
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
                                    <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/editor/${data.ID}`)}>Editar</button>
                                    <button className="btn btn-ghost btn-xs" onClick={() => { filterById(data.ID); (document.getElementById('my_modal_2') as HTMLDialogElement).showModal(); }}>Invite</button>
                                    {/* <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/invite/${data.ID}`)}>Co-Autores</button> */}
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

        </>

    );
};

export default TableData;