import { Websocket } from "./websocket"
import { Logger } from "../stream/logger"
import { WebsocketPlatform } from "./websocket.platform"
import { blue, red, green } from "cli-color"
import { Namespace, Socket } from "socket.io"
import { Network } from "../util/network.util"
import { isUndefined, isString } from "util"
import { AuthenticationData } from "./websocket.const"
import {
    EspModuleType,
    EspSyncDetailType,
    EspSyncIoType,
    EspPinType,
    EspPinCast,
    EspDetailDefineKeys,
    EspSystemDefineKeys
} from "./esp.const"
import { EspModel } from "../database/model/esp.model"
import { defineKeys } from "../util/array.util"
import { EspSyncSystemType } from "./esp.const"

const EVENT_SYNC_IO = "sync.io"
const EVENT_SYNC_DETAIL = "sync.detail"
const EVENT_SYNC_SYSTEM = "sync.system"

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
        this._espModule.updateModule(socket.id, false, false)
    }

    onAuthentication(socket: Socket, data: AuthenticationData, authorized: boolean) {
        if (authorized) {
            this._espModule.updateModule(socket.id, true, true, data.token)
            socket.emit(EVENT_SYNC_SYSTEM)
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

    onSyncDetail(socket: Socket, data: Array<any>) {
        if (isUndefined(data)) return

        const detail = <EspSyncDetailType>defineKeys(EspDetailDefineKeys, data)

        if (detail.detail_rssi) {
            const module = this._espModule.getModule(socket.id)

            const signalModule = Network.calculateSignalLevel(module.detail_rssi)
            const signalClient = Network.calculateSignalLevel(detail.detail_rssi)

            if (signalModule != signalClient || module.detail_heap != detail.detail_heap) {
                this._espModule.updateDetail(socket.id, detail)
            }
        }
    }

    onSyncSystem(socket: Socket, data: Array<any>) {
        this._espModule.updateSystem(socket.id, <EspSyncSystemType>defineKeys(EspSystemDefineKeys, data))
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
                authentication: false,
                changed: false,
                pins: [],
                detail_rssi: Network.MIN_RSSI,
                detail_heap: 0,
                esp_chip_id: 0,
                esp_free_sketch: 0,
                esp_boot_version: 0
            })
        }
    }

    getModule(id: string): EspModuleType {
        this.initModule(id)
        return this.modules.get(id)
    }

    updateModule(id: string, online: boolean, authentication?: boolean, token?: string) {
        const module = this.getModule(id)

        if (isUndefined(token)) token = ""
        if (isUndefined(authentication)) authentication = false

        module.name = id
        module.online = online
        module.token = token
        module.authentication = authentication

        EspModel.updateAuthentication(id, module.authentication, module.online, module.token)
    }

    updatePins(id: string, pins: Array<EspPinType>, changed?: boolean) {
        const module = this.getModule(id)

        if (!isUndefined(changed)) {
            module.changed = changed
        }

        module.pins = pins
        EspModel.updatePins(id, module.pins)
    }

    updateDetail(id: string, detail: EspSyncDetailType) {
        const module = this.getModule(id)

        if (!isUndefined(detail.detail_rssi)) module.detail_rssi = detail.detail_rssi
        if (!isUndefined(detail.detail_heap)) module.detail_heap = detail.detail_heap

        EspModel.updateDetail(id, module.detail_rssi, module.detail_heap)
    }

    updateSystem(id: string, system: EspSyncSystemType) {
        const module = this.getModule(id)

        if (!isUndefined(system.esp_chip_id)) module.esp_chip_id = system.esp_chip_id
        if (!isUndefined(system.esp_free_sketch)) module.esp_free_sketch = system.esp_free_sketch
        if (!isUndefined(system.esp_boot_version)) module.esp_boot_version = system.esp_boot_version

        EspModel.updateSystem(id, module.esp_chip_id, module.esp_free_sketch, module.esp_boot_version)
    }
}
