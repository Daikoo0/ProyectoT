import { Group, Rect, Text, Line, Image } from "react-konva";
import React from "react";
import { Html } from "react-konva-utils";
import { useEffect, useState } from "react";
import useImage from 'use-image';

const Fosil = (img, index) => {
    console.log(img)

    const [svgContent, setSvgContent] = useState('');

    useEffect(() => {
        //if(File === 0){
        if (!img.img.src) {
            setSvgContent('');
            return;
        }

        //const imageURL = new URL('../../assets/patrones/'+File+'.svg', import.meta.url).href
        const imageURL = new URL(img.img.src, import.meta.url).href
        console.log(img.img)

        fetch(imageURL)
            .then(response => response.text())
            .then(svgText => {


                setSvgContent(svgText);

            });

    }, [img.img.src]);

    const [image] = useImage(!img.img.src ? null : "data:image/svg+xml;base64," + window.btoa(svgContent));

    return (
        <React.Fragment key={index}>
            <Line
                points={[img.img.x + 15, img.img.y - 25, img.img.x + 15, img.img.y + 50]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Line
                points={[img.img.x, img.img.y-25, img.img.x + 30, img.img.y-25]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Line
                points={[img.img.x, img.img.y + 50, img.img.x + 30, img.img.y + 50]}
                stroke="grey"
                dash={[2, 2]}
            />
            <Image
                x={img.img.x}
                y={img.img.y}
                width={30}
                height={30}
                image={image}
            />
        </React.Fragment>

    );


}

export default Fosil;