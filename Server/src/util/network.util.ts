import * as os from "os"

export class NetworkUtil {
    static MIN_RSSI = -100
    static MAX_RSSI = -55
    static MIN_SIGNAL = 0
    static MAX_SIGNAL = 5

    private static instance: NetworkUtil
    private host: string

    private constructor() {
        let networks = os.networkInterfaces()

        Object.keys(networks).forEach(key => {
            if (key.startsWith("VirtualBox") || key.startsWith("eth1")) return

            networks[key].forEach(iface => {
                if (
                    "IPv4" !== iface.family ||
                    iface.internal !== false ||
                    this.host !== null
                )
                    return

                this.host = iface.address
            })
        })
    }

    static getInstance(): NetworkUtil {
        if (NetworkUtil.instance === null)
            NetworkUtil.instance = new NetworkUtil()

        return NetworkUtil.instance
    }

    static getHost(): string {
        return NetworkUtil.getInstance().host
    }

    static calculateSignalLevel(
        rssi: number,
        numLevels: number = NetworkUtil.MAX_SIGNAL,
    ): number {
        if (!numLevels) numLevels = NetworkUtil.MAX_RSSI

        if (rssi <= NetworkUtil.MIN_RSSI) return NetworkUtil.MIN_SIGNAL

        if (rssi >= NetworkUtil.MAX_RSSI) return numLevels - 1

        let inputRange = NetworkUtil.MAX_RSSI - NetworkUtil.MIN_RSSI
        let outputRange = numLevels - 1

        return Math.ceil(
            ((rssi - NetworkUtil.MIN_RSSI) * outputRange) / inputRange,
        )
    }
}
