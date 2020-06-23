const MIN_RSSI = -100
const MAX_RSSI = -55
const MIN_SIGNAL = 0
const MAX_SIGNAL = 5
const os = require("os")

let host = null

module.exports = (() => {
    if (host != null)
        return

    let networks = os.networkInterfaces()

    Object.keys(networks).forEach(key => {
        if (key.startsWith("VirtualBox") || key.startsWith("eth1"))
            return

        networks[key].forEach(interface => {
            if ("IPv4" !== interface.family || interface.internal !== false || host !== null)
                return

            host = interface.address
        })
    })

    return {
        getHost: () => host
    }
})()

module.exports.calculateSignalLevel = (rssi, numLevels)  => {
    if (!numLevels)
        numLevels = MAX_SIGNAL

    if (rssi <= MIN_RSSI)
        return MIN_RSSI

    if (rssi >= MAX_RSSI)
        return numLevels - 1

    let inputRange  = (MAX_RSSI - MIN_RSSI)
    let outputRange = (numLevels - 1)

    return Math.ceil((rssi - MIN_RSSI) * outputRange / inputRange)
}

module.exports.MIN_RSSI   = MIN_RSSI
module.exports.MAX_RSSI   = MAX_RSSI
module.exports.MIN_SIGNAL = MIN_SIGNAL
module.exports.MAX_SIGNAL = MAX_SIGNAL
