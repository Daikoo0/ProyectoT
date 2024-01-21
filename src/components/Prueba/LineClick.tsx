import { Line } from 'react-konva';

function LineClick({points, handlePolygonClick, Tension}) {


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

        ctx.strokeShape(shape); 

    };

    const handleMouseEnter = () => {
        console.log("Entro a la linea")
        document.body.style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
        document.body.style.cursor = 'default';
    };

    return (
        <Line
            points={points}
            sceneFunc={handleSceneFunc3}
            strokeWidth={6}
            stroke={'transparent'}
            onClick={handlePolygonClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    );
}

export default LineClick;
