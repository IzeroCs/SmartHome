import os from "os"

export class Network {
    static MIN_RSSI = -100
    static MAX_RSSI = -55
    static MIN_SIGNAL = 0
    static MAX_SIGNAL = 5

    private static instance: Network
    private host: string

    private constructor() {
        let networks = os.networkInterfaces()

        Object.keys(networks).forEach(key => {
            if (key.startsWith("VirtualBox") || key.startsWith("eth1")) return

            networks[key].forEach(iface => {
                if ("IPv4" !== iface.family || iface.internal !== false || this.host !== null) return

                this.host = iface.address
            })
        })
    }

    static getInstance(): Network {
        if (Network.instance === null) Network.instance = new Network()

        return Network.instance
    }

    static getHost(): string {
        return Network.getInstance().host
    }

    static calculateSignalLevel(rssi: number, numLevels: number = Network.MAX_SIGNAL): number {
        if (!numLevels) numLevels = Network.MAX_RSSI

        if (rssi <= Network.MIN_RSSI) return Network.MIN_SIGNAL

        if (rssi >= Network.MAX_RSSI) return numLevels - 1

        let inputRange = Network.MAX_RSSI - Network.MIN_RSSI
        let outputRange = numLevels - 1

        return Math.ceil(((rssi - Network.MIN_RSSI) * outputRange) / inputRange)
    }
}
