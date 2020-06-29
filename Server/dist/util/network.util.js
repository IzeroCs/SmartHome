"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkUtil = void 0;
var os = require("os");
var NetworkUtil = /** @class */ (function () {
    function NetworkUtil() {
        var _this = this;
        var networks = os.networkInterfaces();
        Object.keys(networks).forEach(function (key) {
            if (key.startsWith("VirtualBox") || key.startsWith("eth1"))
                return;
            networks[key].forEach(function (iface) {
                if ("IPv4" !== iface.family ||
                    iface.internal !== false ||
                    _this.host !== null)
                    return;
                _this.host = iface.address;
            });
        });
    }
    NetworkUtil.getInstance = function () {
        if (NetworkUtil.instance === null)
            NetworkUtil.instance = new NetworkUtil();
        return NetworkUtil.instance;
    };
    NetworkUtil.getHost = function () {
        return NetworkUtil.getInstance().host;
    };
    NetworkUtil.calculateSignalLevel = function (rssi, numLevels) {
        if (numLevels === void 0) { numLevels = NetworkUtil.MAX_SIGNAL; }
        if (!numLevels)
            numLevels = NetworkUtil.MAX_RSSI;
        if (rssi <= NetworkUtil.MIN_RSSI)
            return NetworkUtil.MIN_SIGNAL;
        if (rssi >= NetworkUtil.MAX_RSSI)
            return numLevels - 1;
        var inputRange = NetworkUtil.MAX_RSSI - NetworkUtil.MIN_RSSI;
        var outputRange = numLevels - 1;
        return Math.ceil(((rssi - NetworkUtil.MIN_RSSI) * outputRange) / inputRange);
    };
    NetworkUtil.MIN_RSSI = -100;
    NetworkUtil.MAX_RSSI = -55;
    NetworkUtil.MIN_SIGNAL = 0;
    NetworkUtil.MAX_SIGNAL = 5;
    return NetworkUtil;
}());
exports.NetworkUtil = NetworkUtil;
//# sourceMappingURL=network.util.js.map