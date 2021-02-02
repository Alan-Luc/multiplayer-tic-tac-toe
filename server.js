const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path');
app.use(express.static(path.join(__dirname, 'client/build')));

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const router = require("./router");
//App Setup
const server = http.createServer(app);




//Socket Setup
//Cors setup
const io = require("socket.io")(server, {
  cors: {
    //origin: "http://localhost:3000",
    origin: "https://alan-tic-tac-toe.herokuapp.com/",
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});

app.use(cors());
app.use(router);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
}); //used in production, comment out if wanting to test


io.on("connect", (socket) => {
  console.log("made socket connection", socket.id);
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(room);
    const pp = getUsersInRoom(room);
    io.to(user.room).emit('roomData', { room: user.room, pp: pp.slice(0,2) });

    callback();
  });

  socket.on("move", ({ room, move, location, stepNumber }) => {
    //const user = getUser(socket.id);
    console.log(move);
    //console.log(stepNumber)
    io.to(room).emit("move", { move, location, stepNumber });
  });

  socket.on('turn', ({ turn, room }) => {
    socket.to(room).emit('turn', { turn })
  })


  socket.on('playAgain', ({ room, id }) => {
    //kick both players if both dont press play again
    socket.to(room).emit('warning', {});
  })

  socket.on('exit', ({ id, room }) => {
    socket.leave(room);
    removeUser(id);
  })

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit('roomData', { room: user.room, pp: getUsersInRoom(user.room)});
      io.to(user.room).emit('playAgain', {});
    }
  });

  /*if(io.sockets.clients('room').length === 2) { // max two clients
    socket.emit('full', room);
    }*/
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () =>
  console.log(`Server has started on port ${PORT}.`)
);


//socket