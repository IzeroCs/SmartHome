module.exports = ({ server, io, host, port }) => {
    io.on("connection", socket => {
        let useragent = socket.handshake.headers["user-agent"];

        console.log("[app] Connect: " + useragent);
        socket.on("disconnect", () => console.log("[app] Disconnect: " + useragent))
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

    server.listen(port, host, () => console.log("Listen server app: " + host + ":" + port))
}
