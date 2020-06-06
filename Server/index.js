const express    = require("express")
const bodyParser = require("body-parser")
const appExpress = express()
const socket     = require("./src/socket")(appExpress)

// app.use(body.urlencoded({ extended: true }))
// app.use(body.json())

// require("./src/api/routes")(app, database)

socket.listen()
