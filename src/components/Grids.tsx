import React from 'react';
import { Rect, Layer, Text } from 'react-konva';
import { useRef } from 'react';
import Konva from 'konva';


const Grid = ({ polygon, index, setText, text}) => {
  const cellSize = 100; // Tamaño de cada celda de la cuadrícula
  const polygonColumnWidth = 400; // Ancho de la columna de polígonos
  const marginLeft = 100; // Margen a la izquierda de la tabla
  const cellHeight = polygon ? polygon.y2 - polygon.y1 : cellSize;

  const cells = [];

  const arcillaRef = useRef<Konva.Text | null>(null);

  const handleDoubleClick = (textRef) => {
    if (textRef.current) {
      textRef.current.hide();
      const stage = textRef.current.getStage();
      if (!stage) return;

      const textPosition = textRef.current.getAbsolutePosition();
      const stageBox = stage.container().getBoundingClientRect();
      const areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
      };

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      textarea.value = textRef.current.text();
      textarea.style.position = 'absolute';
      textarea.style.top = areaPosition.y + 'px';
      textarea.style.left = areaPosition.x + 'px';
      textarea.style.width = cellSize+'px';
      textarea.style.height = cellHeight+'px';
      textarea.style.fontSize = textRef.current.fontSize() + 'px';
      textarea.style.border = 'none';
      textarea.style.padding = '0px';
      textarea.style.margin = '0px';
      textarea.style.overflow = 'hidden';
      textarea.style.background = 'none';
      textarea.style.overflow = 'auto';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.fontFamily = textRef.current.fontFamily();
      textarea.style.transformOrigin = 'left top';
      textarea.style.textAlign = textRef.current.align();
      textarea.style.color = textRef.current.fill();

      textarea.focus();

      textarea.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
          
          const copia = { ...text };
          copia[0].arcilla = textarea.value;
          console.log(textRef.current.text());
          setText(copia,true);
          textRef.current!.text(textarea.value);
          document.body.removeChild(textarea);
          textRef.current.show();
          stage.batchDraw();
        }
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

  const additionalColumns = ['Sistema','Edad','Formación','Miembro','Espesor(m)','Litología','Arcilla', 'Limo', 'Arena', 'Grava','Estructuras \n y/o fósiles','Facie','Ambiente \n depositacional','Descripción'];
  let xOffset = marginLeft + polygonColumnWidth;
  additionalColumns.forEach((column, index) => {
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
        align="center" // Alineación del texto
       // verticalAlign="middle"
        fontSize={14}
        fill="black"></Text>
    );
  

    // Agregar el texto de la columna
    cells.push(
      <Rect
        key={`row-${index}-${column}`}
        x={xOffset}
        y={polygon.y1}
        width={cellSize}
        height={polygon.y2-polygon.y1}
        fill="white"
        stroke="black"
      />
    );
    
    xOffset += cellSize;
  });

  

  cells.push(
    <Rect
      key={`row-1`}
      x={marginLeft}
      y={polygon.y1}
      width={polygonColumnWidth}
      height={cellHeight}
      fill="white"
      stroke="black"
    />
  );


  xOffset = marginLeft + polygonColumnWidth;


  // Agregar celdas para las columnas adicionales (dejar en blanco si no hay polígono)
  additionalColumns.forEach((column) => {
    if (column === 'Arcilla') {

      cells.push(
        <div >
          <Text 
            ref={arcillaRef}
            x={xOffset}
            y={polygon.y1}
            rotation={0}
            height={cellHeight}
            width={cellSize}
            text={text[0].arcilla}
            fontSize={18}
            onDblClick={(e) => handleDoubleClick(arcillaRef)}
            onTap={(e) => handleDoubleClick(arcillaRef)}
        />
      </div>
      );
      }
    xOffset += cellSize;
      
  });

  return (
    <Layer>
      {cells}
    </Layer>
  );
};

export default Grid;
