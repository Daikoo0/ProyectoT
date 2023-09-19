import { useEffect, useState  } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useParams } from 'react-router-dom';

export default function AppWs() {

    const [squares, setSquares] = useState([]);
    const { project } = useParams();
    
    // Crear la conexión WebSocket
    const socket = new WebSocket(`ws://localhost:3001/ws?room=${project}`);

    useEffect(() => {

        socket.onmessage = (event) => {
            console.log(event.data);
            const square = JSON.parse(event.data);
            setSquares(currentSquares => {
                const existingSquareIndex = currentSquares.findIndex(s => s.id === square.id);
                if (existingSquareIndex !== -1) {
                    // Si el cuadrado ya existe, actualizamos su posición en lugar de agregar un nuevo cuadrado
                    const updatedSquares = [...currentSquares];
                    updatedSquares[existingSquareIndex] = square;
                    return updatedSquares;
                } else {
                    // Si el cuadrado no existe, lo agregamos al estado
                    return [...currentSquares, square];
                }
            });
        };
        
    
        // Limpiar la conexión WebSocket cuando el componente se desmonta
        return () => {
          socket.close();
        };
    }, []);

    // Enviar un mensaje al servidor cuando se agrega un nuevo cuadrado
    const addSquare = () => {
        const newSquare = { x: Math.random() * 100, y: Math.random() * 100, id: squares.length };
        socket.send(JSON.stringify(newSquare));
    };

    const handleDragEnd = (e, index) => {
        const updatedSquare = { ...squares[index], x: e.target.x(), y: e.target.y() };
        const updatedSquares = squares.slice();
        updatedSquares[index] = updatedSquare;
        setSquares(updatedSquares);
        socket.send(JSON.stringify(updatedSquare));
    };
      

    const addList = () => {
        console.log(squares)
    };

    return (
        <div>
          <button onClick={addSquare}>Agregar cuadrado</button>
          <button onClick={addList}>View List</button>
          <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
              {squares.map((square, index) => (
                <Rect key={index} x={square.x} y={square.y} width={50} height={50} fill="red" 
                draggable 
                onDragEnd={e => handleDragEnd(e, index)}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      );
}
