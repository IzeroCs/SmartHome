const dotenv     = require("dotenv").config()
const express    = require("express")
const bodyParser = require("body-parser")
const appExpress = express()
const log        = require("./src/log")
const mongo      = require("./src/mongo")
const network    = require("./src/network")
const socket     = require("./src/socket")(appExpress)
const host       = network.getHost()
const port       = process.env.PORT || 8080

appExpress.use(bodyParser.urlencoded({ extended: true }))
appExpress.use(bodyParser.json())

appExpress.get("/", (req, res) => res.send("Smart Home Server"))

if (process.env.ENVIRONMENT === "production")
    appExpress.listen(port, () => console.log("[index]", "Listen server port: ", port))
else
    appExpress.listen(port, host, () => console.log("[index]", "Listen server: " + host + ":" + port))

socket.listen()
module.exports = appExpress
