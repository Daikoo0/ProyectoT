import { useRef, useState, useCallback } from "react";
import Grid, { Cell as DefaultCell, useSelection, useEditable } from "@rowsncolumns/grid";
import { Rect, Text, Group, Circle } from "react-konva";
import HeaderKonva from "../PruebasKonva/HeaderKonva";
import Polygon2 from "./Polygon2";




// Componente de Celda Personalizado
const Cell = ({ rowIndex, columnIndex, x, y, width, height, value }) => {
  //const text = `${rowIndex}x${columnIndex}`;
  const fill = "white";
  // Aquí puedes añadir más lógica según tus necesidades
  return (
    <>
      {/* <Rect x={x} y={y} height={height} width={width} fill={fill} stroke="grey" strokeWidth={0.5} /> */}
      {/* <Text x={x} y={y} height={height} width={width} text={value} fontStyle="normal" verticalAlign="middle" align="center" /> */}
      <Polygon2
        x={x}
        y={y}
        Width={width}
        Height={height}
        Tension={0.5}
        //circles={dataCircle}
        setCircles={() => console.log("Cambio de circulos")}
        onClick={() => console.log("Click en poligono")}

      />

      {/* <Circle x={x} y={y} radius={10} fill="red" stroke="grey" strokeWidth={0.5} draggable /> */}
    </>
  );
};

