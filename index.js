require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static("public"));
app.use(express.json());

const userStatus = new Map();

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