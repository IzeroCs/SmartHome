const _        = require("underscore")
const realpath = __dirname + "/../../"
const jwt      = require("jsonwebtoken")
const fs       = require("fs")
const query    = require("querystring")
const payload  = require(realpath + "assets/esp8266/payload.json")

let appInstance;
let espModules = {}
let certPrivate = fs.readFileSync(realpath + "assets/esp8266/private.key")
let certPublic  = fs.readFileSync(realpath + "assets/esp8266/public.key")
let token = jwt.sign(payload, certPrivate, { algorithm: "RS256" })

function tokenVerify(token, callback) {
    jwt.verify(token, certPublic, (err, decoded) => {
        if (!err) {
            if (typeof decoded.name != "string" || decoded.name != payload.name)
                return

            if (typeof decoded.sub != "string" || decoded.sub != payload.sub)
                return

            return callback(err, true)
        }

        callback(err, false)
    })
}

function notifyUnauthorized(socket) {
    if (!socket.auth) {
        console.log("[esp] Disconnect socket ", socket.id)
        socket.emit("authenticate", "unauthorized")
        socket.disconnect("unauthorized")
    }
}

function removeSocketModules(socket) {
    if (typeof espModules[socket.id] != "undefined")
        delete espModules[socket.id]
}

module.exports = ({ server, io, host, port }) => {
    function socketOnEvent(appIns) {
        appInstance = appIns

        _.each(io.nsps, nsp => {
            nsp.on("connect", socket => {
                if (!socket.auth) {
                    console.log("Removing socket from ", nsp.name)
                    delete nsp.connected[socket.id]
                }
            })
        })

        io.on("connection", socket => {
            socket.auth   = false
            console.log("[esp] Connect: " + socket.id)

            socket.on("disconnect", () => {
                console.log("[esp] Disconnect: " + socket.id)
                removeSocketModules(socket)
                appInstance.notify.modules()
            })

            socket.on("authenticate", data => {
                if (socket.auth)
                    return

                if (typeof data == "undefined" || typeof data.id == "undefined" || typeof data.token == "undefined")
                    return

                if (!data.id.startsWith("ESP"))
                    return

                espModules[data.id] = { pins: {}, detail: {} }
                socket.id = data.id
                tokenVerify(data.token, (err, authorized) => {
                    if (!err && authorized) {
                        console.log("[esp] Authenticated socket ", socket.id)
                        socket.auth = true
                        socket.emit("authenticate", "authorized")

                        _.each(io.nsps, nsp => {
                            if (_.findWhere(nsp.sockets, { id: socket.id })) {
                                console.log("[esp] Restoring socket to: ", nsp.name)
                                nsp.connected[socket.id] = socket
                            }
                        })

                        appInstance.notify.modules()
                    } else {
                        notifyUnauthorized(socket)
                    }
                })
            })

            socket.on("sync.io", data => {
                if (!socket.auth || typeof data == "undefined" || typeof data.io != "object")
                    return

                let pinData;
                let pinObj;

                for (let i = 0; i < data.io.length; ++i) {
                    pinData = data.io[i].replace(/\=/g, ":")
                    pinData = pinData.replace(/([a-z0-9]+):([0-9]+)/ig, "\"\$1\":\$2")
                    pinData = "{" + pinData + "}"

                    try {
                        pinObj = JSON.parse(pinData)
                        espModules[socket.id].pins = pinObj
                    } catch (e) {}
                }
            })

            socket.on("sync.detail", data => {
                if (!socket.auth || typeof data == "undefined")
                    return

                if (typeof data.signal == "undefined")
                    return

                espModules[socket.id].detail = data
            })

            setTimeout(() => {
                notifyUnauthorized(socket)
            }, 1000);
        })
    }

    function listen(appIns) {
        server.listen(port, host, () => console.log("[esp] Listen server: " + host + ":" + port))
        socketOnEvent(appIns)
    }

    return {
        listen: listen,
        modules: espModules
    }
}
