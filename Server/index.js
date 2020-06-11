const dotenv     = require("dotenv").config()
const express    = require("express")
const bodyParser = require("body-parser")
const appExpress = express()
// const mongo      = require("./src/mongo")
const socket     = require("./src/socket")(appExpress)
const port       = process.env.PORT || 8080

appExpress.use(bodyParser.urlencoded({ extended: true }))
appExpress.use(bodyParser.json())

appExpress.get("/", (req, res) => res.send("Smart Home Server"))
appExpress.listen(port, () => console.log("Listen port: ", port))
// require("./src/api/routes")(app, database)

socket.listen()
module.exports = appExpress
