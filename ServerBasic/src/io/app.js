const socket = require("../socket")
const mongo  = require("../mongo")
const cert   = require("../security/cert")("app")
const tag    = "[app]"
let esp      = require("./esp")
const { emit } = require("nodemon")

let server   = null
let io       = null
let host     = null
let port     = null
let devices  = {}
let dbEsp    = mongo.include("esp")
let dbRoom   = mongo.include("room")

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
                module.exports.notify.roomTypes(socketio)
                module.exports.notify.roomList(socketio)
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

        module.exports.notify.roomTypes(socketio)
    },

    "room.list": (socketio) => {
        if (!socketio.auth)
            return module.exports.notify.unauthorized(socketio)

        module.exports.notify.roomList(socketio)
    },

    "room.device": (socketio, data) => {
        if (!socketio.auth)
            return module.exports.notify.unauthorized(socketio)

        module.exports.notify.roomDevice(socketio, data)
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

    const devices = [
        { room: "Phòng khách", esp: "ESP1N403E91636RSC185G2K", device: [
            { name: "Đèn trái", pin: 0 },
            { name: "Đèn phải", pin: 1 }
        ] },

        { room: "Phòng ngủ", esp: "ESP1N403E91636RSC185G2K", device: [
            { name: "Đèn trái", pin: 0 },
            { name: "Đèn phải", pin: 1 }
        ] }
    ]

    devices.forEach(arr => {
        dbRoom.findListByName(arr.room).then(roomDoc => {
            if (roomDoc === null)
                return

            dbEsp.findEspByName(arr.esp).then(espDoc => {
                if (espDoc === null)
                    return

                arr.device.forEach(dev => {
                    dbRoom.addRoomDevice(espDoc._id, roomDoc._id, dev.name, dev.pin)
                        .then(res => console.log(tag, "Add device[", arr.esp, "]: ", arr.room, " = ", dev.name, "|", dev.pin, clc.green(" ["), clc.green(res), clc.green("]")))
                })
            })
        })
    })

    if (process.env.ENVIRONMENT === "production")
        server.listen(port, "0.0.0.0", () => console.log(tag, "Listen server port: " + port))
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
    },

    roomTypes: (socketio) => {
        if (!socketio || !socketio.auth)
            return emit("room.types", [])

        const types = dbRoom.datas.types
        const arr  = []

        if (typeof types === "undefined" || typeof types.forEach === "undefined")
            return socketio.emit("room.types", arr)

        types.forEach(entry => {
            if (entry.enable) {
                arr.push({
                    id: entry._id,
                    name: entry.name,
                    type: entry.type
                })
            }
        })

        socketio.emit("room.types", arr)
    },

    roomList: (socketio) => {
        if (!socketio || !socketio.auth)
            return emit("room.list", [])

        const list = dbRoom.datas.list
        const arr  = []

        if (typeof list === "undefined" || typeof list.forEach === "undefined")
            return socketio.emit("room.list", arr)

        list.forEach(entry => {
            if (entry.enable) {
                arr.push({
                    id: entry._id,
                    name: entry.name,
                    type: entry.type.type
                })
            }
        })

        socketio.emit("room.list", arr)
    },

    roomDevice: (socketio, data) => {
        if (!socketio || !socketio.auth || !data || !data.id)
            return emit("room.device", [])

        const arr = []
        const id  = data.id


        console.log(tag, "Room device: ", data)
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
