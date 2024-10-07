import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/authProvider';
import api from '../../api/ApiClient';
import { useTranslation } from 'react-i18next';


const TableData = ({ Data, refresh, currentPage, totalPages }) => {

    const { t } = useTranslation("Home");
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filteredItem, setFilteredItem] = useState(null);
    const [message, setMessage] = useState('');
    const [stateRequest, setstateRequest] = useState("");
    const [error, setError] = useState(false);


    const filterById = (id) => {
        const result = Data.find(item => item.ID === id);
        setFilteredItem(result);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            refresh(newPage);
        }
    };

    return (
        <>
            <dialog id="modalDelete" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">¿Estas seguro de eliminar este proyecto?</h3>
                    <p className="py-4">Estas por eliminar el proyecto: <strong>{filteredItem?.ProjectInfo.Name}</strong></p>
                    {filteredItem?.ProjectInfo.Members.Owner === user.email ? <p>Como eres el dueño del proyecto, al eliminarlo, este se eliminara para todos los usuarios</p> : <p>Si eliminas este proyecto, ya no podras acceder a el</p>}

                    <div className="modal-action">
                        {/* p en la posicion de la izquierda */}
                        <p> {message}</p>
                        <form onSubmit={async (event) => {
                            event.preventDefault();
                            try {
                                setstateRequest("loading");
                                const response = await api.delete(`/users/projects/${filteredItem.ID}`);

                                if (response.status === 200) {
                                    setError(true);
                                    setstateRequest("success");
                                    setMessage("Proyecto eliminado con éxito");

                                    setTimeout(() => {
                                        (document.getElementById('modalDelete') as HTMLDialogElement).close();
                                        setError(false);
                                        setstateRequest("");
                                        refresh();

                                    }, 1000);

                                } else if (response.status === 400) {
                                    setstateRequest("error");
                                    setMessage("Sala no existe")

                                } else if (response.status === 403) {
                                    setstateRequest("error");
                                    setMessage("No estás autorizado para eliminar esta sala")
                                }

                            } catch (error) {
                                console.error(error);
                                setMessage("Error al eliminar el proyecto. Por favor, inténtelo de nuevo.");
                                setstateRequest("error");
                            }

                        }}>
                            <button className={error ? "btn btn-success" : "btn btn-error"} disabled={stateRequest === "loading"} type="submit">
                                {stateRequest == "loading" ? <span className="loading loading-ring"></span> : null}
                                {stateRequest == "error" ? <svg width="30px" height="30px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><path fillRule="evenodd" clipRule="evenodd" d="M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6zM7.9 7.5L10.3 5l.7.7-2.4 2.5 2.4 2.5-.7.7-2.4-2.5-2.4 2.5-.7-.7 2.4-2.5-2.4-2.5.7-.7 2.4 2.5z" /></svg> : null}
                                {stateRequest == "success" ? <svg fill="#000000" width="30px" height="30px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 Z M12,4 C7.581722,4 4,7.581722 4,12 C4,16.418278 7.581722,20 12,20 C16.418278,20 20,16.418278 20,12 C20,7.581722 16.418278,4 12,4 Z M15.2928932,8.29289322 L10,13.5857864 L8.70710678,12.2928932 C8.31658249,11.9023689 7.68341751,11.9023689 7.29289322,12.2928932 C6.90236893,12.6834175 6.90236893,13.3165825 7.29289322,13.7071068 L9.29289322,15.7071068 C9.68341751,16.0976311 10.3165825,16.0976311 10.7071068,15.7071068 L16.7071068,9.70710678 C17.0976311,9.31658249 17.0976311,8.68341751 16.7071068,8.29289322 C16.3165825,7.90236893 15.6834175,7.90236893 15.2928932,8.29289322 Z" /></svg> : null}

                                Eliminar
                            </button>
                        </form>
                        <form method="dialog">
                            <button className="btn" formMethod='dialog' onClick={() => setstateRequest("")}>Cancelar</button>
                        </form>

                    </div>
                </div>
            </dialog>

            {/* Tabla de  */}

            <div style={{ display: 'flex' }}>{t("p_user", { user: user.name })}</div>

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
                        <th >{t("t_project")}</th>
                        <th >{t("loc_project")}</th>
                        <th >{t("u_change")}</th>
                        <th >{t("description")}</th>
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
                                            <div className="font-bold">{data.ProjectInfo.Name}</div>
                                            <div className="text-sm opacity-50">{data.ProjectInfo.Owner}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {data.ProjectInfo.Location}
                                    <br />
                                    <span className="badge badge-ghost badge-sm">{data.ProjectInfo.Lat}, {data.ProjectInfo.Long}</span>
                                </td>
                                <td>{data.ProjectInfo.CreationDate}</td>
                                <td>{data.ProjectInfo.Description}</td>
                                <th>
                                    <button className="btn btn-ghost btn-xs" onClick={() => { navigate(`/editor/${data.ID}`) }}><p >{t("edit_project")}</p></button>
                                    {/* <button data-section="Home" data-value="invite_project" className="btn btn-ghost btn-xs" onClick={()=>{filterById(data.ID);(document.getElementById('modalInvite') as HTMLDialogElement).showModal();}}>Invitar</button> */}
                                    <button className="btn btn-ghost btn-xs" onClick={() => { filterById(data.ID); (document.getElementById('modalDelete') as HTMLDialogElement).showModal(); }}><p >{t("delete_project")}</p></button>
                                </th>
                            </tr>
                        ))}
                </tbody>
                {/* foot */}
                <tfoot>
                    <tr>
                        <th></th>
                        <th >{t("t_project")}</th>
                        <th >{t("loc_project")}</th>
                        <th >{t("u_change")}</th>
                        <th >{t("description")}</th>
                        <th>
                            <div className="join">
                                <button className="join-item btn" onClick={() => handlePageChange(currentPage - 1)}>«</button>
                                <button className="join-item btn">{currentPage} of {totalPages}</button>
                                <button className="join-item btn" onClick={() => handlePageChange(currentPage + 1)}>»</button>
                            </div>
                        </th>
                    </tr>
                </tfoot>
            </table >

        </>

    );
};

export default TableData;