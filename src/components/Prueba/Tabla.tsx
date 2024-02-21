import { useState, useEffect, useRef } from "react";
import Polygon from "./Polygon4";
import Fosil from "../Editor/Fosil";
import jsPDF from "jspdf";
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import lithoJson from '../../lithologic.json';
import { Html2CanvasOptions } from "jspdf";
import { exportTableToPdf } from "./ExportUtils";
import { Canvg } from 'canvg';
import 'svg2pdf.js'
import { svg2pdf } from "svg2pdf.js";
import domtoimage from 'dom-to-image';

const Tabla = ({ data, header, lithology, scale, addCircles, setSideBarState, setRelativeX, fossils, setIdClickFosil, openModalPoint, handleClickRow }) => {


    const exportTableToPDFWithPagination = async () => {
        const doc = new jsPDF();
        const table = document.getElementById("your-table-id");
        if (table) {
            const dataUrl = await domtoimage.toPng(table);
            const img = new Image();
            console.log(dataUrl)
            img.src = dataUrl;
            img.onload = () => {
                const imgWidth = img.width;
                const imgHeight = img.height;
                // const pdfWidth = doc.internal.pageSize.getWidth();
                // const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
                doc.addImage(dataUrl, 'PNG', 0, 0, 1000, 1000);

            };

            doc.save('svgs-from-table.pdf');
        }
        // const doc = new jsPDF();
        // const tds = document.querySelectorAll('table tr td');
        // const tdsWithSvg = Array.from(tds).filter(td => td.querySelector('svg'));

        // tdsWithSvg.forEach(td => {
        //     if (td.id === "fossils") {
        //         td.remove();
        //     } else {
        //         //let base64EncodedSvg = window.btoa(unescape(encodeURIComponent(td.innerHTML)));
        //        // let dataUrl = 'data:image/svg+xml;base64,' + base64EncodedSvg;
        //      //   console.log(dataUrl)
        //         //doc.svg(td,{x :100,y:100,width:100,height:100})
        //         doc.svg(td,{ x: 0, y: 0, width: 100, height: 200 })
        //         // svg2pdf(td, doc, {
        //         //     x: 100,
        //         //     y: 100,
        //         //     width: 400 ,
        //         //     height: 400,
        //         //   })
        //         // doc.addSvgAsImage(dataUrl,100,100,100,100)
        //     }
        // });

        // let pageHeight = doc.internal.pageSize.height;
        // let currentPageHeight = 20; // Iniciar con un margen superior
        // let rowIndexesPerPage = [];
        // let currentPageIndexes = [];

        // Object.keys(lithology).forEach((key, index) => {
        //     const rowHeight = lithology[key].height * scale;
        //     if (currentPageHeight + rowHeight > pageHeight) {
        //         rowIndexesPerPage.push(currentPageIndexes);
        //         currentPageIndexes = [];
        //         currentPageHeight = 20; // Reiniciar margen superior para nueva página
        //     }
        //     currentPageHeight += rowHeight;
        //     currentPageIndexes.push(index);
        // });
        // if (currentPageIndexes.length) rowIndexesPerPage.push(currentPageIndexes);

        // // Suponer que 'header' y 'data' están definidos correctamente
        // rowIndexesPerPage.forEach((pageIndexes, pageIndex) => {
        //     const body = [];

        //     pageIndexes.forEach(rowIndex => {
        //         const row = [];
        //         header.forEach(columnName => {
        //             if (columnName === 'Litologia') {
        //                 row.push("");
        //             } else
        //                 if (columnName === 'Estructura fosil') {
        //                     const cellData = data[columnName]?.[rowIndex] || "";
        //                     row.push(cellData);
        //                 } else {
        //                     const cellData = data[columnName]?.[rowIndex] || "";
        //                     row.push(cellData);
        //                 }
        //         });
        //         body.push(row);
        //     });

        //     // Añade la tabla al documento
        //     autoTable(doc, {
        //         head: [header],
        //         body: body,
        //         theme: 'grid',
        //         styles: {
        //             overflow: 'ellipsize',
        //         },
        //         startY: 10, // Ajustar inicio para nuevas páginas
        //         didDrawPage: (dataArg) => {
        //             if (pageIndex < rowIndexesPerPage.length - 1) {
        //                 doc.addPage();
        //             }
        //         },
        //     });
        // });

        // Guardar el PDF
        // doc.save('table.pdf');
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
            <button onClick={exportTableToPDFWithPagination}> aaaaaaaa</button>
            <div id="your-table-id" >
                <table style={{ height: '100px' }}>
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
                                                id="fossils"
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
                                                                tension={lithology[rowIndex].tension}
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
            </div>
        </>
    );
};

export default Tabla;
