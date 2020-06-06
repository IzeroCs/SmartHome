const body = require("body-parser")
const express = require("express")
const app = express()
const http = require("http")
const os = require("os")
const firebase = require("firebase-admin")

const server = {
    app: http.createServer(app),
    esp: http.createServer(app)
}

const io = {
    app: require("socket.io")(server.app),
    esp: require("socket.io")(server.esp, {
        pingTimeout:  1000,
        pingInterval: 1000
    })
}

const port = {
    app: 3180,
    esp: 3190
}

let host = null
let database = null
let networks = os.networkInterfaces()

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
    credential: firebase.credential.cert(require("./firebase.json")),
    databaseURL: "https://izerosmarthome.firebaseio.com"
})

database = firebase.database()
app.use(body.urlencoded({ extended: true }))
app.use(body.json())

require("./src/api/routes")(app, database)

const espIns = require("./src/io/esp")({
    server: server.esp,
    io: io.esp,
    host: host,
    port: port.esp
})

const appIns = require("./src/io/app")({
    server: server.app,
    io: io.app,
    host: host,
    port: port.app
})

appIns.listen(espIns)
espIns.listen(appIns)
