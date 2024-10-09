import { Page, Text, View, Document, StyleSheet, pdf, Image as Img } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import sheetSize from '../../sheetSizes.json';
import MySVG from "../MYSVG.tsx";
import lithologic from '../../lithologic.json';
import fosilJson from '../../fossil.json';
import { useTranslation } from 'react-i18next';

// Estilos
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    paddingTop: 10,
    paddingLeft: "0.3cm",
    paddingRight: "0.3cm",
    fontSize: 10,
  },
  paragraph: {
    marginTop: 1,
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    borderWidth: 0.5,
  },
  tableCellHeader: {
    textAlign: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    backgroundColor: 'white',
    margin: 0,
  },
  tableCell: {
    textAlign: 'center',
    margin: 0,
    overflow: 'hidden',
  },
});

const TableHeader = ({ columnWidths, header }) => {

  const { t } = useTranslation(['PDF']);
  return (
    <View style={[styles.tableRow]}>
      {Object.keys(header).map((key, index) => (
        <View key={index} style={[styles.tableCol, styles.tableCellHeader, { width: columnWidths[header[key]], height: 120 }]}>
          {header[key] === "Litologia" ? (
            <MySVG wdth={parseFloat(columnWidths["Litologia"])} />
          ) : (
            <Text>{t("" + header[key])}</Text>
          )}
        </View>
      ))}
    </View>
  );

};

