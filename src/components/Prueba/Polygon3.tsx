import { useState, useEffect } from 'react';
import { Line, Circle } from 'react-konva';

const Polygon = ({ x, y, Width, Height, rowIndex, circles, Tension, setCircles, openModalPoint}) => {


    const circlesToPoints = (circles) => {
        return circles.map((circle) => [circle.x, circle.y]).flat();
    };

    const [polygonPoints, setPolygonPoints] = useState(circlesToPoints(circles));

    useEffect(() => {

        setPolygonPoints(circlesToPoints(circles));

    }, [Width, Height, x, y, circles]);



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

    const minX = 0;
    const maxX = 6000;

    const handleSceneFunc = (ctx, shape) => {
        const points = shape.points();

        // Dibuja la primera seccion
        ctx.beginPath();

        ctx.moveTo(points[0], points[1]);
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

        //ctx.lineTo(points[points.length - 4], points[points.length - 3]);

        //-------------------- linea recta debajo del contacto --------------------//
        //ctx.lineTo(points[points.length - 2], points[points.length - 1]);


        //--------------------- linea curvas debajo del contacto --------------------//

        const arcSize = 10;
        const length = Math.abs(points[points.length - 4] - points[points.length - 2]);
        const number = length / arcSize;
        for (var i = 0; i < number; i++) {
            var xPos = (length - i * arcSize) + points[points.length - 2];
            // ctx.moveTo(xPos, points[points.length - 3]);

            const midX = xPos - arcSize / 2;
            const midY = points[points.length - 3];

            if ((i % 2 === 0 && xPos - arcSize < points[points.length - 2]) || (i % 2 !== 0 && xPos < points[points.length - 2])) {
                break;
            }
            else if (i % 2 === 0) {
                ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, false);

            }
            else {
                ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, true);

            }
        }
        ctx.lineTo(points[points.length - 2], points[points.length - 1]);


        //----------------------------// stroke, fill y lado izquierdo//-------------------------------//

        ctx.lineTo(points[0], points[1]);
        ctx.fillStyle = "white"
        ctx.fill()
        ctx.lineWidth = 0.3;
        ctx.strokeStyle = "black";
        //ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke()

        //-------------------- linea dash extra del contacto (por eliminar) --------------------//
        // ctx.beginPath()
        // ctx.lineTo(points[points.length - 2], points[points.length - 1]);
        // ctx.setLineDash([4,4])
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = "black";
        // ctx.stroke()

        //---------------------// Signo de pregunta del contacto //--------------------//
        // ctx.font = '18px Arial'; 
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'middle'; 
        // ctx.fillStyle = 'black';
        // ctx.fillText('?', Math.abs((points[points.length - 4] + points[points.length - 2]) / 2), points[points.length - 3]);
        // ctx.strokeText('?', Math.abs((points[points.length - 4] + points[points.length - 2]) / 2), points[points.length - 3]);

        ctx.strokeShape(shape);
    };

    // Crear puntos en las lineas 
    const handlePolygonClick = (e) => {
        const mousePos = e.target.getStage().getPointerPosition();
        const Mx = mousePos.x;
        const My = mousePos.y;

        const updatedCircles = [...circles];
        let insertIndex = -1;

        const tolerance = 10;

        for (let i = 0; i < updatedCircles.length - 1; i++) {
            const s_x = updatedCircles[i].x;
            const s_y = updatedCircles[i].y;
            const e_x = updatedCircles[i + 1].x;
            const e_y = updatedCircles[i + 1].y;

            const inXRange = (s_x - tolerance <= Mx && Mx <= e_x + tolerance) || (e_x - tolerance <= Mx && Mx <= s_x + tolerance);
            const inYRange = (s_y - tolerance <= My && My <= e_y + tolerance) || (e_y - tolerance <= My && My <= s_y + tolerance);

            if (inXRange && inYRange) {
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
        document.body.style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
        document.body.style.cursor = 'default';
    };


    const handleSceneFunc2 = (ctx, shape) => {

        const points = shape.points();
        ctx.beginPath()
        ctx.moveTo(points[points.length - 4], points[points.length - 3]);
        ctx.lineTo(points[points.length - 2], points[points.length - 1]);
        ctx.fillStyle = "white"
        ctx.lineWidth = 3
        ctx.fill()
        ctx.beginPath()
        ctx.setLineDash([2, 12])
        ctx.fillStyle = "black"
        ctx.lineWidth = 9
        ctx.moveTo(points[points.length - 4], points[points.length - 3]);
        ctx.lineTo(points[points.length - 2], points[points.length - 1]);
        ctx.stroke()

    }

    return (
        <>
            <Line
                points={polygonPoints}
                closed
                strokeWidth={5}
                hitStrokeWidth={10}
                stroke={'transparent'}
                //fillPatternImage={image}
                //fillPatternRotation={Rotation}
                onClick={handlePolygonClick}
                sceneFunc={handleSceneFunc}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            {circles.map((circle, index) => (
                <Circle
                    //  key={index}
                    key={`circle-${index}`}
                    x={circle.x}
                    y={circle.y}
                    radius={circle.radius}
                    stroke="#ff0000"
                    strokeWidth={1}
                    //draggable={circle.movable}
                    //dragBoundFunc={(pos) => ({ x: Math.max(Math.min(pos.x, maxX), minX), y: circle.y })}
                    onClick={ () => {
                        if (circle.movable){
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