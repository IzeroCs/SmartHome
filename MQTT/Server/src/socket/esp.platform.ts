import { Websocket } from "./websocket"
import { Logger } from "../stream/logger"
import { WebsocketPlatform } from "./websocket.platform"
import { blue, red, green } from "cli-color"
import { Namespace, Socket } from "socket.io"
import { Network } from "../util/network"
import { isUndefined, isString } from "util"
import { AuthenticationData } from "./websocket.const"
import { EspModuleType, EspSyncDetailType, EspSyncIoType, EspPinType, EspPinCast } from "./esp.const"

export class EspPlatform implements WebsocketPlatform {
    public static platform = "platform.esp"
    private static _espPlatform: EspPlatform

    private _socket: Websocket
    private _logger: Logger
    private _nsp: Namespace
    private _espModule: EspModule

    constructor(socket: Websocket) {
        EspPlatform._espPlatform = this

        this._socket = socket
        this._logger = new Logger(EspPlatform)
        this._espModule = new EspModule()
    }

    getLogger(): Logger {
        return this._logger
    }

    getPlatformName(): string {
        return EspPlatform.platform
    }

    isPlatformId(id: string) {
        return isString(id) && id.startsWith("ESP-")
    }

    ready(nsp: Namespace) {
        this._logger.log("Platform ESP is ready")
        this._nsp = nsp
    }

    onConnection(socket: Socket) {
        this._logger.log("Client ESP connect:", blue(socket.id))
    }

    onDisconnection(socket: Socket) {
        this._logger.log("Client ESP disconnect:", blue(socket.id))
    }

    onAuthentication(socket: Socket, data: AuthenticationData, authorized: boolean) {
        if (authorized) {
            this._espModule.updateModule(socket.id, true, true)
        }
    }

    onSyncIo(socket: Socket, data: EspSyncIoType) {
        if (isUndefined(data.pins)) return
        if (isUndefined(data.changed)) return

        const pins: Array<any> = data.pins
        const changed: boolean = data.changed

        for (let i = 0; i < pins.length; ++i) {
            const pin: Array<any> = pins[i]
            const espPin: EspPinType = {}

            for (let k = 0; k < pin.length; ++k) {
                espPin[EspPinCast[k]] = pin[k]
            }

            pins[i] = espPin
        }

        this._espModule.updatePins(socket.id, pins, changed)
    }

    onSyncDetail(socket: Socket, data: EspSyncDetailType) {
        if (isUndefined(data)) return

        if (data.detail_rssi) {
            const module = this._espModule.getModule(socket.id)

            const signalModule = Network.calculateSignalLevel(module.detail_rssi)
            const signalClient = Network.calculateSignalLevel(data.detail_rssi)

            if (signalModule != signalClient) {
                this._espModule.updateDetail(socket.id, data)
            }
        }
    }
}

class EspModule {
    private modules: Map<String, EspModuleType> = new Map()
    private logger: Logger = new Logger(EspModule)

    initModule(id: string) {
        if (!this.modules.has(id)) {
            this.modules.set(id, {
                name: id,
                online: false,
                authorized: false,
                changed: false,
                pins: [],
                detail_rssi: Network.MIN_RSSI
            })
        }
    }

    getModule(id: string): EspModuleType {
        this.initModule(id)
        return this.modules.get(id)
    }

    updateModule(id: string, online: boolean, authorized?: boolean) {
        const module = this.getModule(id)

        module.name = id
        module.online = online

        if (authorized) module.authorized = authorized
    }

    updatePins(id: string, pins: Array<EspPinType>, changed?: boolean) {
        const module = this.getModule(id)

        if (!isUndefined(changed)) {
            module.changed = changed
        }

        module.pins = pins
    }

    updateDetail(id: string, detail: EspSyncDetailType) {
        const module = this.getModule(id)

        if (detail.detail_rssi) module.detail_rssi = detail.detail_rssi
    }
}
