import React from 'react';

interface GridsProps {
  polygons: [];
}

const Grids: React.FC<GridsProps> = ({ polygons }) => {
  const numRows = polygons.length + 1; // Número total de filas en la tabla de cuadrícula (incluyendo el encabezado)
  const cellSize = 100; // Tamaño de cada celda de la cuadrícula
  const polygonColumnWidth = 450; // Ancho de la columna de polígonos
  const marginLeft = 100; // Margen a la izquierda de la tabla

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: `repeat(${numRows}, ${cellSize}px)`,
    gridTemplateColumns: `${polygonColumnWidth}px repeat(4, auto)`, // Una columna fija para los polígonos, luego 4 columnas adicionales
    width: `calc(100% + ${marginLeft}px)`, // Expandir al ancho total con margen a la derecha
    position: 'absolute',
    zIndex: -1,
    pointerEvents: 'none', // Para que no interfiera con la interacción de las figuras
    marginLeft: `${marginLeft}px`, // Agregar margen a la izquierda
  };


  const cellStyle: React.CSSProperties = {
    border: '1px solid grey',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cells = [];

  // Agregar encabezado en la primera fila
  cells.push(
    <div key={`header`} style={{ ...cellStyle, width: `${polygonColumnWidth}px` }}>
      {'Litología'}
    </div>
  );

  // Agregar encabezado de las columnas adicionales
  const additionalColumns = ['arcilla', 'limo', 'arena', 'grava'];
  additionalColumns.forEach(column => {
    cells.push(
      <div key={`header-${column}`} style={cellStyle}>
        {column}
      </div>
    );
  });

  // Agregar las celdas de la cuadrícula en las filas restantes
  for (let row = 1; row < numRows; row++) {
    const polygon = polygons[row - 1];
    const cellWidth = polygon ? polygon.x2 - polygon.x1 : cellSize;

    cells.push(
      <div
        key={`row-${row}`}
        style={{
          ...cellStyle,
          width: `450px`,
        }}
      >
      </div>
    );

    // Agregar celdas para las columnas adicionales (dejar en blanco si no hay polígono)
    additionalColumns.forEach(column => {
      cells.push(
        <div key={`row-${row}-${column}`} style={cellStyle}>
          {polygon ? '' : ''}
        </div>
      );
    });
  }

  return <div style={gridStyle}>{cells}</div>;
};

export default Grids;
