"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketUtil = void 0;
var underscore = require("underscore");
var SocketUtil = /** @class */ (function () {
    function SocketUtil() {
    }
    SocketUtil.removing = function (io, logger) {
        underscore.each(io.server.nsps, function (nsp) {
            if (io.name != nsp.name)
                return;
            nsp.on('connect', function (client) {
                if (!client['auth'])
                    delete nsp.connected[client.id];
                if (logger)
                    logger.log("Removing socket " + nsp.name);
            });
        });
    };
    SocketUtil.restoring = function (io, client, logger) {
        underscore.each(io.server.nsps, function (nsp) {
            if (io.name != nsp.name)
                return;
            if (underscore.findWhere(nsp.sockets, { id: client.id })) {
                if (logger)
                    logger.log("Restoring socket to " + nsp.name);
                nsp.connected[client.id] = client;
            }
        });
    };
    return SocketUtil;
}());
exports.SocketUtil = SocketUtil;
//# sourceMappingURL=socket.util.js.map