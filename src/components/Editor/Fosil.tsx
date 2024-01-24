import { Line, Image } from "react-konva";
import React from "react";
import { useEffect, useState } from "react";
import useImage from 'use-image';
import fosilJson from '../../fossil.json';

const Fosil = ({img, index,x,setSideBarState,setIdClickFosil}) => {
    console.log(img,x+img.relativeX)

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
        const imageURL = new URL('../../assets/fosiles/'+fosilJson[img.selectedFosil]+'.svg', import.meta.url).href
        console.log(img)

        fetch(imageURL)
            .then(response => response.text())
            .then(svgText => {


                setSvgContent(svgText);

            });

    }, [img.selectedFosil]);

    const [image] = useImage(!img.selectedFosil ? null : "data:image/svg+xml;base64," + window.btoa(svgContent));

    return (
        <React.Fragment key={index}>
            <Line
                points={[(x+img.relativeX || 20) + 10, img.lower, (x+img.relativeX || 20) + 10, img.upper]}
                stroke="grey"
                dash={[2, 2]}
                onClick={a}
            />
            <Line
                points={[(x+img.relativeX || 20), img.lower, (x+img.relativeX || 20) + 20, img.lower]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Line
                points={[(x+img.relativeX || 20), img.upper, (x+img.relativeX || 20) + 20, img.upper]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Image
                x={(x+img.relativeX)-2 || 20}
                y={img.posImage-12}
                width={24}
                height={24}
                image={image}
                onClick={a}
            />
        </React.Fragment>

    );


}

export default Fosil;