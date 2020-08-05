let mosca = require("mosca")

let server = new mosca.Server({
    port: 1883,
    http: {
        port: 8383,
        bundle: true,
        static: "./"
    },
    backend: {
        type: "mysql",
        url: "mongodb://localhost:27017/mqtt",
        pubsubCollection: "ascoltatori",
        mongo: {}
    },
    persistence: {
        factory: mosca.persistence.Mongo,
        url: "mongodb://localhost:27017/mqtt"
    }
})

server.on("ready", () => console.log("[] Mosca server is up and running"))
server.on("clientConnected", client => {
    console.log("[] Client connected", client.id)
})

server.on("clientDisconnecting", client => {
    console.log("[] Client disconnecting", client.id)
})

server.on("clientDisconnected", client => {
    console.log("[] Client disconnected", client.id)
})

server.on("published", (packet, client) => {
    packet.payload = packet.payload.toString()
    console.log("[] Published", packet)
})

server.on("subscribed", (packet, client) => {
    packet.payload = packet.payload.toString()
    console.log("[] Subscribed", packet)
})

server.on("unsubscribed", (packet, client) => {
    packet.payload = packet.payload.toString()
    console.log("[] Unsubcribed", packet)
})
