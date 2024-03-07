import { useState, useRef, useEffect } from "react";
import Polygon from "./Polygon4";
import Fosil from "../Editor/Fosil";
import lithoJson from '../../lithologic.json';
import { useReactToPrint } from "react-to-print"
import Ruler from "./Ruler2";

const Tabla = ({ data, header, scale, 
                addCircles, setSideBarState, 
                fossils, setFormFosil, 
                openModalPoint, handleClickRow, sendActionCell,  
                editingUsers }) => {

    const cellWidth = 150;
    const cellMinWidth = 100;
    const cellMaxWidth = 500;
    const tableref = useRef(null);

    const [columnWidths, setColumnWidths] = useState({});

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

    var adfas = useRef(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (adfas.current) {
            const { width, height } = adfas.current.getBoundingClientRect();
            setDimensions({ width, height });
        }
    }, [adfas.current, data.length, scale]);


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
                                className={"page-break"}
                            // style={{ height: `${lithology[rowIndex].height * scale}px` }}
                            >
                                {header.map((columnName, columnIndex) => {

                                    if (columnName === 'Espesor' && rowIndex === 0) {
                                        return (
                                            <td
                                                ref={adfas}
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={data.length}
                                                className="border"
                                                style={{
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <div className="h-full max-h-full">
                                                    <Ruler height={dimensions.height} width={(columnWidths["Espesor"] || 150)} isInverted={false} scale={scale} />
                                                </div>
                                            </td>
                                        );
                                    } else if (columnName === 'Estructura fosil' && rowIndex === 0) {
                                        return (
                                            <td
                                                id="fossils"
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={data.length}
                                                className="border"
                                                style={{
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <div className="h-full max-h-full"// tooltip" data-tip="hello"
                                                    onClick={(e) => {
                                                        console.log('a')
                                                        if (e.target instanceof SVGSVGElement) {
                                                            setSideBarState({
                                                                sideBar: true,
                                                                sideBarMode: "fosil"
                                                            })
                                                            setFormFosil({ id:'', upper: 0, lower: 0, fosilImg: '', x: e.nativeEvent.offsetX / (columnWidths["Estructura fosil"] || cellWidth), fosilImgCopy: ''})
                                                        }
                                                    }}
                                                    style={{ top: 0 }}>
                                                    <svg className="h-full max-h-full" width={columnWidths["Estructura fosil"] || cellWidth} height="0" overflow='visible'>
                                                        {fossils ? (
                                                            Object.keys(fossils).map((data, index) => (
                                                                
                                                                <Fosil
                                                                    key={index}
                                                                    keyID={data}
                                                                    data={fossils[data]}
                                                                    setSideBarState={setSideBarState}
                                                                    setFormFosil={setFormFosil}
                                                                    scale={scale}
                                                                    litologiaX={columnWidths["Litologia"] || cellWidth}
                                                                    columnW={columnWidths["Estructura fosil"] || cellWidth}
                                                                />
                                                               
                                                            ))
                                                        ) : ( null)}
                                                    </svg>
                                                </div>
                                            </td>
                                        );
                                    } else if (columnName !== 'Estructura fosil' && columnName !== 'Espesor') {
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
                                                                Width={columnWidths["Litologia"] || cellWidth}
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
