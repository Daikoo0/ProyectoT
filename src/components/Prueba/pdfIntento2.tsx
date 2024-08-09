import { Page, Text, View, Document, StyleSheet, pdf, Image as Img, Rect, Svg } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import sheetSize from '../../sheetSizes.json';
import MySVG from "../MYSVG.tsx";
import lithologic from '../../lithologic.json';
import fosilJson from '../../fossil.json';

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

    const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = parseFloat(columnWidths["Litologia"]) * 96 / 2.54
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
    return imageDataURL;
  } else {
    return null;
  }
}


const MyDocument = ({ contacts, fossils, patterns, scale, imageFossils, imageEspesor, imageFacies, orientation, format, imgPage, columnWidths, data, header, rowIndexesPerPage, widthSheet, heightSheet }) => {

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
                        <Html key={i} style={[{ width: columnWidths[firstArray[i]], height: data[item].Litologia.Height * scale }]}>
                          {(data[item]?.[firstArray[i]] || "")}
                        </Html>
                      </View>
                    )
                  })}
                </View>

              ))}
            </View>

            <View style={[styles.tableRow, { borderBottomWidth: 0.5, height: imgPage[pageIndex].totalHeight + (pageIndexes.length) }]}>
              {Object.values(secondArray).map((key, i) => {
                return (
                  <>
                    {secondArray[i] === "Litologia" && (<View style={[{ borderLeftWidth: 0.5, borderRightWidth: 0.5, height: imgPage[pageIndex].totalHeight + (pageIndexes.length) + 10 }]}>
                      <Img src={imgPage[pageIndex].imgURL} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight + (pageIndexes.length) + 10, width: columnWidths["Litologia"] }]} />
                    </View>)}
                    {secondArray[i] === "Estructura fosil" && (
                      <View style={[{ borderLeftWidth: 0.5, borderRightWidth: 0.5, height: imgPage[pageIndex].totalHeight + (pageIndexes.length) }]}>
                        <Img src={imageFossils[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight + (pageIndexes.length), width: columnWidths["Estructura fosil"] }]} />
                      </View>)}
                    {secondArray[i] === "Espesor" && (
                      <View style={[{ borderLeftWidth: 0.5, borderRightWidth: 0.5, height: imgPage[pageIndex].totalHeight + (pageIndexes.length) }]}>
                        <Img src={imageEspesor[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight + (pageIndexes.length), width: columnWidths["Espesor"] }]} />
                      </View>)}
                    {secondArray[i] === "Facie" && (
                      <View style={[{ borderLeftWidth: 0.5, borderRightWidth: 0.5, height: imgPage[pageIndex].totalHeight + (pageIndexes.length) }]}>
                        <Img src={imageFacies[pageIndex]} style={[{ backgroundColor: "transparent", height: imgPage[pageIndex].totalHeight + (pageIndexes.length), width: columnWidths["Facie"], left: "-0.1cm" }]} />
                      </View>)}
                  </>
                )
              })}
            </View>

            <View style={[{ flexDirection: 'column' }]}>
              {pageIndexes.map((item, index) => (

                <View style={[styles.tableRow]} key={index}>
                  {Object.values(thirdArray).map((key, i) => {
                    return (
                      <View style={[styles.tableCol, styles.tableCell]}>
                        <Html key={i} style={[{ width: columnWidths[thirdArray[i]], height: data[item].Litologia.Height * scale }]}>{(data[item]?.[thirdArray[i]] || "")}</Html>
                      </View>
                    )
                  })}
                </View>

              ))}
            </View>
          </View>
        </Page >))}
      <Page orientation={orientation} size={[sheetSize[format][0], sheetSize[format][1]]} style={styles.page} key={`page-symbols`}>
        <Text style={[{ marginTop: 20, marginBottom: 10, fontSize: 20, fontFamily: "Times-Roman" }]}>Simbología</Text>
        {patterns && (<>
          <Text style={[{ marginBottom: 10, fontSize: 15, fontFamily: "Times-Roman" }]}>Patrones</Text>
          <View style={[{ flexDirection: "column" }]}>
            {patterns.map((pattern) => {
              return (
                <View style={[styles.tableRow, { marginTop: 10, height: 50 }]}>
                  <Img src={pattern[0]} style={{ height: 50, width: 50 }} />
                  <Text style={{ marginLeft: 5, alignSelf: 'center', fontSize: 12 }}>
                    {pattern[1]}
                  </Text>
                </View>
              )
            })}
          </View>
        </>)}
        {fossils && (<>
          <Text style={[{ marginTop: 10, marginBottom: 10, fontSize: 15, fontFamily: "Times-Roman" }]}>Fósiles</Text>
          <View style={[{ flexDirection: "column" }]}>
            {Object.values(fossils).map((fosil) => {
              return (
                <View style={[styles.tableRow, { marginTop: 10, height: 50 }]}>
                  <Img src={fosil[0]} style={[{ height: 50, width: 50 }]}></Img>
                  <Text style={{ marginLeft: 5, alignSelf: 'center', fontSize: 12 }}>
                    {fosil[1]}
                  </Text>
                </View>
              )
            })}
          </View>
        </>)}
        {contacts && (<>
          <Text style={[{ marginTop: 10, marginBottom: 10, fontSize: 15, fontFamily: "Times-Roman" }]}>Contactos</Text>
          <View style={[{ flexDirection: "column" }]}>
            {contacts.map((contact) => {
              return (
                <View style={[styles.tableRow, { marginTop: 10, height: 30 }]}>
                  <Img src={contact[0]} style={{ height: 30, width: 150 }} />
                  <Text style={{ marginLeft: 5, alignSelf: 'center', fontSize: 12 }}>
                    {contact[1]}
                  </Text>
                </View>
              )
            })}
          </View>
        </>)}
      </Page>
    </Document >
  )
};


