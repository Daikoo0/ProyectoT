import { useState, useRef, useEffect } from "react";
import Polygon from "./Polygon4";
import Fosil from "../Editor/Fosil";
import lithoJson from '../../lithologic.json';
import { useReactToPrint } from "react-to-print"
import Ruler from "./Ruler2";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

const Tabla = ({  openModal, data, header, scale, 
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


    const exportTableToPDFWithPagination = async (columnWidths, data) => {

        const escala = scale || 1;



        let rowIndexesPerPage = [];

        let currentPageHeight = 60 * 96 / 72;

        let currentPageIndexes = [];

        function pixelsToPoints(pixels) {

            return (pixels / 96) * 72;

        }



        const maxHeight = Math.max(...Object.values(data).map((item) => item['Litologia'].height))



        const pageWidth2 = pixelsToPoints(1500);

        const pageHeight2 = pixelsToPoints(Math.max(Number(maxHeight), 1000)) + 100;



        Object.values(data).forEach((key, index) => {

            const rowHeight = key['Litologia'].height * escala;

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



                                startY += data[i]['Litologia'].height * scale;

                            }

                            let endY = startY;

                            pageIndices.forEach(index => {

                                endY += data[index]['Litologia'].height * scale;

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

                        pElement.setAttribute('transform', `translate(0, ${0})`);

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

        const indices = Object.keys(data);



        const tdsWithSvg = Array.from(filteredSvgs).filter(svg => {

            const patterns = svg.querySelectorAll('pattern');

            return Array.from(patterns).some(pattern => {

                return indices.some(index => pattern.id === `pattern-${index}`);

            });

        });



        const className = "h-full.max-h-full"; // Reemplaza "miClase" con el nombre de la clase que estás buscando

        var svgFossils = []

        if (document.querySelectorAll(`table tbody tr td svg.${className}`).length > 1) {

            svgFossils = [document.querySelectorAll(`table tbody tr td svg.${className}`)[1]];

        }

        //console.log(document.querySelectorAll(`table tbody tr td svg.${className}`))

        var svgEspesor = [document.querySelectorAll(`table tbody tr td svg.${className}`)[0]];

        var imageFossils = await svgListToDataURL(svgFossils, true, rowIndexesPerPage);

        var imageEspesor = await svgListToDataURL(svgEspesor, true, rowIndexesPerPage);





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

            //  var imagesDatas2 = imgPage[pageIndex]

            //   console.log(imagesDatas2)

            pageIndexes.forEach(rowIndex => {

                const row = [];

                header.forEach(columnName => {

                    if (columnName === 'Litologia') {

                    } else if (columnName === 'Estructura fosil') {

                        const currentValue = data[columnName]?.[rowIndex];

                        // if (previousValue === currentValue) {

                        //     //row.push();

                        // } else {

                        //     previousValue = currentValue; // Actualizar el valor anterior

                        //     //  row.push(currentValue);

                        // }

                    } else {

                        const cellData = data[columnName]?.[rowIndex] || "";

                    }

                });

                body.push(row);

            });



            if (pageIndex > 0) {

                doc.addPage();

            }



            var xcell = 0

            var ycell = 0

            var xcellFossils = 0

            var xcellEspesor = 0

            const columnStyles = {};



            // Recorrer el array de encabezados y asignar un cellWidth de columnWidths

            header.forEach(header => {

                columnStyles[header] = { cellWidth: columnWidths[header] * 72 / 96 || 150 * 72 / 96 };

                //   console.log(columnStyles[header])

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

                didDrawCell: (datac) => {

                    if (datac.row.index === 0 && datac.column.dataKey === header.indexOf('Litologia')) {

                        xcell = datac.cell.x

                        ycell = datac.cell.y

                    }

                    else

                        if (datac.row.index === 0 && datac.column.dataKey === header.indexOf('Espesor')) {

                            xcellEspesor = datac.cell.x



                        }

                        else

                            if (datac.row.index === 0 && datac.column.dataKey === header.indexOf('Estructura fosil')) {

                                xcellFossils = datac.cell.x



                            }

                },

                columnStyles: columnStyles,



                didParseCell: function (datac) {

                    if (datac.row.section === "head") {

                        datac.cell.height = 40

                    } else {

                        //   console.log(datac.row.index)

                        datac.row.height = (data[datac.row.index]['Litologia'].height * escala / 96) * 72;

                        datac.cell.height = (data[datac.row.index]['Litologia'].height * escala / 96) * 72;

                        datac.cell.styles.minCellHeight = (data[datac.row.index]['Litologia'].height * escala / 96) * 72;

                    }

                },

                didDrawPage: (datac) => {

                    datac.doc.addImage(imgPage[pageIndex], xcell, ycell);

                    if (imageEspesor[pageIndex] !== "data:,") {

                        datac.doc.addImage(imageEspesor[pageIndex], xcellEspesor, ycell)

                    }

                    if (imageFossils[pageIndex] !== "data:,") {

                        datac.doc.addImage(imageFossils[pageIndex], xcellFossils, ycell)

                    }

                }



            });

        });



        //      doc.save('table.pdf');



        document.getElementById('main-iframe').setAttribute('src', URL.createObjectURL(doc.output('blob')).toString());

        //window.open(doc.output('bloburl'), '_blank');

    };




    return (
        <>

            <>

                <dialog id="modal" className="modal">

                    <div className="modal-box w-11/12 max-w-7xl h-full">

                        <div className="flex flex-col w-full lg:flex-row h-full">

                            <div className="grid flex-grow card place-items-center">

                                <button className="btn" onClick={(e) => exportTableToPDFWithPagination(columnWidths, data)}> Actualizar vista previa</button>

                            </div>

                            <div className="flex flex-col flex-grow card">

                                <p className="flex-shrink-0 text-xl">Vista previa</p>

                                <br></br>

                                <iframe id="main-iframe" className="w-full flex-grow" style={{ 'width': '100%', height: '100%' }}></iframe>

                                <div className="modal-action mt-4">

                                    <form method="dialog">

                                        <button className="btn">Close</button>

                                    </form>

                                </div>

                            </div>

                        </div>

                    </div>

                </dialog>

            </>
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
