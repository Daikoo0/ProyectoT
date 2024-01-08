import { Rect, Text, Group, Line } from "react-konva";

interface HeaderKonvaProps {

    onResize: (columnIndex: number, newWidth: number) => void;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    columnIndex?: number;
    value?: string;
    highestRelativeX?: number;
}

// Barras de desplazamiento
const dragHandleWidth = 2;
const DraggableRect = (props) => {
    return (
        <Rect
            fill="blue"
            draggable
            hitStrokeWidth={20}
            onMouseEnter={() => (document.body.style.cursor = "ew-resize")}
            onMouseLeave={() => (document.body.style.cursor = "default")}
            dragBoundFunc={(pos) => {
                return {
                    ...pos,
                    y: 0,
                };
            }}
            {...props}
        />
    );
};


const HeaderLines = ({ x, y, width, height, categories }) => {
    const linesAndText = [];

    linesAndText.push(
        <>
            <Line
                points={[x, y + height / 2, x + width, y + height / 2]}
                stroke="black"
                strokeWidth={1}
            />
            <Line
                points={[x, y, x, y + 110]}
                stroke="black"
                strokeWidth={1}
            />
        </>
    )

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const linePosition = x + (width * category.widthFactor);

        if (category.widthFactor === 0) {

            linesAndText.push(
                <Line
                    points={[linePosition, y + 42, linePosition, y + height / 2]}
                    stroke="black"
                    strokeWidth={1}
                />
            )
            linesAndText.push(
                <Text
                    rotation={270}
                    x={linePosition - 5} // Ajusta esto para alinear el texto según necesites
                    y={y + 40} // Posición vertical del texto, ajusta según sea necesario
                    text={category.name}
                    fontSize={11} // Ajusta el tamaño de fuente como necesites
                    fill="black" // Color del texto
                // Puedes añadir otros estilos de texto como 'fontFamily', 'fontWeight', etc.
                />
            )

        } else {
            linesAndText.push(
                <Line
                    points={[linePosition, y + 95, linePosition, y + 110]}
                    stroke="black"
                    strokeWidth={1}
                />
            )
            linesAndText.push(
                <Text
                    rotation={270}
                    x={linePosition - 5} // Ajusta esto para alinear el texto según necesites
                    y={y + 95} // Posición vertical del texto, ajusta según sea necesario
                    text={category.name}
                    fontSize={11} // Ajusta el tamaño de fuente como necesites
                    fill="black" // Color del texto
                />

            )
        }

        x = linePosition;
    }

    return <Group>{linesAndText}</Group>;
};



const HeaderComponent: React.FC<HeaderKonvaProps> = ({ columnIndex, x, y, width, height, value, onResize, highestRelativeX }) => {
    const halfWidth = width / 2;
    const text = value;
    const fill = "#eee";
    const MIN_WIDTH = 100; // Ancho mínimo para las columnas
    const MAX_WIDTH = 250; // Ancho máximo para las columnas
    
    const FOSSIL_MAX_WIDTH = 300; 
    const FOSSIL_MIN_WIDTH = highestRelativeX+24 || 200;

    return (
        <Group>
            <Rect
                x={x}
                y={y}
                height={height}
                width={width}
                fill={fill}
                stroke="grey"
                strokeWidth={0.5}
            />
            <Text
                x={x}
                y={y}
                height={height}
                width={text === "Litologia" ? halfWidth : width}
                text={text}
                fontStyle="bold"
                verticalAlign="middle"
                align="center"
                fontSize={18}
            />
            {text === "Litologia" && (

                <HeaderLines x={x + halfWidth} y={y} width={halfWidth} height={height}
                    categories={[
                        // { name: 'border', widthFactor: 0 },
                        { name: 'clay', widthFactor: 0.1 },
                        { name: 'silt', widthFactor: 0.08 },
                        { name: 'mud', widthFactor: 0 },
                        { name: 'vf', widthFactor: 0.08 },
                        { name: 'wacke', widthFactor: 0 },
                        { name: 'f', widthFactor: 0.08 },
                        { name: 'm', widthFactor: 0.08 },
                        { name: 'pack', widthFactor: 0 },
                        { name: 'c', widthFactor: 0.08 },
                        { name: 'vc', widthFactor: 0.08 },
                        { name: 'grain', widthFactor: 0 },
                        { name: 'gran', widthFactor: 0.08 },
                        { name: 'pebb', widthFactor: 0.08 },
                        { name: 'cobb', widthFactor: 0.08 },
                        { name: 'rud & \nbound', widthFactor: 0 },
                        { name: 'boul', widthFactor: 0.08 },
                    ]}
                />


            )}
            <DraggableRect
                x={x + width - dragHandleWidth}
                y={y}
                width={dragHandleWidth}
                height={height}
                onDragMove={(e) => {
                    const node = e.target;
                    let newX = node.x();
                    let newWidth = newX - x + dragHandleWidth;
            
                    let maxWidth = text === 'Estructura fosil' ? FOSSIL_MAX_WIDTH : MAX_WIDTH;
                    let minWidth = text === 'Estructura fosil' ? FOSSIL_MIN_WIDTH : MIN_WIDTH;
            
                
                    if (newWidth > maxWidth) {
                        newWidth = maxWidth;
                        newX = x + newWidth - dragHandleWidth;
                    } else if (newWidth < minWidth) {
                        newWidth = minWidth;
                        newX = x + newWidth - dragHandleWidth;
                    }
            
                    node.x(newX);
                    onResize(columnIndex, newWidth);
                }}
            />
        </Group>
    );
};

export default HeaderComponent;