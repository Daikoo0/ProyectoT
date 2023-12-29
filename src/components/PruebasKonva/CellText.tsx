import { Rect, Text } from 'react-konva';

interface CellTextProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    columnIndex?: number;
    value?: string;

}

const CellText: React.FC<CellTextProps> = ({ x, y, width, height, value }) => {
    //const text = `${rowIndex}x${columnIndex}`;
    const fill = "white";
    // Aquí puedes añadir más lógica según tus necesidades
    return (
        <>
            <Rect x={x} y={y} height={height} width={width} fill={fill} stroke="grey" strokeWidth={1} />
            <Text
                x={x}
                y={y}
                height={height}
                width={width}
                text={value}

                fill="black" // Color de letra
                //stroke="blue" // Color del borde 
                fontSize={12} // Tamaño de fuente	
                align="right" // left: Izquierda, center: Centro, right: Derecha
                verticalAlign="middle" // top: Arriba, middle: Centro, bottom: Abajo
                wrap="word" // word, char, none
                fontStyle="bold" // normal, bold, italic, bold italic - Cursiva, negrita, etc.
                fontFamily="Arial" // Fuente de letra, Arial, Courier, Georgia, Times, Verdana, etc.
                padding={5} // Espacio entre el texto y el borde de la celda
                fontVariant="normal" // normal, small-caps
                textDecoration="none" // none, underline, line-through, underline line-through
                direction="ltr" // inherit, ltr, rtl
            />
        </>
    );
};

export default CellText;