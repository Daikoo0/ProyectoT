import { useState, useEffect } from "react";
import Polygon from "./Polygon4";

const Tabla = ({ data, header, lithology, scale }) => {

    const [columnWidths, setColumnWidths] = useState({});

    useEffect(() => {
        const initialWidths = header.reduce((acc, columnName) => {
            acc[columnName] = 150; // Inicializa todas las columnas con un ancho de 200px
            return acc;
        }, {});
        setColumnWidths(initialWidths);
    }, [header]); 
    

    // Función para manejar el inicio del arrastre para redimensionar
    const handleMouseDown = (columnName, event) => {
        event.preventDefault();

        const startWidth = columnWidths[columnName];
        const startX = event.clientX;

        const handleMouseMove = (moveEvent) => {
            const newWidth = startWidth + moveEvent.clientX - startX;
            setColumnWidths((prevWidths) => ({
                ...prevWidths,
                [columnName]: newWidth > 100 ? newWidth : 100 // Asegura un ancho mínimo de 100px
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    


    return (
        <>
            <div className="flex-col">
                <div className="flex">
                    {header.map((columnName) => (
                        <div key={columnName} className="border bg-primary" style={{ width: `${columnWidths[columnName]}px` }}>
                            <div
                                className="flex justify-between items-center  p-2 font-semibold"
                            >
                                {columnName}
                                <span className="p-1 cursor-col-resize" onMouseDown={(e) => handleMouseDown(columnName, e)}>||</span>
                            </div>
                        </div>
                    ))}
                </div>

                {Object.keys(lithology).map((rowIndex) => (
                    <div
                        key={rowIndex}
                        className="flex"
                        draggable
                        style={{ height: `${lithology[rowIndex].height * scale}px`}}
                    //onDragStart={(e) => onDragStart(e, filaIndex)}
                    //onDragOver={onDragOver(filaIndex)}
                    >
                        {header.map((columnName, columnIndex) => (
                            <div
                                key={`${rowIndex}-${columnIndex}`}
                                className="border border-neutral prose ql-editor "
                                style={{
                                    width: `${columnWidths[columnName]}px`,
                                    overflowY: columnName !== 'Litologia' ? 'auto' : 'visible',
                                    padding: columnName !== 'Litologia' ? undefined : '0',
                                    margin: columnName !== 'Litologia' ? undefined : '0',
                                    borderWidth: 1,
                                    borderTop: (columnName === 'Litologia' || columnName === 'Estructura fosil') ? 'none' : '',
                                    borderBottom: (columnName === 'Litologia' || columnName === 'Estructura fosil') && Number(rowIndex) < Object.keys(lithology).length - 1 ? 'none' : '',
                                }}
                            >

                                {columnName === 'Litologia' ? (
                                    <Polygon
                                        Height={lithology[rowIndex].height * scale}
                                        File={lithology[rowIndex].file}
                                        ColorFill={lithology[rowIndex].ColorFill}
                                        ColorStroke={lithology[rowIndex].colorStroke}
                                        Zoom={lithology[rowIndex].zoom}
                                    />
                                ) : data[columnName] && data[columnName][rowIndex] ? (
                                    <div dangerouslySetInnerHTML={{ __html: data[columnName][rowIndex] }} />
                                ) : null}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>

    );
};

export default Tabla;