const App = () => {
  // Estados y Refs
  // Estado para los datos de la grilla
  const [data, setData] = useState({
    // Estructura inicial de los datos
    "4,2": "Contenido de la celda",
    "2,2": "Cocos"
  });

  const width = 1700;
  const height = 800;

  //const rowCount = 5;

  const [rowCount, setRowCount] = useState(5);
  const columnCount = 8;

  const gridRef = useRef(null);
  const frozenRows = 1;

  // Estado para el ancho de las columnas
  const [columnWidthMap, setColumnWidthMap] = useState({});

  // Referencia a la grilla principal


  const getCellValue = useCallback(
    ({ rowIndex, columnIndex }) => data[`${rowIndex},${columnIndex}`],
    [data]
  );

  // Funciones de selección y edición (del primer código)
  const { activeCell, selections, setActiveCell, ...selectionProps } = useSelection({
    gridRef,
    rowCount,
    columnCount,
    getValue: ({ rowIndex, columnIndex }) => data[`${rowIndex},${columnIndex}`],
    // Otras funciones opcionales como onFill, onSelect, etc.
  });

  const { editorComponent, editingCell, isEditInProgress, ...editableProps } = useEditable({
    rowCount,
    columnCount,
    gridRef,
    selections,
    activeCell,
    getValue: getCellValue,
    onSubmit: (value, { rowIndex, columnIndex }, nextActiveCell) => {
      console.log('On submit');
      console.log(data)
      setData((prev) => ({ ...prev, [`${rowIndex},${columnIndex}`]: value }));
      gridRef.current.resizeColumns([columnIndex]);

      /* Select the next cell */
      if (nextActiveCell) {
        setActiveCell(nextActiveCell);
      }
    },
    canEdit: ({ rowIndex, columnIndex }) => {
      console.log('Can edit', columnIndex, rowIndex);
      if (rowIndex === 0) return false;
      return true;
    },
    onDelete: (activeCell, selections) => {
      // console.log(selections);
      // if (selections.length) {
      //   const newValues = selections.reduce((acc, { bounds: sel }) => {
      //     for (let i = sel.top; i <= sel.bottom; i++) {
      //       for (let j = sel.left; j <= sel.right; j++) {
      //         acc[`${i},${j}`] = "";
      //       }
      //     }
      //     return acc;
      //   }, {});
      //   setData((prev) => ({ ...prev, ...newValues }));
      //   const selectionBounds = selections[0].bounds;

      //   gridRef.current.resetAfterIndices(
      //     {
      //       columnIndex: selectionBounds.left,
      //       rowIndex: selectionBounds.top,
      //     },
      //     true
      //   );
      // } else 
      if (activeCell) {
        setData((prev) => {
          return {
            ...prev,
            [`${activeCell.rowIndex},${activeCell.columnIndex}`]: "",
          };
        });
        gridRef.current.resetAfterIndices(activeCell);
      }
    },
    isHiddenRow: () => false, // Add this property
    isHiddenColumn: () => false, // Add this property
  });

  // Manejo de redimensionamiento de columnas (del segundo código)
  const handleResize = (columnIndex, newWidth) => {
    // Actualiza el estado para reflejar el nuevo ancho de la columna
    setColumnWidthMap(prevWidthMap => ({
      ...prevWidthMap,
      [columnIndex]: newWidth
    }));

    // Asegúrate de que ambos, la grilla principal y el encabezado, se actualizan
    gridRef.current.resizeColumns([columnIndex]);
    //headerGridRef.current.resizeColumns([columnIndex]);
  };

  const {
    nextFocusableCell,
    makeEditable,
    setValue,
    hideEditor,
    showEditor,
    submitEditor,
    cancelEditor,
    ...safeProps
  } = editableProps;


  const addShape = (id,x,y,height,width) => {

    // const send = {
    //   action: "Add",
    //   id : ,
    //   x : ,
    //   y : ,
    //   height : ,
    //   width : ,
    // }
    // //console.log(send)
    // socket.send(JSON.stringify(send));

  }

  // Renderizado de la Grilla
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header Grid */}
      {/* <Grid
        ref={headerGridRef} // Referencia para manipular el encabezado desde otros componentes
        columnCount={columnCount} // Número total de columnas
        rowCount={1} // Solo una fila para el encabezado
        width={width} // Ancho del encabezado, normalmente igual al de la grilla principal
        height={60} // Altura del encabezado
        columnWidth={(index) => columnWidthMap[index] || 100} // Ancho de la columna, obtenido del estado
        rowHeight={() => 60} // Altura de las filas en el encabezado
        showScrollbar={false} // Esconder la barra de desplazamiento para el encabezado
        itemRenderer={(props) => {
          // Renderizador personalizado para las celdas del encabezado
          return <HeaderKonva
            {...props}
            onResize={handleResize} // Función para manejar el redimensionamiento de las columnas
            frozenColumns={frozenColumns} // Número de columnas congeladas
          />
        }}
        // onScroll={({ scrollLeft }) => {
        //   // Sincronizar el desplazamiento horizontal con la grilla principal
        //   gridRef.current.scrollTo({ scrollLeft });
        // }}
      /> */}

      {/* Main Grid */}
      <button onClick={addShape}>aaaaaaaaaaaaaaaaaaaaaaaagregar capa</button>
      <Grid
        ref={gridRef} // Referencia para manipular la grilla principal desde otros componentes
        width={width} // Ancho Stage
        height={height} // Altura Stage
        columnCount={columnCount} // Número total de columnas
        rowCount={rowCount} // Número total de filas
        frozenRows={frozenRows}
        columnWidth={(index) => columnWidthMap[index] || 200} // Ancho de las columnas, obtenido del estado
        rowHeight={(index) => {
          if (index === 0) return 80;
          return 100;
        }}
        //rowHeight={() => 40} // Altura de las filas en la grilla principal
        activeCell={activeCell}
        //frozenColumns={frozenColumns} // Número de columnas congeladas

        //itemRenderer={Cell} // Renderizador personalizado para las celdas de la grilla
        itemRenderer={(props) => {
          if (props.rowIndex === 0) {

            // Renderizar el Encabezado para la primera fila
            return (
              <HeaderKonva

                onResize={handleResize}
                {...props}
              />
            )
          } else {
            // Renderizar celdas normales para el resto de la grilla

            if (props.columnIndex === 1) {
              console.log(props)
              return (
                <Cell
                  value={data[`${props.rowIndex},${props.columnIndex}`]}
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  {...props}
                />
              );
            } else {
              return (
                <DefaultCell
                  value={data[`${props.rowIndex},${props.columnIndex}`]}
                  align="center"
                  fill="white"
                  stroke="blue"
                  fontSize={12}
                  {...props}
                />
              );
            }


            // <Cell
            //   value={data[`${props.rowIndex},${props.columnIndex}`]}
            //   height={props.height}
            //   x={props.x}
            //   y={props.y} 
            //   width={props.width}
            //   {...props}
            // />

          }
        }}
        //{...selectionProps} // Propiedades del hook useSelection
        //{...editableProps} // Editar lo que esta en la celda
        {...safeProps}
        //showFillHandle={!isEditInProgress} // Mostrar el controlador de relleno si no se está editando

        //Permite el cuadro azul que muestra la selección
        onKeyDown={(...args) => {
          selectionProps.onKeyDown(...args);
          editableProps.onKeyDown(...args);
        }}
        onMouseDown={(...args) => {
          selectionProps.onMouseDown(...args);
          editableProps.onMouseDown(...args);
        }}
      />

      {editorComponent}

    </div>
  );
};

export default App;
