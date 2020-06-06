const clc    = require("cli-color")
const socket = require("../socket")
const cert   = require("../security/cert")("esp")
const tag    = "[esp]"
let app      = require("./app")
let server   = null
let io       = null
let host     = null
let port     = null
let modules  = {}

let ons = {
    "disconnect": socketio => {
        console.log(tag, "Disconnect: " + socketio.id)
        module.exports.removeSocketModules(socketio)
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
        modules[data.id] = {
            pins   : [],
            detail : {},
            io_changed: false
        }

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
        if (!socketio.auth || typeof data === "undefined")
            return

        if (typeof data.io === "undefined" || typeof data.io_changed === "undefined")
            return

        let pinData    = null
        let pinObj     = null
        let pinLists   = []
        let status     = "";
        let ioChanged  = parseInt(data.io_changed) === 1

        for (let i = 0; i < data.io.length; ++i) {
            pinData = data.io[i].replace(/\=/g, ":")
            pinData = pinData.replace(/([a-z0-9]+):([0-9]+)/ig, "\"\$1\":\$2")
            pinData = "{" + pinData + "}"

            try {
                pinObj = JSON.parse(pinData)
                pinLists.push(pinObj)

                if (i != 0)
                    status += " - "

                status += "[" + pinObj.input + ":" + (pinObj.status == 1 ? clc.green("high") : clc.red("low")) + "]"
            } catch (e) {}
        }

        status += " - [io:" + (ioChanged ? clc.green("changed") : clc.red("idle")) + "]"

        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        process.stdout.write(status)

        if (typeof modules[socketio.id] === "object") {
            modules[socketio.id]["pins"]       = pinLists
            modules[socketio.id]["io_changed"] = ioChanged

            if (ioChanged)
                app.notify.espModules()
        }
    },

    "sync.detail": (socketio, data) => {
        if (!socketio.auth)
            return

        // var oldDetail = validateDetail(modules[socket.id].detail)
        // var newDetail = validateDetail(data)

        // modules[socket.id].detail = newDetail

        // if (detailHasChanged(oldDetail, newDetail))
        //     app.notify.espModules()
    }
}

module.exports = (_server, _io, _host, _port) => {
    app    = require("./app")
    server = _server
    io     = _io
    host   = _host
    port   = _port
}

module.exports.removeSocketModules = (socketio) => {
    if (typeof socket === "undefined")
        return

    if (typeof modules[socket.id] != "undefined")
        delete modules[socket.id]
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
    }
}

module.exports.modules = modules

// const MIN_RSSI = -100
// const MAX_RSSI = -55
// const MIN_SIGNAL = 0
// const MAX_SIGNAL = 5

// function validateDetail(data) {
//     if (typeof data === "undefined") {
//         data = {
//             detail: {
//                 signal: -100
//             }
//         }
//     }

//     if (typeof data.signal === "undefined")
//         data["signal"] = -100

//     return data
// }

// function calculateSignalLevel(rssi, numLevels) {
//     if (!numLevels)
//         numLevels = MAX_SIGNAL

//     if (rssi <= MIN_RSSI)
//         return MIN_RSSI

//     if (rssi >= MAX_RSSI)
//         return numLevels -1

//     let inputRange  = (MAX_RSSI - MIN_RSSI)
//     let outputRange = (numLevels - 1)

//     return Math.ceil((rssi - MIN_RSSI) * outputRange / inputRange)
// }

// function detailHasChanged(oldDetail, newDetail) {
//     let oldSignal = calculateSignalLevel(oldDetail.signal)
//     let newSignal = calculateSignalLevel(newDetail.signal)

//     if (oldSignal != newSignal)
//         return true

//     return false
// }
