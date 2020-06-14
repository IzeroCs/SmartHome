const tag    = "[app]"
const socket = require("../socket")
const cert   = require("../security/cert")("app")
let esp      = require("./esp")

let server   = null
let io       = null
let host     = null
let port     = null
let devices  = {}

let ons = {
    "disconnect": socketio => {
        console.log(tag, "Disconnect: " + socketio.id)
        module.exports.removeSocketDevices(socketio)
    },

    "authenticate": (socketio, data) => {
        if (socketio.auth)
            return

        data = module.exports.validate.authenticate(data)

        if (!data.id.startsWith("APP"))
            return

        socketio.id = data.id
        devices[data.id] = {}

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

    "esp.detail": (socketio, data) => {
        if (!socket.auth)
            return module.exports.notify.unauthorized(socketio)

        if (typeof data === "undefined")
            return

        Object.keys(data).forEach((espID, status) => esp.notify.detail(espID, status))
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

module.exports.removeSocketDevices = (socketio) => {
    if (typeof socketio === "undefined")
        return

    if (typeof devices[socketio.id] !== "undefined")
        delete devices[socketio.id]
}

module.exports.socketOn = () => {
    socket.removingSocket(io)
    io.on("connection", socketio => {
        let keys = Object.keys(ons)
        let size = keys.length

        socketio.auth = false
        console.log(tag, "Connect: " + socketio.id)
        socket.restoringSocket(io, socketio)

        for (let i = 0; i < size; ++i)
            socketio.on(keys[i], data => ons[keys[i]](socketio, data))

        setTimeout(() => {
            module.exports.notify.unauthorized(socketio)
        }, 1000);
    })
}

module.exports.listen = () => {
    module.exports.socketOn()

    if (process.env.ENVIRONMENT === "production")
        server.listen(port, () => console.log(tag, "Listen server port: " + port))
    else
        server.listen(port, host,
            () => console.log(tag, "Listen server: " + host + ":" + port))
}

module.exports.notify = {
    unauthorized: (socketio) => {
        if (!socketio.auth) {
            console.log(tag, "Disconnect socket unauthorized: ", socketio.id)
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

module.exports.validate = {
    def: (objSrc, objDest) => {
        if (typeof objSrc === "undefined")
            return {}

        if (typeof objDest === "undefined" || objDest === null)
            objDest = {}

        Object.keys(objSrc).forEach((key) => {
            if (typeof objDest[key] === "undefined")
                objDest[key] = objSrc[key]
            else
                objDest[key] = module.exports.validate.def(objSrc[key], objDest[key])
        })

        return objDest
    },

    authenticate: array => module.exports.validate.def({
        id: "",
        token: ""
    }, array)
}
