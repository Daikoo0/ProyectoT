import React from 'react';
import { Rect, Layer, Text, Image, Group } from 'react-konva';
import { useState, useRef, useMemo, useEffect } from 'react';
import useImage from 'use-image';
import { Html } from "react-konva-utils";

interface StickyNoteProps {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  column: string;
  vertical: boolean;
}

interface ImageComponentProps {
  imageNames: any;
  x: number;
  y: number;
  width: number;
  height: number
}

const Grid = ({ polygon, setText, text, config, dragUrl, sendConfig }) => {
  const cellSize = 110; // Tamaño de cada celda de la cuadrícula
  const polygonColumnWidth = 300; // Ancho de la columna de polígonos
  const marginLeft = 100; // Margen a la izquierda de la tabla
  const cellHeight = polygon ? polygon.polygon.y2 - polygon.polygon.y1 : cellSize;

  const cells = [];

  console.log(config);

  const [highestY2, setHighestY2] = useState(200);


  useEffect(() => {
    setHighestY2(prevHighestY2 => Math.max(prevHighestY2, polygon.polygon.y2));

  }, [polygon.polygon.y2]);


  // Esta es la posición fija de Lexer columna en la cuadrícula
  const fixedColumnPosition = marginLeft + polygonColumnWidth + cellSize;

  const renderFixedColumn = () => {
    return (
      <Group x={fixedColumnPosition} y={0}>
        <Text>Contenido de la columna fija</Text>;
      </Group>
    );
  };


  const ImageComponent: React.FC<ImageComponentProps> = (props) => {
    const groupRef = useRef(null);

    var a = []
    props.imageNames.forEach((imageName, index) => {
      const [img] = useImage(imageName.src);
      const b = <Image
        image={img}
        x={imageName.x}
        y={imageName.y}
        offsetX={img ? img.width / 2 : 0}
        offsetY={img ? img.height / 2 : 0}
      />;
      a.push(b)
    });

    const MyKonvaComponent =
      <Group x={props.x} y={props.y} ref={groupRef}>

        <Html
          groupProps={{ x: 0, y: 0 }}
          divProps={{
            style: {
              width: props.width,
              height: props.height,
              overflow: 'hidden',
              background: 'none',
              outline: 'none',
              border: 'none',
              padding: '0px',
              margin: '0px',
            },
          }}
        >
          <div
            style={{
              width: cellSize,
              height: cellHeight,
              background: 'none',
              border: 'none',
              padding: '0px',
              margin: '0px',
              outline: 'none',
              overflow: 'auto',
              fontSize: '18px',
              fontFamily: 'sans-serif',
              color: 'black',
            }}
            onDrop={(e) => {
              e.preventDefault();
              const copia = { ...config };
              copia.config.columns['Estructuras y/o fósiles'].content.push({
                'x': e.nativeEvent.offsetX,
                'y': e.nativeEvent.offsetY,
                'src': dragUrl.current
              });
              sendConfig(copia, true);
            }}

          />
        </Html>
        {a}
      </Group>

    return (
      MyKonvaComponent
    );
  };


  const URLImage = ({ image }) => {
    const [img] = useImage(image.src);
    return (
      <Image
        image={img}
        x={image.x}
        y={image.y}
        offsetX={img ? img.width / 2 : 0}
        offsetY={img ? img.height / 2 : 0}
        width={30}
        height={30}
        draggable
      />
    );
  };


  const RETURN_KEY = 13;
  const ESCAPE_KEY = 27;


  const additionalColumns = ['Arcilla-Limo-Arena-Grava', 'Estructuras y/o fósiles', 'Sistema', 'Edad', 'Formación', 'Miembro', 'Facie', 'Ambiente depositacional', 'Descripción'];


  const StickyNote: React.FC<StickyNoteProps> = (props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(props.text);

    const textComponent = isEditing ? (
      <Html
        groupProps={{ x: 0, y: 0 }}
        divProps={{
          style: {
            width: props.width,
            height: props.height,
            overflow: 'hidden',
            background: 'none',
            outline: 'none',
            border: 'none',
            padding: '0px',
            margin: '0px',
          },
        }}
      >
        <textarea
          style={{
            width: cellSize,
            height: cellHeight,
            background: 'none',
            border: 'none',
            padding: '0px',
            margin: '0px',
            outline: 'none',
            overflow: 'auto',
            fontSize: '18px',
            fontFamily: 'sans-serif',
            color: 'black',
          }}
          value={content}
          onChange={(newText) => {
            setContent(newText.currentTarget.value);
          }}
          onBlur={() => {
            const copia = { ...text };
            copia[props.column].content = content;
            setText(copia, true);
          }}
          onKeyDown={(e) => {
            if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
              setIsEditing(false);
            }
          }
          }
        />
      </Html>
    ) : (
      <Text
        x={0}
        y={props.vertical ? cellHeight : 0}
        text={props.text}
        fill="black"
        fontFamily="sans-serif"
        fontSize={18}
        rotation={props.vertical ? 270 : 0}
        width={props.width}
        height={props.height}
        onDblClick={(e) => setIsEditing(true)}
      />
    );

    return (
      <Group x={props.x} y={props.y}>
        <Rect
          x={0}
          y={0}
          width={props.width}
          height={props.height}
        />
        {textComponent}
      </Group>
    );
  };

  // Agregar encabezado en la primera fila
  cells.push(
    <Rect
      key={`header`}
      x={marginLeft}
      y={0}
      width={polygonColumnWidth}
      height={cellHeight}
      fill="white"
      stroke="black"
    />
  );

  let xOffset = marginLeft + polygonColumnWidth;

  additionalColumns.forEach((column, index) => {

    if (index == 1
      && config.config.columns['Estructuras y/o fósiles'].enabled
      && column === 'Estructuras y/o fósiles') {

      cells.push(
        <Rect
          key={`header-Estructuras y/o fósiles`}
          x={xOffset}
          y={0}
          width={cellSize}
          height={cellHeight}
          fill="white"
          stroke="black"
        />
      );

      cells.push(
        <Rect
          key={`a`}
          x={xOffset}
          y={100}
          width={cellSize}
          height={highestY2 - 100}
          fill="red"
          stroke="black"
        />
      );

      cells.push(

        <ImageComponent
          imageNames={config.config.columns['Estructuras y/o fósiles'].content}
          x={xOffset}
          y={polygon.polygon.y1}
          width={cellSize}
          height={cellHeight}
        />

      );
      
      xOffset += cellSize;

    } else if (config.config.columns[column].enabled
      && column !== 'Estructuras y/o fósiles' 
      && index !== 1
    ) {

      cells.push(
        <Rect
          key={`header-${column}`}
          x={xOffset}
          y={0}
          width={cellSize}
          height={cellHeight}
          fill="white"
          stroke="black"
        />
      );

      const words = column.split(' ');
      const lineHeight = 14 * 1.5;

      const textElements = words.map((word, index) => (
        <Text
          key={`text-${column}-${index}`}
          x={xOffset + cellSize / 8}
          y={cellSize / 5 + index * lineHeight} // Ajustamos la posición 'y' para cada palabra.
          text={word}
          fontSize={14}
          fill="black"
        />
      ));

      cells.push(...textElements);


      // Agregar el texto de la columna
      cells.push(
        <Rect
          key={`row-${index}-${column}`}
          x={xOffset}
          y={polygon.polygon.y1}
          width={cellSize}
          height={polygon.polygon.y2 - polygon.polygon.y1}
          fill="white"
          stroke="black"
        />
      );

      cells.push(

        <StickyNote
          column={column}
          x={xOffset}
          y={polygon.polygon.y1}
          width={cellSize}
          height={cellHeight}
          text={text[column].content}
          vertical={text[column].vertical}
        />

      );

      xOffset += cellSize;
    }

    
  }

  );


  cells.push(
    <Rect
      key={`row-1`}
      x={marginLeft}
      y={polygon.polygon.y1}
      width={polygonColumnWidth}
      height={cellHeight}
      fill="white"
      stroke="black"
    />
  );


  xOffset = marginLeft + polygonColumnWidth;


  cells.push(renderFixedColumn);


  return (
    <>
      {cells}
    </>


  );
};

export default Grid;