import { useState } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { atformFossil, atSideBarState, atSettings } from "../../state/atomEditor"; 
import fosilJson from '../../fossil.json';
import { useDynamicSvgImport } from "../../utils/dynamicSvgImport";
import { Fosil } from "./types";

interface FossilProps { 
    keyID: string;
    data: Fosil;
    // scale: number;
    litologiaX: number;
    columnW: number;
    // isInverted: boolean;
}

const Fossil: React.FC<FossilProps> = ({ keyID, data, litologiaX, columnW }) => {

    const setFormFosil = useSetRecoilState(atformFossil);
    const setSideBar = useSetRecoilState(atSideBarState);
    const settings = useRecoilValue(atSettings);

    const { loading, SvgIcon } = useDynamicSvgImport(fosilJson[data.fosilImg], 'fosiles');

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
        setSideBar({
            isOpen: true,
            entityType: "fossil",
            actionType: "edit",
        })

        setFormFosil({ ...data, id: keyID, fosilImgCopy: data.fosilImg });
        
    }

    return (
        <g
            onClick={a}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="fossilUnit"
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
                id="iconFosil" className="stroke-base-content"
                transform={settings.isInverted ? `translate(${gTranslateX},${gTranslateY})` : `translate(${gTranslateX},${gTranslateY + height}) rotate(180) scale(-1,1)`}
                style={{ transformOrigin: `0 0` }}
            >
                <rect width={width} height={height} className="fill-base-100" stroke="none" /> {/* Cambia 'fill-base-content' por el color que desees */}


                {loading ?
                    <svg
                        xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 200 200"><circle className="stroke-primary" fill="none" strokeOpacity="1" strokeWidth=".5" cx="100" cy="100" r="0"><animate attributeName="r" calcMode="spline" dur="1.3" values="1;80" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-width" calcMode="spline" dur="1.3" values="0;25" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" calcMode="spline" dur="1.3" values="1;0" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate></circle></svg>

                    :
                    SvgIcon && (


                        <SvgIcon {...{ width: width, height: height, className: "stroke-base-content" }} />

                    )}

            </g>

        </g>
    );


}

export default Fossil;