function svgListToDataURL(svgList, columnWidths, limited, pageIndex, pageLengths, isInverted) {

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let totalHeight = 0;
    let val = parseFloat(columnWidths["Litologia"])
    let combinedSVG = `<svg width="${val}cm" xmlns="http://www.w3.org/2000/svg">`;

    svgList.forEach((svg, _) => {
      const svgCopy = svg.cloneNode(true);
      const scaleH = pageLengths[pageIndex].height / parseFloat(svgCopy.getAttribute("height"))
      const circles = svgCopy.querySelectorAll('circle');
      circles.forEach(circle => circle.remove());
      const alturaActual = parseFloat(svgCopy.getAttribute('height'));
      const currentWidth = svg.clientWidth * 2.54 / 96
      let scaleFactor = parseFloat(columnWidths["Litologia"]) / currentWidth
      var path = svgCopy.getElementsByClassName("stroke-current text-base-content");
      var pa = svgCopy.getElementsByClassName("pa");
      path[0].setAttribute('transform', `scale(${scaleFactor},1)`);
      for (var i = 0; i < pa.length; i++) {
        pa[i].setAttribute('transform', `scale(${scaleFactor},1})`);
      }


      if (limited) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', `scale(1, ${scaleH})`);

        while (svgCopy.firstChild) {
          g.appendChild(svgCopy.firstChild);
        }
        svgCopy.appendChild(g);

        totalHeight += alturaActual * scaleH;
        svgCopy.setAttribute('y', (isInverted ? totalHeight : totalHeight - alturaActual * scaleH));
      } else {
        totalHeight += alturaActual;
        svgCopy.setAttribute('y', (isInverted ? totalHeight : totalHeight - alturaActual));
      }


      if (isInverted) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', 'scale(1,-1)');
        while (svgCopy.firstChild) {
          g.appendChild(svgCopy.firstChild);
        }
        svgCopy.appendChild(g);
      }
      //totalHeight += (limited ? alturaActual * scaleH : alturaActual);
      //svgCopy.setAttribute('y', (isInverted ? totalHeight : totalHeight - (isInverted ? alturaActual * scaleH : alturaActual)));
      combinedSVG += new XMLSerializer().serializeToString(svgCopy);
    });
    combinedSVG += `</svg>`;
    const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    const scaleFactor = 3; // Ajustar según sea necesario para mejorar la calidad

    img.onload = () => {
      canvas.width = parseFloat(columnWidths["Litologia"]) * 96 / 2.54 * scaleFactor;
      canvas.height = (totalHeight + 10) * scaleFactor;

      ctx.scale(scaleFactor, scaleFactor);
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

const svgDivision = async (measures, columnWidths, isInverted) => {
  let arrayFossils = []
  let arrayEspesor = []
  let arrayFacies = []
  var y = 0
  const svgFossil = document.querySelector('svg#fossilSvg') as SVGElement | null;
  const svgEspesor = document.querySelector('svg#rulerSvg') as SVGElement | null;
  const svgFacies = document.querySelector('svg#svgFacies') as SVGElement | null;

  console.log(svgFacies.getBoundingClientRect().height)

  for (const measure of measures) {
    const { height, originalHeight } = measure;
    const imgPageFossils = svgFossil ? await svgToImg(svgFossil, height, originalHeight, svgFossil.clientWidth, y, "Estructura fosil", columnWidths, isInverted, svgFacies.getBoundingClientRect().height) : "";
    const imgPageEspesor = svgEspesor ? await svgToImg(svgEspesor, height, originalHeight, svgEspesor.clientWidth, y, "Espesor", columnWidths, isInverted, svgFacies.getBoundingClientRect().height) : "";
    const imgPageFacies = svgFacies ? await svgToImg(svgFacies, height, originalHeight, svgFacies.clientWidth, y, "Facie", columnWidths, isInverted, svgFacies.getBoundingClientRect().height) : "";
    y += originalHeight;
    imgPageFossils ? arrayFossils.push(imgPageFossils) : arrayFossils = [];
    imgPageEspesor ? arrayEspesor.push(imgPageEspesor) : arrayEspesor = [];
    imgPageFacies ? arrayFacies.push(imgPageFacies) : arrayFacies = [];
  }
  return [arrayFossils, arrayEspesor, arrayFacies];
};


async function generateSVGDataURLForPage(pageIndex, rowIndexesPerPage, tdsWithSvg, columnWidths, indexLimited, pageLengths, isInverted) {
  const indexes = rowIndexesPerPage[pageIndex]; // todos los índices de pageIndex
  var limited = indexLimited.includes(indexes[0]) ? true : false;
  const filteredTdsWithSvg = Array.from(tdsWithSvg).filter((_, index) => indexes.includes(index)); // filtrar los svg de la página que se está generando
  if (filteredTdsWithSvg.length > 0) {
    const imageDataURL = await svgListToDataURL(filteredTdsWithSvg, columnWidths, limited, pageIndex, pageLengths, isInverted);
    return imageDataURL;
  } else {
    return null;
  }
}

const MyDocument = ({ indexLimited, isInverted, oLev, date, etSec, oEstrat, infoProject, contacts, fossils, patterns, scale, imageFossils, imageEspesor, imageFacies, orientation, format, imgPage, columnWidths, data, header, rowIndexesPerPage }) => {
  var firstArray = []
  var secondArray = []
  var thirdArray = []
  var splitIndex = header.indexOf("Espesor");
  var endIndex = Math.max(header.indexOf("Facie"), header.indexOf("Estructura fosil"), header.indexOf("Litologia"));
  const { t } = useTranslation(['PDF', 'Description', 'Patterns']);

  for (let i = 0; i < header.length; i++) {
    if (i < splitIndex) {
      firstArray.push(header[i]);
    } else if (i >= splitIndex && i <= endIndex) {
      secondArray.push(header[i]);
    } else if (i > endIndex) {
      thirdArray.push(header[i]);
    }
  }

  const allIndexes = rowIndexesPerPage.flat();
  const invertedIndexes = allIndexes.reverse();
  let index = 0;
  const invertedRowIndexesPerPage = rowIndexesPerPage.map(page => {
    const result = invertedIndexes.slice(index, index + page.length);
    index += page.length;
    return result;
  });

  return (
    <Document>
      {(isInverted ? invertedRowIndexesPerPage : rowIndexesPerPage).map((pageIndexes, pageIndex) => (
        <Page orientation={orientation} size={[sheetSize[format][0], sheetSize[format][1]]} style={styles.page} key={`page-${pageIndex}`}>
          <View wrap={false}>
            <View style={[{ height: 40 }]}>
              <Text style={[{ fontSize: 14, fontFamily: "Times-Roman" }]}>
                {t("oEst")} {oEstrat} {t("scale")} 1:{100 / scale} {t("oLev")} {oLev} {t("locality")} {infoProject.Location}
                {t("etSec")} {etSec}  {t("coord")} {infoProject.Lat},{infoProject.Long} {t("page")} {pageIndex + 1}/{rowIndexesPerPage.length} {t("date")} {date}
              </Text>
            </View>
            <TableHeader columnWidths={columnWidths} header={header} />

            <View style={[{ flexDirection: 'row', height: imgPage[pageIndex].totalHeight * 72 / 96 }]} >

              <View style={[{ flexDirection: 'column' }]}>
                {(pageIndexes).map((item, index) => (
                  <View style={[styles.tableRow, { height: (indexLimited.includes(index) ? imgPage[pageIndex].totalHeight * 72 / 96 : data[(isInverted ? invertedRowIndexesPerPage : rowIndexesPerPage)[pageIndex][index]].Litologia.Height * scale * 72 / 96) }]} key={index}>
                    {Object.values(firstArray).map((_, i) => {
                      const htmlContent = data[item]?.[firstArray[i]] || null;
                      const match = htmlContent ? htmlContent.match(/font-size:\s*(\d+px)/i) : null;
                      const fontSize = match ? match[1] : "8px";
                      return (
                        <View style={[styles.tableCol, styles.tableCell]}>
                          <Html key={`first-${pageIndex}${index}${item}${i}`}
                            style={[{ fontSize: fontSize, width: columnWidths[firstArray[i]] }]}>
                            {(data[item]?.[firstArray[i]] || "")}
                          </Html>
                        </View>
                      )
                    })}
                  </View>

                ))}
              </View>

              <View key={`second-${pageIndex}`} style={[styles.tableRow, { borderBottomWidth: 0.5, height: imgPage[pageIndex].totalHeight * 72 / 96 }]}>
                {Object.values(secondArray).map((key, i) => {
                  return (
                    <>
                      {key === "Litologia" && (
                        <View key={`secondLIT-${pageIndex}${key}${i}`}
                          style={[{ borderLeftWidth: 0.5, borderRightWidth: 0.5, height: (imgPage[pageIndex].totalHeight+10) * 72 / 96 }]}>
                          <Img key={`secondImgLitologia-${pageIndex}${key}${i}`} src={imgPage[pageIndex].imgURL} style={[{ backgroundColor: "transparent", height: (imgPage[pageIndex].totalHeight+10) * 72 / 96, width: columnWidths["Litologia"] }]} />
                        </View>
                      )}
                      {(secondArray[i] === "Estructura fosil" && imageFossils.length) && (
                        <View key={`secondEST-${pageIndex}${key}${i}`}
                          style={[{ borderLeftWidth: 0.5, borderRightWidth: 0.5, height: imgPage[pageIndex].totalHeight * 72 / 96 }]}>
                          <Img key={`secondImgFosil-${pageIndex}${key}${i}`} src={imageFossils[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight * 72 / 96, width: columnWidths["Estructura fosil"] }]} />
                        </View>
                      )}
                      {(secondArray[i] === "Espesor" && imageEspesor.length) && (
                        <View key={`secondESP-${pageIndex}${key}${i}`}
                          style={[{ borderLeftWidth: 0.5, borderRightWidth: 0.5, height: imgPage[pageIndex].totalHeight * 72 / 96 }]}>
                          <Img key={`secondImgEspesor-${pageIndex}${key}${i}`} src={imageEspesor[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight * 72 / 96, width: columnWidths["Espesor"] }]} />
                        </View>)}
                      {(secondArray[i] === "Facie" && imageFacies.length) && (
                        <View key={`secondFAC-${pageIndex}${key}${i}`}
                          style={[{ borderLeftWidth: 0.5, borderRightWidth: 0.5, height: imgPage[pageIndex].totalHeight * 72 / 96 }]}>
                          <Img key={`secondImgFacies-${pageIndex}${key}${i}`} src={imageFacies[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight * 72 / 96, width: columnWidths["Facie"], left: "-0.1cm" }]} />
                        </View>)}
                    </>
                  )
                })}
              </View>

              <View style={[{ flexDirection: 'column' }]}>
                {(pageIndexes).map((item, index) => (
                  <View style={[styles.tableRow, { height: (indexLimited.includes(index) ? imgPage[pageIndex].totalHeight * 72 / 96 : data[(isInverted ? invertedRowIndexesPerPage : rowIndexesPerPage)[pageIndex][index]].Litologia.Height * scale * 72 / 96) }]} key={index}>
                    {Object.values(thirdArray).map((_, i) => {
                      const htmlContent = data[item]?.[thirdArray[i]] || null;
                      const match = htmlContent ? htmlContent.match(/font-size:\s*(\d+px)/i) : null;
                      const fontSize = match ? match[1] : "8px";
                      return (
                        <View style={[styles.tableCol, styles.tableCell]}>
                          <Html key={`first-${pageIndex}${index}${item}${i}`}
                            style={[{ fontSize: fontSize, width: columnWidths[thirdArray[i]] }]}>
                            {(data[item]?.[thirdArray[i]] || "")}
                          </Html>
                        </View>
                      )
                    })}
                  </View>
                )
                )}
              </View>

            </View>
          </View>
        </Page >))}
      <Page orientation={orientation} size={[sheetSize[format][0], sheetSize[format][1]]} style={styles.page} key={`page-symbols`}>
        <Text style={[{ paddingLeft: 10, marginTop: 20, marginBottom: 10, fontSize: 20, fontFamily: "Times-Roman" }]}>Simbología</Text>
        <View style={[{ flexDirection: "row", flexWrap: "wrap" }]}>
          {patterns && (
            <View style={[{ paddingLeft: 10, flexDirection: "column" }]}>
              <Text style={[{ marginBottom: 10, fontSize: 15, fontFamily: "Times-Roman" }]}>Patrones</Text>
              {patterns.map((pattern) => (
                <View style={[styles.tableRow, { marginTop: 10, flexDirection: "row", alignItems: 'center' }]}>
                  <Img src={pattern[0]} style={{ height: 50, width: 50 }} />

                  <Text style={{ marginLeft: 5, flexShrink: 1, fontSize: 12 }}>
                    {t(pattern[1], { ns: "Patterns" })}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {fossils && (
            <View style={[{ paddingLeft: 10, flexDirection: "column" }]}>
              <Text style={[{ marginTop: 10, marginBottom: 10, fontSize: 15, fontFamily: "Times-Roman" }]}>Fósiles</Text>
              {Object.values(fossils).map((fosil) => (
                <View style={[styles.tableRow, { marginTop: 10, flexDirection: "row", alignItems: 'center' }]}>
                  <Img src={fosil[0]} style={[{ height: 50, width: 50 }]} />
                  <Text style={{ marginLeft: 5, flexShrink: 1, fontSize: 12 }}>
                    {fosil[1]}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {contacts && (
            <View style={[{ paddingLeft: 10, flexDirection: "column" }]}>
              <Text style={[{ marginTop: 10, marginBottom: 10, fontSize: 15, fontFamily: "Times-Roman" }]}>Contactos</Text>
              {contacts.map((contact) => (
                <View style={[styles.tableRow, { marginTop: 10, flexDirection: "row", alignItems: 'center' }]}>
                  <Img src={contact[0]} style={{ height: 30, width: 150 }} />
                  <Text style={{ marginLeft: 5, flexShrink: 1, fontSize: 12 }}>
                    {t(contact[1], { ns: 'Description' })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document >
  )
};

function svgToImg(elsvg, height, originalHeight, width, y, columnName, columnWidths, isInverted, hsvg) {
  var svgCopy = elsvg.cloneNode(true);
  let scaleFactor = parseFloat(columnWidths[columnName]) / (width * 2.54 / 96)
  svgCopy.setAttribute("width", columnWidths[columnName]);
  svgCopy.setAttribute("height", originalHeight);
  if (columnName === "Estructura fosil") {
    var lines = svgCopy.querySelectorAll('line');
    lines.forEach(line => {
      line.style.stroke = "black";
    });
    const fossilUnits = svgCopy.querySelectorAll('g.fossilUnit');
    var scaleFactorF = (parseFloat(columnWidths[columnName]) - (15 * 2.54 / 96)) / (width * 2.54 / 96)
    fossilUnits.forEach(fossilUnit => {
      fossilUnit.setAttribute('transform', `scale(${scaleFactorF},${isInverted? -1 : 1})`);
    });
  } else if (columnName === "Espesor") {
    var lines = svgCopy.querySelectorAll('line');
    lines.forEach(line => {
      line.setAttribute("stroke", "black")
    });
    svgCopy.setAttribute('transform', `scale(${scaleFactor},1)`);
  }
  else if (columnName === "Facie") {
    var texts = svgCopy.querySelectorAll('text');
    var rects = svgCopy.querySelectorAll('rect[data-value="value1"]')
    var rLength = rects.length + 5;
    texts.forEach(text => {
      text.setAttribute("font-size", (parseFloat(columnWidths[columnName]) * 96 / 2.54) / rLength);
    });
    rects.forEach(rect => {
      const newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      newLine.setAttribute("x1", rect.x.animVal.valueAsString);
      newLine.setAttribute("y1", "0");
      newLine.setAttribute("x2", rect.x.animVal.valueAsString);
      newLine.setAttribute("y2", hsvg);
      newLine.setAttribute("stroke", "black");
      newLine.setAttribute("stroke-width", "1");
      svgCopy.appendChild(newLine);

      const newLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      newLine2.setAttribute("x1", rect.width.animVal.valueAsString);
      newLine2.setAttribute("y1", "0");
      newLine2.setAttribute("x2", rect.width.animVal.valueAsString);
      newLine2.setAttribute("y2", hsvg);
      newLine2.setAttribute("stroke", "black");
      newLine2.setAttribute("stroke-width", "1");
      svgCopy.appendChild(newLine2);
    });
  }
  if (columnName === "Facie" && isInverted) {
    svgCopy.setAttribute("viewBox", `0 ${Number(hsvg - originalHeight - y)} ${parseFloat(columnWidths[columnName]) * 96 / 2.54} ${originalHeight}`);
  } else {
    svgCopy.setAttribute("viewBox", `0 ${y} ${parseFloat(columnWidths[columnName]) * 96 / 2.54} ${originalHeight}`);
  }

  var combinedSVG = new XMLSerializer().serializeToString(svgCopy);

  return new Promise((resolve, reject) => {
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    console.log(url)
    const img = new Image();
    const scaleFactor = 3; // Escala para mejorar la calidad
    img.onload = () => {
      const originalWidth = parseFloat(columnWidths[columnName]) * 96 / 2.54;
      const originalHeight = height;
      canvas2.width = originalWidth * scaleFactor;
      canvas2.height = originalHeight * scaleFactor;
      ctx2.scale(scaleFactor, scaleFactor);
      ctx2.drawImage(img, 0, 0, originalWidth, originalHeight);
      const imgURL = canvas2.toDataURL('image/png', 1.0);
      resolve(imgURL);
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = url;
  });
}

const Ab = async (info, headerParam, format, orientation, customWidthLit, scale, fossils, infoProject, indexesM, oEstrat,
  oLev,
  etSec,
  date, isInverted) => {
  const iframe = document.getElementById('main-iframe');
  iframe.setAttribute("src", "");
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.innerText = 'Loading...';
  loadingIndicator.style.position = 'absolute';
  loadingIndicator.style.top = '50%';
  loadingIndicator.style.left = '50%';
  loadingIndicator.style.transform = 'translate(-50%, -50%)';
  loadingIndicator.style.zIndex = '1000';
  iframe.parentElement.style.position = 'relative';
  iframe.parentElement.appendChild(loadingIndicator);

  loadingIndicator.innerHTML = `
  <span class="loading loading-spinner text-primary w-16 h-16"></span>
  `;

  iframe.parentElement.style.position = 'relative';
  iframe.parentElement.appendChild(loadingIndicator);
  const clonedInfo = JSON.parse(JSON.stringify(info)); // Clon profundo
  const data = clonedInfo.filter((_, index) => indexesM.includes(index));
  let widthSheet = (orientation == "portrait") ? sheetSize[format][0] : sheetSize[format][1];
  let heightSheet = (orientation == "portrait") ? sheetSize[format][1] : sheetSize[format][0];
  let rowIndexesPerPage = [];
  let currentPageIndexes = [];
  let pageLengths = [];
  let currentPageHeight = 180;
  var header = [...headerParam]
  var format = format
  var columnWidths = {}
  columnWidths["Litologia"] = String(((customWidthLit ? parseFloat(customWidthLit) : 20) * widthSheet * 0.0352778) / 100) + "cm";

  var remainingWidth = widthSheet * 0.0352778 - parseFloat(columnWidths["Litologia"]);
  var otherColumnsCount = header.length - 2;
  var otherColumnWidth = remainingWidth / (otherColumnsCount + 0.5);
  for (var i in header) {
    if (header[i] !== "Espesor" && header[i] !== "Litologia") {
      columnWidths[header[i]] = String(otherColumnWidth) + "cm";
    }
  }
  columnWidths["Espesor"] = String(otherColumnWidth / 2) + "cm";
  const topHeaders = 180
  const indexLimited = []
  const maxLitHeight = heightSheet - topHeaders - 10;

  (isInverted ? Object.values(data).reverse() : Object.values(data)).forEach((key, index) => {
    var rowHeight = key['Litologia'].Height * scale
    if (rowHeight > maxLitHeight) {
      indexLimited.push(index);
      //  rowHeight = maxLitHeight;
      key['Litologia'].Height = maxLitHeight
    }
    if ((currentPageHeight + rowHeight) > (heightSheet - 10)) {
      rowIndexesPerPage.push(currentPageIndexes);
      pageLengths.push({
        'height': Math.min(currentPageHeight - topHeaders, maxLitHeight),
        'originalHeight': currentPageHeight - topHeaders
      })
      currentPageIndexes = [];
      currentPageHeight = topHeaders;
    }
    currentPageHeight += Number(rowHeight);
    currentPageIndexes.push(index);
  });

  // ultima pagina
  if (currentPageIndexes.length) {
    rowIndexesPerPage.push(currentPageIndexes);
    var totalPageHeight = topHeaders;
    Object.values(data).forEach((key, index) => {
      if (currentPageIndexes.includes(index)) {
        const rowHeight = Math.min(key['Litologia'].Height * scale, maxLitHeight);
        totalPageHeight += Number(rowHeight);
      }
    });
    pageLengths.push({
      'height': Math.min(currentPageHeight - topHeaders, maxLitHeight),
      'originalHeight': currentPageHeight - topHeaders
    });
  }

  pageLengths = pageLengths.filter(function (page) {
    return page.height !== 0 || page.originalHeight !== 0;
  });


  var patterns = []
  var contacts = []
  data.forEach(row => {
    if (!patterns.includes(row["Litologia"].File)) {
      patterns.push(row["Litologia"].File);
    }
    if (!contacts.includes(row["Litologia"].Contact)) {
      contacts.push(row["Litologia"].Contact)
    }
  });

  async function createPatternImages(patterns) {
    const patternImages = [];
    const promises = patterns.map(async (pattern) => {
      var newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const svgSize = "30";
      newSvg.setAttribute("width", svgSize);
      newSvg.setAttribute("height", svgSize);
      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      var patternElement = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
      patternElement.setAttribute("id", `${lithologic[pattern]}`);
      patternElement.setAttribute("patternUnits", "userSpaceOnUse");
      patternElement.setAttribute("width", svgSize);
      patternElement.setAttribute("height", svgSize);
      const imageURL = new URL(`../../assets/patrones/${lithologic[pattern]}.svg`, import.meta.url).href;
      const response = await fetch(imageURL);
      const svgText = await response.text();
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<g>${svgText}</g>`;
      patternElement.appendChild(g);
      defs.appendChild(patternElement);
      newSvg.appendChild(defs);
      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", svgSize)
      rect.setAttribute("height", svgSize)
      rect.setAttribute("fill", `url(#${lithologic[pattern]})`);
      rect.setAttribute("rx", "3")
      rect.setAttribute('stroke', "black");
      rect.setAttribute("stroke-width", "1")
      newSvg.appendChild(rect);
      const canvas2 = document.createElement('canvas');
      const ctx2 = canvas2.getContext('2d');
      const svgString = new XMLSerializer().serializeToString(newSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        canvas2.width = 100;
        canvas2.height = 100;
        ctx2.drawImage(img, 0, 0, 100, 100);
        const imgURL = canvas2.toDataURL('image/png', 1.0);
        patternImages.push([imgURL, pattern]);
      };
      img.onerror = (e) => {
        console.log(e)
      };
      img.src = url;
    });
    await Promise.all(promises);
    return patternImages;
  }

  var pImages = await createPatternImages(patterns);

  async function createFossilImages(fossils) {
    const fossilImages = [];
    const promises = Object.values(fossils).map(async (fossil) => {
      var newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const svgSize = "50";
      newSvg.setAttribute("width", svgSize);
      newSvg.setAttribute("height", svgSize);
      const imageURL = new URL(`../../assets/fosiles/${fosilJson[fossil["fosilImg"]]}.svg`, import.meta.url).href;
      const response = await fetch(imageURL);
      const svgText = await response.text();
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<g>${svgText}</g>`;
      newSvg.appendChild(g);
      var svg = newSvg.querySelector('svg');
      if (svg) {
        svg.setAttribute("height", svgSize)
        svg.setAttribute("width", svgSize)
      }
      const canvas2 = document.createElement('canvas');
      const ctx2 = canvas2.getContext('2d');
      const svgString = new XMLSerializer().serializeToString(newSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        canvas2.width = 50;
        canvas2.height = 50;
        ctx2.drawImage(img, 0, 0, 50, 50);
        const imgURL = canvas2.toDataURL('image/png', 1.0);
        fossilImages.push([imgURL, fossil["fosilImg"]]);
      };
      img.onerror = (e) => {
        console.log(e)
      };
      img.src = url;
    });
    await Promise.all(promises);
    return fossilImages;
  }

  var fImages = await createFossilImages(fossils);

  async function createContactImages(contacts) {
    const contactsImages = [];
    const promises = contacts.map(async (contact) => {
      var newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      newSvg.setAttribute("width", "150");
      newSvg.setAttribute("height", "25");
      const imageURL = new URL(`../../assets/contacts/${contact}.svg`, import.meta.url).href;
      const response = await fetch(imageURL);
      const svgText = await response.text();
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<g>${svgText}</g>`;
      newSvg.appendChild(g);
      newSvg.querySelector('svg').setAttribute("height", "25")
      newSvg.querySelector('svg').setAttribute("width", "150")
      const canvas2 = document.createElement('canvas');
      const ctx2 = canvas2.getContext('2d');
      const svgString = new XMLSerializer().serializeToString(newSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        canvas2.width = 150;
        canvas2.height = 25;
        ctx2.drawImage(img, 0, 0, 150, 25);
        const imgURL = canvas2.toDataURL('image/png', 1.0);
        contactsImages.push([imgURL, contact]);
      };
      img.onerror = (e) => {
        console.log(e)
      };
      img.src = url;
    });
    await Promise.all(promises);
    return contactsImages;
  }

  var cImages = await createContactImages(contacts);

  const filteredSvgs = document.querySelectorAll('table tbody tr td svg'); // todos los svg

  // Filtrar los svg que son capas
  var tdsWithSvg = Array.from(filteredSvgs).filter(svg => {
    const patterns = svg.querySelectorAll('pattern');
    return Array.from(patterns).some(pattern => {
      return indexesM.some(index => pattern.id === `pattern-${index}`);
    });
  });
  rowIndexesPerPage = rowIndexesPerPage.filter(arr => arr.length > 0);

  var imgPage = [];
  for (var j = 0; j < rowIndexesPerPage.length; j++) {
    const img = await generateSVGDataURLForPage(j, rowIndexesPerPage, tdsWithSvg, columnWidths, indexLimited, pageLengths, isInverted);
    imgPage.push(img);
  }

  const images = await svgDivision(pageLengths, columnWidths, isInverted);


  const blob = await pdf(<MyDocument indexLimited={indexLimited} isInverted={isInverted} oLev={oLev} date={date} etSec={etSec} oEstrat={oEstrat} infoProject={infoProject} contacts={cImages} fossils={fImages} patterns={pImages} scale={scale} imageFossils={images[0]} imageEspesor={images[1]} imageFacies={images[2]} orientation={orientation} format={format} imgPage={imgPage} columnWidths={columnWidths} data={data} header={header} rowIndexesPerPage={rowIndexesPerPage} />).toBlob();
  const url = URL.createObjectURL(blob);
  // const iframe = document.getElementById('main-iframe');
  iframe.setAttribute("src", url);

  const loadingElement = document.getElementById('loading-indicator');
  if (loadingElement) {
    loadingElement.remove();
  }
};

export default Ab;
