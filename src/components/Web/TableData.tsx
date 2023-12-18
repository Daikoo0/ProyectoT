import { useNavigate } from 'react-router-dom';


const TableData = ({ Data }) => {

    const navigate = useNavigate();

    return (
        <>
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
                                    <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/invite/${data.ID}`)}>Co-Autores</button>
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