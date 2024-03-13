import { useEffect, useState } from "react";
import fosilJson from '../../fossil.json';

const Fosil = ({ keyID, data, setSideBarState, setFormFosil, scale, litologiaX, columnW }) => {

    const [svgContent, setSvgContent] = useState('');
    const [height, setHeight] = useState(10);
    const [width, setWidth] = useState(10);

    const centerX = data.x * columnW;
    const centerY = (data.upper + data.lower) / 2;

    const upper = data.upper * scale;
    const lower = data.lower * scale;

    const gTranslateX = centerX - (width / 2); 
    const gTranslateY = centerY - (height / 2);

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
            sideBarMode: "editFosil"
        })

        setFormFosil({ ...data, id: keyID, fosilImgCopy: data.fosilImg});
    }


    useEffect(() => {
        if (!data.fosilImg) {
            setSvgContent('');
            return;
        }

        const imageURL = new URL('../../assets/fosiles/' + fosilJson[data.fosilImg] + '.svg', import.meta.url).href
        const regexW = /<svg[^>]*width\s*=\s*["']?([^"']+)["']?[^>]*>/;
        const regexH = /<svg[^>]*height\s*=\s*["']?([^"']+)["']?[^>]*>/;

        fetch(imageURL)
            .then(response => response.text())
            .then(svgText => {
                const matchW = svgText.match(regexW);
                const matchH = svgText.match(regexH);
                if (matchW && matchW[1]) {
                    setWidth(Number(matchW[1]))
                }
                if (matchH && matchH[1]) {
                    setHeight(Number(matchH[1]))
                }
                setSvgContent(svgText);
            });

    }, [data.fosilImg]);

    return (
        <g
            onClick={a}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'pointer', margin: '10px' }}
        >

            {/* Imagen del fosil  */}
            <g transform={`translate(${gTranslateX},${gTranslateY * scale}) scale(1,${1})`}
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />

            {/* Lineas horizontal de arriba  */}
            <line x1={-litologiaX} y1={upper} x2={centerX} y2={upper} stroke={hovered ? "blue" : "black"} strokeWidth="1" strokeDasharray="5, 5" />
            <line x1={-litologiaX} y1={upper} x2={centerX} y2={upper} stroke="white" strokeWidth="0.5" strokeDasharray="5, 5" />

            {/* Linea vertical central  */}
            <line x1={-litologiaX} y1={lower} x2={centerX} y2={lower} stroke={hovered ? "blue" : "black"} strokeWidth="1" strokeDasharray="5, 5" />
            <line x1={-litologiaX} y1={lower} x2={centerX} y2={lower} stroke="white" strokeWidth="0.5" strokeDasharray="5, 5" />

            {/* Linea horizontal de abajo  */}
            <line x1={centerX} y1={upper} x2={centerX} y2={lower} stroke={hovered ? "blue" : "black"} strokeWidth="1" strokeDasharray="5, 5" />
            <line x1={centerX} y1={upper} x2={centerX} y2={lower} stroke="white" strokeWidth="0.5" strokeDasharray="5, 5" />

        </g>
    );


}

export default Fosil;