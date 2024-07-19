import { Page, Text, View, Document, StyleSheet, pdf, Image as Img } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import sheetSize from '../../sheetSizes.json';
import sheetSizeCm from '../../sheetSizesCm.json';
import MySVG from "../MYSVG.tsx";

// Estilos
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 10,
    fontSize:10,
  },
  paragraph: {
    marginTop: 1, // Ajusta el espacio entre párrafos
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    borderBottomStyle: 'solid',
    overflow: 'hidden',
    lineHeight: 1,
  },
  tableCol: {
    borderRightWidth: 0.5,
    borderRightColor: 'grey',
    borderRightStyle: 'solid',
    borderLeftWidth: 0.5,
    borderLeftColor: 'grey',
    borderLeftStyle: 'solid',
    overflow: 'hidden',
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
  },
});

const TableHeader = ({ headerImg, columnWidths, header }) => {

  return (
    <View style={styles.tableRow}>
      {Object.keys(header).map((key, index) => (
        <View key={index} style={[styles.tableCol, styles.tableCellHeader, { width: columnWidths[header[key]], height: 120 }]}>
          {header[key] === "Litologia" ? (
            <MySVG/>
          ) : (
            <Text>{header[key]}</Text>
          )}
        </View>
      ))}
    </View>
  );

};

function svgListToDataURL(svgList, columnWidths, widthSheet) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let totalHeight = 0;
    let maxWidth = columnWidths["Litologia"]
    let val = (((widthSheet - 20) / 100) * parseFloat(maxWidth))
    let combinedSVG = `<svg width="` + val + `" xmlns="http://www.w3.org/2000/svg">`;

    svgList.forEach((svg, index) => {
      const svgCopy = svg.cloneNode(true);
      const circles = svgCopy.querySelectorAll('circle');
      circles.forEach(circle => circle.remove());
      const alturaActual = parseFloat(svgCopy.getAttribute('height'));
      const currentWidth = svg.clientWidth
      let scaleFactor = (((widthSheet - 20) / 100) * parseFloat(maxWidth)) / (currentWidth);
      var path = svgCopy.getElementsByClassName("stroke-current text-base-content");
      var pa = svgCopy.getElementsByClassName("pa");
      path[0].setAttribute('transform', `scale(${scaleFactor},1)`);
      for (var i = 0; i < pa.length; i++) {
        pa[i].setAttribute('transform', `scale(${scaleFactor},1)`);
      }
      console.log(scaleFactor)
      svgCopy.style.transformOrigin = `0 0`;
      svgCopy.setAttribute('y', totalHeight);
      totalHeight += alturaActual;
      combinedSVG += new XMLSerializer().serializeToString(svgCopy);
    });
    combinedSVG += `</svg>`;

    console.log(combinedSVG, typeof (combinedSVG))

    const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = (((widthSheet - 20) / 100) * parseFloat(maxWidth));
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

async function generateSVGDataURLForPage(pageIndex, rowIndexesPerPage, tdsWithSvg, columnWidths, widthSheet) {
  const indexes = rowIndexesPerPage[pageIndex]; // todos los índices de pageIndex
  const filteredTdsWithSvg = Array.from(tdsWithSvg).filter((_, index) => indexes.includes(index)); // filtrar los svg de la página que se está generando
  if (filteredTdsWithSvg.length > 0) {
    const imageDataURL = await svgListToDataURL(filteredTdsWithSvg, columnWidths, widthSheet);
    console.log(imageDataURL)
    return imageDataURL;
  } else {
    return null;
  }
}

const getColumnX = (columnName, header, columnWidths, widthSheet) => {
  let xPosition = 0
  for (const key in header) {
    if (header[key] === columnName) break;
    xPosition += parseFloat(columnWidths[header[key]]); // Suma el porcentaje 
    //console.log(xPosition,columnWidths[header[key]],key,header[key])
  }
  return (xPosition*(widthSheet*0.0352778))/100; // Devuelve la posición x en px
};


