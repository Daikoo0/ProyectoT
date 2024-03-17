import { useState, useRef, useEffect } from "react";
import Polygon from "./Polygon4";
import Fosil from "./Fosil";
import lithoJson from '../../lithologic.json';
import Ruler from "./Ruler2";
import exportTableToPDFWithPagination from "./pdfFunction";

const Tabla = ({ setPdfData, pdfData, data, header, scale,
    addCircles, setSideBarState,
    fossils, setFormFosil,
    openModalPoint, handleClickRow, sendActionCell,
    editingUsers }) => {

    const cellWidth = 150;
    const cellMinWidth = 100;
    const cellMaxWidth = 500;
    const tableref = useRef(null);
    const [columnWidths, setColumnWidths] = useState({});

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


    const [hovered, setHovered] = useState(false); // Estado para controlar si se está pasando el mouse por encima

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };

    var adfas = useRef(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (adfas.current) {
            const { width, height } = adfas.current.getBoundingClientRect();
            setDimensions({ width, height });
        }

    }, [adfas.current, data.length, scale]);
    const list = ["Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "Ambiente Depositacional", "Descripcion"]

    const handleColumns = (e, key) => {
        var newHeaders = pdfData.header
        if (e.target.checked) {
            newHeaders.push(key)
        } else {
            const index = newHeaders.indexOf(key);
            if (index !== -1) {
                newHeaders.splice(index, 1);
            }
        }
        setPdfData(prevState => ({
            ...prevState,
            header: newHeaders,
        }));
        exportTableToPDFWithPagination(pdfData.columnWidths, pdfData.data, newHeaders, pdfData.format)
    }

    const handleRows = (e, key) => {
        var newRows = pdfData.data
        if (e.target.checked) {
            newRows.push(key)
        } else {
            const index = newRows.indexOf(key);
            if (index !== -1) {
                newRows.splice(index, 1);
            }
        }
        setPdfData(prevState => ({
            ...prevState,
            data: newRows,
        }));
        exportTableToPDFWithPagination(pdfData.columnWidths, pdfData.data, newRows, pdfData.format)
    }

    const HeaderVal = ({ percentage, name, top }) => {
        var x = percentage * (columnWidths["Litologia"] || 150)
        var pos = top ? 60 : 105
        return (
            <>
                <path id={name} d={`M${x},${pos} L${x},0`} />
                <text className="stroke stroke-accent-content" fontWeight="1" fontSize="10"><textPath href={`#${name}`}>
                    {name}
                </textPath>
                </text>
                {top ? <>
                    <line className="stroke stroke-accent-content" y1="52%" y2="60%" x1={`${percentage * 100}%`} x2={`${percentage * 100}%`} strokeWidth="1"></line>
                </> : <>
                    <line className="stroke stroke-accent-content" y1="90%" y2="100%" x1={`${percentage * 100}%`} x2={`${percentage * 100}%`} strokeWidth="1"></line>
                </>
                }
            </>)
    }

    return (
        <>
            <>
                <dialog id="modal" className="modal">
                    <div className="modal-box w-11/12 max-w-7xl h-full">
                        <div className="flex flex-col lg:flex-row h-full">

                            {/* Sección izquierda */}
                            <div className="flex flex-col flex-grow card overflow-auto">
                                <div className="menu p-4 w-full min-h-full text-base-content">
                                    {/* Select */}
                                    <select value={pdfData.format} onChange={(e) => {
                                        setPdfData(prevState => ({
                                            ...prevState,
                                            format: e.target.value,
                                        }));
                                        exportTableToPDFWithPagination(pdfData.columnWidths, pdfData.data, pdfData.header, pdfData.format)
                                    }} className="select select-bordered w-full max-w-xs mb-4">
                                        <option value={''} disabled>Elige el tamaño de hoja</option>
                                        <option value={'A4'}>A4</option>
                                        <option value={'A3'}>A3</option>
                                        <option value={'letter'}>Carta</option>
                                        <option value={'tabloid'}>Tabloide</option>
                                        <option value={'legal'}>Legal</option>
                                    </select>

                                    {/* Lista de visibilidad de columnas */}
                                    <div className="mb-4">
                                        <details open={false}>
                                            <summary>Visibilidad de columnas</summary>
                                            <ul className="menu p-2 w-full min-h-full text-base-content">
                                                {list.map((key) => {
                                                    if (key !== "Espesor" && key !== "Litologia") {
                                                        return (
                                                            <li key={key} className="py-0 h-6">
                                                                <label className="inline-flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={key}
                                                                        name={key}
                                                                        checked={pdfData.header?.includes(key) ? true : false}
                                                                        onChange={(e) => handleColumns(e, key)}
                                                                        className="form-checkbox h-4 w-4 text-indigo-600"
                                                                    />
                                                                    <span>{key}</span>
                                                                </label>
                                                            </li>
                                                        );
                                                    }
                                                })}
                                            </ul>

                                        </details>
                                    </div>

                                    {/* Lista de visibilidad de capas */}
                                    <div>
                                        <details open={false}>
                                            <summary>Visibilidad de capas</summary>
                                            <p>Elimina las capas que no deben estar en el pdf (en orden de arriba hacia abajo)</p>
                                            <ul className="menu p-2 w-full min-h-full text-base-content">
                                                {Object.values(data).map((item, index) =>
                                                    <li key={index} className="py-0 h-6">
                                                        <label className="inline-flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={pdfData.data?.includes(item) ? true : false}
                                                                onChange={(e) => handleRows(e, item)}
                                                                className="form-checkbox h-4 w-4 text-indigo-600"
                                                            />
                                                            <span>{index}</span>
                                                        </label>
                                                    </li>
                                                )}
                                            </ul>
                                        </details>
                                    </div>
                                </div>
                            </div>

                            {/* Sección derecha */}
                            <div className="flex flex-col flex-grow card">
                                <p className="flex-shrink-0 text-xl">Vista previa</p>
                                <br />
                                <iframe id="main-iframe" className="w-full flex-grow" style={{ height: '100%' }}></iframe>
                                <div className="modal-action mt-4">
                                    <form method="dialog">
                                        <button className="btn">Close</button>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </dialog>
            </>

            <div ref={tableref} >
                <table style={{ height: '100px' }}>
                    <thead>
                        <tr>
                            {header.map((columnName) => (
                                <th
                                    key={columnName}
                                    className="border border-accent-content bg-primary sticky top-0"
                                    style={{
                                        width: `${columnWidths[columnName] || cellWidth}px`,
                                        height: '120px',
                                    }}>

                                    <div className="flex justify-between items-center font-semibold">
                                        <p className="text text-accent-content w-1/2">{columnName}</p>

                                        {columnName === "Litologia" ?
                                            <>
                                                <svg
                                                    className="absolute w-full"
                                                    width={(columnWidths[columnName] || cellWidth) / 2}
                                                    height="120"
                                                    overflow={'visible'}
                                                    style={{
                                                        background: "transparent",
                                                    }}>
                                                    <line className="stroke stroke-accent-content" y1="0%" y2="100%" x1="50%" x2="50%" strokeWidth="1"></line>
                                                    <line className="stroke stroke-accent-content" y1="60%" y2="60%" x1="50%" x2="100%" strokeWidth="1"></line>

                                                    <HeaderVal percentage={0.55} name={"clay"} top={false} />
                                                    <HeaderVal percentage={0.55} name={"mud"} top={true} />
                                                    <HeaderVal percentage={0.59} name={"silt"} top={false} />
                                                    <HeaderVal percentage={0.63} name={"vf"} top={false} />
                                                    <HeaderVal percentage={0.63} name={"wacke"} top={true} />
                                                    <HeaderVal percentage={0.67} name={"f"} top={false} />
                                                    <HeaderVal percentage={0.71} name={"m"} top={false} />
                                                    <HeaderVal percentage={0.71} name={"pack"} top={true} />
                                                    <HeaderVal percentage={0.75} name={"c"} top={false} />
                                                    <HeaderVal percentage={0.79} name={"vc"} top={false} />
                                                    <HeaderVal percentage={0.79} name={"grain"} top={true} />
                                                    <HeaderVal percentage={0.83} name={"gran"} top={false} />
                                                    <HeaderVal percentage={0.83} name={"redstone"} top={true} />
                                                    <HeaderVal percentage={0.87} name={"pebb"} top={false} />
                                                    <HeaderVal percentage={0.87} name={"rud & bound"} top={true} />
                                                    <HeaderVal percentage={0.91} name={"cobb"} top={false} />
                                                    <HeaderVal percentage={0.91} name={"rudstone"} top={true} />
                                                    <HeaderVal percentage={0.95} name={"boul"} top={false} />
                                                </svg>
                                            </> : <></>
                                        }
                                        <div
                                            className="absolute inset-y-0 right-0 h-full"
                                            onMouseOver={(e) =>
                                                e.currentTarget.style.backgroundColor = "red"
                                            }
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                            }}
                                            onMouseDown={(e) => handleMouseDown(columnName, e)}
                                            style={{
                                                width: '5px',
                                                cursor: 'col-resize',
                                                height: '100px',
                                                backgroundColor: 'transparent',
                                            }}
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((RowValue, rowIndex) => (

                            <tr key={rowIndex}
                                className={"page-break"} >
                                {header.map((columnName, columnIndex) => {

                                    if (columnName === 'Espesor' && rowIndex === 0) {
                                        return (
                                            <td
                                                ref={adfas}
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={data.length}
                                                className="border"
                                                style={{
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <div className="h-full max-h-full">
                                                    <Ruler height={dimensions.height} width={(columnWidths["Espesor"] || 150)} isInverted={false} scale={scale} />
                                                </div>
                                            </td>
                                        );
                                    } else if (columnName === 'Estructura fosil' && rowIndex === 0) {
                                        return (
                                            <td
                                                id="fossils"
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={data.length}
                                                className="border"
                                                style={{
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <div className="h-full max-h-full"// tooltip" data-tip="hello"
                                                    onClick={(e) => {
                                                        console.log('a')
                                                        if (e.target instanceof SVGSVGElement) {
                                                            setSideBarState({
                                                                sideBar: true,
                                                                sideBarMode: "fosil"
                                                            })
                                                            setFormFosil({ id: '', upper: 0, lower: 0, fosilImg: '', x: e.nativeEvent.offsetX / (columnWidths["Estructura fosil"] || cellWidth), fosilImgCopy: '' })
                                                        }
                                                    }}
                                                    style={{ top: 0 }}>
                                                    <svg className="h-full max-h-full" width={columnWidths["Estructura fosil"] || cellWidth} height="0" overflow='visible'>
                                                        {fossils ? (
                                                            Object.keys(fossils).map((data, index) => (

                                                                <Fosil
                                                                    key={index}
                                                                    keyID={data}
                                                                    data={fossils[data]}
                                                                    setSideBarState={setSideBarState}
                                                                    setFormFosil={setFormFosil}
                                                                    scale={scale}
                                                                    litologiaX={columnWidths["Litologia"] || cellWidth}
                                                                    columnW={columnWidths["Estructura fosil"] || cellWidth}
                                                                />

                                                            ))
                                                        ) : (null)}
                                                    </svg>
                                                </div>
                                            </td>
                                        );
                                    } else if (columnName !== 'Estructura fosil' && columnName !== 'Espesor') {
                                        return (
                                            <td
                                                key={`${rowIndex}-${columnIndex}`}
                                                className={
                                                    (editingUsers?.[`[${rowIndex},${columnIndex}]`] && columnName !== 'Litologia') ?
                                                        (`border-2 prose` + (columnName === "Litologia" ? "ql-editor" : ""))
                                                        :
                                                        (`border prose` + (columnName === "Litologia" ? "ql-editor" : ""))
                                                }
                                                onClick={() => {
                                                    if (columnName !== "Litologia") {
                                                        setSideBarState({
                                                            sideBar: true,
                                                            sideBarMode: "text"
                                                        });
                                                        console.log(rowIndex, columnName)
                                                        handleClickRow(rowIndex, columnName)
                                                    }
                                                    sendActionCell(rowIndex, columnIndex)
                                                }}
                                                style={{
                                                    overflowY: (columnName === 'Litologia') ? 'visible' : 'auto',
                                                    padding: '0',
                                                    top: '0',
                                                    borderColor: (columnName !== 'Litologia') ? (editingUsers?.[`[${rowIndex},${columnIndex}]`]?.color || '') : '',
                                                    verticalAlign: "top",
                                                }}
                                                onMouseEnter={(editingUsers?.[`[${rowIndex},${columnIndex}]`] && (columnName !== 'Litologia')) ? handleMouseEnter : null}
                                                onMouseLeave={(editingUsers?.[`[${rowIndex},${columnIndex}]`] && (columnName !== 'Litologia')) ? handleMouseLeave : null}
                                            >
                                                {(editingUsers?.[`[${rowIndex},${columnIndex}]`] && columnName !== 'Litologia' && hovered) ? <>
                                                    <p style={{ fontSize: 12, backgroundColor: editingUsers?.[`[${rowIndex},${columnIndex}]`]?.color }} className="tooltip-text">{editingUsers?.[`[${rowIndex},${columnIndex}]`]?.name}</p>
                                                </> : <></>
                                                }
                                                <div
                                                    style={{
                                                        maxHeight: `${RowValue.Litologia.height * scale}px`,
                                                        height: '100%',
                                                    }}
                                                >
                                                    {columnName === 'Litologia' ?
                                                        <>
                                                            <Polygon
                                                                rowIndex={rowIndex}
                                                                Height={RowValue.Litologia.height * scale}
                                                                Width={columnWidths["Litologia"] || cellWidth}
                                                                File={lithoJson[RowValue.Litologia.file]}
                                                                ColorFill={RowValue.Litologia.ColorFill}
                                                                ColorStroke={RowValue.Litologia.colorStroke}
                                                                Zoom={RowValue.Litologia.zoom}
                                                                circles={RowValue.Litologia.circles}
                                                                addCircles={addCircles}
                                                                openModalPoint={openModalPoint}
                                                                setSideBarState={setSideBarState}
                                                                handleClickRow={handleClickRow}
                                                                tension={RowValue.Litologia.tension}
                                                                rotation={RowValue.Litologia.rotation}
                                                            />
                                                        </>
                                                        :
                                                        <>
                                                            <div
                                                                style={{
                                                                    'padding': 10,
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: RowValue[columnName] }}
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
