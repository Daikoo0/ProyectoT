import Navbar from "../components/Web/Narbar";
import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/ApiClient";

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

    const toggleBadge = (badge) => {
        if (selectedBadges.includes(badge)) {
            setSelectedBadges(selectedBadges.filter((selectedBadge) => selectedBadge !== badge));
        } else {
            setSelectedBadges([...selectedBadges, badge]);
        }
    };

    const badgeClass = (badge) => {
        return selectedBadges.includes(badge) ? 'badge badge-accent mr-1' : 'badge badge-neutral mr-1';
    };

    return (
        <div className="flex-1">
            {/* Navbar*/}
            <Navbar logohidden={true} />
            {/* Contenido dentro de la imagen */}
            <div className="hero min-h-screen bg-fixed" style={{
                backgroundImage: `url("src/assets/rainbow-vortex.svg")`,
                
            }}>
                <div className="hero-overlay bg-opacity-60" ></div>
                <div className="hero-content text-center text-neutral-content w-4/5">
                    <div className="max-w-2xl ">
                        <h1 className="mb-5 text-5xl font-bold">Crea tu propia columna estratigráfica</h1>
                        <Link to="/home" className="btn btn-primary">Comenzar</Link>
                    </div>
                </div>
            </div>

            {/* Contenido de la pagina */}

            <div className="hero bg-base-100 mt-1">
                <div className="my-5 w-full max-w-6xl card bg-base-300 rounded-box place-items-center">
                    <h3 className="p-1 text-5xl font-bold">Uso</h3>
                    <div className="divider w-4/5 mx-auto text-center"></div>
                    <div className="ml-8 mr-8 mx-auto text-justify">
                        Al registrarse e iniciar sesión, será visible a la página principal donde se encuentran los proyectos propios y los proyectos a los que se fue invitado a colaborar. Además en el menú de la izquierda existe un botón de proyectos públicos donde al clickearlo se redirigirá a un mapa donde se logran visualizar todos los proyectos a los que sus creadores designaron como públicos.
                        Cada proyecto propio en la lista tiene tres opciones a la derecha para editar el proyecto en la sala eliminar la sala, invitar un usuario (como lector o editor).
                        <br></br>
                        En la esquina superior de la página hay un botón "crear un nuevo proyecto", al presionar el botón se redirigirá a un formulario donde se debe
                        completar datos sobre el proyecto a crear, como la ubicación de la columna, el nombre de la sala de edición y una breve descripción, también está la opción de decidir
                        si la sala del proyecto será de acceso a lectura público o privado (en desarrollo).
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Añadir capas</h3>
                        <br></br>
                        Lo anterior creará una sala vacía sin capas creadas y sin usuarios invitados. En la esquina superior izquierda hay un botón
                        para agregar una capa, este abre un menú en el lado derecho de la derecha de la pantalla, dentro
                        de este menú, se puede elegir agregar la capa arriba, abajo, o en una posición específica
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Editar capa</h3>
                        <br></br>
                        Al hacer click a la capa creada, se abre el menú de la derecha que permite editar su contacto inferior, el patrón de la capa, 
                        el tamaño de la capa en cm, sus colores, el zoom del patrón, la rotación del patrón, la tensión de las líneas 
                        que forman los tamaños de grano, o simplemente eliminar la capa.
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Editar puntos</h3>
                        <br></br>
                        Al seleccionar un punto o crear uno nuevo seleccionando un borde derecho de la capa, se hace visible un menú donde se puede elegir qué tamaño de grano va a tener ese punto de la capa, también se puede eliminar ese punto.
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Añadir y editar fósiles</h3>
                        <br></br>
                        Al seleccionar la columna de fósiles, se abre un menú que permite añadir un nuevo fósil, seleccionando qué tipo de fósil, y cuáles son los límites superior e inferior en los que va a estar ese fósil (en cm). El fósil se añade en la posición donde se hizo click con el puntero. Para editar un fósil sólo se debe seleccionarlo.
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Agregar/eliminar facies y tramos de facies</h3>
                        <br></br>
                        Al seleccionar el encabezado de la columna facies, se abre el menú de la derecha para agregar una nueva facie con el nombre especificado.
                        Luego de que la facie ha sido creada, se debe seleccionar la columna generada de esa facie para agregar un nuevo tramo.
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Escribir en una columna</h3>
                        <br></br>
                        Al seleccionar una celda en una columna que no sea la de litología o la de fósiles, se abre un menú a la derecha que permite escribir texto en esa celda, además puedes escribir listas, imágenes, editar el texto, etc.
                        Si hay otro colaborador editanto la celda, se mostrará un borde de color, y al pasar el mouse por encima se podrá leer su identidad.
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Descargar un pdf (sin terminar)</h3>
                        <br></br>
                        En la esquina superior izquierda del editor hay un botón de descarga del pdf donde se podrá editar configuraciones del pdf, como el tipo de hoja o las capas que no deberían verse, antes de descargarlo
                    </div>

                    <div className="ml-8 mr-8 mx-auto text-justify mb-8">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Configuración de la sala</h3>
                        <br></br>
                        En la esquina superior derecha de la sala también hay un botón de configuración, al presionarlo verás el menú a la derecha
                        donde se puede ajustar la escala de las capas de tu columna, la posición de la regla y la visibilidad de as columnas de información.
                        Además puedes seleccionar un tema visual que sea de tu agrado.
                    </div>
                </div>
            </div>

            <div className="divider"></div>

            <div className="hero bg-base-100 mt-1">
                <div className="bg-base-300 p-4 rounded-md flex items-center mb-4">
                    {/* <div className="avatar">
                        <div className="w-64 rounded-full">
                            <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-3 5h3m-6 0h.01M12 16h3m-6 0h.01M10 3v4h4V3h-4Z" />
                            </svg>
                        </div>
                    </div> */}
                    <div className="ml-4">
                        <div className="flex items-center">
                            <h2 className="text-4xl font-bold">Ayúdanos a mejorar</h2>
                        </div>

                        <p className="text-2xl py-6">
                            Este proyecto está en desarrollo, déjanos saber si encontraste algún problema o tienes alguna sugerencia
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
                            <div className={badgeClass('Tecnicismos')} onClick={() => toggleBadge('Tecnicismos')}>Otros</div>
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
            
                        {message}
                    </div>
                </div>
            </div>


        </div>

    )

}

export default About;