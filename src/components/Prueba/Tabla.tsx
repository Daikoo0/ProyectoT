import { useState, useMemo } from 'react';
import parse from 'html-react-parser';

const Tabla = ({ datos, alturas }) => {
    const columnas = useMemo(() => Object.keys(datos), [datos]);
    const filas = useMemo(() => datos.nombres.length, [datos]);

    const [columnasVisibles, setColumnasVisibles] = useState(() =>
        columnas.reduce((acc, columna) => {
            acc[columna] = true;
            return acc;
        }, {})
    );

    const toggleColumna = (columna) => {
        setColumnasVisibles((prevState) => ({
            ...prevState,
            [columna]: !prevState[columna],
        }));
    };

    const [anchos, setAnchos] = useState(() => new Array(columnas.length).fill(150));
    const [alturaFila] = useState(30); // Esta línea no cambia, pero si no usas setAlturaFila, considera remover esta parte del estado.

    const ajustarAncho = (index, nuevoAncho) => {
        setAnchos((prevAnchos) => {
            const nuevosAnchos = [...prevAnchos];
            nuevosAnchos[index] = Math.max(nuevoAncho, 50); // Establecer un mínimo de ancho
            return nuevosAnchos;
        });
    };

    const [ordenFilas, setOrdenFilas] = useState(() => datos.nombres);
    const [filaArrastrada, setFilaArrastrada] = useState(null);

    const onDragOver = (index) => (event) => {
        event.preventDefault();
        if (filaArrastrada === null || filaArrastrada === index) return;

        setOrdenFilas((prevOrden) => {
            const nuevoOrden = [...prevOrden];
            const itemMovido = nuevoOrden.splice(filaArrastrada, 1)[0];
            nuevoOrden.splice(index, 0, itemMovido);
            return nuevoOrden;
        });
        setFilaArrastrada(index);
    };

    const onDragStart = (event, index) => {
        const startX = event.clientX;
        const startWidth = anchos[index];

        const doDrag = (e) => {
            const nuevoAncho = startWidth + e.clientX - startX;
            ajustarAncho(index, nuevoAncho);
        };

        const stopDrag = () => {
            document.documentElement.removeEventListener('mousemove', doDrag);
            document.documentElement.removeEventListener('mouseup', stopDrag);
        };

        document.documentElement.addEventListener('mousemove', doDrag);
        document.documentElement.addEventListener('mouseup', stopDrag);
    };

    {/* Pre-calcular las columnas visibles para reutilización */ }
    const columnasVisiblesFiltradas = useMemo(() =>
        columnas.filter(columna => columnasVisibles[columna]),
        [columnas, columnasVisibles]
    );


    return (
        <>
            <div className="flex flex-col">
                <div className="flex mb-2">
                    {columnas.map((columna) => (
                        <label key={columna} className="mr-2">
                            <input
                                type="checkbox"
                                checked={columnasVisibles[columna]}
                                onChange={() => toggleColumna(columna)}
                            /> {columna}
                        </label>
                    ))}
                </div>


                <div className="flex">
                    {columnasVisiblesFiltradas.map((columna, index) => (
                        <div key={columna} className="border" style={{ minWidth: `${anchos[index]}px` }}>
                            <div
                                className="cursor-col-resize flex justify-between items-center bg-gray-200 p-2"
                                onMouseDown={(e) => onDragStart(e, index)}
                            >
                                {columna}
                                <span className="p-1">||</span>
                            </div>
                        </div>
                    ))}
                </div>

                {ordenFilas.map((nombre, filaIndex) => (
                    <div
                        key={filaIndex}
                        className="flex"
                        draggable
                        onDragStart={(e) => onDragStart(e, filaIndex)}
                        onDragOver={onDragOver(filaIndex)}
                    >
                        {columnasVisiblesFiltradas.map((columna, colIndex) => (
                            <div
                                key={`${filaIndex}-${colIndex}`}
                                className="border prose ql-editor"
                                style={{
                                    height: `${alturas[filaIndex] || alturaFila}px`,
                                    width: `${anchos[colIndex]}px`,
                                    overflowY: typeof datos[columna][filaIndex] === 'string' ? 'auto' : 'visible',
                                    padding: typeof datos[columna][filaIndex] === 'string' ? undefined : '0',
                                    margin: typeof datos[columna][filaIndex] === 'string' ? undefined : '0',
                                    borderTop: columna === 'Litologia' ? 'none' : '',
                                    borderBottom: columna === 'Litologia' && filaIndex < ordenFilas.length-1 ? 'none' : '',
                                   
                                }}
                            >
                                {typeof datos[columna][filaIndex] === 'string' ?
                                    parse(datos[columna][filaIndex]) :
                                    datos[columna][filaIndex]
                                }
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>



    );

};

export default Tabla;
