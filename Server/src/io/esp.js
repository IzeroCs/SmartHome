const jwt   = require("jsonwebtoken")
const fs    = require("fs")
const query = require("querystring")

let espModules = {}
let payload = {
    name: "IzeroCs",
    sub: "ESP8266",
    iat: 4102444800
}

let certPrivate = fs.readFileSync(__dirname + "/../../assets/esp8266.key")
let certPublic  = fs.readFileSync(__dirname + "/../../assets/esp8266.pub")
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

module.exports = ({ server, io, host, port }) => {
    io.on("connection", socket => {
        let useragent = socket.handshake.headers["user-agent"]
        socket.auth   = false

        console.log("[esp] Connect: " + useragent)
        socket.on("disconnect", () => console.log("[esp] Disconnect: " + useragent))
        socket.on("authenticate", data => {
            if (typeof data == "undefined" || typeof data.id == "undefined" || typeof data.token == "undefined")
                return

            if (!data.id.startsWith("ESP"))
                return

            espModules[data.id] = {}
            socket.id = data.id
            tokenVerify(data.token, (err, authorized) => {
                if (!err && authorized) {
                    console.log("[esp] Authenticated socket ", socket.id)
                    socket.auth = true
                    socket.emit("authenticate", "authorized")
                } else {
                    notifyUnauthorized(socket)
                }
            })
        })

        socket.on("sync-io", data => {
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
                    espModules[socket.id] = pinObj
                } catch (e) {}
            }
        })

        setTimeout(() => {
            notifyUnauthorized(socket)
        }, 1000);
    })

    server.listen(port, host, () => console.log("[esp] Listen server: " + host + ":" + port))
}
