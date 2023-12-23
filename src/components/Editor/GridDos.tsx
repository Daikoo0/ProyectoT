import { useRef, useState } from "react";
import Grid from "@rowsncolumns/grid";
import { Rect, Text, Group, Circle } from "react-konva";
import HeaderKonva from "../PruebasKonva/HeaderKonva";

// Celdas
const Cell = ({
  rowIndex,
  columnIndex,
  x,
  y,
  width,
  height,
  key,
}) => {
  const text = `${rowIndex}x${columnIndex}`;
  const fill = "white";
  return (
    <>
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
        fontStyle="normal"
        verticalAlign="middle"
        align="center"
      />
      
    </>
  );
};

const columnCount = 10;
const rowCount = 10;

const GridDos = () => {
  const width = 1000;
  const height = 500;
  const gridRef = useRef(null);
  const mainGridRef = useRef(null);
  const frozenColumns = 1; // Indica las columnas que no se mueven

  const [columnWidthMap, setColumnWidthMap] = useState({});

  // 
  const handleResize = (columnIndex, newWidth) => {
    setColumnWidthMap((prev) => {
      return {
        ...prev,
        [columnIndex]: newWidth,
      };
    });
    gridRef.current.resizeColumns([columnIndex]); // Header
    mainGridRef.current.resizeColumns([columnIndex]); // Main Grid
  };

  return (
     <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
    
    <Grid
        columnCount={columnCount}
        height={60}
        rowCount={1}
        frozenColumns={frozenColumns}
        ref={gridRef}
        width={width}
        columnWidth={(index) => {
          if (index in columnWidthMap) return columnWidthMap[index];

          // if (index === 0) return 80;
          // if (index % 3 === 0) return 200;
          return 100;
        }}
        rowHeight={(index) => {
          //if (index % 2 === 0) return 40;
          return 60;
        }}
        showScrollbar={false}
        itemRenderer={(props) => {
          console.log(props);
          return <HeaderKonva
            x={0}
            columnIndex={0}
            y={0}
            width={0}
            height={0}
            onResize={handleResize}
            frozenColumns={frozenColumns}
            {...props}
          />
        }}
      />

      {/* Main Grid */}
      <Grid
        columnCount={columnCount} // Número de columnas
        rowCount={rowCount} // Número de filas
        frozenColumns={frozenColumns} // Indica las columnas que no se mueven

        //Dimensiones 
        height={height}
        width={width}

        ref={mainGridRef} // Referencia para la grid principal

        //Columna
        columnWidth={(index) => {
          if (index in columnWidthMap) return columnWidthMap[index];
          // if (index === 0) return 80;
          // if (index % 3 === 0) return 200;
          return 100;
        }}

        // Fila
        rowHeight={(index) => {
          //if (index % 2 === 0) return 40;
          return 40;
        }}
        // Adapta el scrool para que la celda coincida con el header
        onScroll={({ scrollLeft }) => {
          gridRef.current.scrollTo({ scrollLeft });
        }}
        itemRenderer={Cell}
      />
   </div>
  );
};

export default GridDos;