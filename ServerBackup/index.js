const body      = require("body-parser");
const watch     = require("node-watch");
const express   = require("express");
const app       = express();
const http      = require("http");
const server    = http.createServer(app);
const io        = require("socket.io")(server);
const os        = require("os");
const firebase  = require("firebase-admin");

let host = null;
let port = "80";

let idClients = [];
let database  = null;
let networks  = os.networkInterfaces();

Object.keys(networks).forEach(key => {
    networks[key].forEach(interface => {
        if ("IPv4" !== interface.family || interface.internal !== false)
            return;

        host = interface.address;
    });
});

firebase.initializeApp({
    credential : firebase.credential.cert(require("./firebase.json")),
    databaseURL: "https://izerosmarthome.firebaseio.com"
});

database = firebase.database();
app.use(body.urlencoded({ extended: true }));
app.use(body.json());

app.use("/images", express.static("website/images"));
app.use("/styles", express.static("website/styles"));
app.use("/scripts", express.static("website/scripts"));
app.get("/", (req, res) => res.sendFile(__dirname + "/website/index.html"));

app.get(/^\/actionbar/, (req, res) => {
    let url = req.url;

    if (url.endsWith("/list")) {
        res.writeHead(200);
        res.end("List");
    } else if (url.endsWith("/add")) {
        res.writeHead(200);
        res.end("Add");
    } else {
        res.writeHead(404);
        res.end("Not Found " + url);
    }
});

io.on("connection", socket => {
    let handshake = socket.handshake;
    let headers   = handshake.headers;

    socket.emit("id", socket.id);
    socket.on("id", id => {
        if (id !== null && id !== socket.id)
            socket.id = id;

        if (idClients.indexOf(id) === -1) {
            idClients.push(id);
            socket.emit("refresh");
            //console.log("Connected:", headers["user-agent"]);
        }
    });
})

require("./api/routes")(app, database);
server.listen(port, host, () => console.log("Listen " + host + ":" + port));
watch("/", { recursive: true }, (evt, name) => {
    console.log("Refresh all client");
    io.emit("refresh")
});
