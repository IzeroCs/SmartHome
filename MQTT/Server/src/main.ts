import { Server, Client, Packet, ServerOptions, persistence } from "mosca"

const server = new Server({
    port: 1883,
    host: "192.168.31.104",
    http: {
        port: 8383
    },
    backend: {
        type: "mongo",
        url: "mongodb://localhost:27017/mqtt",
        pubsubCollection: "ascoltatori",
        mongo: {}
    },
    persistence: {
        factory: persistence.Mongo,
        url: "mongodb://localhost:27017/mqtt"
    }
})

server.on("ready", () => console.log("[app] Mosca server is up and running"))

server.on("clientConnected", (client: Client) => {
    console.log("[] Client connected", client.id)
})

server.on("clientDisconnected", (client: Client) => {
    console.log("[] Client disconnecting", client.id)
})

server.on("published", (packet: Packet, client: Client) => {
    if (packet.payload instanceof Buffer) packet.payload = packet.payload.toString()
    console.log("[] Published", packet)
})

server.on("subscribed", (packet: Packet, client: Client) => {
    if (packet.payload instanceof Buffer) packet.payload = packet.payload.toString()
    console.log("[] Subscribed", packet)
})

server.on("unsubscribed", (packet: Packet, client: Client) => {
    if (packet.payload instanceof Buffer) packet.payload = packet.payload.toString()
    console.log("[] Unsubcribed", packet)
})