const MyDocument = ({ headerImg, orientation, format, imgPage, columnWidths, data, header, rowIndexesPerPage, widthSheet, heightSheet }) => {

  const LitologiaX = getColumnX("Litologia", header, columnWidths, widthSheet);
  console.log(LitologiaX)
  return (
    <Document>
      {rowIndexesPerPage.map((pageIndexes, pageIndex) => (
        <Page orientation={orientation} size={[sheetSize[format][0],sheetSize[format][1]]} style={styles.page} key={`page-${pageIndex}`}>
          <TableHeader headerImg={headerImg} columnWidths={columnWidths} header={header} />
          <Img src={imgPage[pageIndex].imgURL} style={[{ backgroundColor:"transparent", height: imgPage[pageIndex].totalHeight + 10, top: 130, left: (LitologiaX+10), position: "absolute", width: ((widthSheet - 20) / 100) * parseFloat(columnWidths["Litologia"]) }]} />
          {pageIndexes.map((item, index) => (
            <View style={[styles.tableRow, { height: data[item]["Litologia"].height }]} key={index}>
              {Object.values(header).map((key, i) => {
                if (header[i] === 'Litologia') {
                  return (
                    <View key={i} style={[styles.tableCol, { width: columnWidths[header[i]], position: 'relative' }]}>
                      <Text> </Text>
                    </View>
                  );
                }
                return (
                  <Html key={i} style={[styles.tableCol, styles.tableCell, { width: columnWidths[header[i]] }]}>{(data[item]?.[header[i]] || "")}</Html>
                )
              })}
            </View>))}
        </Page>))}
    </Document>
  )
};

function svgToImg(elsvg, columnWidths, format, column) {
  const svgCopy = elsvg.cloneNode(true);
  svgCopy.setAttribute("width", elsvg.clientWidth)
  svgCopy.setAttribute("height", elsvg.clientHeight)
  const maxWidth = columnWidths[column]
  // let scaleFactor = (((widthSheet - 20) / 100) * parseFloat(maxWidth)) / (elsvg.clientWidth)
  // svgCopy.setAttribute('transform', `scale(${scaleFactor},1)`);
  // svgCopy.style.transformOrigin = `0 0`;
  const texts = svgCopy.querySelectorAll('text');
  texts.forEach(text => {
    const fontSize = window.getComputedStyle(text).fontSize;
    text.style.fontSize = "12px";  //`${parseFloat(fontSize) * scaleFactor}px`;
  });
  var combinedSVG = new XMLSerializer().serializeToString(svgCopy);
  return new Promise((resolve, reject) => {
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    console.log(combinedSVG, typeof (combinedSVG))
    const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      canvas2.width = elsvg.clientWidth// (((widthSheet - 20) / 100) * parseFloat(maxWidth));
      canvas2.height = elsvg.clientHeight;
      console.log(img)
      ctx2.drawImage(img, 0, 0);
      const imgURL = canvas2.toDataURL('image/png', 1.0);
      console.log(imgURL)
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
  let currentPageHeight = 110;
  var header = [...headerParam]
  var format = format
  var columnWidths = {}
  columnWidths["Espesor"] = String((1 * 100) / (widthSheet*0.0352778-20)) + "cm"
  columnWidths["Litologia"] = customWidthLit!=="" ? customWidthLit : String((3 * 100) / (widthSheet*0.0352778)) + "cm"
//  columnWidths["Litologia"] = customWidthLit!=="" ? customWidthLit : "25%";
  for (var i in header) {
    if (header[i] !== "Espesor" && header[i] !== "Litologia") {
      //columnWidths[header[i]] = String((((100)-((((40+((customWidthLit !== ""? parseFloat(customWidthLit) : 25)*(widthSheet-20)/100)) * 100)/(widthSheet-20)))) / (header.length - 2))) + "%"
      columnWidths[header[i]] = String((((100)-((((4) * 100)/(widthSheet*0.0352778-20)))) / (header.length - 2))) + "%"
      //columnWidths[header[i]] = "1cm"
    }
  }

  Object.values(data).forEach((key, index) => {
    const rowHeight = key['Litologia'].height
    if ((currentPageHeight + rowHeight) > (heightSheet - 10)) {
      rowIndexesPerPage.push(currentPageIndexes);
      currentPageIndexes = [];
      currentPageHeight = 110;
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

  var imgPage = [];
  for (var j = 0; j < rowIndexesPerPage.length; j++) {
    const img = await generateSVGDataURLForPage(j, rowIndexesPerPage, tdsWithSvg, columnWidths, widthSheet);
    imgPage.push(img);
    console.log(img)
  }

  const headerImg = document.querySelector('svg#headerLit')
  console.log(String(headerImg.outerHTML))
  const laimg = await svgToImg(headerImg, columnWidths, format, "Litologia")
  const blob = await pdf(<MyDocument headerImg={laimg} orientation={orientation} format={format} imgPage={imgPage} columnWidths={columnWidths} data={data} header={header} rowIndexesPerPage={rowIndexesPerPage} widthSheet={widthSheet} heightSheet={heightSheet} />).toBlob();
  const url = URL.createObjectURL(blob);
  const iframe = document.getElementById('main-iframe');
  iframe.setAttribute("src", url);
};

export default Ab;
