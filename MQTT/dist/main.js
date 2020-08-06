"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mosca_1 = require("mosca");
const server = new mosca_1.Server({
    port: 1883,
    host: "127.0.0.1"
});
server.on("ready", () => console.log("[app] Mosca server is up and running"));
server.on("clientConnected", (client) => {
    console.log("[] Client connected", client.id);
});
server.on("clientDisconnected", (client) => {
    console.log("[] Client disconnecting", client.id);
});
server.on("published", (packet, client) => {
    packet.payload = packet.payload.toString();
    console.log("[] Published", packet);
});
server.on("subscribed", (packet, client) => {
    packet.payload = packet.payload.toString();
    console.log("[] Subscribed", packet);
});
server.on("unsubscribed", (packet, client) => {
    packet.payload = packet.payload.toString();
    console.log("[] Unsubcribed", packet);
});
//# sourceMappingURL=main.js.map