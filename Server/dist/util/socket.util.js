"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketUtil = void 0;
var underscore = require("underscore");
var SocketUtil = /** @class */ (function () {
    function SocketUtil() {
    }
    SocketUtil.removing = function (io, logger) {
        var nsp = io.server.nsps[io.name];
        var connect = function (client) {
            if (!client["auth"]) {
                delete nsp.connected[client.id];
                nsp.removeListener("connect", connect);
            }
            if (logger)
                logger.log("Removing socket " + client.id);
        };
        nsp.on("connect", connect);
    };
    SocketUtil.restoring = function (io, client, logger) {
        var nsp = io.server.nsps[io.name];
        if (underscore.findWhere(nsp.sockets, { id: client.id })) {
            if (logger)
                logger.log("Restoring socket to " + client.id);
            nsp.connected[client.id] = client;
        }
    };
    return SocketUtil;
}());
exports.SocketUtil = SocketUtil;
//# sourceMappingURL=socket.util.js.map