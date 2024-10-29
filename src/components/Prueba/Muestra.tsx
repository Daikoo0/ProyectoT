import { useState } from "react";

const Muestra = ({ keyID, data, setSideBarState, setFormMuestra, scale, litologiaX, columnW, isInverted }) => {

    const height = 30;
    const width = 30;

    const centerX = data.x * columnW;
    const centerY = (data.upper + data.lower) / 2;

    const upper = data.upper * scale;
    const lower = data.lower * scale;

    const gTranslateX = centerX - (width / 2);
    const gTranslateY = centerY * scale - (height / 2);

    const [hovered, setHovered] = useState(false); // Estado para controlar si se está pasando el mouse por encima

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };

    const a = () => {
        setSideBarState({
            sideBar: true,
            sideBarMode: "editMuestra"
        })

        setFormMuestra({ ...data, id: keyID, muestraTextCopy: data.muestraText });
    }

    return (
        <g
            onClick={a}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="muestraUnit"
            //   transform={isInverted ? "scale(1,-1)" : "none"}
            transform={isInverted ? "none" : "scale(1,-1)"}
            style={{
                //  transform: isInverted ? "scaleY(-1)" : "none",
                transformOrigin: "center",
            }}
        >


            {/* Lineas horizontal de arriba  */}
            <line
                className={hovered ? "stroke-info" : "stroke-base-content"} x1={-litologiaX} y1={upper} x2={centerX} y2={upper} strokeWidth="1" strokeDasharray="5, 5" />

            {/* Linea vertical central  */}
            <line
                className={hovered ? "stroke-info" : "stroke-base-content"} x1={-litologiaX} y1={lower} x2={centerX} y2={lower} strokeWidth="1" strokeDasharray="5, 5" />

            {/* Linea horizontal de abajo  */}
            <line
                className={hovered ? "stroke-info" : "stroke-base-content"} x1={centerX} y1={upper} x2={centerX} y2={lower} strokeWidth="1" strokeDasharray="5, 5" />

            {/* Imagen del fosil  */}
            <g
                className="stroke-base-content"
               // transform={`translate(${gTranslateX},${gTranslateY})`}
                transform={isInverted? `translate(${gTranslateX},${gTranslateY})`: `translate(${gTranslateX},${gTranslateY+height}) rotate(180) scale(-1,1)`}
                style={{ transformOrigin: `0 0` }}
            >
                <foreignObject
                    width="80"
                    height="20"
                >
                    <div className="bg-primary">
                        <p style={{ fontFamily: "Times New Roman, Times, serif" }}>{data.muestraText}</p>
                    </div>
                </foreignObject>
            </g>
        </g>
    );


}

export default Muestra;