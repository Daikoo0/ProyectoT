import { Rect, Text, Group, Line } from "react-konva";

interface HeaderKonvaProps {
    //frozenColumns: number;
    onResize: (columnIndex: number, newWidth: number) => void;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    columnIndex?: number;
    // ...otros tipos de propiedades según sea necesario...
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
    let accumulatedWidth = x;

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const linePosition = accumulatedWidth + (width * category.widthFactor);

        // Agregar la línea
        linesAndText.push(
            <Line
                points={[linePosition, y + 95, linePosition, y + 110]}
                stroke="black"
                strokeWidth={1}
            />
        );

        // Agregar el texto arriba de la línea
        linesAndText.push(
            <Text
               rotation={270}
                x={linePosition - 10} // Ajusta esto para alinear el texto según necesites
                y={y + 95} // Posición vertical del texto, ajusta según sea necesario
                text={category.name}
                fontSize={11} // Ajusta el tamaño de fuente como necesites
                fill="black" // Color del texto
                // Puedes añadir otros estilos de texto como 'fontFamily', 'fontWeight', etc.
            />
        );

        accumulatedWidth = linePosition;
    }

    return <Group>{linesAndText}</Group>;
};


const HeaderComponent: React.FC<HeaderKonvaProps> = ({ columnIndex, x, y, width, height, onResize }) => {
    const halfWidth = width / 2;
    const text = columnIndex ? `Header ${columnIndex}` :  "S/No";
    const fill = "#eee";
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
                width={columnIndex ===1? halfWidth :width}
                text={text}
                fontStyle="bold"
                verticalAlign="middle"
                align="center"
                fontSize={18}
            />
               {columnIndex === 1 && (
              
                <HeaderLines x={x + halfWidth} y={y} width={halfWidth} height={height} 
                categories={[
                    // { name: 'border', widthFactor: 0 },
                    { name: 'clay', widthFactor: 0.08 },
                    { name: 'silt', widthFactor: 0.08 },
                    { name: 'vf', widthFactor: 0.08 },
                    { name: 'f', widthFactor: 0.08 },
                    { name: 'm', widthFactor: 0.08 },
                    { name: 'c', widthFactor: 0.08 },
                    { name: 'vc', widthFactor: 0.08 },
                    { name: 'gran', widthFactor: 0.08 },
                    { name: 'pebb', widthFactor: 0.08 },
                    { name: 'cobb', widthFactor: 0.08 },
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
                    const newWidth = node.x() - x + dragHandleWidth;

                    onResize(columnIndex, newWidth);
                }}
            />
        </Group>
    );
};

export default HeaderComponent;