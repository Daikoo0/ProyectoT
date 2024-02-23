import { useState} from "react";
import Polygon from "./Polygon4";
import Fosil from "../Editor/Fosil";
import lithoJson from '../../lithologic.json';


const Tabla = ({ data, header, lithology, scale, addCircles, setSideBarState, setRelativeX, fossils, setIdClickFosil, openModalPoint, handleClickRow }) => {

    const [columnWidths, setColumnWidths] = useState({});
    const cellWidth = 150;
    const cellMinWidth = 100;
    const cellMaxWidth = 500;

    // Función para manejar el inicio del arrastre para redimensionar
    const handleMouseDown = (columnName, event) => {
        event.preventDefault();

        const startWidth = columnWidths[columnName] || cellWidth;
        const startX = event.clientX;

        const handleMouseMove = (moveEvent) => {
            let newWidth = startWidth + moveEvent.clientX - startX;
            newWidth = Math.max(cellMinWidth, Math.min(newWidth, cellMaxWidth));
            setColumnWidths((prevWidths) => ({
                ...prevWidths,
                [columnName]: newWidth,
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
            {/* <button onClick={exportTableToPDFWithPagination}> aaaaaaaa</button> */}
            <div id="your-table-id" >
                <table style={{ height: '100px' }}>
                    <thead>
                        <tr>
                            {header.map((columnName) => (
                                <th
                                    key={columnName}
                                    className="border border-secondary bg-primary"
                                    style={{
                                        width: `${columnWidths[columnName] || cellWidth}px`,
                                        height: '100px'
                                    }}
                                >
                                    <div
                                        className="flex justify-between items-center p-2 font-semibold"
                                    >
                                        <p className="text text-accent-content"> {columnName}</p>
                                        <span className="p-1 cursor-col-resize" onMouseDown={(e) => handleMouseDown(columnName, e)}>||</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(lithology).map((rowIndex, index) => (

                            <tr key={rowIndex}
                                // style={{ height: `${lithology[rowIndex].height * scale}px` }}
                            >
                                {header.map((columnName, columnIndex) => {

                                    if (columnName === 'Estructura fosil' && index === 0) {
                                        return (
                                            <td
                                                id="fossils"
                                                onClick={(e) => {
                                                    setSideBarState({
                                                        sideBar: true,
                                                        sideBarMode: "fosil"
                                                    })
                                                    setRelativeX(e.nativeEvent.offsetX)
                                                }}
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={Object.keys(lithology).length}
                                                className="border border-secondary"
                                                style={{
                                                    verticalAlign: "top",
                                                    borderLeft: 'none',
                                                }}
                                            >
                                                <div className="h-full max-h-full" style={{ top: 0}}>
                                                    <svg className="h-full max-h-full" width="100%" height="0" overflow='visible'>
                                                        {fossils.length > 0 ? (
                                                            fossils.map((img) => (
                                                                <Fosil
                                                                    img={img}
                                                                    setSideBarState={setSideBarState}
                                                                    setIdClickFosil={setIdClickFosil}
                                                                    scale={scale}
                                                                    litologiaX={columnWidths["Litologia"] || cellWidth}
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
                                                className="border border-secondary prose ql-editor"
                                                onClick={() => {
                                                    if (columnName !== "Litologia") {
                                                        setSideBarState({
                                                            sideBar: true,
                                                            sideBarMode: "text"
                                                        });
                                                        console.log(rowIndex, columnName)
                                                        handleClickRow(rowIndex, columnName)

                                                    }
                                                }}
                                                style={{
                                                    //maxHeight: `${lithology[rowIndex].height * scale}px`,
                                                    //width: `${columnWidths[columnName] || 150}px`,
                                                    overflowY: (columnName === 'Litologia') ? 'visible' : 'auto',
                                                    padding: '0',
                                                    top: '0',
                                                    borderWidth: 1,
                                                    borderTop: (columnName === 'Litologia') ? 'none' : '',
                                                    borderBottom: (columnName === 'Litologia') && Number(rowIndex) < Object.keys(lithology).length - 1 ? 'none' : '',
                                                    verticalAlign: "top",
                                                    borderRight: ((columnName === 'Litologia') && (header.includes('Estructura fosil'))) ? 'none' : '',
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
                                                                File={lithoJson[lithology[rowIndex].file]}
                                                                ColorFill={lithology[rowIndex].ColorFill}
                                                                ColorStroke={lithology[rowIndex].colorStroke}
                                                                Zoom={lithology[rowIndex].zoom}
                                                                circles={lithology[rowIndex].circles}
                                                                addCircles={addCircles}
                                                                openModalPoint={openModalPoint}
                                                                setSideBarState={setSideBarState}
                                                                handleClickRow={handleClickRow}
                                                                tension={lithology[rowIndex].tension}
                                                                rotation={lithology[rowIndex].rotation}
                                                            />
                                                        </>
                                                        : 
                                                        <>
                                                            <div
                                                                style={{
                                                                    'padding': 10,
                                                                    // maxHeight: `${lithology[rowIndex].height * scale}px`,
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: data[columnName][rowIndex] }}
                                                            />
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
                </table>
            </div>
        </>
    );
};

export default Tabla;
