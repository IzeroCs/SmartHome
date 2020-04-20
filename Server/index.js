const body      = require("body-parser")
const express   = require("express")
const app       = express()
const http      = require("http")
const server    = http.createServer(app)
const io        = require("socket.io")(server)
const os        = require("os")
const firebase  = require("firebase-admin")

let host = null
let port = "80"

let idClients = []
let database  = null
let networks  = os.networkInterfaces()

Object.keys(networks).forEach(key => {
    if (key.startsWith("VirtualBox"))
        return

    networks[key].forEach(interface => {
        if ("IPv4" !== interface.family || interface.internal !== false || host !== null)
            return

        host = interface.address
    })
})

firebase.initializeApp({
    credential : firebase.credential.cert(require("./firebase.json")),
    databaseURL: "https://izerosmarthome.firebaseio.com"
})

database = firebase.database()
app.use(body.urlencoded({ extended: true }))
app.use(body.json())

require("./api/routes")(app, database)

io.on("connection", socket => {
    let useragent = socket.handshake.headers["user-agent"];

    console.log("Connect: " + useragent);
    socket.on("disconnect", () => console.log("Disconnect: " + useragent))
    socket.on("room/types", () => socket.emit("room/types", [
        "living_room",
        "bed_room",
        "kitchen_room",
        "bath_room",
        "balcony_room",
        "stairs_room",
        "fence_room",
        "mezzanine_room",
        "roof_room"
    ]))
})

server.listen(port, host, () => console.log("Listen " + host + ":" + port))
