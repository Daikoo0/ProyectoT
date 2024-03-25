import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exportTableToPDFWithPagination = async (columnWidths, dataParam, headerParam, format) => {
    // const escala = scale || 1;
    const escala = 1
    var data = dataParam
    var header = [...headerParam]
    let rowIndexesPerPage = [];
    let currentPageHeight = 60 * 96 / 72;
    let currentPageIndexes = [];
    // function pixelsToPoints(pixels) {
    //     return (pixels / 96) * 72;
    // }
    //const maxHeight = Math.max(...Object.values(data).map((item) => item['Litologia'].height))
    //  const pageWidth2 = 595 // pixelsToPoints(1500);
    //const pageHeight2 = 842//pixelsToPoints(Math.max(Number(maxHeight), 1000)) + 100;

    const sheetSizes = {
        'A4': [595, 842],
        'A3': [842, 1190],
        'letter': [612, 792],
        'tabloid': [792, 1224],
        'legal': [725, 1009]
    }
    console.log(sheetSizes[String(format)][1])

    Object.values(data).forEach((key, index) => {
        const rowHeight = key['Litologia'].height * escala;
        if (currentPageHeight + rowHeight > sheetSizes[String(format)][1]) {
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
                        pageCtx.drawImage(img1, 0, startY, maxwidth, pageCanvas.height, 0, 0, maxwidth, endY - startY);
                        const pageImgURL = pageCanvas.toDataURL('image/png', 1.0);
                        //        console.log(pageImgURL)
                        fossilsPage.push(pageImgURL);
                    });
                    resolve(fossilsPage); // Asegúrate de resolver la promesa original después de procesar todas las páginas
                }).catch(error => reject(error));
            } else {
                svgList.forEach((svg) => {
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
        orientation: 'l', // l
        unit: 'pt',
        format: format//[pageWidth2, pageHeight2]
    });

    const filteredSvgs = document.querySelectorAll('table tbody tr td svg');
    const indices = Object.keys(data);
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
    var imageFossils = await svgListToDataURL(svgFossils, true, rowIndexesPerPage);
    var imageEspesor = await svgListToDataURL(svgEspesor, true, rowIndexesPerPage);

    async function generateSVGDataURLForPage(pageIndex) {
        const indexes = rowIndexesPerPage[pageIndex];
        const filteredTdsWithSvg = Array.from(tdsWithSvg).filter((_, index) => indexes.includes(index));
        const imageDataURL = await svgListToDataURL(filteredTdsWithSvg, false, rowIndexesPerPage);
        return imageDataURL;
    }

    var imgPage = []
    for (var i = 0; i < rowIndexesPerPage.length; i++) {
        var img = await generateSVGDataURLForPage(i)
        imgPage.push(img)
    }

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
            columnStyles[header.indexOf(head)] = { cellWidth: columnWidths[head] * 72 / 96 || 150 * 72 / 96 };
        });

        autoTable(doc, {
            head: [header],
            body: body,
            theme: 'grid',
            styles: {
                // overflow: 'ellipsize',
                //fontSize: 10,
            },
            startY: 20,
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
                    console.log(datac)
                } else {
                    //  datac.row.height = (data[datac.row.index]['Litologia'].height * escala / 96) * 72;
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
    //doc.save('table.pdf');
    document.getElementById('main-iframe').setAttribute('src', URL.createObjectURL(doc.output('blob')).toString());
    //window.open(doc.output('bloburl'), '_blank');
};


export default exportTableToPDFWithPagination;