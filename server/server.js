const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const router = require("./router");
//App Setup
const server = http.createServer(app);

//Socket Setup
//Cors setup
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});

app.use(cors());
app.use(router);

io.on("connect", (socket) => {
  console.log("made socket connection", socket.id);
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(room);

    io.to(user.room).emit('roomData', { room: user.room, pp: getUsersInRoom(room) });

    callback();
  });

  socket.on("move", ({ name, room, move, location, stepNumber }) => {
    //const user = getUser(socket.id);
    console.log(move);
    console.log(stepNumber)
    io.to(room).emit("move", { move, location, name, stepNumber });
  });

  socket.on('turn', ({turn}) => {
    const user = getUser(socket.id);
    socket.to(user.room).emit('turn', { turn })
  })

  socket.on('userList', ({ userList, room }) => {
    console.log(userList);
    io.to(room).emit('userList', { userList });
  })

  socket.on('playAgain', ({ pp, room }) => {
    pp.slice(0,1);
    io.to(room).emit('roomData', { pp, room})
  })

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit('roomData', { room: user.room, pp: getUsersInRoom(user.room)});
    }
  });

  /*if(io.sockets.clients('room').length === 2) { // max two clients
    socket.emit('full', room);
    }*/
});

server.listen(process.env.PORT || 8000, () =>
  console.log("Server has started.")
);


//socket