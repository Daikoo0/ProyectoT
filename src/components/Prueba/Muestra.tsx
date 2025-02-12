import { useState } from "react";
import { atSettings, atSideBarState } from "../../state/atomEditor";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { Muestra } from "./types";

interface MuestrasProps {    
    keyID: string;
    data: Muestra;
    setFormMuestra: any;
    // scale: number;
    litologiaX: number;
    columnW: number;
    // isInverted: boolean;

}

const Muestras: React.FC<MuestrasProps> = ({ keyID, data, setFormMuestra, litologiaX, columnW }) => {

    const setAtSideBar = useSetRecoilState(atSideBarState);
    const settings = useRecoilValue(atSettings)

    const height = 30;
    const width = 30;

    const centerX = data.x * columnW;
    const centerY = (data.upper + data.lower) / 2;

    const upper = data.upper * settings.scale;
    const lower = data.lower * settings.scale;

    const gTranslateX = centerX - (width / 2);
    const gTranslateY = centerY * settings.scale - (height / 2);

    const [hovered, setHovered] = useState(false); // Estado para controlar si se está pasando el mouse por encima

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };

    const a = () => {
        setAtSideBar({
            isOpen: true,
            entityType: "sample", actionType: "edit"
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
            transform={settings.isInverted ? "none" : "scale(1,-1)"}
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
                transform={settings.isInverted? `translate(${gTranslateX},${gTranslateY})`: `translate(${gTranslateX},${gTranslateY+height}) rotate(180) scale(-1,1)`}
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

export default Muestras;