function svgToImg(elsvg, height, width, y, columnName, columnWidths) {
  var svgCopy = elsvg.cloneNode(true);
  let scaleFactor = parseFloat(columnWidths[columnName]) / (width * 2.54 / 96)
  svgCopy.setAttribute("width", columnWidths[columnName]);
  svgCopy.setAttribute("height", height);
  if (columnName === "Estructura fosil") {
    var lines = svgCopy.querySelectorAll('line');
    lines.forEach(line => {
      line.style.stroke = "black";
    });
    const fossilUnits = svgCopy.querySelectorAll('g.fossilUnit');
    fossilUnits.forEach(fossilUnit => {
      fossilUnit.setAttribute('transform', `scale(${scaleFactor},1)`);
      var icon = fossilUnit.querySelector('g#iconFosil');
      var iconH = icon.getAttribute("height");
      icon.setAttribute('height', iconH * scaleFactor)
    });

  } else if (columnName === "Espesor") {
    var lines = svgCopy.querySelectorAll('line');
    lines.forEach(line => {
      line.style.stroke = "black";
    });
    svgCopy.setAttribute('transform', `scale(${scaleFactor},1)`);
  }
  else if (columnName === "Facie") {
    var texts = svgCopy.querySelectorAll('text');
    var rects = svgCopy.querySelectorAll('rect');
    var rLength = svgCopy.querySelectorAll('rect[data-value="value1"]').length + 5;
    texts.forEach(text => {
      text.setAttribute("font-size", (parseFloat(columnWidths[columnName]) * 96 / 2.54) / rLength);
    });
    rects.forEach(rect => {
      rect.setAttribute("stroke", "black");
      rect.setAttribute("stroke-width", 1);
    });
  }
  svgCopy.setAttribute("viewBox", `0 ${y} ${parseFloat(columnWidths[columnName]) * 96 / 2.54} ${height}`);
  //svgCopy.style.background = "white"
  svgCopy.style.transformOrigin = `0 0`;
  var combinedSVG = new XMLSerializer().serializeToString(svgCopy);
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


const Ab = async (data, headerParam, format, orientation, customWidthLit, scale, fossils) => {
  let widthSheet = (orientation == "portrait") ? sheetSize[format][0] : sheetSize[format][1];
  let heightSheet = (orientation == "portrait") ? sheetSize[format][1] : sheetSize[format][0];
  let rowIndexesPerPage = [];
  let currentPageIndexes = [];
  let pageLenghts = [];
  let currentPageHeight = 110;
  var header = [...headerParam]
  var format = format
  var columnWidths = {}
  columnWidths["Litologia"] = customWidthLit !== "" ? customWidthLit : String((25 * widthSheet * 0.0352778) / 100) + "cm"
  columnWidths["Espesor"] = (parseFloat(columnWidths["Litologia"]) / 4) + "cm"; //"2cm"
  for (var i in header) {
    if (header[i] !== "Espesor" && header[i] !== "Litologia") {
      columnWidths[header[i]] = String((widthSheet * 0.0352778 - (parseFloat(columnWidths["Espesor"]) + parseFloat(columnWidths["Litologia"]))) / (header.length - 2)) + "cm"
    }
  }

  Object.values(data).forEach((key, index) => {
    const rowHeight = key['Litologia'].Height * scale
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
        const rowHeight = key['Litologia'].Height * scale
        totalPageHeight += Number(rowHeight)
      }
    });
    pageLenghts.push({
      'height': totalPageHeight - 110
    })
  }

  var patterns = []
  var contacts = []
  data.forEach(row => {
    if (!patterns.includes(row.Litologia.File)) {
      patterns.push(row.Litologia.File);
    }
    if (!contacts.includes(row.Litologia.Contact)) {
      contacts.push(row.Litologia.Contact)
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
  const blob = await pdf(<MyDocument contacts={cImages} fossils={fImages} patterns={pImages} scale={scale} imageFossils={images[0]} imageEspesor={images[1]} imageFacies={images[2]} orientation={orientation} format={format} imgPage={imgPage} columnWidths={columnWidths} data={data} header={header} rowIndexesPerPage={rowIndexesPerPage} widthSheet={widthSheet} heightSheet={heightSheet} />).toBlob();
  const url = URL.createObjectURL(blob);
  const iframe = document.getElementById('main-iframe');
  iframe.setAttribute("src", url);
};

export default Ab;
