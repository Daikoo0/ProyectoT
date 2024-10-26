import { useState, useRef, useEffect, CSSProperties, useMemo } from "react";
import Polygon from "./Polygon4";
import Fosil from "./Fosil";
import lithoJson from '../../lithologic.json';
import Ruler from "./Ruler2";
import Ab from "./pdfFunction";
import ResizeObserver from "resize-observer-polyfill";
import { useTranslation } from 'react-i18next';
import { DndContext, rectIntersection, MouseSensor, useSensor, useSensors, TouchSensor, type UniqueIdentifier, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableOptions, Row, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

interface Layer {
    userId: string;
    Sistema: string;
    Descripcion: string;
    Litologia: any;
    Edad: string;
    Facie: string;
    AmbienteDepositacional: string;
    Estructurafosil: string;
    Formacion: string;
    Miembro: string;
}

const RowDragHandleCell = ({ row }: { row: Row<Layer> }) => {
    const { attributes, listeners } = useSortable({
        id: row.id,
    });
    return (
        <button {...attributes} {...listeners} style={{
            maxHeight: row.original.Litologia.Height, padding: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}
        >
            =
        </button>
    );
};

const DraggableRow = ({ row, index, header, isInverted, setSideBarState, columnWidths
    , openModalPoint, handleClickRow, addCircles, prevContact, rowspan, alturaTd, editingUsers,
    sendActionCell, setFormFosil, hovered, scale, facies, setFormFacies
}: {
    row: Row<Layer>;
    index: number;
    header: Array<string>;
    isInverted: boolean;
    setSideBarState: (state: { sideBar: boolean, sideBarMode: string }) => void,
    columnWidths: any;
    openModalPoint: void;
    handleClickRow: (rowIndex: number, columnName: string) => void;
    addCircles: void;
    prevContact: string;
    rowspan: number;
    alturaTd: number;
    editingUsers: any;
    sendActionCell: (rowIndex: number, columnIndex: number) => void;
    setFormFosil: (state: { id: string, upper: number, lower: number, fosilImg: string, x: number, fosilImgCopy: string }) => void;
    hovered: boolean;
    scale: number;
    facies: any;
    setFormFacies(state: { facie: string })
}) => {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging? 1000 : row.getVisibleCells().length - Number(row.id),
        position: 'relative',
        padding: 0,
        height: row.original.Litologia.Height * scale,
        margin: 0,
    };


    return (
        <tr ref={setNodeRef} style={style} id={row.id} >
            {row.getVisibleCells().map((cell, cellIndex) => {
                const cdef = cell.column.columnDef;
                if (cellIndex === header.indexOf("Espesor") + 1) {
                    if (index === (isInverted ? rowspan - 1 : 0)) {
                        return (
                            <td
                                key={cell.id}
                                rowSpan={rowspan}
                                className="border border-base-content h-full max-h-full"
                                style={{
                                    verticalAlign: "top",
                                }}
                            >
                                {/* <div className="h-full max-h-full"> */}
                                <Ruler height={alturaTd} width={(columnWidths["Espesor"] || 70)} isInverted={isInverted} scale={scale} />
                                {/* </div> */}
                            </td>
                        );
                    } else {
                        return null;
                    }
                }
                if (cellIndex === header.indexOf("Litologia") + 1) {
                    return (
                        <td key={cell.id} style={{ padding: 0, height: cell.row.original.Litologia.Height * scale }}>
                            <Polygon
                                zindex={row.getVisibleCells().length - index}
                                isInverted={isInverted}
                                rowIndex={index}//rowIndex={adjustedRowIndex}
                                Height={(cell.row.original.Litologia.Height * scale) + 2}// * scale}
                                Width={columnWidths['Litologia'] || 250}
                                File={lithoJson[cell.row.original.Litologia.File]}
                                ColorFill={cell.row.original.Litologia.ColorFill}
                                ColorStroke={cell.row.original.Litologia.ColorStroke}
                                Zoom={cell.row.original.Litologia.Zoom}
                                circles={cell.row.original.Litologia.Circles}
                                addCircles={addCircles}
                                openModalPoint={openModalPoint}
                                setSideBarState={setSideBarState}
                                handleClickRow={handleClickRow}
                                tension={cell.row.original.Litologia.Tension}
                                rotation={cell.row.original.Litologia.Rotation}
                                contact={cell.row.original.Litologia.Contact}
                                prevContact={prevContact}
                            />
                        </td>
                    );
                }
                if ((cellIndex === header.indexOf("Estructura fosil") + 1) && header.includes("Estructura fosil")) {
                    if (index === (isInverted ? rowspan - 1 : 0)) {
                        return (
                            <td
                                id="fossils"
                                key={cell.id}
                                rowSpan={rowspan}
                                className="border border-base-content"
                            >
                                <div
                                    className="h-full max-h-full"
                                    onClick={(e) => {
                                        if (e.target instanceof SVGSVGElement) {
                                            setSideBarState({
                                                sideBar: true,
                                                sideBarMode: "fosil",
                                            });
                                            setFormFosil({
                                                id: '',
                                                upper: 0,
                                                lower: 0,
                                                fosilImg: '',
                                                x: e.nativeEvent.offsetX / (columnWidths["Estructura fosil"] || cell.column.getSize()),
                                                fosilImgCopy: '',
                                            });
                                        }
                                    }}
                                >
                                    <svg id="fossilSvg"
                                        className="h-full max-h-full"
                                        width={columnWidths["Estructura fosil"] || cell.column.getSize()}
                                        height={alturaTd < 153 ? alturaTd : ''} overflow="visible"
                                    >
                                        {cdef["fossils"]
                                            ? Object.keys(cdef["fossils"]).map((data, index) => (
                                                <Fosil
                                                    isInverted={isInverted}
                                                    key={index}
                                                    keyID={data}
                                                    data={cdef["fossils"][data]}
                                                    setSideBarState={setSideBarState}
                                                    setFormFosil={setFormFosil}
                                                    scale={scale}
                                                    litologiaX={columnWidths["Litologia"] || 200}
                                                    columnW={columnWidths["Estructura fosil"] || cell.column.getSize()}
                                                />
                                            ))
                                            : null}
                                    </svg>
                                </div>
                            </td>
                        )
                    } else {
                        return null;
                    }

                }
                if ((cellIndex === header.indexOf("Facie") + 1) && header.includes("Facie")) {
                    if (index === (isInverted ? rowspan - 1 : 0)) {
                        return (
                            <td
                                id="facies"
                                key={cell.id}
                                rowSpan={rowspan}
                                className="border border-base-content"
                                style={{
                                    verticalAlign: "top",
                                    'overflow': 'hidden',
                                    'whiteSpace': 'nowrap',
                                    'textOverflow': 'ellipsis',
                                    padding: 0,
                                }}
                            >
                                {/* <div className="h-full max-h-full" style={{ top: 0 }}> */}
                                <svg id="svgFacies"
                                    className="h-full max-h-full"
                                    width={columnWidths["Facie"] || cell.column.getSize()}
                                    overflow="visible"
                                    transform={isInverted ? "scale(1,-1)" : "scale(1,1)"}
                                    height={alturaTd < 153 ? alturaTd : ''}
                                >
                                    {facies
                                        ? Object.keys(facies).map((key, index) => {
                                            const xPosp = `${((index + 1) / (Object.keys(facies).length + 1)) * 100}%`;
                                            const wp = `${(((columnWidths["Facie"] || cell.column.getSize()) / (Object.keys(facies).length + 1)) / (columnWidths["Facie"] || cell.column.getSize())) * 100}%`;
                                            return (
                                                <>
                                                    <rect
                                                        x={xPosp}
                                                        y="0"
                                                        key={"facie-" + key + index}
                                                        height="100%"
                                                        width={wp}
                                                        className="stroke stroke-base-content"
                                                        strokeWidth={"1"}
                                                        fill="transparent"
                                                        data-value="value1"
                                                        onClick={() => {
                                                            setSideBarState({
                                                                sideBar: true,
                                                                sideBarMode: "facieSection",
                                                            });
                                                            setFormFacies({ facie: key });
                                                        }}
                                                    />
                                                    {facies[key].map((value, i) => (
                                                        <>
                                                            <g key={"g-" + key + value + i}>
                                                                <text
                                                                    key={"value-" + key + value + i}
                                                                    fontSize={14}
                                                                    className="fill fill-base-content"
                                                                    x={isInverted ? -((parseFloat(value.y2) - parseFloat(value.y1)) * scale) : 10}
                                                                    transform={
                                                                        isInverted
                                                                            ? `scale(-1, 1) rotate(${270}, -5, ${parseFloat(value.y1) * scale})`
                                                                            : `rotate(90, 5, ${parseFloat(value.y1) * scale})`
                                                                    }
                                                                    y={(parseFloat(value.y1) - 2) * scale}

                                                                >
                                                                    {key}
                                                                </text>
                                                            </g>
                                                            <rect
                                                                data-custom="valor1"
                                                                key={"rect-" + key + value + i}
                                                                className="fill fill-base-content"
                                                                x={xPosp}
                                                                y={parseFloat(value.y1) * scale}
                                                                width={wp}
                                                                height={(parseFloat(value.y2) - parseFloat(value.y1)) * scale}
                                                                onClick={() => {
                                                                    setSideBarState({
                                                                        sideBar: true,
                                                                        sideBarMode: "facieSection",
                                                                    });
                                                                    setFormFacies({ facie: key });
                                                                }}
                                                            />
                                                        </>
                                                    ))}
                                                </>
                                            );
                                        })
                                        : null}
                                </svg>
                                {/* </div> */}
                            </td>
                        );
                    } else { return null; }
                }
                if (cellIndex === 0) {
                    return (
                        <td key={cell.id} style={{ width: cell.column.getSize() }} className="no-print">
                            <div style={{ height: row.original.Litologia.Height * scale }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                        </td>
                    );
                }
                return (
                    <td key={cell.id} style={{
                        width: cell.column.getSize(),
                        height: row.original.Litologia.Height * scale,
                        overflow: 'hidden',
                        padding: '0',
                        top: '0',
                        verticalAlign: "top",
                        borderColor: editingUsers?.[`[${row.id},${cellIndex}]`]?.color || '',
                        //   boxSizing: 'border-box'
                    }}
                        className={
                            editingUsers?.[`[${row.id},${cellIndex}]`] ? 'border-2' : 'border border-base-content'
                        }
                        onClick={() => {
                            setSideBarState({
                                sideBar: true,
                                sideBarMode: "text"
                            });
                            handleClickRow(Number(row.id), String(cdef.header))
                            sendActionCell(Number(row.id), cellIndex)
                        }}
                        onMouseEnter={(editingUsers?.[`[${row.id},${cellIndex}]`] ? cdef["handleMouseEnter"] : null)}
                        onMouseLeave={(editingUsers?.[`[${row.id},${cellIndex}]`] ? cdef["handleMouseLeave"] : null)}
                    >

                        <div style={{ display: 'block', boxSizing: 'border-box', margin: 0, padding: 0, top: 0, overflow: "hidden", maxHeight: cell.row.original.Litologia.Height * scale, height: "100%" }}>
                            {(editingUsers?.[`[${row.id},${cellIndex}]`] && hovered) ?
                                <p style={{ top: 0, fontSize: 12, backgroundColor: editingUsers?.[`[${row.id},${cellIndex}]`]?.color }}>{editingUsers?.[`[${row.id},${cellIndex}]`]?.name}</p>
                                : <></>
                            }
                            <div
                                style={{ overflow: hovered ? "auto" : "hidden", height: row.original.Litologia.Height * scale }}
                                className="ql-editor prose"
                                dangerouslySetInnerHTML={{ __html: cell.getValue() }} />
                        </div>
                    </td>
                );

            })}

        </tr>
    );
};

const HeaderVal = ({ percentage, name, top, columnWidths }) => {
    var x = percentage * (columnWidths["Litologia"] || 250)
    var pos = top ? 60 : 105
    return (
        <>
            <path id={name} d={`M${x},${pos} L${x},0`} />
            <text className="stroke stroke-accent-content" fontWeight="1" fontSize="10"><textPath href={`#${name}`}>
                {name}
            </textPath>
            </text>
            {top ? <>
                <line className="stroke stroke-accent-content" y1="52%" y2="60%" x1={x} x2={x} strokeWidth="1"></line>
            </> : <>
                <line className="stroke stroke-accent-content" y1="90%" y2="100%" x1={x} x2={x} strokeWidth="1"></line>
            </>
            }
        </>)
}



const Tabla = ({ setPdfData, pdfData, data, header, scale,
    addCircles, setSideBarState,
    fossils, setFormFosil,
    facies, setFormFacies,
    openModalPoint, handleClickRow, sendActionCell,
    editingUsers, isInverted, alturaTd, setAlturaTd, socket, tableref }) => {
    const { t } = useTranslation(['PDF']);
    const cellWidth = 150;
    var cellMinWidth = 150;
    var cellMaxWidth = 300;
    const [columnWidths, setColumnWidths] = useState({});

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 3,  // Reducir la distancia necesaria para activar el arrastre
            },
        }),
        useSensor(TouchSensor, {})
    );

    const columns = useMemo(
        () => [
            {
                id: 'drag-handle',
                header: " ",
                cell: ({ row }: { row: Row<Layer> }) => (
                    <RowDragHandleCell row={row} />
                ),
                size: 60,
            },
            {
                accessorKey: 'Sistema',
                header: header[header.indexOf("Sistema")],
                cell: (info: any) => info.getValue(),
                handleMouseEnter: () => setHovered(true),
                handleMouseLeave: () => setHovered(false),
            },
            {
                accessorKey: 'Edad',
                header: header[header.indexOf("Edad")],
                cell: (info: any) => info.getValue(),
                handleMouseEnter: () => setHovered(true),
                handleMouseLeave: () => setHovered(false),
            },
            {
                accessorKey: 'Formacion',
                header: header[header.indexOf("Formacion")],
                cell: (info: any) => info.getValue(),
                handleMouseEnter: () => setHovered(true),
                handleMouseLeave: () => setHovered(false),
            },
            {
                accessorKey: 'Miembro',
                header: header[header.indexOf("Miembro")],
                cell: (info: any) => info.getValue(),
                handleMouseEnter: () => setHovered(true),
                handleMouseLeave: () => setHovered(false),
            },
            {
                accessorKey: 'Espesor',
                header: header[header.indexOf("Espesor")],
                cell: (info: any) => info.getValue(),
            },
            {
                accessorKey: 'Litologia',
                header: header[header.indexOf("Litologia")],
                cell: (info: any) => info.getValue(),
            },
            {
                accessorKey: 'Estructura fosil',
                header: header[header.indexOf("Estructura fosil")],
                cell: (info: any) => info.getValue(),
                fossils: fossils,
            },
            {
                accessorKey: 'Facie',
                header: header[header.indexOf("Facie")],
                cell: (info: any) => info.getValue(),
            },
            {
                accessorKey: 'AmbienteDepositacional',
                header: header[header.indexOf("AmbienteDepositacional")],
                cell: (info: any) => info.getValue(),
                handleMouseEnter: () => setHovered(true),
                handleMouseLeave: () => setHovered(false),
            },
            {
                accessorKey: 'Descripcion',
                header: header[header.indexOf("Descripcion")],
                cell: (info: any) => info.getValue(),
                handleMouseEnter: () => setHovered(true),
                handleMouseLeave: () => setHovered(false),
            },

        ].filter((column) =>
            column.id === 'drag-handle' || header.includes(column.accessorKey)),
        [header, fossils]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row: Layer) => row.userId,
        debugTable: true,
        debugHeaders: true,
        debugColumns: true,
    } as TableOptions<Layer>);


    const dataIds = useMemo<UniqueIdentifier[]>(
        () => table.getRowModel().rows.map((row) => row.id), // Utiliza el índice como id
        [table.getRowModel().rows, header, isInverted]
    );


    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            socket.send(JSON.stringify({
                action: 'drop',
                data: {
                    "activeId": Number(active.id),
                    "overId": Number(over.id)
                }
            }));
        }
    }


    // Función para manejar el inicio del arrastre para redimensionar
    const handleMouseDown = (columnName, event) => {
        event.preventDefault();

        const startWidth = columnWidths[columnName] || cellWidth;
        const startX = event.clientX;

        const handleMouseMove = (moveEvent) => {
            let newWidth = startWidth + moveEvent.clientX - startX;
            if (columnName === "Litologia") { cellMinWidth = 250; cellMaxWidth = 600 }
            newWidth = Math.max(cellMinWidth, Math.min(newWidth, cellMaxWidth));
            if (columnName !== "Espesor") {
                setColumnWidths((prevWidths) => ({
                    ...prevWidths,
                    [columnName]: newWidth,
                }));
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };


    const [hovered, setHovered] = useState(false); // Estado para controlar si se está pasando el mouse por encima

    // const handleMouseEnter = () => {
    //     setHovered(true);
    // };

    // const handleMouseLeave = () => {
    //     setHovered(false);
    // };


    // const list = ["Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "Ambiente Depositacional", "Descripcion"]

    // const handleColumns = (e, key) => {
    //     var newHeaders = pdfData.header
    //     if (e.target.checked) {
    //         newHeaders.push(key)
    //     } else {
    //         const index = newHeaders.indexOf(key);
    //         if (index !== -1) {
    //             newHeaders.splice(index, 1);
    //         }
    //     }
    //     setPdfData(prevState => ({
    //         ...prevState,
    //         header: newHeaders,
    //     }));
    //     Ab(pdfData.data, newHeaders, pdfData.format, pdfData.orientation, pdfData.customWidthLit, pdfData.scale, pdfData.fossils, pdfData.infoProject, pdfData.indexesM, pdfData.oEstrat,
    //         pdfData.oLev,
    //         pdfData.etSec,
    //         pdfData.date, isInverted)
    // }

    const handleRows = (number) => {
        var rowsBefore = [...pdfData.data];
        var indexes = rowsBefore.map((row, index) => Number(row.Litologia.Height) > Number(number) ? index : -1)
            .filter(index => index !== -1);
        Ab(pdfData.data, pdfData.header, pdfData.format, pdfData.orientation, pdfData.customWidthLit, pdfData.scale, pdfData.fossils, pdfData.infoProject, indexes, pdfData.oEstrat,
            pdfData.oLev,
            pdfData.etSec,
            pdfData.date, isInverted);
    }

    var adfas = useRef<HTMLTableSectionElement>(null);

    useEffect(() => {
        const obtenerAlturaTd = () => {
            if (adfas.current) {
                const alturaBody = adfas.current.getBoundingClientRect().height;
                const altura = alturaBody < 153
                    ? data.reduce((total, item) => total + (item.Litologia?.Height || 0), 0)
                    : alturaBody;

                setAlturaTd(altura);
            }
        };
        if (adfas.current) {
            obtenerAlturaTd();
            const resizeObserver = new ResizeObserver(obtenerAlturaTd);
            resizeObserver.observe(adfas.current);
            return () => {
                resizeObserver.disconnect();
            };
        }
    }, [adfas.current, data]);


    return (
        <>
            <>
                <dialog id="modal" className="modal">
                    <div className="modal-box w-screen h-screen max-w-full max-h-full rounded-none">
                        <div className="flex flex-col lg:flex-row h-full">

                            {/* Sección izquierda */}
                            <div className="flex flex-col flex-grow card w-full lg:w-7/10">
                                <iframe id="main-iframe" className="w-full flex-grow" style={{ height: '100%' }}></iframe>
                            </div>

                            {/* seccion derecha */}
                            <div className="flex flex-col card w-full lg:w-3/10 overflow-y-auto">
                                <div className="menu p-4 w-full text-base-content">
                                    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                        <input type="checkbox" className="peer" />
                                        <div className="collapse-title text-xl font-medium" >{t("paper_format")}</div>
                                        <div className="collapse-content">
                                            <select
                                                value={pdfData.format}
                                                onChange={(e) => {
                                                    setPdfData((prevState) => ({
                                                        ...prevState,
                                                        format: e.target.value,
                                                    }));
                                                    Ab(
                                                        pdfData.data,
                                                        pdfData.header,
                                                        e.target.value,
                                                        pdfData.orientation,
                                                        pdfData.customWidthLit,
                                                        pdfData.scale,
                                                        pdfData.fossils,
                                                        pdfData.infoProject,
                                                        pdfData.indexesM,
                                                        pdfData.oEstrat,
                                                        pdfData.oLev,
                                                        pdfData.etSec,
                                                        pdfData.date, isInverted
                                                    );
                                                }}
                                                className="select select-bordered w-full mb-4"
                                            >
                                                <option className="bg-base-100 text-base-content" value={''} disabled>{t("choose_paper")}</option>
                                                <option className="bg-base-100 text-base-content" value={'EXECUTIVE'}>Executive</option>
                                                <option className="bg-base-100 text-base-content" value={'FOLIO'}>Folio</option>
                                                <option className="bg-base-100 text-base-content" value={'LEGAL'}>Legal</option>
                                                <option className="bg-base-100 text-base-content" value={'LETTER'}>Letter</option>
                                                <option className="bg-base-100 text-base-content" value={'TABLOID'}>Tabloid</option>
                                                {/* <option className="bg-base-100 text-base-content" value={'ID1'}>ID1</option> */}
                                                <option className="bg-base-100 text-base-content" value={'4A0'}>4A0</option>
                                                <option className="bg-base-100 text-base-content" value={'2A0'}>2A0</option>
                                                <option className="bg-base-100 text-base-content" value={'A0'}>A0</option>
                                                <option className="bg-base-100 text-base-content" value={'A1'}>A1</option>
                                                <option className="bg-base-100 text-base-content" value={'A2'}>A2</option>
                                                <option className="bg-base-100 text-base-content" value={'A3'}>A3</option>
                                                <option className="bg-base-100 text-base-content" value={'A4'}>A4</option>
                                                {/* <option className="bg-base-100 text-base-content" value={'A5'}>A5</option>
                                                <option className="bg-base-100 text-base-content" value={'A6'}>A6</option>
                                                <option className="bg-base-100 text-base-content" value={'A7'}>A7</option>
                                                <option className="bg-base-100 text-base-content" value={'A8'}>A8</option>
                                                <option className="bg-base-100 text-base-content" value={'A9'}>A9</option>
                                                <option className="bg-base-100 text-base-content" value={'A10'}>A10</option> */}
                                                <option className="bg-base-100 text-base-content" value={'B0'}>B0</option>
                                                <option className="bg-base-100 text-base-content" value={'B1'}>B1</option>
                                                <option className="bg-base-100 text-base-content" value={'B2'}>B2</option>
                                                <option className="bg-base-100 text-base-content" value={'B3'}>B3</option>
                                                <option className="bg-base-100 text-base-content" value={'B4'}>B4</option>
                                                {/* <option className="bg-base-100 text-base-content" value={'B5'}>B5</option>
                                                <option className="bg-base-100 text-base-content" value={'B6'}>B6</option>
                                                <option className="bg-base-100 text-base-content" value={'B7'}>B7</option>
                                                <option className="bg-base-100 text-base-content" value={'B8'}>B8</option>
                                                <option className="bg-base-100 text-base-content" value={'B9'}>B9</option>
                                                <option className="bg-base-100 text-base-content" value={'B10'}>B10</option> */}
                                                <option className="bg-base-100 text-base-content" value={'C0'}>C0</option>
                                                <option className="bg-base-100 text-base-content" value={'C1'}>C1</option>
                                                <option className="bg-base-100 text-base-content" value={'C2'}>C2</option>
                                                <option className="bg-base-100 text-base-content" value={'C3'}>C3</option>
                                                {/* <option className="bg-base-100 text-base-content" value={'C4'}>C4</option>
                                                <option className="bg-base-100 text-base-content" value={'C5'}>C5</option>
                                                <option className="bg-base-100 text-base-content" value={'C6'}>C6</option>
                                                <option className="bg-base-100 text-base-content" value={'C7'}>C7</option>
                                                <option className="bg-base-100 text-base-content" value={'C8'}>C8</option>
                                                <option className="bg-base-100 text-base-content" value={'C9'}>C9</option>
                                                <option className="bg-base-100 text-base-content" value={'C10'}>C10</option> */}
                                                <option className="bg-base-100 text-base-content" value={'RA0'}>RA0</option>
                                                <option className="bg-base-100 text-base-content" value={'RA1'}>RA1</option>
                                                <option className="bg-base-100 text-base-content" value={'RA2'}>RA2</option>
                                                <option className="bg-base-100 text-base-content" value={'RA3'}>RA3</option>
                                                <option className="bg-base-100 text-base-content" value={'RA4'}>RA4</option>
                                                <option className="bg-base-100 text-base-content" value={'SRA0'}>SRA0</option>
                                                <option className="bg-base-100 text-base-content" value={'SRA1'}>SRA1</option>
                                                <option className="bg-base-100 text-base-content" value={'SRA2'}>SRA2</option>
                                                <option className="bg-base-100 text-base-content" value={'SRA3'}>SRA3</option>
                                                <option className="bg-base-100 text-base-content" value={'SRA4'}>SRA4</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                        <input type="checkbox" className="peer" />
                                        <div className="collapse-title text-xl font-medium" >{t("header_info")}</div>
                                        <div className="collapse-content">
                                            <ul>
                                                <li>
                                                    <label >{t("o_est")}</label>
                                                    <p>
                                                        <input id="oEstrat" className="input input-bordered w-full" value={pdfData.oEstrat}
                                                            onChange={(e) => setPdfData(prevState => ({
                                                                ...prevState,
                                                                oEstrat: e.target.value,
                                                            }))} />
                                                        <button className="btn btn-primary"
                                                            onClick={() => {
                                                                const val = document.getElementById('oEstrat')["value"];
                                                                Ab(
                                                                    pdfData.data,
                                                                    pdfData.header,
                                                                    pdfData.format,
                                                                    pdfData.orientation,
                                                                    pdfData.customWidthLit,
                                                                    pdfData.scale,
                                                                    pdfData.fossils,
                                                                    pdfData.infoProject,
                                                                    pdfData.indexesM,
                                                                    val,
                                                                    pdfData.oLev,
                                                                    pdfData.etSec,
                                                                    pdfData.date, isInverted
                                                                );
                                                            }}
                                                        >Aplicar</button>
                                                    </p>
                                                </li>
                                                <li>
                                                    <label >{t("o_lev")}</label>
                                                    <p>
                                                        <input id="oLev" className="input input-bordered w-full" value={pdfData.oLev}
                                                            onChange={(e) => setPdfData(prevState => ({
                                                                ...prevState,
                                                                oLev: e.target.value,
                                                            }))} />
                                                        <button className="btn btn-primary"
                                                            onClick={() => {
                                                                const val = document.getElementById('oLev')["value"];
                                                                Ab(
                                                                    pdfData.data,
                                                                    pdfData.header,
                                                                    pdfData.format,
                                                                    pdfData.orientation,
                                                                    pdfData.customWidthLit,
                                                                    pdfData.scale,
                                                                    pdfData.fossils,
                                                                    pdfData.infoProject,
                                                                    pdfData.indexesM,
                                                                    pdfData.oEstrat,
                                                                    val,
                                                                    pdfData.etSec,
                                                                    pdfData.date
                                                                    , isInverted
                                                                );
                                                            }}
                                                        >
                                                            <p >{t("apply")}</p></button>
                                                    </p>
                                                </li>
                                                <li>
                                                    <label >{t("section_etiq")}</label>
                                                    <p>
                                                        <input id="etSec" className="input input-bordered w-full" value={pdfData.etSec}
                                                            onChange={(e) => setPdfData(prevState => ({
                                                                ...prevState,
                                                                etSec: e.target.value,
                                                            }))} />
                                                        <button className="btn btn-primary"
                                                            onClick={() => {
                                                                const val = document.getElementById('etSec')["value"];
                                                                Ab(
                                                                    pdfData.data,
                                                                    pdfData.header,
                                                                    pdfData.format,
                                                                    pdfData.orientation,
                                                                    pdfData.customWidthLit,
                                                                    pdfData.scale,
                                                                    pdfData.fossils,
                                                                    pdfData.infoProject,
                                                                    pdfData.indexesM,
                                                                    pdfData.oEstrat,
                                                                    pdfData.oLev,
                                                                    val,
                                                                    pdfData.date, isInverted
                                                                );
                                                            }}
                                                        ><p >{t("apply")}</p></button>
                                                    </p>
                                                </li>
                                                <li>
                                                    <label >{t("date")}</label>
                                                    <p>
                                                        <input id="date" className="input input-bordered w-full" value={pdfData.date}
                                                            onChange={(e) => setPdfData(prevState => ({
                                                                ...prevState,
                                                                date: e.target.value,
                                                            }))}
                                                        />
                                                        <button className="btn btn-primary"
                                                            onClick={() => {
                                                                const val = document.getElementById('date')["value"];
                                                                Ab(
                                                                    pdfData.data,
                                                                    pdfData.header,
                                                                    pdfData.format,
                                                                    pdfData.orientation,
                                                                    pdfData.customWidthLit,
                                                                    pdfData.scale,
                                                                    pdfData.fossils,
                                                                    pdfData.infoProject,
                                                                    pdfData.indexesM,
                                                                    pdfData.oEstrat,
                                                                    pdfData.oLev,
                                                                    pdfData.etSec,
                                                                    val, isInverted
                                                                );
                                                            }}
                                                        ><p >{t("apply")}</p></button>
                                                    </p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                        <input type="checkbox" className="peer" />
                                        <div className="collapse-title text-xl font-medium" >{t("orientation")}</div>
                                        <div className="collapse-content">
                                            <div className="form-control w-full">
                                                <label className="label-text">
                                                    {pdfData.orientation === "portrait" ?
                                                        <label>Vertical</label> :
                                                        <label>Horizontal</label>}
                                                </label>
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-success"
                                                    checked={pdfData.orientation === "portrait"}
                                                    onChange={(e) => {
                                                        setPdfData((prevState) => ({
                                                            ...prevState,
                                                            orientation: (e.target.checked ? "portrait" : "landscape"),
                                                        }));
                                                        Ab(
                                                            pdfData.data,
                                                            pdfData.header,
                                                            pdfData.format,
                                                            e.target.checked ? "portrait" : "landscape",
                                                            pdfData.customWidthLit,
                                                            pdfData.scale,
                                                            pdfData.fossils,
                                                            pdfData.infoProject,
                                                            pdfData.indexesM,
                                                            pdfData.oEstrat,
                                                            pdfData.oLev,
                                                            pdfData.etSec,
                                                            pdfData.date, isInverted
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                        <input type="checkbox" className="peer" />
                                        <div className="collapse-title text-xl font-medium" >{t("visibility")}</div>
                                        <div className="collapse-content">
                                            <ul className="menu p-2 w-full text-base-content">
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
                                                                    <span>{t("" + key)}</span>
                                                                </label>
                                                            </li>
                                                        );
                                                    }
                                                })}
                                            </ul>
                                        </div>
                                    </div> */}

                                    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                        <input type="checkbox" className="peer" />
                                        <div className="collapse-title text-xl font-medium" >{t("w_lit")}
                                        </div>
                                        <div className="collapse-content">
                                            <select
                                                value={pdfData.customWidthLit}
                                                onChange={(e) => {
                                                    setPdfData((prevState) => ({
                                                        ...prevState,
                                                        customWidthLit: e.target.value,
                                                    }));
                                                    Ab(
                                                        pdfData.data,
                                                        pdfData.header,
                                                        pdfData.format,
                                                        pdfData.orientation,
                                                        e.target.value,
                                                        pdfData.scale,
                                                        pdfData.fossils,
                                                        pdfData.infoProject,
                                                        pdfData.indexesM,
                                                        pdfData.oEstrat,
                                                        pdfData.oLev,
                                                        pdfData.etSec,
                                                        pdfData.date, isInverted
                                                    );
                                                }}
                                                className="select select-bordered w-full mb-4"
                                            >
                                                <option className="bg-base-100 text-base-content" value={""} disabled>{t("c_w_lit")}</option>
                                                <option className="bg-base-100 text-base-content" value={'20%'}>20%</option>
                                                <option className="bg-base-100 text-base-content" value={'25%'}>25%</option>
                                                <option className="bg-base-100 text-base-content" value={'30%'}>30%</option>
                                                <option className="bg-base-100 text-base-content" value={'40%'}>40%</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                        <input type="checkbox" className="peer" />
                                        <div className="collapse-title text-xl font-medium" >{t("visibility_rows")}</div>
                                        <div className="collapse-content">
                                            <p className="mb-2" >{t("delete_rows")}</p>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    placeholder="En centímetros"
                                                    id="heightInput"
                                                    className="input input-bordered w-32 text-indigo-600"
                                                /> <p>cm</p>
                                                <button
                                                    onClick={() => {
                                                        const height = document.getElementById('heightInput')["value"];
                                                        handleRows(height);
                                                    }}
                                                    className="btn btn-primary"
                                                >
                                                    <p >{t("apply")}</p>
                                                </button>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                <div className="modal-action mt-4">
                                    <form method="dialog">
                                        <button className="btn"><p >{t("close")}</p></button>
                                    </form>
                                </div>
                            </div>


                        </div>
                    </div>
                </dialog>
            </>

            <div ref={tableref} className="py-16 pl-6">
                <table id="aaaa" style={{ height: '100px' }} >
                    <thead className={`relative sticky top-16 z-[${1000}]`}>
                        <tr>
                            <th className="bg-base-100 no-print">
                                {/* <p className="text-3xl font-bold text-accent-content w-1/2">↓↑</p> */}
                            </th>
                            {header.map((columnName, number) => (
                                <th
                                    key={columnName}
                                    className="border border-base-content bg-primary"
                                    style={{
                                        width: `${columnName === "Espesor"
                                            ? 70
                                            : columnName === "Litologia"
                                                ? (columnWidths[columnName] || 250)
                                                : (columnWidths[columnName] || cellWidth)}px`,
                                        height: '120px',
                                    }}

                                    onClick={() => {
                                        if (columnName === "Facie") {
                                            setSideBarState({
                                                sideBar: true,
                                                sideBarMode: "addFacie"
                                            })
                                        }
                                    }}
                                >

                                    <div className="flex justify-between items-center font-semibold">
                                        <p className="text text-accent-content w-1/2">{t("" + columnName)}</p>

                                        {columnName === "Litologia" ?
                                            <>
                                                <svg
                                                    id="headerLit"
                                                    className="absolute"
                                                    width={(columnWidths[columnName] || 250) / 2}
                                                    height="120"
                                                    overflow={'visible'}
                                                    style={{
                                                        background: "transparent",
                                                    }}>
                                                    <line className="stroke stroke-accent-content" y1="0%" y2="100%" x1={0.5 * (columnWidths["Litologia"] || 250)} x2={0.5 * (columnWidths["Litologia"] || 250)} strokeWidth="1"></line>
                                                    <line className="stroke stroke-accent-content" y1="60%" y2="60%" x1={0.5 * (columnWidths["Litologia"] || 250)} x2={(columnWidths["Litologia"] || 250)} strokeWidth="1"></line>

                                                    <HeaderVal columnWidths={columnWidths} percentage={0.55} name={"clay"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.55} name={"mud"} top={true} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.59} name={"silt"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.63} name={"vf"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.63} name={"wacke"} top={true} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.67} name={"f"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.71} name={"m"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.71} name={"pack"} top={true} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.75} name={"c"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.79} name={"vc"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.79} name={"grain"} top={true} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.83} name={"gran"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.83} name={"redstone"} top={true} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.87} name={"pebb"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.87} name={"rud & bound"} top={true} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.91} name={"cobb"} top={false} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.91} name={"rudstone"} top={true} />
                                                    <HeaderVal columnWidths={columnWidths} percentage={0.95} name={"boul"} top={false} />
                                                </svg>
                                            </> : <></>
                                        }

                                        {columnName === "Facie" ?
                                            <>
                                                <svg
                                                    key={`facieSvg-${columnName}${number}`}
                                                    className="absolute"
                                                    width={(columnWidths[columnName] || cellWidth) / 2}
                                                    height="120"
                                                    overflow={'visible'}
                                                    style={{
                                                        background: "transparent",
                                                    }}
                                                >
                                                    {facies && (
                                                        Object.keys(facies).map((key, index) => {
                                                            const xPos = (index + 1) * ((columnWidths["Facie"] || cellWidth) / (Object.keys(facies).length + 1));
                                                            return (
                                                                <>
                                                                    <text
                                                                        key={`textFacie-${key}${index}${number}`}
                                                                        className="fill fill-accent-content"
                                                                        x={xPos}
                                                                        y={112}>{index}</text>
                                                                </>)
                                                        })
                                                    )}
                                                </svg></> : <></>
                                        }
                                        <div
                                            className="inset-y-0 right-0 h-full"
                                            onMouseOver={(e) =>
                                                e.currentTarget.style.backgroundColor = "transparent"
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
                    <DndContext
                        collisionDetection={rectIntersection}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                    >
                        <SortableContext
                            items={dataIds}
                            strategy={rectSortingStrategy}
                            key={header.length}
                        >
                            <tbody ref={adfas}>
                                {(
                                    isInverted
                                        ? table.getRowModel().rows.slice().reverse()
                                        : table.getRowModel().rows
                                ).map((row, index) => {
                                    return (
                                        <DraggableRow
                                            rowspan={data.length}
                                            key={row.id + "" + index}
                                            row={row}
                                            index={row.index}
                                            header={header}
                                            isInverted={isInverted}
                                            setSideBarState={setSideBarState}
                                            columnWidths={columnWidths}
                                            openModalPoint={openModalPoint}
                                            handleClickRow={handleClickRow}
                                            addCircles={addCircles}
                                            prevContact={
                                                row.index > 0 ? (table.getRowModel().rows[row.index - 1].original.Litologia.Contact) : "111"
                                            }
                                            alturaTd={alturaTd}
                                            editingUsers={editingUsers}
                                            sendActionCell={sendActionCell}
                                            hovered={hovered}
                                            setFormFosil={setFormFosil}
                                            scale={scale}
                                            facies={facies}
                                            setFormFacies={setFormFacies}
                                        />

                                    )
                                }
                                )}
                            </tbody>

                        </SortableContext>
                    </DndContext>

                </table>
            </div>

        </>
    );
};

export default Tabla;
