import { Line } from 'react-konva';

function LineFill({ points, x, Width, upperContact, lowerContact, ColorFill, Tension, image, Rotation }) {


    const handleSceneFunc = (ctx, shape) => {
        //   const points = shape.points();
        //var upperLimit = upperLimit ? upperLimit : (points[2] - x) / Width

        const points = shape.points();
        ctx.beginPath()


        ctx.moveTo(points[0], points[1]);
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
                    ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, false);
                    if ((i % 2 === 0 && xPos - arcSize > points[2]) || (i % 2 !== 0 && xPos > points[2])) {
                        ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, false);
                    }

                }
                else {
                    ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, true);
                    if ((i % 2 === 0 && xPos - arcSize > points[2]) || (i % 2 !== 0 && xPos > points[2])) {
                        ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, true);
                    }


                }
            }
            ctx.moveTo(Width, points[3]);


            ctx.moveTo(points[2], points[3]);


        } else {
            //  -------------------- linea recta debajo del contacto --------------------//

            ctx.lineTo(points[2], points[3]);
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

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextPoint.x, nextPoint.y);
        }

        ctx.lineTo(points[points.length - 4], points[points.length - 3]);

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
                    ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, false);
                    if ((i % 2 === 0 && xPos - arcSize > points[points.length - 4]) || (i % 2 !== 0 && xPos > points[points.length - 4])) {
                        ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, false);
                    }

                }
                else {
                    ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, true);
                    if ((i % 2 === 0 && xPos - arcSize > points[points.length - 4]) || (i % 2 !== 0 && xPos > points[points.length - 4])) {
                        ctx.arc(midX, midY, arcSize / 2, 0, Math.PI, true);
                    }

                }
            }
            ctx.lineTo(points[points.length - 2], points[points.length - 1]);


        } else {
            //-------------------- linea recta debajo del contacto --------------------//
            ctx.lineTo(points[points.length - 2], points[points.length - 1]);
        }
        ctx.lineTo(points[0],points[1])

        //ctx.lineTo(points[points.length - 2], points[points.length - 1]);

        //----------------------------// stroke, fill y lado izquierdo//-------------------------------//

        ctx.closePath();
        ctx.fillStrokeShape(shape);
    };


    return (
        <Line
            points={points}
            closed
            sceneFunc={handleSceneFunc}
            fillRule='evenodd'
            fillPatternImage={image}
        />
    );
}

export default LineFill;
