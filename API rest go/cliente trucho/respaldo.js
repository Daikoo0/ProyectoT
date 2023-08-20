var io = require('socket.io-client');
var socket = io.connect('http://localhost:3001');

console.log('hola')
socket.on('connect', function() {
  console.log('Connected to server');
});
socket.on('event', function(data) {
  console.log('Received event:', data);
});

socket.on('welcome', function(message) {
  console.log(message);
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

