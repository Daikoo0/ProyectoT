import { useState, useRef } from "react";
import Polygon from "./Polygon4";
import Fosil from "../Editor/Fosil";
import lithoJson from '../../lithologic.json';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import { useReactToPrint } from "react-to-print"
import { string } from "prop-types";

const Tabla = ({ sendActionCell, setEditingUsers, editingUsers, data, header, scale, addCircles, setSideBarState, setRelativeX, fossils, setIdClickFosil, openModalPoint, handleClickRow, setColumnWidths, columnWidths }) => {

    const cellWidth = 150;
    const cellMinWidth = 100;
    const cellMaxWidth = 500;
    const tableref = useRef(null);
    console.log(editingUsers)
    const handlePrint = useReactToPrint({

        documentTitle: "Print This Document",
        content: () => tableref.current,
        onBeforePrint: () => { },
        onAfterPrint: () => console.log("after printing..."),
        removeAfterPrint: true,
        pageStyle: `
        @media print {
            @page {
              size: 
              ${header.reduce((total, columnName) => {
            const columnWidth = columnWidths[columnName] !== undefined ? columnWidths[columnName] : 150;
            return total + columnWidth;
        }, 0) + 100
            }px

            ${Math.max(Math.max(...Object.values(data).map((item) => item['Litologia'].height)) * scale, 1000)}px;
             margin : 50;
  }
 }
  `,
    });



    // Función para manejar el inicio del arrastre para redimensionar
    const handleMouseDown = (columnName, event) => {
        event.preventDefault();

        const startWidth = columnWidths[columnName] || cellWidth;
        const startX = event.clientX;

        const handleMouseMove = (moveEvent) => {
            let newWidth = startWidth + moveEvent.clientX - startX;
            newWidth = Math.max(cellMinWidth, Math.min(newWidth, cellMaxWidth));
            setColumnWidths((prevWidths) => ({
                ...prevWidths,
                [columnName]: newWidth,
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };


    const [hovered, setHovered] = useState(false); // Estado para controlar si se está pasando el mouse por encima

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };

    return (
        <>
            <button onClick={handlePrint}> aaaaaaaa</button>


            <div ref={tableref} >
                <table style={{ height: '100px' }} >
                    <thead>
                        <tr>
                            {header.map((columnName) => (
                                <th
                                    key={columnName}
                                    className="border border-secondary bg-primary"
                                    style={{
                                        width: `${columnWidths[columnName] || cellWidth}px`,
                                        height: '100px'
                                    }}
                                >
                                    <div
                                        className="flex justify-between items-center p-2 font-semibold"
                                    >
                                        <p className="text text-accent-content"> {columnName}</p>
                                        <span className="p-1 cursor-col-resize" onMouseDown={(e) => handleMouseDown(columnName, e)}>||</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((RowValue, rowIndex) => (

                            <tr key={rowIndex}
                                className="page-break"
                            // style={{ height: `${lithology[rowIndex].height * scale}px` }}
                            >
                                {header.map((columnName, columnIndex) => {

                                    if (columnName === 'Estructura fosil' && rowIndex === 0) {
                                        return (
                                            <td
                                                id="fossils"
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={data.length}
                                                className="border"
                                                style={{
                                                    verticalAlign: "top",
                                                    borderLeft: 'none',
                                                }}
                                            >
                                                <div className="h-full max-h-full"// tooltip" data-tip="hello"
                                                    onClick={(e) => {
                                                        if (e.target instanceof SVGSVGElement) {
                                                            setSideBarState({
                                                                sideBar: true,
                                                                sideBarMode: "fosil"
                                                            })
                                                            setRelativeX(e.nativeEvent.offsetX)
                                                        }
                                                    }}
                                                    style={{ top: 0 }}>
                                                    <svg className="h-full max-h-full" width={columnWidths["Estructura fosil"] || cellWidth} height="0" overflow='visible'>
                                                        {fossils ? (
                                                            fossils.map((img, index) => (
                                                                <Fosil
                                                                    key={index}
                                                                    img={img}
                                                                    setSideBarState={setSideBarState}
                                                                    setIdClickFosil={setIdClickFosil}
                                                                    scale={scale}
                                                                    litologiaX={columnWidths["Litologia"] || cellWidth}
                                                                    columnW={columnWidths["Estructura fosil"] || cellWidth}
                                                                />
                                                            ))
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </svg>
                                                </div>
                                            </td>
                                        );
                                    } else if (columnName !== 'Estructura fosil') {
                                        return (
                                            <td
                                                key={`${rowIndex}-${columnIndex}`}
                                                className={
                                                    (editingUsers?.[`[${rowIndex},${columnIndex}]`] && columnName !== 'Litologia') ?
                                                        (`border-2 prose` + (columnName === "Litologia" ? "ql-editor" : ""))
                                                        :
                                                        (`border prose` + (columnName === "Litologia" ? "ql-editor" : ""))
                                                }
                                                onClick={() => {
                                                    if (columnName !== "Litologia") {
                                                        setSideBarState({
                                                            sideBar: true,
                                                            sideBarMode: "text"
                                                        });
                                                        console.log(rowIndex, columnName)
                                                        handleClickRow(rowIndex, columnName)
                                                    }
                                                    sendActionCell(rowIndex, columnIndex)
                                                }}
                                                style={{
                                                    overflowY: (columnName === 'Litologia') ? 'visible' : 'auto',
                                                    padding: '0',
                                                    top: '0',
                                                    borderColor: (columnName !== 'Litologia') ? (editingUsers?.[`[${rowIndex},${columnIndex}]`]?.color || '') : '',
                                                    verticalAlign: "top",
                                                }}
                                                onMouseEnter={(editingUsers?.[`[${rowIndex},${columnIndex}]`] && (columnName !== 'Litologia')) ? handleMouseEnter : null} 
                                                onMouseLeave={(editingUsers?.[`[${rowIndex},${columnIndex}]`] && (columnName !== 'Litologia')) ? handleMouseLeave : null} 
                                            >
                                                {(editingUsers?.[`[${rowIndex},${columnIndex}]`] && columnName !== 'Litologia' && hovered) ? <>
                                                    <p style={{ fontSize: 12, backgroundColor: editingUsers?.[`[${rowIndex},${columnIndex}]`]?.color }} className="tooltip-text">{editingUsers?.[`[${rowIndex},${columnIndex}]`]?.name}</p>
                                                </> : <></>
                                                }
                                                <div
                                                    style={{
                                                        maxHeight: `${RowValue.Litologia.height * scale}px`,
                                                        height: '100%',
                                                    }}
                                                >
                                                    {columnName === 'Litologia' ?
                                                        <>
                                                            <Polygon
                                                                rowIndex={rowIndex}
                                                                Height={RowValue.Litologia.height * scale}
                                                                File={lithoJson[RowValue.Litologia.file]}
                                                                ColorFill={RowValue.Litologia.ColorFill}
                                                                ColorStroke={RowValue.Litologia.colorStroke}
                                                                Zoom={RowValue.Litologia.zoom}
                                                                circles={RowValue.Litologia.circles}
                                                                addCircles={addCircles}
                                                                openModalPoint={openModalPoint}
                                                                setSideBarState={setSideBarState}
                                                                handleClickRow={handleClickRow}
                                                                tension={RowValue.Litologia.tension}
                                                                rotation={RowValue.Litologia.rotation}
                                                            />
                                                        </>
                                                        :
                                                        <>
                                                            <div
                                                                style={{
                                                                    'padding': 10,
                                                                    // maxHeight: `${lithology[rowIndex].height * scale}px`,
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: RowValue[columnName] }}
                                                            />

                                                        </>
                                                    }
                                                </div>
                                            </td>
                                        );
                                    }
                                    return null;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Tabla;
