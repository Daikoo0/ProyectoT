import { useState, useEffect } from 'react';
import { Line, Circle } from 'react-konva';
import Contacts from '../../contacts.json';
import useImage from 'use-image';

const Polygon = ({ x, y, Width, Height, rowIndex, circles, Tension, setCircles, File, Zoom, Rotation,
    openModalPoint, upperContact, ColorFill, ColorStroke, selected, lowerContact, lowerLimit, upperLimit
}) => {
    console.log("zoom: ", Zoom, " rotation: ", Rotation, " file: ", File, " colorFill: ", ColorFill, " colorStroke: ", ColorStroke)
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


    const [image] = useImage(File === 0 ? null : "data:image/svg+xml;base64," + window.btoa(svgContent));


    // Todos los eventos de los circulos
    const addEventToCircle = (index) => {
        return {
            onMouseUp: () => {
                const updatedCircles = [...circles];
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

    const handleSceneFunc = (ctx, shape) => {
        const points = shape.points();
        var upperLimit = upperLimit ? upperLimit : (points[2] - x) / Width

        let region = new Path2D();
        region.moveTo(points[0], points[1]);
        if (upperContact && upperContact.arcs) {
            //--------------------- linea curvas -------------------//
            var arcSize = 10;
            var length = Math.abs(Width - points[0]);
            var number = length / arcSize;
            for (var i = 0; i < number; i++) {
                var xPos = (length - i * arcSize) + points[0];

                const midX = xPos - arcSize / 2;
                const midY = points[1];


                if ((i % 2 === 0 && xPos - arcSize < points[0]) || (i % 2 !== 0 && xPos < points[0])) {
                    break;
                }
                else if (i % 2 === 0) {
                    region.arc(midX, midY, arcSize / 2, 0, Math.PI, false);
                    if ((i % 2 === 0 && xPos - arcSize > points[2]) || (i % 2 !== 0 && xPos > points[2])) {
                        region.arc(midX, midY, arcSize / 2, 0, Math.PI, false);
                    }

                }
                else {
                    region.arc(midX, midY, arcSize / 2, 0, Math.PI, true);
                    if ((i % 2 === 0 && xPos - arcSize > points[2]) || (i % 2 !== 0 && xPos > points[2])) {
                        region.arc(midX, midY, arcSize / 2, 0, Math.PI, true);
                    }


                }
            }
            region.moveTo(Width, points[3]);


            region.moveTo(points[2], points[3]);


        } else {
            //  -------------------- linea recta debajo del contacto --------------------//

            region.lineTo(points[2], points[3]);
        }


        for (let n = 0; n < points.length - 2; n += 2) {
            const prevPoint = { x: points[n - 2], y: points[n - 1] };
            const currentPoint = { x: points[n], y: points[n + 1] };
            const nextPoint = { x: points[n + 2], y: points[n + 3] };
            const afterNextPoint = { x: points[n + 4], y: points[n + 5] };

            const cp1x = currentPoint.x + ((nextPoint.x - prevPoint.x) / 6) * Tension;
            const cp1y = currentPoint.y + ((nextPoint.y - prevPoint.y) / 6) * Tension;

            const cp2x = nextPoint.x - ((afterNextPoint.x - currentPoint.x) / 6) * Tension;
            const cp2y = nextPoint.y - ((afterNextPoint.y - currentPoint.y) / 6) * Tension;

            region.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextPoint.x, nextPoint.y);
        }

        region.lineTo(points[points.length - 4], points[points.length - 3]);

        if (lowerContact && lowerContact.arcs) {
            var arcSize = 10;
            var length = Math.abs(Width - points[points.length - 2]);
            var number = length / arcSize;
            for (var i = 0; i < number; i++) {
                var xPos = (length - i * arcSize) + points[points.length - 2];
                // ctx.moveTo(xPos, points[points.length - 3]);

                const midX = xPos - arcSize / 2;
                const midY = points[points.length - 3];


                if ((i % 2 === 0 && xPos - arcSize < points[points.length - 2]) || (i % 2 !== 0 && xPos < points[points.length - 2])) {
                    break;
                }
                else if (i % 2 === 0) {
                    region.arc(midX, midY, arcSize / 2, 0, Math.PI, false);
                    if ((i % 2 === 0 && xPos - arcSize > points[points.length - 4]) || (i % 2 !== 0 && xPos > points[points.length - 4])) {
                        region.arc(midX, midY, arcSize / 2, 0, Math.PI, false);
                    }

                }
                else {
                    region.arc(midX, midY, arcSize / 2, 0, Math.PI, true);
                    if ((i % 2 === 0 && xPos - arcSize > points[points.length - 4]) || (i % 2 !== 0 && xPos > points[points.length - 4])) {
                        region.arc(midX, midY, arcSize / 2, 0, Math.PI, true);
                    }

                }
            }
            region.lineTo(points[points.length - 2], points[points.length - 1]);


        } else {
            //-------------------- linea recta debajo del contacto --------------------//
            region.lineTo(points[points.length - 2], points[points.length - 1]);
        }

        //region.lineTo(points[points.length - 2], points[points.length - 1]);

        //----------------------------// stroke, fill y lado izquierdo//-------------------------------//

        region.lineTo(points[0], points[1]);

        ctx.clip(region, "evenodd")
        //ctx.fillStyle = ColorFill
        //ctx.fillStyle = ColorFill;
        ctx.fill(region, "evenodd");
        //  ctx.fillRect(points[0], points[1] - 10, Width, points[points.length - 3] + 20)
        // ctx.fill()
        //ctx.lineWidth = 0.3;
        //ctx.strokeStyle = "black";
        //ctx.stroke()
        ctx.strokeShape(shape);
        //ctx.fillStrokeShape(shape);

        if (image) {
            ctx.fillStyle = ctx.createPattern(image, 'repeat');

            const radians = (Rotation * Math.PI) / 180;

            ctx.rotate(radians);

        } else {
            ctx.fillStyle = 'white';
        }

        ctx.fill();
        ctx.strokeShape(shape);
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

    const handleMouseEnter = () => {
        console.log("Entro a la linea")
        document.body.style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
        document.body.style.cursor = 'default';
    };


    const handleSceneFunc2 = (ctx, shape) => {

        const points = shape.points();
        if (upperContact) {
            ctx.beginPath()
            ctx.moveTo(points[points.length - 4], points[points.length - 3]);
            ctx.lineTo(points[points.length - 2], points[points.length - 1]);
            ctx.moveTo(points[0], points[1]);
            ctx.lineTo((upperLimit * Width) + x, points[3]);
            ctx.lineWidth = 2
            ctx.strokeStyle = "transparent"
            ctx.stroke()
            ctx.beginPath()
            ctx.setLineDash(typeof (upperContact.dash) === "string" ? eval(upperContact.dash) : upperContact.dash)
            ctx.strokeStyle = "black"
            ctx.lineWidth = upperContact.lineWidth
            ctx.moveTo(points[0], points[1]);
            ctx.lineTo((upperLimit * Width) + x, points[3]);
            ctx.stroke()

            if (upperContact.dash2) {

                ctx.beginPath()
                ctx.setLineDash(typeof (upperContact.dash2) === "string" ? eval(upperContact.dash2) : upperContact.dash2)
                ctx.strokeStyle = "black"
                ctx.lineWidth = upperContact.lineWidth2
                ctx.moveTo(points[0], points[1] - upperContact.lineWidth2 / 2);
                ctx.lineTo((upperLimit * Width) + x, points[3] - upperContact.lineWidth2 / 2);
                ctx.stroke()
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

    const handleSceneFunc3 = (ctx, shape) => {

        const points = shape.points();

        ctx.beginPath();

        ctx.lineTo(points[2], points[3]);

        for (let n = 0; n < points.length - 2; n += 2) {
            const prevPoint = { x: points[n - 2], y: points[n - 1] };
            const currentPoint = { x: points[n], y: points[n + 1] };
            const nextPoint = { x: points[n + 2], y: points[n + 3] };
            const afterNextPoint = { x: points[n + 4], y: points[n + 5] };

            const cp1x = currentPoint.x + ((nextPoint.x - prevPoint.x) / 6) * Tension;
            const cp1y = currentPoint.y + ((nextPoint.y - prevPoint.y) / 6) * Tension;

            const cp2x = nextPoint.x - ((afterNextPoint.x - currentPoint.x) / 6) * Tension;
            const cp2y = nextPoint.y - ((afterNextPoint.y - currentPoint.y) / 6) * Tension;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextPoint.x, nextPoint.y);
        }


        //ctx.lineWidth = 0.3;
        //ctx.strokeStyle = "red";
        ctx.strokeShape(shape); //Necesario para las funciones

        //ctx.stroke()
        //ctx.fillStrokeShape(shape);
    };

    return (
        <>
            <Line
                points={polygonPoints}
                closed
                strokeWidth={0.3}
                //hitStrokeWidth={7}
                stroke={'black'}
                fill={ColorFill}
                //fillPatternImage={image}
                //fillPatternRotation={Rotation}
                //onClick={handlePolygonClick}
                sceneFunc={handleSceneFunc}
            //onMouseEnter={handleMouseEnter}
            //onMouseLeave={handleMouseLeave}
            />

            <Line
                points={polygonPoints}
                sceneFunc={handleSceneFunc3}
                //closed
                //strokeWidth={1}
                hitStrokeWidth={10}
                stroke={'transparent'}
                //fillPatternImage={image}
                //fillPatternRotation={Rotation}
                onClick={selected ? handlePolygonClick : null}

                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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