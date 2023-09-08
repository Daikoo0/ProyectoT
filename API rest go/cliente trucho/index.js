const WebSocket = require('ws');
const room = 'pruebas'
const socket = new WebSocket(`ws://localhost:3001/ws?room=${room}`);

socket.on('open', () => {
  console.log('Conexión establecida');
  socket.send('Hola desde el cliente');
});

socket.on('message', (data) => {
  console.log('Mensaje recibido:', data);
});

socket.on('close', () => {
  console.log('Conexión cerrada');
});