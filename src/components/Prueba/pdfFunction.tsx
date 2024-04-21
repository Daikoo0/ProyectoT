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

    // Funcion para convertir los svg a imagenes por pagina     
    function svgListToDataURL(svgList, fosil, rowIndexesPerPage, pageIndex) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const promises = [];
            let totalHeight = 0;
            let maxwidth = columnWidths["Litologia"];
            var svgData;
            if (!fosil) {
                svgList.forEach((svg, index) => {
                    const svgCopy = svg.cloneNode(true); // Clonar el svg para no modificar el original
                    const circles = svgCopy.querySelectorAll('circle');
                    circles.forEach(circle => {
                        circle.remove();
                    });
                    let alturaActual = parseFloat(svgCopy.getAttribute('height'));
                    originalW = parseFloat(svgCopy.getAttribute('width'));
                    let nuevaAltura = alturaActual + 10;
                    svgCopy.setAttribute('height', `${nuevaAltura}px`);
                    var contenedor = svg.parentNode;
                    const currentWidth = contenedor.clientWidth;
                    var newWidth = columnWidths["Litologia"];
                    var scaleFactor = 0
                    if (newWidth < currentWidth) {
                        scaleFactor = newWidth / currentWidth;
                        svgCopy.setAttribute('transform', 'scale(' + scaleFactor + ',1)');
                    }
                    if (newWidth >= currentWidth) {
                        scaleFactor = currentWidth / newWidth;
                        svgCopy.setAttribute('transform', 'scale(' + scaleFactor + ',1)');
                    }
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
                        canvas.width = maxwidth + 500;
                        canvas.height = totalHeight
                        let offsetY = 0;
                        images.forEach((img) => {
                            ctx.drawImage(img, 0, offsetY);
                            offsetY += img.height - 10
                        });
                        const imgURL = canvas.toDataURL('image/png', 1.0);
                        //console.log(imgURL)
                        resolve(imgURL);

                    }).catch(error => reject(error));
            }
        });
    }

    // Funcion para calcular la cantidad de filas por pagina
    Object.values(data).forEach((key, index) => {
        const rowHeight = key['Litologia'].height*0.75
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

    // Funcion para generar una imagen segun la pagina
    async function generateSVGDataURLForPage(pageIndex) {
        const indexes = rowIndexesPerPage[pageIndex]; // todos los index de pageindex
        const filteredTdsWithSvg = Array.from(tdsWithSvg).filter((_, index) => indexes.includes(index)); // filtrar los svg de la pagina que se esta generando 
        const imageDataURL = await svgListToDataURL(filteredTdsWithSvg, false, rowIndexesPerPage[pageIndex], pageIndex);
        return imageDataURL;
    }

    var imgPage = []
    for (var j = 0; j < rowIndexesPerPage.length; j++) {
        var img = await generateSVGDataURLForPage(j)
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
            includeHiddenHtml: true,
            didParseCell: function (datac) {
                if (datac.row.section === "head") {
                    datac.cell.height = 400//40
                } else {
                    const value = svgHeights[`${pageIndex},${datac.row.index}`]//  * (colW / originalW)
                    datac.cell.styles.minCellHeight = value*0.75
                   // datac.cell.height = value
                }
            },
            didDrawPage: (datac) => {
                datac.doc.addImage(imgPage[pageIndex], xcellCapas, ycellCapas); // capas
                //datac.doc.rect(xcellCapas, ycellCapas, 100, 40);

            }
        });
    });

    document.getElementById('main-iframe').setAttribute('src', URL.createObjectURL(doc.output('blob')).toString());

};


export default exportTableToPDFWithPagination;