import { useState, useRef, useEffect } from "react";
import Polygon from "./Polygon4";
import Fosil from "./Fosil";
import lithoJson from '../../lithologic.json';
import Ruler from "./Ruler2";
import Ab from "./pdfFunction";
import ResizeObserver from "resize-observer-polyfill";
import { useTranslation } from 'react-i18next';

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
    editingUsers, isInverted, alturaTd, setAlturaTd }) => {
        const { t } = useTranslation(['PDF']);
    const cellWidth = 150;
    var cellMinWidth = 150;
    var cellMaxWidth = 300;
    const tableref = useRef(null);
    const [columnWidths, setColumnWidths] = useState({});

    // Función para manejar el inicio del arrastre para redimensionar
    const handleMouseDown = (columnName, event) => {
        event.preventDefault();

        const startWidth = columnWidths[columnName] || cellWidth;
        const startX = event.clientX;

        const handleMouseMove = (moveEvent) => {
            let newWidth = startWidth + moveEvent.clientX - startX;
            if (columnName === "Litologia") { cellMinWidth = 250; cellMaxWidth = 400 }
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

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };


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
        Ab(pdfData.data, newHeaders, pdfData.format, pdfData.orientation, pdfData.customWidthLit, pdfData.scale, pdfData.fossils, pdfData.infoProject, pdfData.indexesM, pdfData.oEstrat,
            pdfData.oLev,
            pdfData.etSec,
            pdfData.date)
    }

    const handleRows = (number) => {
        console.log(number)
        var rowsBefore = [...pdfData.data];
        var indexes = rowsBefore.map((row, index) => Number(row.Litologia.Height) > Number(number) ? index : -1)
            .filter(index => index !== -1);
        Ab(pdfData.data, pdfData.header, pdfData.format, pdfData.orientation, pdfData.customWidthLit, pdfData.scale, pdfData.fossils, pdfData.infoProject, indexes, pdfData.oEstrat,
            pdfData.oLev,
            pdfData.etSec,
            pdfData.date);
    }

    var adfas = useRef<HTMLTableCellElement>(null);

    useEffect(() => {
        const obtenerAlturaTd = () => {
            if (adfas.current) {
                const altura = adfas.current.getBoundingClientRect().height;
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
    }, [adfas.current, data.length]);

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
                                                        pdfData.date
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
                                                                    pdfData.date
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
                                                                    pdfData.date
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
                                                                    val
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
                                                            pdfData.date
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
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
                                                                    <span>{t(""+key)}</span>
                                                                </label>
                                                            </li>
                                                        );
                                                    }
                                                })}
                                            </ul>
                                        </div>
                                    </div>

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
                                                        pdfData.date
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
                <table style={{ height: '100px' }} >
                    <thead className="relative sticky top-16 z-[1]">
                        <tr>
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
                                    }}>

                                    <div className="flex justify-between items-center font-semibold">
                                        <p className="text text-accent-content w-1/2">{t(""+columnName)}</p>

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
                                                    <line className="stroke stroke-accent-content" y1="0%" y2="100%" x1={0.5 * (columnWidths["Litologia"] || 250)}x2={0.5 * (columnWidths["Litologia"] || 250)} strokeWidth="1"></line>
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
                                                    onClick={() => {
                                                        setSideBarState({
                                                            sideBar: true,
                                                            sideBarMode: "addFacie"
                                                        })
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
                    <tbody >
                        {data.map((RowValue, rowIndex) => (
                            <tr key={rowIndex} className="relative z-[0]">
                                {header.map((columnName, columnIndex) => {

                                    if (columnName === 'Espesor' && rowIndex === 0) {
                                        return (
                                            <td
                                                ref={adfas}
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={data.length}
                                                className="border border-base-content"
                                                style={{
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <div className="h-full max-h-full">
                                                    <Ruler height={alturaTd} width={(columnWidths["Espesor"] || 70)} isInverted={isInverted} scale={scale} />
                                                </div>
                                            </td>
                                        );
                                    } else if (columnName === 'Estructura fosil' && rowIndex === 0) {
                                        return (
                                            <td
                                                id="fossils"
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={data.length}
                                                className="border border-base-content"
                                                style={{
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <div className="h-full max-h-full"// tooltip" data-tip="hello"
                                                    onClick={(e) => {
                                                        if (e.target instanceof SVGSVGElement) {
                                                            setSideBarState({
                                                                sideBar: true,
                                                                sideBarMode: "fosil"
                                                            })
                                                            setFormFosil({ id: '', upper: 0, lower: 0, fosilImg: '', x: e.nativeEvent.offsetX / (columnWidths["Estructura fosil"] || cellWidth), fosilImgCopy: '' })
                                                        }
                                                    }}
                                                    style={{ top: 0 }}>
                                                    <svg id="fossilSvg" className="h-full max-h-full" width={columnWidths["Estructura fosil"] || cellWidth} height="0" overflow='visible'>
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
                                    }
                                    else if (columnName === 'Facie' && rowIndex === 0) {
                                        return (
                                            <td
                                                id="facies"
                                                key={`${rowIndex}-${columnIndex}`}
                                                rowSpan={data.length}
                                                className="border border-base-content"
                                                style={{
                                                    verticalAlign: "top"
                                                }}
                                            >
                                                <div className="h-full max-h-full"
                                                    style={{ top: 0 }}>
                                                    <svg id="svgFacies" className="h-full max-h-full" width={columnWidths["Facie"] || cellWidth} height="0" overflow='visible'>
                                                        {facies ? (
                                                            Object.keys(facies).map((key, index) => {
                                                                const xPosp = "" + (((index + 1) / (Object.keys(facies).length + 1)) * 100) + "%";//(index + 1) * (w);
                                                                const wp = "" + (((columnWidths["Facie"] || cellWidth) / (Object.keys(facies).length + 1)) / (columnWidths["Facie"] || cellWidth) * 100) + "%";
                                                                return (
                                                                    <>

                                                                        <rect x={xPosp} y="0" height="100%" width={wp} className="stroke stroke-base-content"
                                                                            strokeWidth={"1"} fill="transparent"
                                                                            data-value="value1"
                                                                            onClick={() => {
                                                                                setSideBarState({
                                                                                    sideBar: true,
                                                                                    sideBarMode: "facieSection"
                                                                                })
                                                                                setFormFacies({ facie: key })
                                                                            }
                                                                            }
                                                                        />
                                                                        {facies[key].map((value, i) => {
                                                                            return (
                                                                                <>
                                                                                    {/* strokeWidth={index<Object.keys(facies).length ? "1" : "0"} /> */}
                                                                                    <g key={i}>
                                                                                        <text
                                                                                            key={value}
                                                                                            fontSize={14}
                                                                                            className="fill fill-base-content"
                                                                                            x={10}
                                                                                            transform={`rotate(90, 5, ${parseFloat(value.y1) * scale})`}
                                                                                            y={(parseFloat(value.y1) - 2) * scale}>{key}</text>
                                                                                    </g>
                                                                                    <rect data-custom="valor1"
                                                                                        key={value}
                                                                                        className="fill fill-base-content"
                                                                                        x={xPosp}
                                                                                        y={parseFloat(value.y1) * scale}
                                                                                        width={wp}//width={(xPos - rectx) + 1}
                                                                                        height={(parseFloat(value.y2) - parseFloat(value.y1)) * scale}  // Altura del rectángulo
                                                                                        onClick={() => {
                                                                                            setSideBarState({
                                                                                                sideBar: true,
                                                                                                sideBarMode: "facieSection"
                                                                                            })
                                                                                            setFormFacies({ facie: key })
                                                                                        }
                                                                                        }
                                                                                    />
                                                                                </>
                                                                            )
                                                                        })}
                                                                    </>
                                                                );
                                                            })
                                                        ) : null}
                                                    </svg>
                                                </div>
                                            </td>
                                        );
                                    }
                                    else if (columnName !== 'Estructura fosil' && columnName !== 'Espesor' && columnName !== 'Facie') {
                                        return (
                                            <td
                                                key={`${rowIndex}-${columnIndex}`}
                                                className={
                                                    (editingUsers?.[`[${rowIndex},${columnIndex}]`] && columnName !== 'Litologia') ?
                                                        (`border-2`) : (`border border-base-content`)
                                                }
                                                onClick={() => {
                                                    if (columnName !== "Litologia") {
                                                        setSideBarState({
                                                            sideBar: true,
                                                            sideBarMode: "text"
                                                        });
                                                        handleClickRow(rowIndex, columnName)
                                                    }
                                                    sendActionCell(rowIndex, columnIndex)
                                                }}
                                                style={{
                                                    overflowY: (columnName === 'Litologia') ? 'visible' : 'auto',
                                                    padding: '0',
                                                    top: '0',
                                                    borderTop: (columnName === 'Litologia') ? 'none' : '',   // Eliminar borde superior si es Litologia
                                                    borderBottom: (columnName === 'Litologia') ? 'none' : '', // Eliminar borde inferior si es Litologia
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
                                                        maxHeight: `${RowValue.Litologia.Height * scale}px`,
                                                        height: '100%',
                                                    }}
                                                >
                                                    {columnName === 'Litologia' ?
                                                        <>
                                                            <Polygon
                                                                rowIndex={rowIndex}
                                                                Height={RowValue.Litologia.Height * scale}
                                                                Width={columnWidths["Litologia"] || 250}
                                                                File={lithoJson[RowValue.Litologia.File]}
                                                                ColorFill={RowValue.Litologia.ColorFill}
                                                                ColorStroke={RowValue.Litologia.ColorStroke}
                                                                Zoom={RowValue.Litologia.Zoom}
                                                                circles={RowValue.Litologia.Circles}
                                                                addCircles={addCircles}
                                                                openModalPoint={openModalPoint}
                                                                setSideBarState={setSideBarState}
                                                                handleClickRow={handleClickRow}
                                                                tension={RowValue.Litologia.Tension}
                                                                rotation={RowValue.Litologia.Rotation}
                                                                contact={RowValue.Litologia.Contact}
                                                                prevContact={RowValue.Litologia.PrevContact}
                                                            />
                                                        </>
                                                        :
                                                        <>

                                                            <div
                                                                className="ql-editor prose "
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
