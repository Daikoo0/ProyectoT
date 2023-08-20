import { useState, useEffect } from 'react';
import Sockette from 'sockette';
import { useParams } from 'react-router-dom';

const WebSocketComponent = () => {
  const [socket, setSocket] = useState(null);
  const { room } = useParams();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const url = `ws://localhost:3001/ws?room=${room}`;
    const newSocket = new Sockette(url, {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: (e) => console.log('Conexión establecida', e),
      onmessage: (e) => setMessage(e.data),
      onreconnect: (e) => console.log('Intentando reconectar', e),
      onmaximum: (e) => console.log('Número máximo de intentos alcanzado', e),
      onclose: (e) => console.log('Conexión cerrada', e),
      onerror: (e) => console.log('Error:', e),
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [room]);

  const handleSendMessage = () => {
    if (socket) {
      socket.send(message);
    }
  };

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  return (
    <div>
      <h1>Sala: {room}</h1>
      <h3>Ultimo envio:</h3>
      <div>{message}</div>
      <input type="text" onChange={handleInputChange} />
      <button onClick={handleSendMessage}>Enviar mensaje</button>
    </div>
  );
};

export default WebSocketComponent;