const socket = require("../socket")
const cert   = require("../security/cert")("app")
const tag    = "[app]"
let esp      = require("./esp")
let server   = null
let io       = null
let host     = null
let port     = null

let ons = {
    "disconnect": socketio => console.log(tag, "Disconnect: " + socketio.id),
    "authenticate": (socketio, data) => {
        if (socketio.auth)
            return

        if (typeof data == "undefined" || typeof data.id == "undefined" || typeof data.token == "undefined")
            return

        if (!data.id.startsWith("APP"))
            return

        cert.verify(data.token, (err, authorized) => {
            if (!err && authorized) {
                console.log(tag, "Authenticated socket ", socketio.id)
                socketio.auth = true
                socketio.emit("authenticate", "authorized")

                module.exports.notify.espModules(socketio)
            } else {
                module.exports.notify.unauthorized(socketio)
            }
        })
    },

    "esp.list": (socketio) => {
        if (!socket.auth)
            return module.exports.notify.unauthorized(socketio)

        module.exports.notify.espModules(socketio)
    },

    "room.types": (socketio) => {
        if (!socketio.auth)
            return module.exports.notify.unauthorized(socketio)

        socketio.emit("room.types", [
            "living_room",
            "bed_room",
            "kitchen_room",
            "bath_room",
            "balcony_room",
            "stairs_room",
            "fence_room",
            "mezzanine_room",
            "roof_room"
        ])
    }
}

module.exports = (_server, _io, _host, _port) => {
    esp    = require("./esp")
    server = _server
    io     = _io
    host   = _host
    port   = _port
}

module.exports.socketOn = () => {
    socket.removingSocket(io, tag)
    io.on("connection", socketio => {
        let keys = Object.keys(ons)
        let size = keys.length

        socketio.auth = false
        console.log(tag, "Connect: " + socketio.id)

        for (let i = 0; i < size; ++i)
            socketio.on(keys[i], data => ons[keys[i]](socketio, data))

        setTimeout(() => {
            module.exports.notify.unauthorized(socketio)
        }, 1000);
    })
}

module.exports.listen = () => {
    module.exports.socketOn()
    server.listen(port, host,
        () => console.log(tag, "Listen server: " + host + ":" + port))
}

module.exports.notify = {
    unauthorized: (socketio) => {
        if (!socketio.auth) {
            console.log(tag, "Disconnect socket: ", socketio.id)
            socketio.emit("authenticate", "unauthorized")
            socketio.disconnect("unauthorized")
        }
    },

    espModules: (socketio) => {
        if (socketio) {
            if (socketio.auth)
                socketio.emit("esp.list", esp.modules)
        } else {
            io.sockets.emit("esp.list", esp.modules)
        }
    }
}

// modules: (socket) => {
//     if (socket)
//         socket.emit("esp.list", espInstance.modules)
//     else
//         io.sockets.emit("esp.list", espInstance.modules)
// }
