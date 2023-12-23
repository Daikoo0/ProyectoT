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


const Grid = ({ polygon, setText, text, config, dragUrl, sendConfig, columnWidths, setColumnWidths }) => {
  const cellSize = 110; // Tamaño de cada celda de la cuadrícula
  const polygonColumnWidth = 300; // Ancho de la columna de polígonos
  const marginLeft = 100; // Margen a la izquierda de la tabla
  const cellHeight = polygon ? polygon.polygon.y2 - polygon.polygon.y1 : cellSize;
  const cells = [];
  const RETURN_KEY = 13;
  const ESCAPE_KEY = 27;
  const additionalColumns = ['Arcilla-Limo-Arena-Grava', 'Estructuras y/o fósiles', 'Sistema', 'Edad', 'Formación', 'Miembro', 'Facie', 'Ambiente depositacional', 'Descripción'];

  const gridRef = useRef(null);


  const ondragst = (e,initialPosition) => {
    initialPosition.current = { ...e.target.position() };
  }

  const handleDragMove = (e,column,initialPosition, xOffset) => {

    const speedFactor = 1000;

    // Multiplica las coordenadas del objeto por el factor de velocidad
    const newX = e.target.x() + e.target.getStage().getPointerPosition().dx * speedFactor;
    
    e.target.x(newX);

    requestAnimationFrame(() => {
      const deltaX = e.evt.movementX;
      setColumnWidths((prev) => ({
        ...prev,
        [column]:  prev[column] + deltaX,
      }));
    });
  };

  const DraggableRect = (props) => {
    
    
    const initialPosition = useRef({ x: props.x, y: 0 }); 

    return (
      <Rect
        fill="blue"
        dragVelocity={99999999999999}
        draggable
        hitStrokeWidth={0}
        dragDistance={1}
        onMouseEnter={() => (document.body.style.cursor = "ew-resize")}
        onMouseLeave={() => (document.body.style.cursor = "default")}
        onDragStart={(e) => ondragst(e,initialPosition)}
        dragThrottle={0.00002}
        onDragMove={(e) => handleDragMove(e,props.column,initialPosition,xOffset)}
        onDragEnd={(e) => console.log(e)}
        dragBoundFunc={(pos) => {
          return {
            x : pos.x,
            y: 0,
          };
        }}
        {...props}
      />
    );
  };

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
            width: columnWidths[props.column],
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
          fill="white"
          stroke="black"
          ref={gridRef}
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


  let xOffset = marginLeft + polygonColumnWidth + 150;

  additionalColumns.forEach((column, index) => {


    if (config.config.columns[column].enabled
      && column !== 'Estructuras y/o fósiles'
    ) {

      cells.push(
        <Rect
          key={`header-${column}`}
          x={xOffset}
          y={0}
          width={columnWidths[column]}
          height={cellHeight}
          fill="white"
          stroke="black"
        />
      );


      cells.push(
        <DraggableRect
          x={xOffset + columnWidths[column] - 5}
          y={0}
          width={5}
          height={cellHeight}
          column={column}
        />);

      const words = column.split(' ');
      const lineHeight = 14 * 1.5;

      const textElements = words.map((word, index) => (
        <Text
          key={`text-${column}-${index}`}
          x={xOffset + columnWidths[column] / 8}
          y={cellSize / 5 + index * lineHeight} // Ajustamos la posición 'y' para cada palabra.
          text={word}
          fontSize={14}
          fill="black"
        />
      ));

      cells.push(...textElements);

      cells.push(

        <StickyNote
          column={column}
          x={xOffset}
          y={polygon.polygon.y1}
          width={columnWidths[column]}
          height={cellHeight}
          text={text[column].content}
          vertical={text[column].vertical}
        />

      );

      xOffset += columnWidths[column];
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



  return (
    <>
      {cells}
    </>


  );
};

export default Grid;