"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketUtil = void 0;
const underscore = require("underscore");
class SocketUtil {
    static removing(io, logger) {
        const nsp = io.server.nsps[io.name];
        const connect = (client) => {
            if (!client["auth"]) {
                delete nsp.connected[client.id];
                nsp.removeListener("connect", connect);
            }
            if (logger)
                logger.log(`Removing socket ${client.id}`);
        };
        nsp.on("connect", connect);
    }
    static restoring(io, client, logger) {
        const nsp = io.server.nsps[io.name];
        if (underscore.findWhere(nsp.sockets, { id: client.id })) {
            if (logger)
                logger.log(`Restoring socket to ${client.id}`);
            nsp.connected[client.id] = client;
        }
    }
}
exports.SocketUtil = SocketUtil;
//# sourceMappingURL=socket.util.js.map