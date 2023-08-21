import React from 'react';
import { Rect, Layer, Text } from 'react-konva';

interface Polygon {
  x1: number;
  y1: number;
  x2: number;
}

interface GridsProps {
  polygons: Polygon[];
}

const Grids: React.FC<GridsProps> = ({ polygons }) => {
  const numRows = polygons.length + 1; // Número total de filas en la tabla de cuadrícula (incluyendo el encabezado)
  const cellSize = 100; // Tamaño de cada celda de la cuadrícula
  const polygonColumnWidth = 450; // Ancho de la columna de polígonos
  const marginLeft = 100; // Margen a la izquierda de la tabla

  const cells = [];

 
  // Agregar encabezado en la primera fila
  cells.push(
    <Rect
      key={`header`}
      x={marginLeft}
      y={0}
      width={polygonColumnWidth}
      height={cellSize}
      fill="grey"
      stroke="black"
    />
  );

  const additionalColumns = ['Arcilla', 'Limo', 'Arena', 'Grava'];
  let xOffset = marginLeft + polygonColumnWidth;
  additionalColumns.forEach(column => {
    cells.push(
      <Rect
        key={`header-${column}`}
        x={xOffset}
        y={0}
        width={cellSize}
        height={cellSize}
        fill="grey"
        stroke="black"
      />
    );

    // Agregar el texto de la columna
    cells.push(
      <Text
        key={`text-${column}`}
        x={xOffset + cellSize / 2} // Alineación horizontal en el centro de la celda
        y={cellSize / 2} // Alineación vertical en el centro de la celda
        text={column}
        align="center" // Alineación del texto
       // verticalAlign="middle"
        fontSize={14}
        fill="black"
      />
      
      // Incrementar el desplazamiento x
      
      
    );
    xOffset += cellSize;

    
  });

  for (let row = 1; row < numRows; row++) {
    const y = row * cellSize;
    const polygon = polygons[row - 1];
    const cellWidth = polygon ? polygon.x2 - polygon.x1 : cellSize;

    cells.push(
      <Rect
        key={`row-${row}`}
        x={marginLeft}
        y={y}
        width={polygonColumnWidth}
        height={cellSize}
        fill="white"
        stroke="black"
      />
    );

    xOffset = marginLeft + polygonColumnWidth;
    // Agregar celdas para las columnas adicionales (dejar en blanco si no hay polígono)
    additionalColumns.forEach(column => {
      cells.push(
        <Rect
          key={`row-${row}-${column}`}
          x={xOffset}
          y={y}
          width={cellSize}
          height={cellSize}
          fill="white"
          stroke="black"
        />
      );
      xOffset += cellSize;
    });
  }
  

  return (
    <Layer>
      {cells}
    </Layer>
  );
};

export default Grids;
