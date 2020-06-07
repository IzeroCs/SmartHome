const express    = require("express")
const bodyParser = require("body-parser")
const appExpress = express()
const socket     = require("./src/socket")(appExpress)
const port       = process.env.PORT || 8080

appExpress.use(bodyParser.urlencoded({ extended: true }))
appExpress.use(bodyParser.json())

appExpress.get("/", (req, res) => res.send("Smart Home Server 6"))
appExpress.listen(port, () => console.log("Listen port: ", port))
// require("./src/api/routes")(app, database)

socket.listen()
module.exports = appExpress
