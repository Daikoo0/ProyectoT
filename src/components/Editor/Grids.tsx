// import React from 'react';
// import { Rect, Text, Image, Group } from 'react-konva';
// import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
// import { Html } from "react-konva-utils";


// const Grid = ({ polygon, setText, text, config, dragUrl, sendConfig, columnWidths, setColumnWidths }) => {
//   const cellSize = 110; // Tamaño de cada celda de la cuadrícula
//   const polygonColumnWidth = 300; // Ancho de la columna de polígonos
//   const marginLeft = 100; // Margen a la izquierda de la tabla
//   const cellHeight = polygon ? polygon.polygon.y2 - polygon.polygon.y1 : cellSize;
//   const cells = [];
//   const RETURN_KEY = 13;
//   const ESCAPE_KEY = 27;
//   const additionalColumns = ['Arcilla-Limo-Arena-Grava', 'Estructuras y/o fósiles', 'Sistema', 'Edad', 'Formación', 'Miembro', 'Facie', 'Ambiente depositacional', 'Descripción'];

//   const ondragst = useCallback((e, initialPosition) => {
//     initialPosition.current = { ...e.target.position() };
//   }, []);

//   const handleDragMove = useCallback((e, column, initialPosition) => {


//     requestAnimationFrame(() => {
//       const deltaX = e.evt.movementX;
//       setColumnWidths((prev) => ({
//         ...prev,
//         [column]:  prev[column] + deltaX,
//       }));
//     });
//   }, [setColumnWidths]);


//   // Define manejadores de eventos fuera del cuerpo de DraggableRect
// const handleMouseEnter = useCallback(() => {
//   document.body.style.cursor = "ew-resize";
// }, []);

// const handleMouseLeave = useCallback(() => {
//   document.body.style.cursor = "default";
// }, []);

// const handleDragEnd = useCallback((e) => {
//   console.log(e);
// }, []);

// const dragBoundFunc = useCallback((pos) => {
//   return {
//     x: pos.x,
//     y: 0
//   };
// }, []);

// const DraggableRect = useMemo(() => {
//   return (props) => (
//     <Rect
//       fill="blue"
//       draggable
//       hitStrokeWidth={30}
//       dragDistance={1}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//       onDragStart={(e) => ondragst(e, props.initialPosition)}
//       dragThrottle={0.00002}
//       onDragMove={(e) => handleDragMove(e, props.column, props.initialPosition)}
//       onDragEnd={handleDragEnd}
//       dragBoundFunc={dragBoundFunc}
//       {...props}
//     />
//   );
// }, [ondragst, handleDragMove, handleMouseEnter, handleMouseLeave, handleDragEnd, dragBoundFunc]);


//   const StickyNote = useCallback((props) => {
//     const [isEditing, setIsEditing] = useState(false);
//     const [content, setContent] = useState(props.text);
  
//     const handleChange = (newText) => {
//       setContent(newText.currentTarget.value);
//     };
  
//     const handleBlur = () => {
//       const copia = { ...text };
//       copia[props.column].content = content;
//       setText(copia, true);
//     };
  
//     const handleKeyDown = (e) => {
//       if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
//         setIsEditing(false);
//       }
//     };
  
//     const renderTextComponent = () => {
//       if (isEditing) {
//         return (
//           <Html
//             groupProps={{ x: 0, y: 0 }}
//             divProps={{ style: textAreaDivStyle }}
//           >
//             <textarea
//               style={{ ...textAreaStyle, width: columnWidths[props.column], height: cellHeight }}
//               value={content}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               onKeyDown={handleKeyDown}
//             />
//           </Html>
//         );
//       } else {
//         return (
//           <Text
//             {...textProps}
//             x={0}
//             y={props.vertical ? cellHeight : 0}
//             text={props.text}
//             onDblClick={() => setIsEditing(true)}
//             width={props.width}
//             height={props.height}
//           />
//         );
//       }
//     };
  
//     return (
//       <Group x={props.x} y={props.y}>
//         <Rect {...rectProps} x={0} y={0} width={props.width} height={props.height} />
//         {renderTextComponent()}
//       </Group>
//     );
//   }, [setText, columnWidths, cellHeight, text]);
  
//   // Estilos fuera del componente
//   const textAreaDivStyle = {
//     width: '100%',
//     height: '100%',
//     overflow: 'hidden',
//     background: 'none',
//     outline: 'none',
//     border: 'none',
//     padding: '0px',
//     margin: '0px',
//   };
  
//   const textAreaStyle = {
//     background: 'none',
//     border: 'none',
//     padding: '0px',
//     margin: '0px',
//     outline: 'none',
//     overflow: 'auto',
//     fontSize: '18px',
//     fontFamily: 'sans-serif',
//     color: 'black',
//   };
  
//   const textProps = {
//     fill: 'black',
//     fontFamily: 'sans-serif',
//     fontSize: 18,
//     rotation: 0, // Este valor puede ajustarse si es necesario
//   };
  
//   const rectProps = {
//     fill: 'white',
//     stroke: 'black',
//   };
  

//   // Agregar encabezado en la primera fila
//   const headerCell = useMemo(() => (
//     <Rect
//       key={`header`}
//       x={marginLeft}
//       y={0}
//       width={polygonColumnWidth}
//       height={cellHeight}
//       fill="white"
//       stroke="black"
//     />
//   ), [polygonColumnWidth, cellHeight, marginLeft]);

//   cells.push(headerCell);

  

//   const additionalColumnCells = useMemo(() => {
//     const columnCells = [];
//     let xOffset = marginLeft + polygonColumnWidth + 150;
//     additionalColumns.forEach((column, index) => {


//   //additionalColumns.forEach((column, index) => {


//     if (config.config.columns[column].enabled
//       && column !== 'Estructuras y/o fósiles'
//     ) {

//       columnCells.push(
//         <Rect
//           key={`header-${column}`}
//           x={xOffset}
//           y={0}
//           width={columnWidths[column]}
//           height={cellHeight}
//           fill="white"
//           stroke="black"
//         />
//       );


//       columnCells.push(
//         <DraggableRect
//           x={xOffset + columnWidths[column] - 5}
//           y={0}
//           width={5}
//           height={cellHeight}
//           column={column}
//         />);

//       const words = column.split(' ');
//       const lineHeight = 14 * 1.5;

//       const textElements = words.map((word, index) => (
//         <Text
//           key={`text-${column}-${index}`}
//           x={xOffset + columnWidths[column] / 8}
//           y={cellSize / 5 + index * lineHeight} // Ajustamos la posición 'y' para cada palabra.
//           text={word}
//           fontSize={14}
//           fill="black"
//         />
//       ));

//       columnCells.push(...textElements);

//       columnCells.push(

//         <StickyNote
//           column={column}
//           x={xOffset}
//           y={polygon.polygon.y1}
//           width={columnWidths[column]}
//           height={cellHeight}
//           text={text[column].content}
//           vertical={text[column].vertical}
//         />

//       );

//       xOffset += columnWidths[column];
//     }


//   }
//   );

  


//   columnCells.push(
//     <Rect
//       key={`row-1`}
//       x={marginLeft}
//       y={polygon.polygon.y1}
//       width={polygonColumnWidth}
//       height={cellHeight}
//       fill="white"
//       stroke="black"
//     />
//   );


//   xOffset = marginLeft + polygonColumnWidth;



//   return columnCells;
// }, [additionalColumns]);


// cells.push(...additionalColumnCells);

//   return (
//     <>
//       {cells}
//     </>


//   );
// };

// export default Grid;