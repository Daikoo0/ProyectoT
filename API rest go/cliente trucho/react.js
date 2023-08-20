import React, { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001/ws');

    socket.onopen = () => {
      console.log('Conexión establecida');
      socket.send('Hola desde el cliente');
    };

    socket.onmessage = (event) => {
      console.log('Mensaje recibido:', event.data);
    };

    socket.onclose = () => {
      console.log('Conexión cerrada');
    };

    return () => {
      socket.close();
    };
  }, []);

  return <div>Cliente React</div>;
};

export default App;