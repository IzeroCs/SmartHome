const underscore = require("underscore")
const http       = require("http")
const network    = require("./network")
const ioAPP      = require("./io/app")
const ioESP      = require("./io/esp")
const host       = { app: network.getHost(), esp: network.getHost() }
const port       = { app: 3180, esp: 3190 }
let instance     = { app: null, esp: null }
let server       = { app: null, esp: null }
let socketio     = { app: null, esp: null }

module.exports.removingSocket = (io, tag) => {
    underscore.each(io.nsps, nsp => {
        nsp.on("connect", socket => {
            if (!socket.auth)
                delete nsp.connected[socket.id]

            if (tag)
                console.log(tag + " Removing socket from ", nsp.name)
        })
    })
}

module.exports.restoringSocket = (io, socket, tag) => {
    underscore.each(io.nsps, nsp => {
        if (underscore.findWhere(nsp.sockets, { id: socket.id })) {
            if (tag)
                console.log(tag + " Restoring socket to: ", nsp.name)

            nsp.connected[socket.id] = socket
        }
    })
}

module.exports = (appExpress) => {
    server.app   = http.createServer(appExpress)
    server.esp   = http.createServer(appExpress)

    socketio.app = require("socket.io")(server.app)
    socketio.esp = require("socket.io")(server.esp, {
        pingTimeout:  1000,
        pingInterval: 500
    })

    instance.esp = ioESP(server.esp, socketio.esp, host.esp, port.esp)
    instance.app = ioAPP(server.app, socketio.app, host.app, port.app)

    return {
        listen: () => {
            ioESP.listen()
            ioAPP.listen()
        }
    }
}
