const jwt = require("jsonwebtoken")
const fs  = require("fs")

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
            if (typeof data.token == "undefined")
                return

            tokenVerify(data.token, (err, authorized) => {
                if (!err && authorized) {
                    console.log("[esp] Authenticated socket ", socket.id)
                    socket.auth = true
                } else {
                    notifyUnauthorized(socket)
                }
            })
        })

        // setTimeout(() => {
            // notifyUnauthorized(socket)
        // }, 3000);
    })

    server.listen(port, host, () => console.log("[esp] Listen server: " + host + ":" + port))
}
