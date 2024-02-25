import { useState, useRef } from "react";
import Polygon from "./Polygon4";
import Fosil from "../Editor/Fosil";
import lithoJson from '../../lithologic.json';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import ReactToPrint from 'react-to-print';


const Tabla = ({ data, header, lithology, scale, addCircles, setSideBarState, setRelativeX, fossils, setIdClickFosil, openModalPoint, handleClickRow }) => {

    const [columnWidths, setColumnWidths] = useState({});
    const cellWidth = 150;
    const cellMinWidth = 100;
    const cellMaxWidth = 500;

    const tableref = useRef(null);

    // const handlePrint = useReactToPrint({
    //     content: () => tableref.current,
    //   });

    const exportTableToPDFWithPagination = async (columnWidths) => {
        const escala = scale || 1;
        let rowIndexesPerPage = [];
        let currentPageHeight = 60 * 96 / 72;
        let currentPageIndexes = [];
        function pixelsToPoints(pixels) {
            return (pixels / 96) * 72;
        }

        const maxHeight = Object.values(lithology).reduce((previousValue, currentValue) => {
            const currentHeight = parseInt((currentValue as any).height, 10);
            const previousHeight = typeof previousValue === 'number' ? previousValue : parseInt((previousValue as any).height, 10);
            return Math.max(previousHeight, currentHeight);
        }, 0);


        const pageWidth2 = pixelsToPoints(1500);
        const pageHeight2 = pixelsToPoints(Math.max(Number(maxHeight), 1000)) + 100;

        Object.keys(lithology).forEach((key, index) => {
            const rowHeight = lithology[key].height * escala;
            if (currentPageHeight + rowHeight > pageHeight2 * 96 / 72) {
                rowIndexesPerPage.push(currentPageIndexes);
                currentPageIndexes = [];
                currentPageHeight = 60 * 96 / 72;
            }
            currentPageHeight += rowHeight;
            currentPageIndexes.push(index);
        });
        if (currentPageIndexes.length) rowIndexesPerPage.push(currentPageIndexes);

        function svgListToDataURL(svgList, fosil, rowIndexesPerPage) {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const promises = [];
                const fossilsPage = []
                let totalHeight = 0;
                let maxwidth = 0;
                var svgData;
                if (fosil) {
                    const svgCopy = svgList[0].cloneNode(true);
                    var alt = parseFloat(svgList[0].getAttribute('height'));
                    svgCopy.setAttribute('height', alt > 1000 ? `${alt}px` : "8000px")
                    let width = parseFloat(svgCopy.getAttribute('width'));
                    let height = parseFloat(svgCopy.getAttribute('height'));
                    maxwidth = width;
                    totalHeight = height;
                    svgData = new XMLSerializer().serializeToString(svgCopy);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    var url1 = URL.createObjectURL(svgBlob);
                    const imgPromise1 = new Promise((resolve, reject) => {
                        const img1 = new Image();
                        img1.onload = () => {
                            console.log(img1)
                            resolve(img1);
                        };
                        img1.onerror = (e) => {
                            console.log(e)
                            reject(e);
                        };
                        img1.src = url1;
                    });
                    promises.push(imgPromise1);

                    promises[0].then(img1 => {
                        canvas.width = maxwidth;
                        canvas.height = totalHeight;
                        ctx.drawImage(img1, 0, 0);
                        console.log(rowIndexesPerPage)
                        rowIndexesPerPage.forEach((pageIndices, pageIndex) => {
                            console.log(pageIndices)
                            const pageCanvas = document.createElement('canvas');
                            const pageCtx = pageCanvas.getContext('2d');
                            let startY = 0;
                            for (let i = 0; i < pageIndices[0]; i++) {
                                startY += lithology[i].height * scale;
                            }
                            let endY = startY;
                            pageIndices.forEach(index => {
                                endY += lithology[index].height * scale;
                            });
                            pageCanvas.width = maxwidth;
                            pageCanvas.height = endY - startY;

                            pageCtx.drawImage(img1, 0, startY, maxwidth, pageCanvas.height, 0, 0, maxwidth, endY - startY);
                            const pageImgURL = pageCanvas.toDataURL('image/png', 1.0);
                            console.log(pageImgURL)
                            // Guardar el DataURL de la página en el array, en el índice correspondiente
                            fossilsPage.push(pageImgURL);
                        });

                        resolve(fossilsPage); // Asegúrate de resolver la promesa original después de procesar todas las páginas
                    }).catch(error => reject(error));


                } else {
                    svgList.forEach((svg, index) => {
                        const svgCopy = svg.cloneNode(true);
                        const circles = svgCopy.querySelectorAll('circle');
                        circles.forEach(circle => {
                            circle.remove();
                        });
                        let alturaActual = parseFloat(svgCopy.getAttribute('height'));
                        let nuevaAltura = alturaActual + 10;
                        totalHeight += nuevaAltura;
                        let pElement = svgCopy.querySelector('path');
                        svgCopy.setAttribute('height', `${nuevaAltura}px`);
                        pElement.setAttribute('transform', `translate(0, ${5})`);
                        let width = parseFloat(svgCopy.getAttribute('width'));
                        if (width > maxwidth) {
                            maxwidth = width;
                        }
                        svgData = new XMLSerializer().serializeToString(svgCopy);
                        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(svgBlob);
                        const imgPromise = new Promise((resolve, reject) => {
                            const img = new Image();
                            img.onload = () => {
                                console.log(img)
                                resolve(img);
                            };
                            img.onerror = (e) => {
                                console.log(e)
                                reject(e);
                            };
                            img.src = url;
                        });

                        promises.push(imgPromise);
                    });
                    Promise.all(promises)
                        .then(images => {
                            canvas.width = maxwidth + 200;
                            canvas.height = totalHeight - (images.length * 10) + 10//> 10 ? totalHeight : 500;
                            let offsetY = 0;
                            images.forEach(img => {
                                ctx.drawImage(img, 0, offsetY);
                                offsetY += img.height - 10;
                            });
                            const imgURL = canvas.toDataURL('image/png', 1.0);
                            resolve(imgURL);
                        }).catch(error => reject(error));

                }
            });
        }


        const doc = new jsPDF({
            orientation: 'l',
            unit: 'pt',
            format: [pageWidth2, pageHeight2]
        });

        const filteredSvgs = document.querySelectorAll('table tbody tr td svg');
        const indices = Object.keys(lithology);

        const tdsWithSvg = Array.from(filteredSvgs).filter(svg => {
            const patterns = svg.querySelectorAll('pattern');
            return Array.from(patterns).some(pattern => {
                return indices.some(index => pattern.id === `pattern-${index}`);
            });
        });

        const className = "h-full.max-h-full"; // Reemplaza "miClase" con el nombre de la clase que estás buscando
        var svgFossils = [document.querySelector(`table tbody tr td svg.${className}`)];

        var imageFossils = await svgListToDataURL(svgFossils, true, rowIndexesPerPage);
        let previousValue = null;
        let skipDrawing = false;

        async function generateSVGDataURLForPage(pageIndex) {
            const indexes = rowIndexesPerPage[pageIndex];
            const filteredTdsWithSvg = Array.from(tdsWithSvg).filter((td, index) => indexes.includes(index));
            const imageDataURL = await svgListToDataURL(filteredTdsWithSvg, false, rowIndexesPerPage);
            return imageDataURL;
        }

        var imgPage = []
        for (var i = 0; i < rowIndexesPerPage.length; i++) {
            var img = await generateSVGDataURLForPage(i)
            imgPage.push(img)
        }
        // Paso 2.2: Generar las páginas del PDF
        rowIndexesPerPage.forEach((pageIndexes, pageIndex) => {
            const body = [];
            var imagesDatas2 = imgPage[pageIndex]
            console.log(imagesDatas2)
            pageIndexes.forEach(rowIndex => {
                const row = [];
                header.forEach(columnName => {
                    if (columnName === 'Litologia') {
                    } else if (columnName === 'Estructura fosil') {
                        const currentValue = data[columnName]?.[rowIndex];
                        if (previousValue === currentValue) {
                            skipDrawing = true; // Marcar para no dibujar si el valor es el mismo que el anterior
                            //row.push();
                        } else {
                            skipDrawing = false; // Resetear flag si el valor cambia
                            previousValue = currentValue; // Actualizar el valor anterior
                            //  row.push(currentValue);
                        }
                    } else {
                        const cellData = data[columnName]?.[rowIndex] || "";
                    }
                });
                body.push(row);
            });

            if (pageIndex > 0) {
                doc.addPage();
            }

            let addedImage = false; // Variable para rastrear si la imagen se ha agregado en la página actual
            var xcell = 0
            var ycell = 0

            const columnStyles = {};

            // Recorrer el array de encabezados y asignar un cellWidth de columnWidths
            header.forEach(header => {
                columnStyles[header] = { cellWidth: columnWidths[header] * 72 / 96 || 'auto' }; // Usamos 'auto' si no se especifica un ancho
            });

            autoTable(doc, {
                head: [header],
                body: body,
                theme: 'grid',
                styles: {
                    overflow: 'ellipsize',
                    fontSize: 10,
                },
                startY: 20,
                didDrawCell: (data) => {
                    if (data.row.index === 0 && data.column.dataKey === header.indexOf('Litologia') && !addedImage) {
                        const cell = data.cell;
                        xcell = cell.x
                        ycell = cell.y

                    } else
                        if (data.column.dataKey === header.indexOf('Estructura fosil') && !skipDrawing) {
                            const cell = data.cell;
                        }
                },
                columnStyles: columnStyles,

                didParseCell: function (data) {
                    if (data.row.section === "head") {
                        data.cell.height = 40
                    } else {
                        console.log(data)
                        data.row.height = (lithology[data.row.index].height * escala / 96) * 72;
                        data.cell.height = (lithology[data.row.index].height * escala / 96) * 72;
                        data.cell.styles.minCellHeight = (lithology[data.row.index].height * escala / 96) * 72;
                    }
                },
                didDrawPage: (data) => {
                    data.doc.addImage(imagesDatas2, xcell, ycell - 3);
                    if (imageFossils[pageIndex] !== "data:,") {
                        data.doc.addImage(imageFossils[pageIndex], xcell + 80, ycell - 3)
                    }
                    addedImage = true;
                }

            });
        });

        doc.save('table.pdf');
    };

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

    const maxHeight = Object.values(lithology).reduce((previousValue, currentValue) => {
        const currentHeight = parseInt((currentValue as any).height, 10);
        const previousHeight = typeof previousValue === 'number' ? previousValue : parseInt((previousValue as any).height, 10);
        return Math.max(previousHeight, currentHeight);
    }, 0);


    return (
        <>
            {/* <button onClick={handlePrint}> aaaaaaaa</button> */}
            <ReactToPrint
                trigger={() => <button>Imprimir</button>}
                content={() => tableref.current}
                copyStyles={true}
                pageStyle={ `
                    @page {
                      size: 50mm 150mm;
                    }
                  }
                  @media print {
                    display: block
                    body {
                      transform: scale(2);
                    }
                  
                  
                  `}
            />
        
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
                        {Object.keys(lithology).map((rowIndex, index) => (

                            <tr key={rowIndex}
                            className="page-break"
                            // style={{ height: `${lithology[rowIndex].height * scale}px` }}
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
                                            >
                                                <div className="h-full max-h-full" style={{ top: 0 }}>
                                                    <svg className="h-full max-h-full" width="100%" height="0" overflow='visible'>
                                                        {fossils.length > 0 ? (
                                                            fossils.map((img) => (
                                                                <Fosil
                                                                    img={img}
                                                                    setSideBarState={setSideBarState}
                                                                    setIdClickFosil={setIdClickFosil}
                                                                    scale={scale}
                                                                    litologiaX={columnWidths["Litologia"] || cellWidth}
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
                                                onClick={() => {
                                                    if (columnName !== "Litologia") {
                                                        setSideBarState({
                                                            sideBar: true,
                                                            sideBarMode: "text"
                                                        });
                                                        console.log(rowIndex, columnName)
                                                        handleClickRow(rowIndex, columnName)

                                                    }
                                                }}
                                                style={{
                                                    //maxHeight: `${lithology[rowIndex].height * scale}px`,
                                                    //width: `${columnWidths[columnName] || 150}px`,
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
                                                                rotation={lithology[rowIndex].rotation}
                                                            />
                                                        </>
                                                        :
                                                        <>
                                                            <div
                                                                style={{
                                                                    'padding': 10,
                                                                    // maxHeight: `${lithology[rowIndex].height * scale}px`,
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: data[columnName][rowIndex] }}
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
