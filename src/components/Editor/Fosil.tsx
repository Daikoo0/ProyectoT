import { Line, Image } from "react-konva";
import React from "react";
import { useEffect, useState } from "react";
import useImage from 'use-image';
import fosilJson from '../../fossil.json';

const Fosil = ({img, index,x}) => {
    console.log(img,x+img.relativeX)

    const [svgContent, setSvgContent] = useState('');

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
            />
            <Line
                points={[x+img.relativeX || 20, img.lower, (x+img.relativeX || 20) + 30, img.lower]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Line
                points={[x+img.relativeX || 20, img.upper, (x+img.relativeX || 20) + 30, img.upper]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Image
                x={x+img.relativeX || 20}
                y={img.posImage-10}
                width={20}
                height={20}
                image={image}
            />
        </React.Fragment>

    );


}

export default Fosil;