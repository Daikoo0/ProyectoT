import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// data de las filas, Nombre de las columnas, formato de la hoja
const exportTableToPDFWithPagination = async (data, headerParam, format) => {

    // var data = dataParam
    var header = [...headerParam]
    var format = format
    let rowIndexesPerPage = [];
    let currentPageHeight = 60;
    let currentPageIndexes = [];
    let svgHeights = {};
    var marginRight = 20
    var marginLeft = 20

    const doc = new jsPDF({
        orientation: 'p', // l
        unit: 'pt',
        format: format
    });

    var columnWidths = {}
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    console.log(pageHeight)

    const colW = ((pageWidth - (marginRight + marginLeft)) - ((pageWidth - (marginRight + marginLeft)) * 0.25)) / (header.length - 2) // ancho de cada columna - 50 espesor - 40 margenes 
    let originalW = 1;
    columnWidths["Espesor"] = (pageWidth - (marginRight + marginLeft)) * 0.05
    columnWidths["Litologia"] = (pageWidth - (marginRight + marginLeft)) * 0.2

    for (var i in header) {
        if (header[i] !== "Espesor" && header[i] !== "Litologia") {
            columnWidths[header[i]] = colW
        }
    }

    function svgListToDataURL(svgList, fosil, rowIndexesPerPage, pageIndex) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let totalHeight = 0;
            let maxWidth = columnWidths["Litologia"] + 200;
            let combinedSVG = `<svg width="${maxWidth}" xmlns="http://www.w3.org/2000/svg">`;

            svgList.forEach((svg, index) => {
                const svgCopy = svg.cloneNode(true);
                const circles = svgCopy.querySelectorAll('circle');
                circles.forEach(circle => circle.remove());
                const alturaActual = parseFloat(svgCopy.getAttribute('height'));
                const currentWidth = svg.parentNode.clientWidth;
                let scaleFactor = maxWidth / currentWidth;
                svgCopy.setAttribute('transform', `scale(${scaleFactor},1)`);
                svgCopy.style.transformOrigin = `0 0`;
                svgCopy.setAttribute('y', totalHeight); // Set the y position for stacking
                totalHeight += alturaActual;
                svgHeights[`${pageIndex},${index}`] = alturaActual
                combinedSVG += new XMLSerializer().serializeToString(svgCopy);
            });
            combinedSVG += `</svg>`;

            console.log(combinedSVG)

            const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            console.log(url)

            const img = new Image();
            img.onload = () => {
                canvas.width = maxWidth + 200;
                canvas.height = totalHeight + 10;
                ctx.drawImage(img, 0, 0);
                const imgURL = canvas.toDataURL('image/png', 1.0);
                console.log(imgURL)
                resolve(imgURL);
            };
            img.onerror = (e) => {
                reject(e);
            };
            img.src = url;
        });
    }


    // Funcion para calcular la cantidad de filas por pagina
    Object.values(data).forEach((key, index) => {
        const rowHeight = key['Litologia'].height * 0.75
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

    // Funcion para generar una imagen segun la pagina
    async function generateSVGDataURLForPage(pageIndex) {
        const indexes = rowIndexesPerPage[pageIndex]; // todos los índices de pageIndex
        const filteredTdsWithSvg = Array.from(tdsWithSvg).filter((_, index) => indexes.includes(index)); // filtrar los svg de la página que se está generando
        if (filteredTdsWithSvg.length > 0) {
            const imageDataURL = await svgListToDataURL(filteredTdsWithSvg, false, rowIndexesPerPage[pageIndex], pageIndex);
            console.log(imageDataURL)
            return imageDataURL;
        } else {
            // Si no hay SVGs, podría retornar una imagen estándar o manejar de otro modo
            return null; // O manejo alternativo
        }
    }

    var imgPage = [];
    for (var j = 0; j < rowIndexesPerPage.length; j++) {
        const img = await generateSVGDataURLForPage(j);
        console.log(img)
        if (img) { // Solo añadir si la imagen existe
            imgPage.push(img);
        } else {
            imgPage.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'); // imagen en blanco o similar
        }
    }


    rowIndexesPerPage.forEach((pageIndexes, pageIndex) => {
        const body = [];
        pageIndexes.forEach(rowIndex => {
            const row = [];
            header.forEach(columnName => {
                if (columnName !== 'Litologia' && columnName !== 'Estructura fosil') {
                    let cellData = data[rowIndex]?.[columnName] || "";
                    row.push(cellData);
                }
            });
            body.push(row);
        });

        if (pageIndex > 0) {
            doc.addPage();
        }
        var xcellCapas = 0
        var ycellCapas = 0
        const columnStyles = {};
        header.forEach(head => {
            columnStyles[header.indexOf(head)] = { cellWidth: columnWidths[head] || 10 };
        });

        autoTable(doc, {
            head: [header],
            body: body,
            theme: 'grid',
            margin: { top: 20, right: marginRight, bottom: 20, left: marginLeft },

            didDrawCell: (datac) => {

                if (datac.row.index === 0 && datac.column.dataKey === header.indexOf('Litologia')) {
                    xcellCapas = datac.cell.x
                    ycellCapas = datac.cell.y
                }

            },
            columnStyles: columnStyles,
            bodyStyles: {
                cellPadding: 0,
            },
            includeHiddenHtml: true,
            didParseCell: function (datac) {
                if (datac.row.section === "head") {
                    datac.cell.styles.minCellHeight = 40//40
                } else {
                    console.log(datac)
                    const value = svgHeights[`${pageIndex},${datac.row.index}`]
                    datac.cell.styles.minCellHeight = value * 0.75
                }
            },
            didDrawPage: (datac) => {
                datac.doc.addImage(imgPage[pageIndex], xcellCapas, ycellCapas); // capas

            }
        });
    });

    document.getElementById('main-iframe').setAttribute('src', URL.createObjectURL(doc.output('blob')).toString());

};


export default exportTableToPDFWithPagination;