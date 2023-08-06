const http = require('http');
const port = 3001

const server = http.createServer();

const io = require('socket.io')(server, {
    cors: {origin: '*' }
});

io.on('connect', (socket) => {
    socket.on('polygons', (data) => {
        io.emit('polygons', data)
    })
    
    socket.on('movimiento', (data) => {
        io.emit('movimiento', data)
    })

})

server.listen(port);
