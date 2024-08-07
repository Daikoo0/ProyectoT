import { Page, Text, View, Document, StyleSheet, pdf, Image as Img } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import sheetSize from '../../sheetSizes.json';
//import sheetSizeCm from '../../sheetSizesCm.json';
import MySVG from "../MYSVG.tsx";

// Estilos
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    paddingTop: 10,
    paddingLeft: "0.5cm",
    paddingRight: "0.5cm",
    fontSize: 10,
  },
  paragraph: {
    marginTop: 1, // Ajusta el espacio entre párrafos
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: 'row',
    // borderBottomWidth: 1,
    // borderBottomColor: 'grey',
    // borderBottomStyle: 'solid',
    // overflow: 'hidden',
    // lineHeight: 1,
  },
  tableCol: {
    borderRightWidth: "0.01cm",//0.5,
    borderRightColor: 'grey',
    borderRightStyle: 'solid',
    borderLeftWidth: "0.01cm",//0.5,
    borderLeftColor: 'grey',
    borderLeftStyle: 'solid',
    //  overflow: 'hidden',
  },
  tableCellHeader: {
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#f3f3f3',
    margin: 0,
  },
  tableCell: {
    textAlign: 'center',
    margin: 0,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
});

const TableHeader = ({ columnWidths, header }) => {
  return (
    <View style={[styles.tableRow]}>
      {Object.keys(header).map((key, index) => (
        <View key={index} style={[styles.tableCol, styles.tableCellHeader, { width: columnWidths[header[key]], height: 120 }]}>
          {header[key] === "Litologia" ? (
            <MySVG wdth={parseFloat(columnWidths["Litologia"])} />
          ) : (
            <Text>{header[key]}</Text>
          )}
        </View>
      ))}
    </View>
  );

};

function svgListToDataURL(svgList, columnWidths) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let totalHeight = 0;
    let val = parseFloat(columnWidths["Litologia"]) //(((widthSheet - 20) / 100) * parseFloat(maxWidth))
    let combinedSVG = `<svg width="` + val + `cm" xmlns="http://www.w3.org/2000/svg">`;

    svgList.forEach((svg, index) => {
      const svgCopy = svg.cloneNode(true);
      const circles = svgCopy.querySelectorAll('circle');
      circles.forEach(circle => circle.remove());
      const alturaActual = parseFloat(svgCopy.getAttribute('height'));
      const currentWidth = svg.clientWidth * 2.54 / 96//svg.clientWidth
      let scaleFactor = parseFloat(columnWidths["Litologia"]) / currentWidth //(((widthSheet - 20) / 100) * parseFloat(maxWidth)) / (currentWidth);
      var path = svgCopy.getElementsByClassName("stroke-current text-base-content");
      var pa = svgCopy.getElementsByClassName("pa");
      path[0].setAttribute('transform', `scale(${scaleFactor},1)`);
      for (var i = 0; i < pa.length; i++) {
        pa[i].setAttribute('transform', `scale(${scaleFactor},1)`);
      }
      svgCopy.style.transformOrigin = `0 0`;
      svgCopy.setAttribute('y', totalHeight);
      totalHeight += alturaActual;
      combinedSVG += new XMLSerializer().serializeToString(svgCopy);
    });
    combinedSVG += `</svg>`;
    console.log(combinedSVG)

    const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = parseFloat(columnWidths["Litologia"]) * 96 / 2.54//(((widthSheet - 20) / 100) * parseFloat(maxWidth));
      canvas.height = totalHeight + 10;
      ctx.drawImage(img, 0, 0);
      const imgURL = canvas.toDataURL('image/png', 1.0);
      resolve({ imgURL, totalHeight });
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = url;
  });
}


const svgDivision = async (measures, columnWidths) => {
  let arrayFossils = []
  let arrayEspesor = []
  let arrayFacies = []
  var y = 0
  const svgFossil = document.querySelector('svg#fossilSvg');
  const svgEspesor = document.querySelector('svg#rulerSvg');
  const svgFacies = document.querySelector('svg#svgFacies');
  for (const measure of measures) {
    const { height } = measure;
    const imgPageFossils = await svgToImg(svgFossil, height, svgFossil.clientWidth, y, "Estructura fosil", columnWidths);
    const imgPageEspesor = await svgToImg(svgEspesor, height, svgEspesor.clientWidth, y, "Espesor", columnWidths);
    const imgPageFacies = await svgToImg(svgFacies, height, svgFacies.clientWidth, y, "Facie", columnWidths);
    y += height;
    arrayFossils.push(imgPageFossils);
    arrayEspesor.push(imgPageEspesor);
    arrayFacies.push(imgPageFacies);
  }
  return [arrayFossils, arrayEspesor, arrayFacies];
};

async function generateSVGDataURLForPage(pageIndex, rowIndexesPerPage, tdsWithSvg, columnWidths) {
  const indexes = rowIndexesPerPage[pageIndex]; // todos los índices de pageIndex
  const filteredTdsWithSvg = Array.from(tdsWithSvg).filter((_, index) => indexes.includes(index)); // filtrar los svg de la página que se está generando
  if (filteredTdsWithSvg.length > 0) {
    const imageDataURL = await svgListToDataURL(filteredTdsWithSvg, columnWidths);
    console.log(imageDataURL)
    return imageDataURL;
  } else {
    return null;
  }
}


