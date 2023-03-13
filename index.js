require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static("public"));
app.use(express.json());

const userStatus = new Map();
const rooms = new Map();
const usernames = new Map();

const path = require("path");
function rp(p) {
  return path.join(__dirname, p);
}

app.get("/", (req, res) => {
  res.sendFile(rp("html/index.html"))
})

const port = process.env.PORT;
server.listen(port, () => {
  console.log("\x1b[33mServer Running!")
  console.log("\x1b[31mThis is a development server, do not use this for hosting!\n")
  console.log(`\x1b[0mRunning on:\nhttp://localhost${port == 80 ? "" : ":" + port}`)
})

io.on('connection', (socket) => {
  socket.join("voice");

  userStatus.set(socket.id, "connected");

  socket.on("join", (data) => {
    if (data.room.replaceAll(" ", "") == "" || data.user.replaceAll(" ", "") == "") return;
    socket.join(data.room);
    rooms.set(socket.id, data.room)
    io.to(data.room).emit("recieve-join", { user: data.user })
    usernames.set(socket.id, data.user)
  })

  socket.on("send-voice", function (data) {

    var newData = data.split(";");
    newData[0] = "data:audio/ogg;";
    newData = newData[0] + newData[1];

    if (userStatus.get(socket.id) == "mute") return;
    io.to(rooms.get(socket.id)).emit("recieve-voice", { audio: newData, user: usernames.get(socket.id) });
  });

  socket.on("disconnect", () => {
    userStatus.delete(socket.id);
    rooms.delete(socket.id);
  })
})