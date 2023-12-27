import { useRef, useState, useCallback} from "react";
import Grid, { Cell as DefaultCell, useSelection, useEditable, useSizer as useAutoSizer } from "@rowsncolumns/grid";
//import { Rect, Text, Group, RegularPolygon } from "react-konva";


const width = 1000;
const height = 600;

const App = () => {
    const [data, setData] = useState({
        "1,2": "Hello lorem ipsum lorem",
        "1,1": "Select editor",
        "2,3": "Cannot be edited",
        "30,4": "lorem asd asd as das dasd asd as da sdasdasda",
        "2,15": "lorem asd asd as das dasd asd as da sdasdasda",
        "100,80": "asdhasd asd asd asd as dasdas",
    });
    
    const rowCount = 200;
    const columnCount = 200;
    const gridRef = useRef(null);
    const getCellValue = useCallback(
        ({ rowIndex, columnIndex }) => data[`${rowIndex},${columnIndex}`],
        [data]
    );
    const frozenRows = 2;
    const frozenColumns = 2;
    const rowHeight = useCallback(() => 20, []);
    const columnWidth = useCallback(() => 100, []);


    const { activeCell, selections, setActiveCell, ...selectionProps } = useSelection({
        gridRef,
        rowCount,
        columnCount,
        getValue: getCellValue, // Add the missing getValue property
        
        // Copia lo que tenga marcado 
        // onFill: (activeCell, fillSelection) => {
        //     console.log('aa', activeCell, fillSelection)
        //     if (!fillSelection) return;
        //     const { bounds } = fillSelection;
        //     const changes = {};
        //     const value = getCellValue(activeCell);
        //     for (let i = bounds.top; i <= bounds.bottom; i++) {
        //         for (let j = bounds.left; j <= bounds.right; j++) {
        //             changes[`${i},${j}`] = value; // Fix the index type error
        //         }
        //     }
        //     setData((prev) => ({ ...prev, ...changes }));
        // },
    });

    
    const { editorComponent, editingCell, isEditInProgress, ...editableProps } = useEditable({
        rowCount,
        columnCount,
        gridRef,
        getValue: getCellValue,
        selections,
        frozenRows,
        frozenColumns,
        activeCell,
        onDelete: (activeCell, selections) => {
            console.log('On delete');
            if (selections.length) {
                const newValues = selections.reduce((acc, { bounds: sel }) => {
                    for (let i = sel.top; i <= sel.bottom; i++) {
                        for (let j = sel.left; j <= sel.right; j++) {
                            acc[`${i},${j}`] = "";
                        }
                    }
                    return acc;
                }, {});
                setData((prev) => ({ ...prev, ...newValues }));
                const selectionBounds = selections[0].bounds;

                gridRef.current.resetAfterIndices(
                    {
                        columnIndex: selectionBounds.left,
                        rowIndex: selectionBounds.top,
                    },
                    true
                );
            } else if (activeCell) {
                setData((prev) => {
                    return {
                        ...prev,
                        [`${activeCell.rowIndex},${activeCell.columnIndex}`]: "",
                    };
                });
                gridRef.current.resetAfterIndices(activeCell);
            }
        },
        canEdit: ({ rowIndex, columnIndex }) => {
            console.log('Can edit', columnIndex, rowIndex );
            if (rowIndex === 2 && columnIndex === 3) return false;
            return true;
        },
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
        isHiddenRow: () => false, // Add the missing isHiddenRow property
        isHiddenColumn: () => false, // Add the missing isHiddenColumn property
    });

    return (
        <div style={{ position: "relative" }}>
            <Grid
                frozenColumns={frozenColumns}
                frozenRows={frozenRows}
                width={width}
                height={height}
                columnCount={100}
                rowCount={100}
                ref={gridRef}
                activeCell={activeCell}
                selections={selections}
                columnWidth={columnWidth}
                showFillHandle={!isEditInProgress}
                itemRenderer={(props) => {
                    console.log(props)
                    return <DefaultCell
                        value={data[`${props.rowIndex},${props.columnIndex}`]}
                        align="left"
                        {...props}
                    />
                    
                }}
                rowHeight={rowHeight}
                {...selectionProps}
                {...editableProps}
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