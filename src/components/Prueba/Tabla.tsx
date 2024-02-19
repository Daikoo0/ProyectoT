import { useState, useEffect, useRef } from "react";
import Polygon from "./Polygon4";
import Fosil from "../Editor/Fosil";

const Tabla = ({ data, header, lithology, scale, setCircles, setSideBarState, setRelativeX, fossils, setIdClickFosil }) => {

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

    const eltd = useRef(null)

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (eltd.current) {
            const { width, height } = eltd.current.getBoundingClientRect();
            console.log(eltd)
            setDimensions({ width, height });
        }
    }, [eltd.current, scale]);


    return (
        <table style={{ height:'100px' }}>
            <thead>
                <tr>
                    {header.map((columnName) => (
                        <th
                            key={columnName}
                            className="border bg-primary" // Ajusta según tus clases de estilo
                            style={{ width: `${columnWidths[columnName]}px`,
                                    height: '100px'}}
                        >
                            <div
                                className="flex justify-between items-center p-2 font-semibold"
                            >
                                {columnName}
                                <span className="p-1 cursor-col-resize" onMouseDown={(e) => handleMouseDown(columnName, e)}>||</span>
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Object.keys(lithology).map((rowIndex, index) => (

                    <tr key={rowIndex}
                        style={{ height: `${lithology[rowIndex].height * scale}px` }}
                    >
                        {header.map((columnName, columnIndex) => {

                            if (columnName === 'Estructura fosil' && index === 0) {
                                return (
                                    <td
                                        onClick={(e) => {
                                            setSideBarState({
                                                sideBar: true,
                                                sideBarMode: "fosil"
                                            })
                                            //  console.log(e.nativeEvent.offsetX,e.nativeEvent.offsetY)
                                            setRelativeX(e.nativeEvent.offsetX)
                                        }}
                                        key={`${rowIndex}-${columnIndex}`}
                                        rowSpan={Object.keys(lithology).length}
                                        className="border border-neutral"
                                        style={{
                                            verticalAlign: "top"
                                        }}
                                        ref={eltd}
                                    >
                                        <div className="h-full max-h-full" style={{ top: 0, width: dimensions.width }}>
                                            <svg width="100%" height={"100%"}>
                                                {fossils.length > 0 ? (
                                                    fossils.map((img, index) => (
                                                        <Fosil
                                                            img={img}
                                                            setSideBarState={setSideBarState}
                                                            setIdClickFosil={setIdClickFosil}
                                                            scale={scale}
                                                        />
                                                    ))
                                                ) : (
                                                    <></>
                                                )}
                                            </svg>
                                        </div>
                                    </td>
                                );
                            } else if (columnName !== 'Estructura fosil') {
                                return (
                                    <td
                                        key={`${rowIndex}-${columnIndex}`}
                                        className="border border-neutral prose ql-editor"
                                        style={{
                                            maxHeight: `${lithology[rowIndex].height * scale}px`,
                                            width: `${columnWidths[columnName]}px`,
                                            overflowY: (columnName === 'Litologia' ) ? 'visible' : 'auto',
                                            padding: '0',
                                            top: '0',
                                            borderWidth: 1,
                                            borderTop: (columnName === 'Litologia' ) ? 'none' : '',
                                            borderBottom: (columnName === 'Litologia') && Number(rowIndex) < Object.keys(lithology).length - 1 ? 'none' : '',
                                            verticalAlign: "top"
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxHeight: `${lithology[rowIndex].height * scale}px`,
                                             
                                            }}
                                        >
                                            {columnName === 'Litologia' ?
                                                <>
                                                    <Polygon
                                                        rowIndex={Number(rowIndex)}
                                                        Height={lithology[rowIndex].height * scale}
                                                        File={lithology[rowIndex].file}
                                                        ColorFill={lithology[rowIndex].ColorFill}
                                                        ColorStroke={lithology[rowIndex].colorStroke}
                                                        Zoom={lithology[rowIndex].zoom}
                                                        circles={lithology[rowIndex].circles}
                                                        setCircles={setCircles}
                                                    />
                                                </>
                                                : <>
                                                    <div
                                                        style={{ 'padding': 10,
                                                        maxHeight: `${lithology[rowIndex].height * scale}px`,
                                                    }}
                                                        dangerouslySetInnerHTML={{ __html: data[columnName][rowIndex] }} />
                                                </>
                                            }
                                        </div>
                                    </td>
                                );
                            }
                            return null;
                        })}
                    </tr>
                ))}
            </tbody>
        </table >
    );
};

export default Tabla;
