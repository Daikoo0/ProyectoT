import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// data de las filas, Nombre de las columnas, formato de la hoja
const exportTableToPDFWithPagination = async (dataParam, headerParam, format) => {
    // const escala = scale || 1;
    
    const escala = 1
    var data = dataParam
    var header = [...headerParam]
    var format = format
    let rowIndexesPerPage = [];
    let currentPageHeight = 60;
    let currentPageIndexes = [];
    let svgHeights = {};

    const doc = new jsPDF({
        orientation: 'p', // l
        unit: 'px',
        format: format
    });

    var columnWidths = {}

    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    console.log(pageHeight)

    const colW = ((pageWidth-40) - (pageWidth-40)*0.25) / (header.length - 2) // ancho de cada columna - 50 espesor - 40 margenes 
    let originalW = 1;
    columnWidths["Espesor"] = (pageWidth-40)*0.05
    columnWidths["Litologia"] = (pageWidth-40)*0.2

    for (var i in header) {
        if (header[i] !== "Espesor" && header[i] !== "Litologia") {
            columnWidths[header[i]] = colW
        }
    }

    // Funcion para convertir los svg a imagenes por pagina     
    function svgListToDataURL(svgList, fosil, rowIndexesPerPage, pageIndex) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const promises = [];
            const fossilsPage = []
            let totalHeight = 0;
            let maxwidth = columnWidths["Litologia"];
            var svgData;
            if (fosil) {
                const svgCopy = svgList[0].cloneNode(true);
                var alt = parseFloat(svgList[0].getAttribute('height'));
                svgCopy.setAttribute('height', alt > 1000 ? `${alt}px` : "8000px")
                // let width = parseFloat(svgCopy.getAttribute('width'));
                let height = parseFloat(svgCopy.getAttribute('height'));
                maxwidth = colW;
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
                    rowIndexesPerPage.forEach((pageIndices) => {
                        console.log(pageIndices)
                        const pageCanvas = document.createElement('canvas');
                        const pageCtx = pageCanvas.getContext('2d');
                        let startY = 0;
                        for (let i = 0; i < pageIndices[0]; i++) {
                            startY += data[i]['Litologia'].height * escala;
                        }
                        let endY = startY;
                        pageIndices.forEach(index => {
                            endY += data[index]['Litologia'].height * escala;
                        });
                        pageCanvas.width = maxwidth;
                        pageCanvas.height = endY - startY;
                        pageCtx.drawImage(img1, 0, startY, pageCanvas.width, pageCanvas.height, 0, 0, maxwidth, endY - startY);
                        const pageImgURL = pageCanvas.toDataURL('image/png', 1.0);
                        //        console.log(pageImgURL)
                        fossilsPage.push(pageImgURL);
                    });
                    resolve(fossilsPage); // Asegúrate de resolver la promesa original después de procesar todas las páginas
                }).catch(error => reject(error));
            } else {
                svgList.forEach((svg, index) => {
                    const svgCopy = svg.cloneNode(true); // Clonar el svg para no modificar el original
                    const circles = svgCopy.querySelectorAll('circle');
                    circles.forEach(circle => {
                        circle.remove();
                    });

                    let alturaActual = parseFloat(svgCopy.getAttribute('height'));
                    originalW = parseFloat(svgCopy.getAttribute('width'));
                    //let width = parseFloat(svgCopy.getAttribute('width'));
                    let nuevaAltura = alturaActual + 10;
                    
                    svgCopy.setAttribute('height', `${nuevaAltura}px`);
                    
                    const scaleW = (maxwidth / originalW);
                  
                    const originalY = svgCopy.getBoundingClientRect().top; 
                    const deltaY = originalY * (1 - (scaleW / nuevaAltura));
                    const originY = (deltaY / nuevaAltura) * 100 + "%";
                    console.log(originY)

                    svgCopy.setAttribute("transform", `scale(${scaleW})`)
                  
                    svgCopy.style.transformOrigin = `0 0`;
                  
                    totalHeight += alturaActual
                 
                    svgHeights[`${pageIndex},${index}`] = alturaActual
              
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
                        canvas.height = totalHeight
                        let offsetY = 0;
                        images.forEach((img) => {
                      //      if (index === 0) {svgHeights.push(img.height* (colW / originalW) - 8)}
                            ctx.drawImage(img, 0, offsetY);
                            offsetY += img.height* (maxwidth / originalW);
                        //    svgHeights.push(img.height * (colW / originalW) - 8)
                            console.log(offsetY)
                        });
                        const imgURL = canvas.toDataURL('image/png', 1.0);
                        console.log(imgURL)
                        resolve(imgURL);

                    }).catch(error => reject(error));
            }
        });
    }

    // Funcion para calcular la cantidad de filas por pagina
    Object.values(data).forEach((key, index) => {
        const rowHeight = key['Litologia'].height
        console.log(key['Litologia'].height)
        if ((currentPageHeight + rowHeight) > (pageHeight - 20)) {
            rowIndexesPerPage.push(currentPageIndexes);
            currentPageIndexes = [];
            currentPageHeight = 60;
        }
        currentPageHeight += rowHeight;
        currentPageIndexes.push(index);
    });

    // ??
    if (currentPageIndexes.length) rowIndexesPerPage.push(currentPageIndexes);


    const filteredSvgs = document.querySelectorAll('table tbody tr td svg');
    const indices = Object.keys(data); // data [0,1,2,3,4,5...n] 
    
    // Filtrar los svg que contienen los patrones 
    const tdsWithSvg = Array.from(filteredSvgs).filter(svg => {
        const patterns = svg.querySelectorAll('pattern');
        return Array.from(patterns).some(pattern => {
            return indices.some(index => pattern.id === `pattern-${index}`);
        });
    });
 
    const className = "h-full.max-h-full";
    var svgFossils = []
    if (document.querySelectorAll(`table tbody tr td svg.${className}`).length > 1) {
        svgFossils = [document.querySelectorAll(`table tbody tr td svg.${className}`)[1]];
    }
    var svgEspesor = [document.querySelectorAll(`table tbody tr td svg.${className}`)[0]];
    var imageFossils = await svgListToDataURL(svgFossils, true, rowIndexesPerPage, null);
    var imageEspesor = await svgListToDataURL(svgEspesor, true, rowIndexesPerPage, null);

    // Funcion para generar una imagen segun la pagina
    async function generateSVGDataURLForPage(pageIndex) {
        const indexes = rowIndexesPerPage[pageIndex]; // todos los index de pageindex
        const filteredTdsWithSvg = Array.from(tdsWithSvg).filter((_, index) => indexes.includes(index)); // filtrar los svg de la pagina que se esta generando 
        // if (filteredTdsWithSvg.length > 0) {
        //     originalW = parseFloat(filteredTdsWithSvg[0].querySelector('svg').getAttribute('width'))
        // }
        const imageDataURL = await svgListToDataURL(filteredTdsWithSvg, false, rowIndexesPerPage[pageIndex],pageIndex);
        return imageDataURL;
    }

    var imgPage = []
    for (var j = 0; j < rowIndexesPerPage.length; j++) {
        var img = await generateSVGDataURLForPage(j)
        imgPage.push(img)
    }

    console.log(svgHeights)

    rowIndexesPerPage.forEach((pageIndexes, pageIndex) => {
        const body = [];
        pageIndexes.forEach(rowIndex => {
            const row = [];
            header.forEach(columnName => {
                if (columnName !== 'Litologia' && columnName !== 'Estructura fosil') {
                    const cellData = data[columnName]?.[rowIndex] || "";
                    row.push([cellData])
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
        header.forEach(head => {
            columnStyles[header.indexOf(head)] = { cellWidth: columnWidths[head] || 10 };
        });

        autoTable(doc, {
            head: [header],
            body: body,
            theme: 'grid',
            styles: {
                // overflow: 'ellipsize',
                //fontSize: 10,
            },
            margin: { top: 20, right: 20, bottom: 20, left: 20 },
            didDrawCell: (datac) => {

                if (datac.row.index === 0 && datac.column.dataKey === header.indexOf('Litologia')) {
                    xcell = datac.cell.x
                    ycell = datac.cell.y
                }
                else if (datac.row.index === 0 && datac.column.dataKey === header.indexOf('Espesor')) {
                    xcellEspesor = datac.cell.x
                }
                else if (datac.row.index === 0 && datac.column.dataKey === header.indexOf('Estructura fosil')) {
                    xcellFossils = datac.cell.x
                }
            },
            columnStyles: columnStyles,
            includeHiddenHtml: true,
            didParseCell: function (datac) {
                if (datac.row.section === "head") {
                    datac.cell.height = 40
                } else {
                    //console.log(svgHeights[`${pageIndex},${datac.row.index}`] * (colW/originalW))
                    const value = svgHeights[`${pageIndex},${datac.row.index}`] * (colW / originalW)
                    console.log( colW/originalW)
                    console.log(svgHeights[`${pageIndex},${datac.row.index}`], value)
                    datac.cell.styles.minCellHeight = value
                }
            },
            didDrawPage: (datac) => {
                datac.doc.addImage(imgPage[pageIndex], xcell, ycell); // capas
                if (imageEspesor[pageIndex] !== "data:,") {
                    datac.doc.addImage(imageEspesor[pageIndex], xcellEspesor, ycell) // espesor
                }
                if (imageFossils[pageIndex] !== "data:,") {
                    datac.doc.addImage(imageFossils[pageIndex], xcellFossils, ycell) // fosiles
                }


            }
        });
    });
    //doc.save('table.pdf');
    document.getElementById('main-iframe').setAttribute('src', URL.createObjectURL(doc.output('blob')).toString());
    //window.open(doc.output('bloburl'), '_blank');
};


export default exportTableToPDFWithPagination;