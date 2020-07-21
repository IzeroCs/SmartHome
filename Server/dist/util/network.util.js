"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkUtil = void 0;
const os = require("os");
class NetworkUtil {
    constructor() {
        let networks = os.networkInterfaces();
        Object.keys(networks).forEach(key => {
            if (key.startsWith("VirtualBox") || key.startsWith("eth1"))
                return;
            networks[key].forEach(iface => {
                if ("IPv4" !== iface.family || iface.internal !== false || this.host !== null)
                    return;
                this.host = iface.address;
            });
        });
    }
    static getInstance() {
        if (NetworkUtil.instance === null)
            NetworkUtil.instance = new NetworkUtil();
        return NetworkUtil.instance;
    }
    static getHost() {
        return NetworkUtil.getInstance().host;
    }
    static calculateSignalLevel(rssi, numLevels = NetworkUtil.MAX_SIGNAL) {
        if (!numLevels)
            numLevels = NetworkUtil.MAX_RSSI;
        if (rssi <= NetworkUtil.MIN_RSSI)
            return NetworkUtil.MIN_SIGNAL;
        if (rssi >= NetworkUtil.MAX_RSSI)
            return numLevels - 1;
        let inputRange = NetworkUtil.MAX_RSSI - NetworkUtil.MIN_RSSI;
        let outputRange = numLevels - 1;
        return Math.ceil(((rssi - NetworkUtil.MIN_RSSI) * outputRange) / inputRange);
    }
}
exports.NetworkUtil = NetworkUtil;
NetworkUtil.MIN_RSSI = -100;
NetworkUtil.MAX_RSSI = -55;
NetworkUtil.MIN_SIGNAL = 0;
NetworkUtil.MAX_SIGNAL = 5;
//# sourceMappingURL=network.util.js.map