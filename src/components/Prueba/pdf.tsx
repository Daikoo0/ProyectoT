import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import ReactDOMServer from 'react-dom/server';



function generarPDF(datos, alturas) {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
    });

    const margen = 40;
    const espacioEntreFilas = 10; // Espacio adicional entre filas para legibilidad
    let posY = margen;

    const encabezados = ["Nombre", "Edad", "Ciudad", "Litologia"];
    const anchoColumna = (doc.internal.pageSize.width - margen * 2) / encabezados.length;
    const altoPagina = doc.internal.pageSize.height;

    // Función para agregar el encabezado de la tabla
    const agregarEncabezado = () => {
        posY = margen; // Restablece la posición inicial para Y
        encabezados.forEach((encabezado, index) => {
            doc.text(encabezado, margen + anchoColumna * index, posY);
        });
        posY += espacioEntreFilas; // Añade espacio después del encabezado
    };

    // Función para verificar si una nueva fila cabe en la página actual
    const cabeEnPagina = (alturaFila) => posY + alturaFila + espacioEntreFilas <= altoPagina - margen;

    // Agrega el encabezado inicial
    agregarEncabezado();

    // Itera sobre cada fila de datos para agregarlas al PDF
    datos.nombres.forEach(async (nombre, index) => {
        const alturaFila = alturas[index]; // Usa el módulo por si hay más filas que alturas definidas

        // Si la fila no cabe, añade una nueva página y el encabezado
        if (!cabeEnPagina(alturaFila)) {
            doc.addPage();
            agregarEncabezado();
        }

        // Ejemplo de cómo agregar texto. Para contenido complejo, convierte primero a imagen.
        doc.text(nombre, margen, posY + espacioEntreFilas);
        doc.text(datos.edades[index].toString(), margen + anchoColumna, posY + espacioEntreFilas);
        doc.text(datos.ciudades[index], margen + anchoColumna * 2, posY + espacioEntreFilas);
        // doc.text(datos.Litologia[index], margen + anchoColumna * 3, posY + espacioEntreFilas);

        posY += alturaFila + espacioEntreFilas; // Actualiza la posición de Y para la próxima fila
    });

    // Guarda el PDF
    doc.save("tabla.pdf");
};
export default generarPDF;
// Llamar a generarPDF con los datos y alturas adecuados
