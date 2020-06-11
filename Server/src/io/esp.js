const tag     = "[esp]"
const clc     = require("cli-color")
const network = require("../network")
const socket  = require("../socket")
const cert    = require("../security/cert")("esp")

let app      = require("./app")
let server   = null
let io       = null
let host     = null
let port     = null
let modules  = {}

let ons = {
    "disconnect": socketio => {
        console.log(tag, "Disconnect: " + socketio.id)
        module.exports.updateModules(socketio, false)
        app.notify.espModules()
    },

    "authenticate": (socketio, data) => {
        if (socketio.auth)
            return

        if (typeof data == "undefined" || typeof data.id == "undefined" || typeof data.token == "undefined")
            return

        if (!data.id.startsWith("ESP"))
            return

        socketio.id = data.id
        module.exports.updateModules(socketio, true)

        cert.verify(data.token, (err, authorized) => {
            if (!err && authorized) {
                console.log(tag, "Authenticated socket ", socketio.id)
                socketio.auth = true
                socketio.emit("authenticate", "authorized")

                app.notify.espModules()
            } else {
                module.exports.notify.unauthorized(socketio)
            }
        })
    },

    "sync.io": (socketio, data) => {
        if (!socketio.auth)
            return

        espIO     = module.exports.validate.io(data).io
        ioData    = espIO.data
        ioChanged = espIO.changed === 1

        let pinData  = null
        let pinObj   = null
        let pinLists = []

        for (let i = 0; i < ioData.length; ++i) {
            pinData = ioData[i].replace(/\=/g, ":")
            pinData = pinData.replace(/([a-z0-9]+):([0-9]+)/ig, "\"\$1\":\$2")
            pinData = "{" + pinData + "}"

            try {
                pinObj = JSON.parse(pinData)
                pinLists.push(pinObj)
            } catch (e) {}
        }

        if (typeof modules[socketio.id] === "object") {
            modules[socketio.id].pins.data    = pinLists
            modules[socketio.id].pins.changed = ioChanged

            if (ioChanged)
                app.notify.espModules()
        }
    },

    "sync.detail": (socketio, data) => {
        if (!socketio.auth)
            return

        const oldDetail = module.exports.validate.detail(modules[socketio.id])
        const newDetail = module.exports.validate.detail(data)

        const oldSignal = network.calculateSignalLevel(oldDetail.detail.data.rssi)
        const newSignal = network.calculateSignalLevel(newDetail.detail.data.rssi)

        if (oldSignal != newSignal) {
            modules[socketio.id].detail = newDetail.detail
            app.notify.espModules()
        }
    }
}

module.exports = (_server, _io, _host, _port) => {
    app    = require("./app")
    server = _server
    io     = _io
    host   = _host
    port   = _port
}

module.exports.updateModules = (socketio, online) => {
    if (typeof socketio === "undefined")
        return

    modules[socketio.id] = module.exports.validate.module(modules[socketio.id])
    modules[socketio.id].online = online
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

        app.notify.espModules()
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
            console.log(tag, "Disconnect socket: ", socketio.id)
            socketio.emit("authenticate", "unauthorized")
            socketio.disconnect("unauthorized")
        }
    },

    detail: (espID, status) => {
        if (typeof modules[espID] === "undefined" || status != "updated")
            return

        modules[espID]["updated"] = true
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

    module: array => modules.exports.validate.def({
        online : true,
        pins   : { data: [], changed: false },
        detail : { data: {} }
    }, array),

    io: array => module.exports.validate.def({ io: {
        data: [],
        changed: false
    }}, array),

    detail: array => module.exports.validate.def({ detail: {
        data: { rssi: network.MIN_RSSI }
    }}, array)
}

module.exports.modules = modules
