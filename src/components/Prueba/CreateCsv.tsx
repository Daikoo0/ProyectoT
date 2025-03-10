import { DataInfo, Col } from './types'

// Función para convertir JSON a CSV
function jsonToCsv(jsonData: DataInfo[], headers: Col[]): string {
  // Crear los encabezados como primera fila
  const csvHeaders = headers.map(header => header.Name).join(",") + "\n";

  // Crear las filas del CSV mapeando las propiedades deseadas de cada objeto JSON
  const csvRows = jsonData.map(row =>
    headers.map(header => row[header.Name] ?? "").join(",")
  );

  // Unir las filas y añadirlas después de los encabezados
  const csvContent = csvHeaders + csvRows.join("\n");
  return csvContent;
}

// Función para descargar el CSV generado
const handleDownloadCsv = ({ jsonData, headers }: { jsonData: DataInfo[]; headers: Col[] }) => {
  const csvContent = jsonToCsv(jsonData, headers);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return;
};

export default handleDownloadCsv;
