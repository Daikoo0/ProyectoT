import React, { useState, useRef, useEffect, CSSProperties, useMemo } from "react";
import { atFossil, atSideBarState, atformFossil, atSettingsHeader, atSettings, atSamples, atLithologyTable, atLithologyTableOrder } from "../../state/atomEditor";
import { useSetRecoilState, useRecoilValue } from "recoil";
import Lithology from "./Lithology";
import Fosil from "./Fosil";
import Muestra from "./Muestra";
import lithoJson from '../../lithologic.json';
import Ruler from "./Ruler2";
import ResizeObserver from "resize-observer-polyfill";
import { useTranslation } from 'react-i18next';
import { DndContext, rectIntersection, MouseSensor, useSensor, useSensors, TouchSensor, type UniqueIdentifier, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableOptions, Row, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import Symbology from './Symbology'
import { LithologyTable } from '../../components/Prueba/types'

// interface Layer {
//     // userId: string;
//     Columns: any;
//     Litologia: any;
// }

const pix = 2

const RowDragHandleCell = ({ row }: { row: Row<LithologyTable> }) => {
    const { attributes, listeners } = useSortable({
        id: row.id,
    });

    return (
        <button {...attributes} {...listeners} style={{
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'grab',
        }}
        >
            =
        </button>
    );
};

const DraggableRow = ({ row, index, columnWidths
    , openModalPoint, handleClickRow, addCircles, prevContact, rowspan, alturaTd, editingUsers,
    sendActionCell, hovered, facies, setFormFacies, adfas, setFormMuestra,
    length
}: {
    row: Row<LithologyTable>;
    index: number;
    // header: Array<Col>;
    isInverted: boolean;
    // setSideBarState: (state: { sideBar: boolean, sideBarMode: string }) => void,
    columnWidths: any;
    openModalPoint: (index, insertIndex, x, name) => void;
    handleClickRow: (rowIndex: number, columnName: string) => void;
    addCircles: (rowIndex: number, insertIndex: number, point: number) => void;
    prevContact: string;
    rowspan: number;
    alturaTd: number;
    editingUsers: any;
    sendActionCell: (rowIndex: number, columnIndex: number) => void;
    // setFormFosil: (state: { id: string, upper: number, lower: number, fosilImg: string, x: number, fosilImgCopy: string }) => void;
    hovered: boolean;
    // scale: number;
    facies: any;
    setFormFacies(state: { facie: string });
    adfas: any;
    setFormMuestra: (state: { id: string, upper: number, lower: number, muestraText: string, x: number, muestraTextCopy: string }) => void;
    // fossils: any;
    // muestras: any;
    length: number;
}) => {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.id,
    });

    const setFormFossil = useSetRecoilState(atformFossil);
    const setAtSideBar = useSetRecoilState(atSideBarState);
    const settings = useRecoilValue(atSettings);
    const fossils = useRecoilValue(atFossil);
    const muestras = useRecoilValue(atSamples);

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1000 : length - Number(row.id),
        position: 'relative',
        padding: 0,
        height: (row.original.Litologia.Height * settings.scale) - pix,
        margin: 0,
    };


    return (
        <tr ref={setNodeRef} style={style} id={row.id} >
            {row.getVisibleCells().map((cell, cellIndex) => {
                const cdef = cell.column.columnDef;

                if (cell.column.id === "Espesor") {
                    if (index === 0) {
                        return (
                            <td
                                key={cell.id}
                                rowSpan={rowspan}
                                //  className="border border-base-content h-full max-h-full"
                                ref={adfas}
                                style={{
                                    verticalAlign: "top",
                                }}
                                className="border border-base-content"
                            >

                                <Ruler height={alturaTd} width={(columnWidths["Espesor"] || 70)} isInverted={settings.isInverted} scale={settings.scale} />

                            </td>
                        );
                    } else {
                        return null;
                    }
                }
                if (cell.column.id === "Litologia") {
                    return (
                        <td key={cell.id} style={{ padding: 0, height: (cell.row.original.Litologia.Height * settings.scale) - pix }}>
                            <Lithology
                                zindex={row.getVisibleCells().length - index}
                                isInverted={settings.isInverted}
                                rowIndex={index}//rowIndex={adjustedRowIndex}
                                Height={(cell.row.original.Litologia.Height * settings.scale)}
                                Width={columnWidths['Litologia'] || 250}
                                File={lithoJson[cell.row.original.Litologia.File]}
                                ColorFill={cell.row.original.Litologia.ColorFill}
                                ColorStroke={cell.row.original.Litologia.ColorStroke}
                                Zoom={cell.row.original.Litologia.Zoom}
                                circles={cell.row.original.Litologia.Circles}
                                addCircles={addCircles}
                                openModalPoint={openModalPoint}
                                handleClickRow={handleClickRow}
                                tension={cell.row.original.Litologia.Tension}
                                rotation={cell.row.original.Litologia.Rotation}
                                contact={cell.row.original.Litologia.Contact}
                                prevContact={prevContact}
                            />
                        </td>
                    );
                }
                if (cell.column.id === "Estructura fosil") {
                    if (index === 0) {
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
                                            setAtSideBar({
                                                isOpen: true,
                                                entityType: "fossil", actionType: "add"
                                            });
                                            setFormFossil({
                                                id: '', upper: 0, lower: 0, fosilImg: '',
                                                x: e.nativeEvent.offsetX / (columnWidths["Estructura fosil"] || cell.column.getSize()),
                                                fosilImgCopy: '',
                                            });
                                        }
                                    }}
                                >
                                    <svg id="fossilSvg"
                                        className="h-full max-h-full"
                                        width={columnWidths["Estructura fosil"] || cell.column.getSize()}
                                        height={alturaTd < 153 ? alturaTd : ''}
                                        overflow={settings.header[cellIndex - 2]?.Name == "Litologia" ? "visible" : "hidden"}
                                    >
                                        {fossils
                                            ? Object.keys(fossils).map((data, index) => (
                                                <Fosil
                                                    //  isInverted={isInverted}
                                                    key={index}
                                                    keyID={data}
                                                    data={fossils[data]}
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
                if (cell.column.id === "Muestras") {
                    if (index === 0) {
                        return (
                            <td
                                id="muestras"
                                key={cell.id}
                                rowSpan={rowspan}
                                className="border border-base-content"
                            >
                                <div
                                    className="h-full max-h-full"
                                    onClick={(e) => {
                                        if (e.target instanceof SVGSVGElement) {
                                            setAtSideBar({
                                                isOpen: true,
                                                entityType: "sample", actionType: "add"
                                            });
                                            setFormMuestra({
                                                id: '',
                                                upper: 0,
                                                lower: 0,
                                                muestraText: '',
                                                x: e.nativeEvent.offsetX / (columnWidths["Muestra"] || cell.column.getSize()),
                                                muestraTextCopy: '',
                                            });
                                        }
                                    }}
                                >
                                    <svg id="muestraSvg"
                                        className="h-full max-h-full"
                                        width={columnWidths["Muestras"] || cell.column.getSize()}
                                        height={alturaTd < 153 ? alturaTd : ''}
                                        overflow={settings.header[cellIndex - 2]?.Name == "Litologia" ? "visible" : "hidden"}
                                    >
                                        {muestras
                                            ? Object.keys(muestras).map((data, index) => (
                                                <Muestra
                                                    key={index}
                                                    keyID={data}
                                                    data={muestras[data]}
                                                    setFormMuestra={setFormMuestra}
                                                    litologiaX={columnWidths["Litologia"] || 200}
                                                    columnW={columnWidths["Muestra"] || cell.column.getSize()}
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
                if (cell.column.id === "Facie") {
                    if (index === 0) {
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
                                    transform={settings.isInverted ? "none" : "scale(1,-1)"}
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
                                                            setAtSideBar({
                                                                isOpen: true,
                                                                entityType: "facieSection", actionType: "edit"
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
                                                                    fontFamily="Times New Roman, Times, serif"
                                                                    className="fill fill-base-content"
                                                                    x={settings.isInverted ? 10 : -((parseFloat(value.y2) - parseFloat(value.y1)) * settings.scale)}
                                                                    transform={
                                                                        settings.isInverted
                                                                            ?
                                                                            `rotate(90, 5, ${parseFloat(value.y1) * settings.scale})`
                                                                            :
                                                                            `scale(-1, 1) rotate(${270}, -5, ${parseFloat(value.y1) * settings.scale})`

                                                                    }
                                                                    y={(parseFloat(value.y1) - 2) * settings.scale}

                                                                >
                                                                    {key}
                                                                </text>
                                                            </g>
                                                            <rect
                                                                data-custom="valor1"
                                                                key={"rect-" + key + value + i}
                                                                className="fill fill-base-content"
                                                                x={xPosp}
                                                                y={parseFloat(value.y1) * settings.scale}
                                                                width={wp}
                                                                height={(parseFloat(value.y2) - parseFloat(value.y1)) * settings.scale}
                                                                onClick={() => {
                                                                    setAtSideBar({
                                                                        isOpen: true,
                                                                        entityType: "facieSection", actionType: "edit"
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
                if (cell.column.id === "drag-handle") {
                    return (
                        <td key={cell.id} style={{ height: (row.original.Litologia.Height * settings.scale) - pix, width: cell.column.getSize() }} className="no-print">
                            <div style={{ height: (row.original.Litologia.Height * settings.scale) - pix }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                        </td>
                    );
                }
                return (
                    <td key={cell.id} style={{
                        width: cell.column.getSize(),
                        height: (row.original.Litologia.Height * settings.scale) - pix,
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
                            setAtSideBar({
                                isOpen: true,
                                entityType: "text", actionType: "edit"
                            });
                            handleClickRow(Number(row.id), String(cdef.header))
                            sendActionCell(Number(row.id), cellIndex)
                        }}
                        onMouseEnter={(editingUsers?.[`[${row.id},${cellIndex}]`] ? cdef["handleMouseEnter"] : null)}
                        onMouseLeave={(editingUsers?.[`[${row.id},${cellIndex}]`] ? cdef["handleMouseLeave"] : null)}
                    >

                        <div style={{ display: 'block', boxSizing: 'border-box', margin: 0, padding: 0, top: 0, overflow: "hidden", maxHeight: (cell.row.original.Litologia.Height * settings.scale) - pix, }}>
                            {(editingUsers?.[`[${row.id},${cellIndex}]`] && hovered) ?
                                <p style={{ top: 0, fontSize: 12, backgroundColor: editingUsers?.[`[${row.id},${cellIndex}]`]?.color }}>{editingUsers?.[`[${row.id},${cellIndex}]`]?.name}</p>
                                : <></>
                            }
                            <div
                                style={{ overflow: hovered ? "auto" : "hidden", height: (row.original.Litologia.Height * settings.scale) - pix }}
                                className="ql-editor prose"
                                dangerouslySetInnerHTML={{ __html: row.original.Columns[cell.column.id] }} />
                        </div>
                    </td>
                );

            })}

        </tr>
    );
};

const LitologiaHeader = ({ columnWidths }) => {
    // Definimos las opciones para los HeaderVal
    const options = [
        { percentage: 0.55, name: "clay", top: false },
        { percentage: 0.55, name: "mud", top: true },
        { percentage: 0.59, name: "silt", top: false },
        { percentage: 0.63, name: "vf", top: false },
        { percentage: 0.63, name: "wacke", top: true },
        { percentage: 0.67, name: "f", top: false },
        { percentage: 0.71, name: "m", top: false },
        { percentage: 0.71, name: "pack", top: true },
        { percentage: 0.75, name: "c", top: false },
        { percentage: 0.79, name: "vc", top: false },
        { percentage: 0.79, name: "grain", top: true },
        { percentage: 0.83, name: "gran", top: false },
        { percentage: 0.83, name: "redstone", top: true },
        { percentage: 0.87, name: "pebb", top: false },
        { percentage: 0.87, name: "rud & bound", top: true },
        { percentage: 0.91, name: "cobb", top: false },
        { percentage: 0.91, name: "rudstone", top: true },
        { percentage: 0.95, name: "boul", top: false },
    ];

    // Ancho de la columna "Litologia" o un valor por defecto
    const litologiaWidth = columnWidths["Litologia"] || 250;

    return (
        <svg
            id="headerLit"
            className="absolute"
            width={litologiaWidth / 2}
            height="120"
            overflow={'visible'}
            style={{ background: "transparent" }}
        >
            {/* Líneas principales */}
            <line
                className="stroke stroke-accent-content"
                y1="0%"
                y2="100%"
                x1={0.5 * litologiaWidth}
                x2={0.5 * litologiaWidth}
                strokeWidth="1"
            />
            <line
                className="stroke stroke-accent-content"
                y1="60%"
                y2="60%"
                x1={0.5 * litologiaWidth}
                x2={litologiaWidth}
                strokeWidth="1"
            />

            {/* Renderizamos las opciones dinámicamente */}
            {options.map((option, index) => {
                const x = option.percentage * litologiaWidth;
                const pos = option.top ? 60 : 105;

                return (
                    <React.Fragment key={index}>
                        {/* Línea vertical */}
                        <path id={option.name} d={`M${x},${pos} L${x},0`} />

                        {/* Texto rotado */}
                        <foreignObject
                            x={x - 10}
                            y={pos - 10}
                            width="50"
                            height="20"
                            transform={`rotate(${270}, ${x}, ${pos})`}
                        >
                            <p
                                className="text text-accent-content"
                                style={{
                                    fontFamily: "Times New Roman, Times, serif",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                }}
                            >
                                {option.name}
                            </p>
                        </foreignObject>

                        {/* Línea horizontal superior o inferior */}
                        {option.top ? (
                            <line
                                className="stroke stroke-accent-content"
                                y1="52%"
                                y2="60%"
                                x1={x}
                                x2={x}
                                strokeWidth="1"
                            />
                        ) : (
                            <line
                                className="stroke stroke-accent-content"
                                y1="90%"
                                y2="100%"
                                x1={x}
                                x2={x}
                                strokeWidth="1"
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </svg>
    );
};

const Tabla = ({
    addCircles, setSideBarState,
    facies, setFormFacies,
    openModalPoint, handleClickRow, sendActionCell,
    editingUsers, alturaTd, setAlturaTd, socket, tableref, setFormMuestra }) => {
    const { t } = useTranslation(['PDF']);
    const cellWidth = 150;
    var cellMinWidth = 150;
    var cellMaxWidth = 300;
    const [columnWidths, setColumnWidths] = useState({});

    const header = useRecoilValue(atSettingsHeader);

    const lithologyTable = useRecoilValue(atLithologyTable);
    const lithologyTableOrder = useRecoilValue(atLithologyTableOrder);
    const settings = useRecoilValue(atSettings);

    const data = useMemo(() => {
        return lithologyTableOrder.map(id => lithologyTable[id]);
    }, [lithologyTable, lithologyTableOrder]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 3,  // Reducir la distancia necesaria para activar el arrastre
            },
        }),
        useSensor(TouchSensor, {})
    );

    const columns = useMemo(() => {
        const fixedColumns = {
            "drag-handle": {
                id: 'drag-handle',
                cell: ({ row }) => <RowDragHandleCell row={row} />,
                size: 60,
            },
            "Espesor": {
                accessorKey: 'Espesor',
                header: "Espesor",
            },
            "Litologia": {
                accessorKey: 'Litologia',
                cell: (info) => info.getValue(),
                header: "Litologia",
            },
            "Estructura fosil": {
                accessorKey: 'Estructura fosil',
                //  fossils: fossils,
                header: "Estructura fosil",
            },
            "Facie": {
                accessorKey: 'Facie',
                header: "Facie",
            },
            "Muestras": {
                accessorKey: 'Muestras',
                //   muestras: muestras,
                header: "Muestras",
            },
        };

        const orderedColumns = header
            .filter(item => item.Visible)
            .map(item => {
                if (fixedColumns[item.Name]) {
                    return fixedColumns[item.Name];
                }

                return {
                    accessorKey: item.Name,
                    cell: (info) => info.row.original.Columns[item.Name],
                    header: item.Name,
                    handleMouseEnter: () => setHovered(true),
                    handleMouseLeave: () => setHovered(false),
                };
            });

        return [fixedColumns["drag-handle"], ...orderedColumns];
    }, [header]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // getRowId: (row: Layer) => row.userId,
        debugTable: true,
        debugHeaders: true,
        debugColumns: true,
    } as TableOptions<LithologyTable>);


    const dataIds = useMemo<UniqueIdentifier[]>(
        () => table.getRowModel().rows.map((row) => row.id), // Utiliza el índice como id
        [table.getRowModel().rows, header, settings.isInverted, columns]
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

    var adfas = useRef<HTMLTableSectionElement>(null);

    useEffect(() => {
        const obtenerAlturaTd = () => {
            if (adfas.current) {
                const alturaBody = adfas.current.getBoundingClientRect().height;
                const altura = alturaBody < 170
                    ? data.reduce((total, item) => total + (item.Litologia?.Height * 1 || 0), 0)
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
            <div ref={tableref} className="py-16 pl-6">
                <table style={{ height: '100px' }} >
                    <thead className={`relative sticky top-16 z-[1001]`}>
                        <tr>
                            <th className="bg-base-100 no-print">
                                {/* <p className="text-3xl font-bold text-accent-content w-1/2">↓↑</p> */}
                            </th>
                            {columns.map((col, number) => (
                                number > 0 && (  // Este condicional omite el primer elemento
                                    <th
                                        key={col.header}
                                        className="border border-base-content bg-primary"
                                        style={{
                                            width: `${col.header === "Espesor"
                                                ? 70
                                                : col.header === "Litologia"
                                                    ? (columnWidths[col.header] || 250)
                                                    : (columnWidths[col.header] || cellWidth)}px`,
                                            height: '120px',
                                        }}

                                        onClick={() => {
                                            if (col.header === "Facie") {
                                                setSideBarState({
                                                    sideBar: true,
                                                    sideBarMode: "addFacie"
                                                })
                                            }
                                        }}
                                    >

                                        <div className="flex justify-between items-center font-semibold">
                                            <p style={{ fontFamily: "Times New Roman, Times, serif" }} className="text text-accent-content w-1/2">{t(col.header)}{col.header === "Espesor" ? " [m]" : ""}</p>

                                            {col.header === "Litologia" ?
                                                <>
                                                    <LitologiaHeader columnWidths={columnWidths} />
                                                </> : <></>
                                            }

                                            {col.header === "Facie" ?
                                                <>
                                                    <svg
                                                        key={`facieSvg-${col.header}${number}`}
                                                        className="absolute"
                                                        width={(columnWidths[col.header] || cellWidth) / 2}
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
                                                onMouseDown={(e) => handleMouseDown(col.header, e)}
                                                style={{
                                                    width: '5px',
                                                    cursor: 'col-resize',
                                                    height: '100px',
                                                    backgroundColor: 'transparent',
                                                }}
                                            />
                                        </div>
                                    </th>
                                )))}
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
                            key={columns.map(column => column.accessorKey).join("")}
                        >
                            <tbody style={{ maxHeight: data.reduce((acc, item) => acc + (item.Litologia?.Height * 1 || 0), 0) }}>
                                {(
                                    // isInverted
                                    //     ? table.getRowModel().rows.slice().reverse()
                                    //     : 
                                    table.getRowModel().rows
                                ).map((row, index) => {

                                    return (
                                        <DraggableRow
                                            rowspan={data.length}
                                            key={row.id + "" + index}
                                            row={row}
                                            index={row.index}
                                            // header={header}
                                            isInverted={settings.isInverted}
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
                                            facies={facies}
                                            setFormFacies={setFormFacies}
                                            adfas={adfas}
                                            setFormMuestra={setFormMuestra}
                                            length={data.length}
                                        />

                                    )
                                }
                                )}
                            </tbody>

                        </SortableContext>
                    </DndContext>

                </table>

                <Symbology />
            </div>
        </>
    );
};

export default Tabla;
