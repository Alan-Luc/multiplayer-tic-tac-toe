const app = require('express')();
const socket = require('socket.io');

//App Setup
const server = app.listen(3000, () => {
    console.log('listening to requests on port 3000')
});

//Socket Setup
const io = socket(server);

io.on('connection', (socket) => {
    console.log('made socket connection', socket.id)
})