const MyDocument = ({ imageFossils, imageEspesor, imageFacies, orientation, format, imgPage, columnWidths, data, header, rowIndexesPerPage, widthSheet, heightSheet }) => {

  var firstArray = []
  var secondArray = []
  var thirdArray = []
  var uno = 0;
  var dos = 0;
  var tres = 0;

  var splitIndex = header.indexOf("Espesor");
  var endIndex = header.indexOf("Facie") || header.indexOf("Estructura fosil") || header.indexOf("Litologia");

  for (let i = 0; i < header.length; i++) {
    if (i < splitIndex) {
      firstArray.push(header[i]);
      uno += parseFloat(columnWidths[header[i]])
    } else if (i >= splitIndex && i <= endIndex) {
      secondArray.push(header[i]);
      dos += parseFloat(columnWidths[header[i]])
    } else if (i > endIndex) {
      thirdArray.push(header[i]);
      tres += parseFloat(columnWidths[header[i]])
    }
  }

  return (
    <Document>
      {rowIndexesPerPage.map((pageIndexes, pageIndex) => (
        <Page orientation={orientation} size={[sheetSize[format][0], sheetSize[format][1]]} style={styles.page} key={`page-${pageIndex}`}>
          <TableHeader columnWidths={columnWidths} header={header} />
          <View style={[{ flexDirection: 'row' }]}>
            <View style={[{ flexDirection: 'column' }]}>
              {pageIndexes.map((item, index) => (

                <View style={[styles.tableRow]} key={index}>
                  {Object.values(firstArray).map((key, i) => {
                    return (
                      <View style={[styles.tableCol, styles.tableCell]}>
                        <Html key={i} style={[{ width: columnWidths[firstArray[i]], height: data[item].Litologia.Height }]}>{(data[item]?.[firstArray[i]] || "")}</Html>
                      </View>
                    )
                  })}
                </View>

              ))}
            </View>

            {pageIndexes.map((item, index) => (
              <View style={[styles.tableRow,{height:imgPage[pageIndex].totalHeight + 10}]}>
                {Object.values(secondArray).map((key, i) => {
                  if (item === 0) {
                    return (
                      <View key={i} style={[styles.tableCol]}>
                        {secondArray[i] === "Litologia" && (<Img src={imgPage[pageIndex].imgURL} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight + 10, width: columnWidths["Litologia"] }]} />)}
                        {secondArray[i] === "Estructura fosil" && (<Img src={imageFossils[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight, width: columnWidths["Estructura fosil"] }]} />)}
                        {secondArray[i] === "Espesor" && (<Img src={imageEspesor[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight, width: columnWidths["Espesor"] }]} />)}
                        {secondArray[i] === "Facie" && (<Img src={imageFacies[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight, width: columnWidths["Facie"],left : "-0.1cm" }]} />)}
                      </View>
                    )
                  }
                })}
              </View>
            ))}

            <View style={[{ flexDirection: 'column' }]}>
              {pageIndexes.map((item, index) => (

                <View style={[styles.tableRow]} key={index}>
                  {Object.values(thirdArray).map((key, i) => {
                    return (
                      <View style={[styles.tableCol, styles.tableCell]}>
                        <Html key={i} style={[{ width: columnWidths[thirdArray[i]], height: data[item].Litologia.Height }]}>{(data[item]?.[thirdArray[i]] || "")}</Html>
                      </View>
                    )
                  })}
                </View>

              ))}
            </View>
          </View>
        </Page >))}
    </Document>
  )
};


function svgToImg(elsvg, height, width, y, columnName, columnWidths) {
  var svgCopy = elsvg.cloneNode(true);
  let scaleFactor = parseFloat(columnWidths[columnName]) / (width * 2.54 / 96)
  svgCopy.setAttribute("width", columnWidths[columnName]);//(parseFloat(columnWidths[columnName]) * 96 / 2.54));
  svgCopy.setAttribute("height", height);
  // svgCopy.setAttribute('transform', `scale(${scaleFactor},1)`);
  if (columnName === "Estructura fosil") {
    //svgCopy.style.background = "blue";
    var lines = svgCopy.querySelectorAll('line');
    lines.forEach(line => {
      line.style.stroke = "black";
    });
    const fossilUnits = svgCopy.querySelectorAll('g.fossilUnit');
    fossilUnits.forEach(fossilUnit => {
      fossilUnit.setAttribute('transform', `scale(${scaleFactor},1)`);
    });
    console.log(svgCopy)
  } else if (columnName === "Espesor") {
    var lines = svgCopy.querySelectorAll('line');
    lines.forEach(line => {
      line.style.stroke = "black";
    });
  } 
  else if (columnName === "Facie") {
    var texts = svgCopy.querySelectorAll('text');
    var rLength = svgCopy.querySelectorAll('rect[data-value="value1"]').length + 5;
    console.log((parseFloat(columnWidths[columnName]) * 96 / 2.54) / rLength)
    texts.forEach(text => {
      text.setAttribute("font-size", (parseFloat(columnWidths[columnName]) * 96 / 2.54) / rLength);
    });
  }
  svgCopy.setAttribute("viewBox", `0 ${y} ${parseFloat(columnWidths[columnName]) * 96 / 2.54} ${height}`);
  //svgCopy.style.background = "white"
  svgCopy.style.transformOrigin = `0 0`;
  var combinedSVG = new XMLSerializer().serializeToString(svgCopy);
  console.log(combinedSVG)
  return new Promise((resolve, reject) => {
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      canvas2.width = parseFloat(columnWidths[columnName]) * 96 / 2.54//width;
      canvas2.height = height;
      ctx2.drawImage(img, 0, 0);
      const imgURL = canvas2.toDataURL('image/png', 1.0);
      resolve(imgURL);
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = url;
  })
}


