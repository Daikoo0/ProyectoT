import React from 'react';
import { Rect, Layer, Text } from 'react-konva';
import { useRef, useState } from 'react';
import Konva from 'konva';


const Grid = ({ polygon, setText, text}) => {
  const cellSize = 100; // Tamaño de cada celda de la cuadrícula
  const polygonColumnWidth = 300; // Ancho de la columna de polígonos
  const marginLeft = 100; // Margen a la izquierda de la tabla
  const cellHeight = polygon ? polygon.polygon.y2 - polygon.polygon.y1 : cellSize;

  const cells = [];
  const columnRefs = {};

  const handleDoubleClick = (textRef,column,vertical) => {
    if (textRef.current) {
      textRef.current.hide();
      const stage = textRef.current.getStage();
      if (!stage) return;

      const textPosition = textRef.current.getAbsolutePosition();
      const stageBox = stage.container().getBoundingClientRect();
      console.log(stageBox,textPosition);
      var areaPosition;

      if(vertical){
         areaPosition = {
          x: stageBox.left + textPosition.x +150,
          y: stageBox.top + textPosition.y-100,
        };
      }else{
        areaPosition = {
          x: stageBox.left + textPosition.x+150,
          y: stageBox.top + textPosition.y,
        };
      }


      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
       textarea.value = textRef.current.text();
       textarea.style.position = 'absolute';
       textarea.style.top = stageBox.top + polygon.polygon.y1+ 'px';
       textarea.style.left =  stageBox.left + textRef.current.getAbsolutePosition().x + 'px';
       textarea.style.width = cellSize -2 +'px';
       textarea.style.height = cellHeight -2 +'px';
       textarea.style.background = 'none';
       textarea.style.overflow = 'auto';
       textarea.style.color = textRef.current.fill();
       if(vertical){
        textarea.style.transform = 'rotate(270deg)';
       // textarea.style.top = areaPosition.y + cellSize-1 + 'px';
        textarea.style.width = polygon.polygon.height
      }
     textarea.focus();

      textarea.addEventListener('blur', (e) => {
          
          const copia = { ...text };
          copia[column].content = textarea.value;
          console.log(textRef.current.text());
          setText(copia,true);
          textRef.current!.text(textarea.value);
          stage.batchDraw();
          document.body.removeChild(textarea);
          textRef.current.show();
      });
    }
  };

  // Agregar encabezado en la primera fila
  cells.push(
    <Rect
      key={`header`}
      x={marginLeft}
      y={0}
      width={polygonColumnWidth}
      height={cellHeight}
      fill="grey"
      stroke="black"
    />
  );

  const additionalColumns = ['Sistema','Edad','Formación','Miembro','Arcilla-Limo-Arena-Grava','Facie','Ambiente depositacional','Descripción','Estructuras y/o fósiles'];

  //const additionalColumns = Object.keys(text).filter(key => text[key].enabled === true);

  let xOffset = marginLeft + polygonColumnWidth;
  additionalColumns.forEach((column, index) => {

   if(text[column].enabled){ 
    cells.push(
      <Rect
        key={`header-${column}`}
        x={xOffset}
        y={0}
        width={cellSize}
        height={cellHeight}
        fill="grey"
        stroke="black"
      />
    );

    cells.push(
      <Text
        key={`text-${column}`}
        x={xOffset + cellSize / 2} // Alineación horizontal en el centro de la celda
        y={cellSize / 2} // Alineación vertical en el centro de la celda
        text={column}
       // verticalAlign="middle"
        fontSize={14}
        fill="black"></Text>
    );
  

    // Agregar el texto de la columna
    cells.push(
      <Rect
        key={`row-${index}-${column}`}
        x={xOffset}
        y={polygon.polygon.y1}
        width={cellSize}
        height={polygon.polygon.y2-polygon.polygon.y1}
        fill="white"
        stroke="black"
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


  // Agregar celdas para las columnas adicionales (dejar en blanco si no hay polígono)
  additionalColumns.forEach((column) => {

  
   if (!columnRefs[column]) {
    columnRefs[column] = useRef(null);
   }

   if(text[column].enabled){

  if(text[column].vertical){
      cells.push(
          <Text 
            ref={columnRefs[column]}
            x={xOffset+1}
            y={polygon.polygon.y1+cellHeight}
            rotation={270}
            height={cellHeight}
            width={cellSize}
            text={text[column].content}
            fontSize={18}
            onDblClick={(e) => handleDoubleClick(columnRefs[column],column,text[column].vertical)}
            onTap={(e) => handleDoubleClick(columnRefs[column],column,text[column].vertical)}
        />
      );
  
    xOffset += cellSize;

  }
  
  if(!text[column].vertical){

    cells.push(
      <Text 
        ref={columnRefs[column]}
        x={xOffset+1}
        y={polygon.polygon.y1}
        rotation={0}
        height={cellHeight}
        width={cellSize}
        text={text[column].content}
        fontSize={18}
        onDblClick={(e) => handleDoubleClick(columnRefs[column],column,text[column].vertical)}
        onTap={(e) => handleDoubleClick(columnRefs[column],column,text[column].vertical)}
    />
  );

  xOffset += cellSize;
  }   
  }
}

  );

  return (
    <Layer>
      {cells}
    </Layer>
  );
};

export default Grid;
