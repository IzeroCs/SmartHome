const realpath = __dirname + "/../../"
const jwt      = require("jsonwebtoken")
const fs       = require("fs")
const payload  = require(realpath + "assets/app/payload.json")

let espInstance
let devices = {}
let certPrivate = fs.readFileSync(realpath + "assets/app/private.key")
let certPublic  = fs.readFileSync(realpath + "assets/app/public.key")
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
        console.log("[app] Disconnect socket ", socket.id)
        socket.emit("authenticate", "unauthorized")
        socket.disconnect("unauthorized")
    }
}

module.exports = ({ server, io, host, port }) => {
    function listen(espIns) {
        espInstance = espIns
        io.on("connection", socket => {
            socket.auth   = false

            console.log("[app] Connect: " + socket.id)
            socket.on("disconnect", () => console.log("[app] Disconnect: " + socket.id))
            socket.on("authenticate", data => {
                if (typeof data == "undefined" || typeof data.id == "undefined" || typeof data.token == "undefined")
                    return

                if (!data.id.startsWith("APP"))
                    return

                tokenVerify(data.token, (err, authorized) => {
                    if (!err && authorized) {
                        console.log("[app] Authenticated socket ", socket.id)
                        socket.auth = true
                        socket.emit("authenticate", "authorized")
                    } else {
                        notifyUnauthorized(socket)
                    }
                })
            })

            setTimeout(() => {
                notifyUnauthorized(socket)
            }, 1000);

            socket.on("esp.list", () => {

            })

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

        server.listen(port, host, () => console.log("[app] Listen server: " + host + ":" + port))
    }

    return {
        listen: listen
    }
}
