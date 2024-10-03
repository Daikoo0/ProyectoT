import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
    config: () => void;
    openModal: () => void;
    setSideBarState: (state: { sideBar: boolean; sideBarMode: string }) => void;
    setFormData: (data: any) => void;
    socket: WebSocket;
    t: (key: string) => string;
    infoProject: { [key: string]: any } | null;
    initialFormData: any;
    tokenLink: ({ editor: string; reader: string });
    setTokenLink: (state: { editor: string; reader: string }) => void;
}

interface InviteModalProps {
    tokenLink: ({ editor: string; reader: string });
    setTokenLink: (state: { editor: string; reader: string }) => void;
    socket: WebSocket;

}

const Navbar: React.FC<NavbarProps> = ({
    config,
    openModal,
    setSideBarState,
    setFormData,
    socket,
    t,
    infoProject,
    initialFormData,
    tokenLink,
    setTokenLink
}) => {


    return (
        <div className="navbar bg-base-200 fixed top-0 z-[100]">
            <div className="flex justify-between w-full">
                {/* Contenedor para los elementos alineados a la izquierda */}
                <div className="flex-none flex">
                    <Link to="/home" className="tooltip tooltip-bottom pl-5" data-tip={t("return")}>
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle ">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                                <path fill="currentColor" strokeLinejoin="round" strokeLinecap="round" d="M11.336 2.253a1 1 0 0 1 1.328 0l9 8a1 1 0 0 1-1.328 1.494L20 11.45V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7.55l-.336.297a1 1 0 0 1-1.328-1.494l9-8zM6 9.67V19h3v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5h3V9.671l-6-5.333-6 5.333zM13 19v-4h-2v4h2z" />
                            </svg>
                        </div>
                    </Link>

                    <div className="tooltip tooltip-bottom" onClick={config} data-tip={t("config")}>
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25" />
                            </svg>
                        </div>
                    </div>

                    <div className="tooltip tooltip-bottom" onClick={openModal} data-tip={t("export")}>
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 17v-5h1.5a1.5 1.5 0 1 1 0 3H5m12 2v-5h2m-2 3h2M5 10V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1v6M5 19v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1M10 3v4a1 1 0 0 1-1 1H5m6 4v5h1.375A1.627 1.627 0 0 0 14 15.375v-1.75A1.627 1.627 0 0 0 12.375 12H11Z" />
                            </svg>
                        </div>
                    </div>

                    <div className="tooltip tooltip-bottom" onClick={() => (setSideBarState({ sideBar: true, sideBarMode: "añadirCapa" }), setFormData(initialFormData))} data-tip={t("add")}>
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                            </svg>
                        </div>
                    </div>

                    <div className="tooltip tooltip-bottom" onClick={() => socket.send(JSON.stringify({ action: 'undo' }))} data-tip={t("undo")}>
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4" />
                            </svg>
                        </div>
                    </div>

                    <div className="tooltip tooltip-bottom" onClick={() => socket.send(JSON.stringify({ action: 'redo' }))} data-tip={t("redo")}>
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9H8a5 5 0 0 0 0 10h9m4-10-4-4m4 4-4 4" />
                            </svg>
                        </div>
                    </div>

                    <div className="text-3xl my-2 ml-4">
                        {infoProject ? infoProject['Name'] : ' '}
                    </div>
                </div>

                {/* Contenedor para los elementos alineados a la derecha */}
                <div className="flex items-center space-x-4">
                    <InviteModal
                        tokenLink={tokenLink}
                        setTokenLink={setTokenLink}
                        socket={socket}
                    />
                </div>
            </div>

        </div>
    );
};

const InviteModal: React.FC<InviteModalProps> = ({ tokenLink, setTokenLink, socket }) => {

    const delTokenLinks = () => {
        socket.send(JSON.stringify({ action: 'tokenLink' }));
        setTokenLink({ editor: '', reader: '' });

    };

    const generateTokenLinks = () => {
        socket.send(JSON.stringify({ action: 'generateTokenLink' }));
    }


    return (
        <>
            <button className="btn" onClick={() => (document.getElementById('modal_share') as HTMLDialogElement).showModal()}>Share</button>

            <dialog id="modal_share" className="modal">
                <div className="modal-box border border-accent">

                    <h2 className="text-2xl font-bold mb-4">Invitar Usuarios</h2>
                    <div className="flex justify-between mb-4 space-x-2">
                        <button onClick={generateTokenLinks} className="btn btn-primary flex-1">Generar Enlaces de Invitación</button>
                        <button onClick={delTokenLinks} className="btn flex-1 bg-error">Invalidar Enlaces de Invitación</button>
                    </div>

                    {tokenLink.editor && (
                        <>
                            <p className="mb-4">Utiliza los siguientes enlaces para invitar a otros usuarios. Haz clic en "Copy" para copiar el enlace al portapapeles.</p>
                            <div className="mb-4">
                                <p className="font-bold mb-2">Enlace de Editor:</p>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={`${window.location.origin}/invite?token=${tokenLink.editor}`}
                                        readOnly
                                        className="input input-bordered w-full max-w-xs mr-2"
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/invite?token=${tokenLink.editor}`)}
                                        className="btn btn-secondary"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    {tokenLink.reader && (
                        <div className="mb-4">
                            <p className="font-bold mb-2">Enlace de Lector:</p>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={`${window.location.origin}/invite?token=${tokenLink.reader}`}
                                    readOnly
                                    className="input input-bordered w-full max-w-xs mr-2"
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/invite?token=${tokenLink.reader}`)}
                                    className="btn btn-secondary"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
};


export default Navbar;