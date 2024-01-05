import { Line, Image } from "react-konva";
import React from "react";
import { useEffect, useState } from "react";
import useImage from 'use-image';
import fosilJson from '../../fossil.json';

const Fosil = (img, index) => {
    console.log(img)

    const [svgContent, setSvgContent] = useState('');

    useEffect(() => {
        //if(File === 0){
        if (!img.img.selectedFosil) {
            setSvgContent('');
            return;
        }

        //const imageURL = new URL('../../assets/patrones/'+File+'.svg', import.meta.url).href
        //const imageURL = new URL(img.img.posImage, import.meta.url).href
        const imageURL = new URL('../../assets/fosiles/'+fosilJson[img.img.selectedFosil]+'.svg', import.meta.url).href
        console.log(img.img)

        fetch(imageURL)
            .then(response => response.text())
            .then(svgText => {


                setSvgContent(svgText);

            });

    }, [img.img.selectedFosil]);

    const [image] = useImage(!img.img.selectedFosil ? null : "data:image/svg+xml;base64," + window.btoa(svgContent));

    return (
        <React.Fragment key={index}>
            <Line
                points={[(img.img.x || 20) + 15, img.img.posImage - 25, (img.img.x || 20) + 15, img.img.posImage + 50]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Line
                points={[img.img.x || 20, img.img.lower, (img.img.x || 20) + 30, img.img.lower]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Line
                points={[img.img.x || 20, img.img.upper, (img.img.x || 20) + 30, img.img.upper]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Image
                x={img.img.x || 20}
                y={img.img.posImage}
                width={30}
                height={30}
                image={image}
            />
        </React.Fragment>

    );


}

export default Fosil;