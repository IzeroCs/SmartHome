const body      = require("body-parser");
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
        if ("IPv4" !== interface.family || interface.internal !== false || host !== null)
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

require("./api/routes")(app, database);
server.listen(port, host, () => console.log("Listen " + host + ":" + port));
