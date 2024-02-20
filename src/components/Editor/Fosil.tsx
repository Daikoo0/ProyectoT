import { useEffect, useState } from "react";
import fosilJson from '../../fossil.json';

const Fosil = ({ img, setSideBarState, setIdClickFosil, scale, litologiaX }) => {

    const [svgContent, setSvgContent] = useState('');
    const [height, setHeight] = useState(10);
    const [width, setWidth] = useState(10);

    const a = () => {
        setSideBarState({
            sideBar: true,
            sideBarMode: "editFosil"
        })
        setIdClickFosil(img.idFosil);
    }

    useEffect(() => {
        //if(File === 0){
        if (!img.selectedFosil) {
            setSvgContent('');
            return;
        }

        //const imageURL = new URL('../../assets/patrones/'+File+'.svg', import.meta.url).href
        //const imageURL = new URL(img.posImage, import.meta.url).href
        const imageURL = new URL('../../assets/fosiles/' + fosilJson[img.selectedFosil] + '.svg', import.meta.url).href
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

    }, [img.selectedFosil]);

    const imgX = img.relativeX - (width / 2);
    console.log(litologiaX)
    return (
        <>
            <g transform={`translate(${imgX},${(img.posImage - (height * scale / 2)) * scale}) scale(1,${scale})`}
                dangerouslySetInnerHTML={{ __html: svgContent }} />

            <line x1={0 - litologiaX} y1={img.upper * scale} x2={img.relativeX} y2={img.upper * scale} stroke="black" strokeWidth="1" strokeDasharray="5, 5" />
            <line x1={0 - litologiaX} y1={img.upper * scale} x2={img.relativeX} y2={img.upper * scale} stroke="white" strokeWidth="0.5" strokeDasharray="5, 5" />

            <line x1={0 - litologiaX} y1={img.lower * scale} x2={img.relativeX} y2={img.lower * scale} stroke="black" strokeWidth="1" strokeDasharray="5, 5" />
            <line x1={0 - litologiaX} y1={img.lower * scale} x2={img.relativeX} y2={img.lower * scale} stroke="white" strokeWidth="0.5" strokeDasharray="5, 5" />

            <line x1={img.relativeX} y1={img.upper * scale} x2={img.relativeX} y2={img.lower * scale} stroke="black" strokeWidth="1" strokeDasharray="5, 5" />
            <line x1={img.relativeX} y1={img.upper * scale} x2={img.relativeX} y2={img.lower * scale} stroke="white" strokeWidth="0.5" strokeDasharray="5, 5" />
        </>
    );


}

export default Fosil;