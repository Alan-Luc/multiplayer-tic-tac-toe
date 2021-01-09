const http = require('http');
const app = require('express')();
const socket = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');
//App Setup
const server = http.createServer(app);

//Socket Setup
const io = socket(server);


app.use(cors());
app.use(router);

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error) return callback(error);

        socket.join(user.room);

        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!`});

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    })

    socket.on('move', (move) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('move', { user: user.name, move })
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
    
        if(user) {
          io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
          io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
      })
})



server.listen(process.env.PORT || 3000, () => console.log('Server has started.'));