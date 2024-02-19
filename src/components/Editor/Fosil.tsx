import { useEffect, useState } from "react";
import fosilJson from '../../fossil.json';

const Fosil = ({ img, setSideBarState, setIdClickFosil, scale }) => {

    const [svgContent, setSvgContent] = useState('');

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


        fetch(imageURL)
            .then(response => response.text())
            .then(svgText => {


                setSvgContent(svgText);

            });

    }, [img.selectedFosil]);

    // console.log(img)
    return (
        <>
            <g transform={`translate(${img.relativeX},${img.posImage * scale }) scale(${9}, ${1})`}
                dangerouslySetInnerHTML={{ __html: svgContent }} />
            <line x1={img.relativeX} y1={img.upper*scale} x2={img.relativeX} y2={img.lower*scale} stroke="black" strokeWidth="2" strokeDasharray="5, 5" />
        </>
    );


}

export default Fosil;