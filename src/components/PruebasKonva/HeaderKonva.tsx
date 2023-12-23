import { Rect, Text, Group } from "react-konva";

// Barras de desplazamiento
const dragHandleWidth = 5;
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

const HeaderComponent = ({ columnIndex, x, y, width, height, frozenColumns, onResize }) => {
    const text = columnIndex < frozenColumns ? "S/No" : `Header ${columnIndex}`;
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
                width={width}
                text={text}
                fontStyle="bold"
                verticalAlign="middle"
                align="center"
            />
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