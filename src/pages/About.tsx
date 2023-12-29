import Navbar from "../components/Web/Narbar";
import { useNavigate } from "react-router-dom";

const About = () => {

    const navigate = useNavigate();

    return (


        <div className="flex-1">
            {/* Navbar*/}
            <Navbar logohidden={true} />

            {/* Contenido dentro de la imagen */}
            <div className="hero min-h-screen bg-fixed" style={{ backgroundImage: 'url(https://wallpapercosmos.com/w/full/6/6/8/1194912-2500x1668-desktop-hd-geology-wallpaper-image.jpg)' }}>
                <div className="hero-overlay bg-opacity-60" ></div>
                <div className="hero-content text-center text-neutral-content w-4/5">
                    <div className="max-w-2xl ">
                        <h1 className="mb-5 text-5xl font-bold">Crea tu propia columna estratigráfica</h1>
                        <p className="mb-5">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/home')}>Get Started</button>
                    </div>
                </div>
            </div>

            {/* Contenido de la pagina */}

            <div className="hero bg-base-100 mt-1">
                <div className="my-5 w-full max-w-6xl card bg-base-300 rounded-box place-items-center">
                    <h3 className="p-4 text-5xl font-bold">Uso</h3>
                    <div className="divider w-4/5 mx-auto text-center"></div>
                    <p className="w-4/5 mb-4 mx-auto text-justify">
                        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.
                    </p>

                </div>
            </div>


            <div className="divider"></div>



            {/* Primer bloque */}
            <div className="hero  bg-base-100 mt-1">
                <div className="bg-base-300 p-4 rounded-md flex items-center mb-4">
                    <div className="avatar">
                        <div className="w-64 rounded-full">
                            <img src={`http://localhost:3000/src/assets/about/danipelao.jpg`} />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h1 className="text-5xl font-bold">Participante 1</h1>
                        <h2 className="text-xl">Rol</h2>
                        <p className="py-6">
                            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
                            excepturi exercitationem quasi. In deleniti eaque aut
                        </p>
                        <button className="btn btn-primary">Contáctame</button>
                    </div>
                </div>
            </div>

            {/* Segundo bloque */}
            <div className="hero bg-base-100 mt-1">
                <div className="bg-base-300 p-4 rounded-md flex items-center mb-4">
                    <div className="avatar">
                        <div className="w-64 rounded-full">
                            <img src="http://localhost:3000/src/assets/about/gatorico.jpg" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h1 className="text-5xl font-bold">Participante 2</h1>
                        <h2 className="text-xl">Rol</h2>
                        <p className="py-6">
                            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
                            excepturi exercitationem quasi. In deleniti eaque aut
                        </p>
                        <button className="btn btn-primary">Contáctame</button>
                    </div>
                </div>
            </div>

            {/* Tercer bloque */}
            <div className="hero bg-base-100 mt-1">
                <div className="bg-base-300 p-4 rounded-md flex items-center mb-4">
                    <div className="avatar">
                        <div className="w-64 rounded-full">
                            <img src="http://localhost:3000/src/assets/about/TaMasRica.jpg" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h1 className="text-5xl font-bold">Participante 3</h1>
                        <h2 className="text-xl">Rol</h2>
                        <p className="py-6">
                            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
                            excepturi exercitationem quasi. In deleniti eaque aut
                        </p>
                        <button className="btn btn-primary">Contáctame</button>
                    </div>
                </div>
            </div>

            {/* Cuarto Bloque */}
            <div className="hero bg-base-100 mt-1">
                <div className="bg-base-300 p-4 rounded-md flex items-center mb-4">
                    <div className="avatar">
                        <div className="w-64 rounded-full">
                            <img src="http://localhost:3000/src/assets/about/InvitadoVerde.jpg" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h1 className="text-5xl font-bold">Artista invitado</h1>
                        <h2 className="text-xl">Rol</h2>
                        <p className="py-6">
                            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
                            excepturi exercitationem quasi. In deleniti eaque aut
                        </p>
                        <button className="btn btn-primary">Contáctame</button>
                    </div>
                </div>
            </div>





        </div>

    )

}

export default About;