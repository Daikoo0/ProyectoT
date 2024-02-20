import { useState, useEffect, useRef } from "react";
import Polygon from "./Polygon4";
import Fosil from "../Editor/Fosil";
import jsPDF from "jspdf";
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import lithoJson from '../../lithologic.json';

const Tabla = ({ data, header, lithology, scale, addCircles, setSideBarState, setRelativeX, fossils, setIdClickFosil, openModalPoint, handleClickRow }) => {


    const exportTableToPDFWithPagination = async () => {
        const doc = new jsPDF();

        // Calcula las alturas de las filas y determina cuántas caben en una página
        let pageHeight = doc.internal.pageSize.height;
        let currentPageHeight = 20; // Iniciar con un margen superior
        let rowIndexesPerPage = [];
        let currentPageIndexes = [];

        Object.keys(lithology).forEach((row, index) => {
            const rowHeight = lithology[row].height * scale;
            if (currentPageHeight + rowHeight > pageHeight) {
                rowIndexesPerPage.push(currentPageIndexes);
                currentPageIndexes = [];
                currentPageHeight = 20; // Reiniciar margen superior para nueva página
            }
            currentPageHeight += rowHeight;
            currentPageIndexes.push(index);
        });
        if (currentPageIndexes.length) rowIndexesPerPage.push(currentPageIndexes);

        // Datos para autotable
        const body = [];
        rowIndexesPerPage.forEach((pageIndexes) => {
            pageIndexes.forEach((rowIndex) => {
                const row = [];
                header.forEach((columnName) => {
                    if (columnName === 'Estructura fosil') {
                        row.push('Representación especial de fosil');
                    } else {
                        data[columnName]?.[rowIndex] ? 
                        row.push(data[columnName][rowIndex]) : row.push("")
                    }
                });
                body.push(row);
            });

            // Añade la tabla al documento
            autoTable(doc, {
                head: [header],
                body: body,
                theme: 'grid',
                didDrawPage: (dataArg) => {
                    // Restablece el cuerpo para la próxima página
                    body.length = 0;
                },
            });

            // Añade una nueva página si hay más datos por renderizar
            if (rowIndexesPerPage.indexOf(pageIndexes) < rowIndexesPerPage.length - 1) {
                doc.addPage();
            }
        });

        // Guardar el PDF
        doc.save('table.pdf');
    };




    const [columnWidths, setColumnWidths] = useState({});

    useEffect(() => {
        const initialWidths = header.reduce((acc, columnName) => {
            acc[columnName] = 150; // Inicializa todas las columnas con un ancho de 200px
            return acc;
        }, {});
        setColumnWidths(initialWidths);
    }, [header]);


    // Función para manejar el inicio del arrastre para redimensionar
    const handleMouseDown = (columnName, event) => {
        event.preventDefault();

        const startWidth = columnWidths[columnName];
        const startX = event.clientX;

        const handleMouseMove = (moveEvent) => {
            const newWidth = startWidth + moveEvent.clientX - startX;
            setColumnWidths((prevWidths) => ({
                ...prevWidths,
                [columnName]: newWidth > 100 ? newWidth : 100 // Asegura un ancho mínimo de 100px
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const eltd = useRef(null)

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (eltd.current) {
            const { width, height } = eltd.current.getBoundingClientRect();
            setDimensions({ width, height });
        }
    }, [eltd.current, scale]);


    return (
        <>
            <button onClick={(e)=>window.print()}>descagrlo</button>
            <table id="your-table-id" style={{ height: '100px' }}>
                <thead>
                    <tr>
                        {header.map((columnName) => (
                            <th
                                key={columnName}
                                className="border border-secondary bg-primary"
                                style={{
                                    width: `${columnWidths[columnName]}px`,
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
                    {Object.keys(lithology).map((rowIndex, index) => (

                        <tr key={rowIndex}
                            style={{ height: `${lithology[rowIndex].height * scale}px` }}
                        >
                            {header.map((columnName, columnIndex) => {

                                if (columnName === 'Estructura fosil' && index === 0) {
                                    return (
                                        <td
                                            onClick={(e) => {
                                                setSideBarState({
                                                    sideBar: true,
                                                    sideBarMode: "fosil"
                                                })
                                                setRelativeX(e.nativeEvent.offsetX)
                                            }}
                                            key={`${rowIndex}-${columnIndex}`}
                                            rowSpan={Object.keys(lithology).length}
                                            className="border border-secondary"
                                            style={{
                                                verticalAlign: "top",
                                                borderLeft: 'none',
                                            }}
                                            ref={eltd}
                                        >
                                            <div className="h-full max-h-full" style={{ top: 0, width: dimensions.width }}>
                                                <svg className="h-full max-h-full" width="100%" height="0" overflow='visible'>
                                                    {fossils.length > 0 ? (
                                                        fossils.map((img, index) => (
                                                            <Fosil
                                                                img={img}
                                                                setSideBarState={setSideBarState}
                                                                setIdClickFosil={setIdClickFosil}
                                                                scale={scale}
                                                                litologiaX={columnWidths["Litologia"]}
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
                                            className="border border-secondary prose ql-editor"
                                            style={{
                                                maxHeight: `${lithology[rowIndex].height * scale}px`,
                                                width: `${columnWidths[columnName]}px`,
                                                overflowY: (columnName === 'Litologia') ? 'visible' : 'auto',
                                                padding: '0',
                                                top: '0',
                                                borderWidth: 1,
                                                borderTop: (columnName === 'Litologia') ? 'none' : '',
                                                borderBottom: (columnName === 'Litologia') && Number(rowIndex) < Object.keys(lithology).length - 1 ? 'none' : '',
                                                verticalAlign: "top",
                                                borderRight: ((columnName === 'Litologia') && (header.includes('Estructura fosil'))) ? 'none' : '',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    maxHeight: `${lithology[rowIndex].height * scale}px`,

                                                }}
                                            >
                                                {columnName === 'Litologia' ?
                                                    <>
                                                        <Polygon
                                                            rowIndex={Number(rowIndex)}
                                                            Height={lithology[rowIndex].height * scale}
                                                            File={lithoJson[lithology[rowIndex].file]}
                                                            ColorFill={lithology[rowIndex].ColorFill}
                                                            ColorStroke={lithology[rowIndex].colorStroke}
                                                            Zoom={lithology[rowIndex].zoom}
                                                            circles={lithology[rowIndex].circles}
                                                            addCircles={addCircles}
                                                            openModalPoint={openModalPoint}
                                                            setSideBarState={setSideBarState}
                                                            handleClickRow={handleClickRow}
                                                        />
                                                    </>
                                                    : <>
                                                        <div
                                                            style={{
                                                                'padding': 10,
                                                                maxHeight: `${lithology[rowIndex].height * scale}px`,
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: data[columnName][rowIndex] }} />
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
        </>
    );
};

export default Tabla;
