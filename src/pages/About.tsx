import Navbar from "../components/Web/Narbar";
import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/ApiClient";
import { useTranslation } from "react-i18next";

async function sendComment(setMessage, selectedBadges, comment) {

    if (!comment) {
        setMessage("Por favor, no comentarios vacíos.");
        return;
    }

    var Data = {
        content: comment,
        CreatedAt: new Date().toLocaleString(),
        Labels: selectedBadges,
    };

    console.log(Data)

    try {
        const response = await api.post(`/comment`, Data);
        console.log(response.status);

        if (response.status === 200) {
            window.location.href = "/";
        } else if (response.status === 500) {
            setMessage("Error al crear comentario");
        } else {
            setMessage("Error desconocido");
        }
    } catch (error) {
        console.error("Error:", error);
        setMessage("Ha ocurrido un error al procesar tu solicitud.");
    }

}

const About = () => {

    const [message, setMessage] = useState("");
    const [selectedBadges, setSelectedBadges] = useState([]);
    const [comment, setComment] = useState("");
    const { t } = useTranslation(["About"])

    const toggleBadge = (badge) => {
        if (selectedBadges.includes(badge)) {
            setSelectedBadges(selectedBadges.filter((selectedBadge) => selectedBadge !== badge));
        } else {
            setSelectedBadges([...selectedBadges, badge]);
        }
    };

    const badgeClass = (badge) => {
        return selectedBadges.includes(badge) ? 'badge badge-accent mr-1 cursor-pointer' : 'badge badge-neutral mr-1 cursor-pointer';
    };

    return (
        <div className="flex-1">
            {/* Navbar*/}
            <Navbar logohidden={true} />
            {/* Contenido dentro de la imagen */}
            <div className="hero min-h-screen bg-fixed" style={{
                backgroundImage: `url("/rainbow-vortex.svg")`,

            }}>
                <div className="hero-overlay bg-opacity-60" ></div>
                <div className="hero-content text-center text-neutral-content w-4/5">
                    <div className="max-w-2xl ">
                        <h1 className="mb-5 text-5xl font-bold">{t("create_column")}</h1>
                        <Link to="/home" className="btn btn-primary">{t("start")}</Link>
                    </div>
                </div>
            </div>

            {/* Contenido de la pagina */}


            <div className="hero bg-base-100 mt-1">
                <iframe
                    className="my-5 h-screen w-full max-w-6xl  rounded-box place-items-center"
                    src="https://docs.google.com/forms/d/e/1FAIpQLSc1kz78ROCa8zFdnG7KRy7rJcVd0gPKDgT-L0hwwko4XZP9CQ/viewform?embedded=true"
                >Cargando…
                </iframe>

            </div>

            <div className="divider"></div>

            <div className="hero bg-base-100">
                <div className="my-5 w-full max-w-6xl card bg-base-300 rounded-box place-items-center">
                    <h3 className="text-5xl font-bold pt-4">Uso</h3>
                    
                    <div className="divider w-4/5 mx-auto text-center"></div>
                    <div className="ml-8 mr-8 mx-auto text-justify">
                        {t("uso")}
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">{t("add_layers")}</h3>
                        <br></br>
                        {t("add_layers_text")}
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">{t("edit_layer")}</h3>
                        <br></br>
                        {t("edit_layer_text")}
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">{t("edit_points")}</h3>
                        <br></br>
                        {t("edit_points_text")}
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">{t("fossils")}</h3>
                        <br></br>
                        {t("fossils_text")}
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">{t("facies")}</h3>
                        <br></br>
                        {t("facies_text")}
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">{t("write_column")}</h3>
                        <br></br>
                        {t("write_column_text")}
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">{t("exportPDF")}</h3>
                        <br></br>
                        {t("exportPDF_text")}
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify mb-8">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">{t("room_and_table_settings")}</h3>
                        <br></br>
                        {t("room_and_table_settings_text")}
                    </div>
                </div>
            </div>

            <div className="divider"></div>

            <div className="hero bg-base-100">
            <div className="my-5 w-full max-w-6xl card bg-base-300 rounded-box place-items-center">
                    <div className="p-6">
                       
                        <h3 className="p-1 text-3xl font-bold">Tuviste algun problema?</h3>

                        <p className="text-2xl py-4 text-justify">
                            Este proyecto está en desarrollo, déjanos saber si encontraste algún problema o tienes alguna sugerencia. Da click en los botones para seleccionar las etiquetas que correspondan y escribe tu comentario.
                        </p>


                        <div>
                            <div className={badgeClass('Diseño')} onClick={() => toggleBadge('Diseño')}>Diseño</div>
                            <div className={badgeClass('Rendimiento')} onClick={() => toggleBadge('Rendimiento')}>Rendimiento</div>
                            <div className={badgeClass('Funcionalidad')} onClick={() => toggleBadge('Funcionalidad')}>Funcionalidad</div>
                            <div className={badgeClass('Compatibilidad')} onClick={() => toggleBadge('Compatibilidad')}>Compatibilidad</div>
                            <div className={badgeClass('Seguridad')} onClick={() => toggleBadge('Seguridad')}>Seguridad</div>
                            <div className={badgeClass('Accesibilidad')} onClick={() => toggleBadge('Accesibilidad')}>Accesibilidad</div>
                            <div className={badgeClass('Documentación')} onClick={() => toggleBadge('Documentación')}>Documentación</div>
                            <div className={badgeClass('Registro')} onClick={() => toggleBadge('Registro')}>Registro</div>
                            <div className={badgeClass('Tecnicismos')} onClick={() => toggleBadge('Tecnicismos')}>Tecnicismos</div>
                            <div className={badgeClass('Otros')} onClick={() => toggleBadge('Otros')}>Otros</div>
                        </div>

                        <div className="mt-4">
                            <textarea
                                aria-label="Comentarios"
                                placeholder=" " className="textarea textarea-primary w-full"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)} >
                            </textarea>
                            <button
                                onClick={() => sendComment(setMessage, selectedBadges, comment)}
                                className="btn btn-primary" aria-label="Enviar">Enviar</button>
                            {message}
                        </div>
                    </div>
                </div>
            </div>


        </div>

    )

}

export default About;