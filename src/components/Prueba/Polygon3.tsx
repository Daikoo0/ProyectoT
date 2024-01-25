import { useState, useEffect } from 'react';
import { Line, Circle } from 'react-konva';
import Contacts from '../../contacts.json';
import useImage from 'use-image';
import LineClick from './LineClick';
import LineFill from './LineFill';

const Polygon = ({ x, y, Width, Height, rowIndex, circles, Tension, setCircles, File, Zoom, Rotation,
    openModalPoint, upperContact, ColorFill, ColorStroke, selected, lowerContact, upperLimit
}) => {

    var upperContact = Contacts[String(upperContact)]
    if (upperContact !== undefined) {
        upperContact = JSON.parse(JSON.stringify(upperContact))
    }

    var lowerContact = Contacts[String(lowerContact)]
    if (lowerContact !== undefined) {
        lowerContact = JSON.parse(JSON.stringify(lowerContact))
    }

    const circlesToPoints = (circles) => {
        return circles.map((circle) => [circle.x, circle.y]).flat();
    };

    const [polygonPoints, setPolygonPoints] = useState(circlesToPoints(circles));
    const [svgContent, setSvgContent] = useState('');

    useEffect(() => {

        setPolygonPoints(circlesToPoints(circles));

    }, [Width, Height, x, y, circles]);


    useEffect(() => {
        if (File === 0) {
            setSvgContent('');
            return;
        }

        // Función para cargar y actualizar el contenido SVG inicial
        const updateSvgContent = (svgText) => {
            let updatedSvg = svgText;
            updatedSvg = updateSvg(updatedSvg, ColorFill, ColorStroke, Zoom);
            setSvgContent(updatedSvg);
        };

        // Si el SVG no está cargado, lo carga
        if (!svgContent) {
            const imageURL = new URL(`../../assets/patrones/${File}.svg`, import.meta.url).href;
            fetch(imageURL)
                .then(response => response.text())
                .then(updateSvgContent);
        } else {
            // Si el SVG ya está cargado, solo actualiza los colores o el zoom
            let updatedSvg = svgContent;
            updatedSvg = updateSvg(updatedSvg, ColorFill, ColorStroke, Zoom);
            setSvgContent(updatedSvg);
        }


    }, [File, ColorFill, ColorStroke, Zoom]);

    function updateSvg(svgText, colorFill, colorStroke, zoom) {
        // Actualizar colores de relleno y trazo
        let updatedSvg = svgText.replace(/<rect[^>]+fill='[^']+'/g, (match) => {
            return match.replace(/fill='[^']+'/g, `fill='${colorFill}'`);
        }).replace(/<g[^>]+stroke='[^']+'/g, (match) => {
            return match.replace(/stroke='[^']+'/g, `stroke='${colorStroke}'`);
        });

        // Actualizar dimensiones para el zoom si es necesario
        if (zoom) {
            updatedSvg = updatedSvg.replace(/<svg[^>]+/g, (match) => {
                return match.replace(/width="[^"]*"/g, `width="${zoom}"`)
                    .replace(/height="[^"]*"/g, `height="${zoom}"`);
            });
        }

        return updatedSvg;
    }


     var [image] = useImage(File === 0 ? null : "data:image/svg+xml;base64," + window.btoa(svgContent));


    // Todos los eventos de los circulos
    const addEventToCircle = (index) => {
        return {
            onMouseUp: () => {
                console.log(index)
              //  const updatedCircles = [...circles];
                console.log("Soltar punto")
                //setCircles(updatedCircles, true);
            },


            // ondragMove: (e) => {
            //     const updatedCircles = [...circles];
            //     updatedCircles[index].x = e.target.x();

            //     console.log("Movimiento de puntos")
            //     //setCircles(updatedCircles, false);
            //     setPolygonPoints(circlesToPoints(updatedCircles));

            // },

        };
    };


    // Crear puntos en las lineas 
    const handlePolygonClick = (e) => {
        const mousePos = e.target.getStage().getPointerPosition();
        const My = mousePos.y;

        const updatedCircles = [...circles];
        let insertIndex = -1;

        for (let i = 1; i < updatedCircles.length - 2; i++) {
            const start_y = updatedCircles[i].y;
            const end_y = updatedCircles[i + 1].y;

            if ((start_y <= My && My <= end_y) || (end_y <= My && My <= start_y)) {
                insertIndex = i + 1;
                break;
            }
        }

        if (insertIndex !== -1) {
            const originalY = (My - y) / Height;
            const point = { x: 0.5, y: originalY, radius: 5, movable: true };

            setCircles(rowIndex, insertIndex, point)
        }
    };




    const handleSceneFunc2 = (ctx, shape) => {

        const points = shape.points();

        if (upperContact) {
         

            if (upperContact.dash) {
                ctx.beginPath()
                ctx.setLineDash(typeof (upperContact.dash) === "string" ? eval(upperContact.dash) : upperContact.dash)
                ctx.strokeStyle = "black"
                ctx.lineWidth = upperContact.lineWidth
                ctx.moveTo(points[0], points[1]);
                ctx.lineTo((upperLimit * Width) + x, points[3]);
                ctx.stroke()
            }

            if (upperContact.dash2) {

                ctx.beginPath()
                ctx.setLineDash(typeof (upperContact.dash2) === "string" ? eval(upperContact.dash2) : upperContact.dash2)
                ctx.strokeStyle = "black"
                ctx.lineWidth = upperContact.lineWidth2
                ctx.moveTo(points[0], points[1] - upperContact.lineWidth2 / 2);
                ctx.lineTo((upperLimit * Width) + x, points[3] - upperContact.lineWidth2 / 2);
                ctx.stroke()
            }

            if (upperContact.question) {
                //---------------------// Signo de pregunta del contacto //--------------------//
                ctx.beginPath()
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.fillText('?', Math.abs(((upperLimit * Width) + x + points[0]) / 2), points[1]);

            }

        }
        if (upperContact && upperContact.question) {
            //---------------------// Signo de pregunta del contacto //--------------------//
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.fillText('?', Math.abs(((upperLimit * Width) + x - points[0]) / 2), points[1]);
        }

    }


    return (
        <>
            <LineFill
                points={polygonPoints}
                upperContact={upperContact}
                lowerContact={lowerContact}
                image={image}
                Width={Width}
                Tension={Tension}
                Rotation={Rotation}

            />

            <LineClick
                points={polygonPoints}
                handlePolygonClick={handlePolygonClick}
                Tension={Tension}
            />


            {selected && circles.map((circle, index) => (
                <Circle
                    //  key={index}
                    key={`circle-${index}`}
                    x={circle.x}
                    y={circle.y}
                    radius={7}
                    stroke="#ff0000"
                    strokeWidth={1}
                    //draggable={circle.movable}
                    //dragBoundFunc={(pos) => ({ x: Math.max(Math.min(pos.x, maxX), minX), y: circle.y })}
                    onClick={() => {
                        if (circle.movable) {
                            //(document.getElementById('modalPoint') as HTMLDialogElement).showModal();
                            openModalPoint(rowIndex, index, (circle.x - x) / Height);
                        }
                    }}
                    {...addEventToCircle(index)}
                />
            ))}
            <Line
                points={polygonPoints}
                sceneFunc={handleSceneFunc2}
            />
        </>

    );
};

Polygon.defaultProps = {

    Tension: 1,
    circles: [],
    setCircles: () => { },
    onClick: () => { },
};

export default Polygon;