const Ab = async (data, headerParam, format, orientation, customWidthLit) => {
  let widthSheet = (orientation == "portrait") ? sheetSize[format][0] : sheetSize[format][1];
  let heightSheet = (orientation == "portrait") ? sheetSize[format][1] : sheetSize[format][0];
  let rowIndexesPerPage = [];
  let currentPageIndexes = [];
  let pageLenghts = [];
  let currentPageHeight = 110;
  var header = [...headerParam]
  var format = format
  var columnWidths = {}
  //columnWidths["Espesor"] = String((1 * 100) / (widthSheet*0.0352778-20)) + "cm"
  // columnWidths["Litologia"] = customWidthLit!=="" ? customWidthLit : String((3 * 100) / (widthSheet*0.0352778)) + "cm"
  columnWidths["Litologia"] = customWidthLit !== "" ? customWidthLit : String((25 * widthSheet * 0.0352778) / 100) + "cm"
  columnWidths["Espesor"] = (parseFloat(columnWidths["Litologia"]) / 4) + "cm"; //"2cm"
  console.log(columnWidths["Espesor"])
  //  columnWidths["Litologia"] = customWidthLit!=="" ? customWidthLit : "25%";
  for (var i in header) {
    if (header[i] !== "Espesor" && header[i] !== "Litologia") {
      //columnWidths[header[i]] = String((((100)-((((40+((customWidthLit !== ""? parseFloat(customWidthLit) : 25)*(widthSheet-20)/100)) * 100)/(widthSheet-20)))) / (header.length - 2))) + "%"
      //columnWidths[header[i]] = String((((100)-((((4) * 100)/(widthSheet*0.0352778-20)))) / (header.length - 2))) + "%"
      console.log(header[i])
      columnWidths[header[i]] = String((widthSheet * 0.0352778 - (parseFloat(columnWidths["Espesor"]) + parseFloat(columnWidths["Litologia"]))) / (header.length - 2)) + "cm"
    }
  }

  Object.values(data).forEach((key, index) => {
    const rowHeight = key['Litologia'].Height
    if ((currentPageHeight + rowHeight) > (heightSheet - 10)) {
      rowIndexesPerPage.push(currentPageIndexes);
      pageLenghts.push({ 'height': currentPageHeight - 110 })
      currentPageIndexes = [];
      currentPageHeight = 110;
    }
    currentPageHeight += Number(rowHeight);
    currentPageIndexes.push(index);
  });

  // ultima pagina
  if (currentPageIndexes.length) {
    rowIndexesPerPage.push(currentPageIndexes);
    var totalPageHeight = 110
    Object.values(data).forEach((key, index) => {
      if (currentPageIndexes.includes(index)) {
        const rowHeight = key['Litologia'].Height
        totalPageHeight += Number(rowHeight)
      }
    });
    pageLenghts.push({
      'height': totalPageHeight - 110
    })
  }


  const filteredSvgs = document.querySelectorAll('table tbody tr td svg');
  const indices = Object.keys(data); // data [0,1,2,3,4,5...n]

  // Filtrar los svg que contienen los patrones
  const tdsWithSvg = Array.from(filteredSvgs).filter(svg => {
    const patterns = svg.querySelectorAll('pattern');
    return Array.from(patterns).some(pattern => {
      return indices.some(index => pattern.id === `pattern-${index}`);
    });
  });

  var imgPage = [];
  for (var j = 0; j < rowIndexesPerPage.length; j++) {
    const img = await generateSVGDataURLForPage(j, rowIndexesPerPage, tdsWithSvg, columnWidths);
    imgPage.push(img);
  }

  const images = await svgDivision(pageLenghts, columnWidths);
  const blob = await pdf(<MyDocument imageFossils={images[0]} imageEspesor={images[1]} imageFacies={images[2]} orientation={orientation} format={format} imgPage={imgPage} columnWidths={columnWidths} data={data} header={header} rowIndexesPerPage={rowIndexesPerPage} widthSheet={widthSheet} heightSheet={heightSheet} />).toBlob();
  const url = URL.createObjectURL(blob);
  const iframe = document.getElementById('main-iframe');
  iframe.setAttribute("src", url);
};

export default Ab;
