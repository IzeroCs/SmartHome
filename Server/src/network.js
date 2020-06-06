const os = require("os")
let host = null

module.exports = () => {
    if (host != null)
        return

    let networks = os.networkInterfaces()

    Object.keys(networks).forEach(key => {
        if (key.startsWith("VirtualBox"))
            return

        networks[key].forEach(interface => {
            if ("IPv4" !== interface.family || interface.internal !== false || host !== null)
                return

            host = interface.address
        })
    })

    return {
        getHost : () => host
    }
}
