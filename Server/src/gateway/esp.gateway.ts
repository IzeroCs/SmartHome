import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
} from "@nestjs/websockets"
import { Logger } from "@nestjs/common"
import { Socket, Server, Namespace } from "socket.io"
import { SocketUtil } from "../util/socket.util"
import { CertSecurity } from "../security/cert.security"
import { NetworkUtil } from "../util/network.util"
import { isUndefined, isNull, isObject, isArray } from "util"
import { AppGateway, EVENTS } from "./app.gateway"
import { Esp } from "src/database/entity/esp.entity"
import { EspModel } from "src/database/model/esp.model"
import { RoomDevice } from "src/database/entity/room_device.entity"
import * as underscore from "underscore"
import Wildcard = require("socketio-wildcard")

export enum IOPin {
    IOPin_0 = 0,
    IOPin_1 = 1,
    IOPin_2 = 2,
    IOPin_3 = 3,
    IOPin_4 = 4,
    IOPin_5 = 5,
    IOPin_6 = 6,
    IOPin_7 = 7,
    IOPin_NUll = 8
}

export enum StatusCloud {
    StatusCloud_IDLE = 1,
    StatusCloud_ON = 2,
    StatusCloud_OFF = 3
}

export type EspModulePin = {
    input: IOPin
    outputType: IOPin
    outputPrimary: IOPin
    outputSecondary: IOPin
    dualToggleCount: IOPin
    statusCloud: StatusCloud
    status: boolean
}

export type EspModule = {
    name: string
    online: boolean
    auth: boolean
    changed: boolean
    pins: Array<EspModulePin>
    detail_rssi: number
}

@WebSocketGateway({
    namespace: "/platform-esp",
    pingTimeout: 5000,
    pingInterval: 1000
})
export class EspGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Namespace

    private static instance: EspGateway = null
    private logger: Logger = new Logger("EspGateway")
    private cert: CertSecurity = new CertSecurity("esp")
    private modules: Map<String, EspModule> = new Map()
    private middleware = Wildcard()

    constructor() {
        EspGateway.instance = this
    }

    afterInit(server: Server) {
        this.logger.log("Socket /platform-esp initialized")
        this.server.use(this.middleware)
        SocketUtil.removing(this.server)
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connection: ${client.id}`)
        SocketUtil.restoring(this.server, client)
        setTimeout(() => EspGateway.notifyUnauthorized(client), 5000)
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnect: ${client.id}`)
        this.updateModule(client, false)

        EspModel.updateOnline(client.id, false).then((esp: Esp) => {
            if (!isUndefined(esp)) AppGateway.notifyEspDevices(null, esp.id)
        })

        SocketUtil.removing(this.server, this.logger)
    }

    @SubscribeMessage("*")
    handle(client: Socket, packet: any) {}

    @SubscribeMessage("auth")
    async handleAuth(client: Socket, payload: any) {
        payload = Pass.auth(payload)

        if (EspGateway.isClientAuth(client)) return this.logger.log(`Authenticate already`)
        if (!EspGateway.isEspID(payload.id)) return EspGateway.notifyUnauthorized(client)
        if (!isUndefined(this.modules[payload.id]) && this.modules[payload.id].online === true)
            return client.disconnect()

        client.id = payload.id
        EspModel.add(client.id)
        this.cert.verify(payload.token, (err, authorized) => {
            if (!err && authorized) {
                this.logger.log(`Authenticate socket ${client.id}`)
                EspModel.updateAuth(client.id, true, true)
                    .then(_ => {
                        client["auth"] = true
                        client.emit("auth", "authorized")
                        this.updateModule(client, true, true)
                    })
                    .catch(_ => client.disconnect())
            } else {
                EspGateway.notifyUnauthorized(client)
            }
        })
    }

    @SubscribeMessage("sync-io")
    handleSyncIO(client: Socket, payload: any) {
        if (!EspGateway.isClientAuth(client)) return EspGateway.notifyUnauthorized(client)

        const espIO = Pass.io(payload)
        const pinData = espIO.pins
        const pinChanged = espIO.changed
        const module = this.getModule(client.id)

        if (isArray(pinData)) {
            for (let i = 0; i < pinData.length; ++i) pinData[i] = Pass.pin(pinData[i])

            module.pins = pinData
            module.changed = pinChanged

            if (pinChanged) {
                EspModel.updatePin(client.id, pinData).then((esp: Esp) => {
                    if (!isUndefined(esp)) {
                        EspModel.getEspDevice(esp.id).then((list: Array<RoomDevice>) => {
                            AppGateway.notifyEspDevices(null, list)
                        })
                    }
                })

                AppGateway.notifyEspModules()
            }
        }
    }

    @SubscribeMessage("sync-detail")
    handleSyncDetail(client: Socket, payload: any) {
        if (!EspGateway.isClientAuth(client)) return EspGateway.notifyUnauthorized(client)

        const module = this.getModule(client.id)
        const newDetail = Pass.detail(payload)

        const oldSignal = NetworkUtil.calculateSignalLevel(module.detail_rssi)
        const newSignal = NetworkUtil.calculateSignalLevel(newDetail.detail_rssi)

        if (oldSignal !== newSignal) {
            module.detail_rssi = newDetail.detail_rssi

            EspModel.updateDetail(client.id, {
                rssi: newDetail.detail_rssi
            })
            AppGateway.notifyEspModules()
        }
    }

    private getModule(id: string): EspModule {
        if (!this.modules.has(id)) {
            this.modules.set(id, {
                name: id,
                online: false,
                auth: false,
                changed: false,
                pins: [],
                detail_rssi: NetworkUtil.MIN_RSSI
            })
        }

        return this.modules.get(id)
    }

    private updateModule(client: Socket, online: boolean, auth?: boolean) {
        const module = this.getModule(client.id)

        module.name = client.id
        module.online = online

        if (auth) module.auth = auth
    }

    static getInstance(): EspGateway {
        return EspGateway.instance
    }

    static getLogger(): Logger {
        return EspGateway.getInstance().logger
    }

    static getModules(): Map<String, EspModule> {
        return EspGateway.getInstance().modules
    }

    static notifyUnauthorized(client: Socket) {
        if (EspGateway.isClientAuth(client)) return

        EspGateway.getLogger().log(`Disconnect socket unauthorized: ${client.id}`)
        EspModel.updateAuth(client.id, false, false)
        client.emit("auth", "unauthorized")
        client.disconnect(true)
    }

    static notifyStatusCloud(espName: string, device: RoomDevice): Promise<any> {
        return new Promise(async resolve => {
            let sockets = EspGateway.getInstance().server.sockets
            let client: Socket = null
            let module: EspModule = null

            underscore.each(sockets, (socket: Socket) => {
                if (socket.id === espName) {
                    client = socket
                    module = this.getModules().get(espName)
                }
            })

            if (!isUndefined(client) && !isUndefined(module) && device instanceof RoomDevice) {
                let pin = <IOPin>device.pin.input
                let status = <StatusCloud>device.pin.statusCloud

                client.emit(EVENTS.STATUS_CLOUD, `pin=${pin},status=${status}`)
            }
        })
    }

    static isClientAuth(client: Socket): boolean {
        return client["auth"] === true && EspGateway.getInstance().modules.has(client.id)
    }

    static isEspID(id: string): boolean {
        return !isUndefined(id) && id.startsWith("ESP")
    }
}

class Pass {
    static def(objSrc: Object, objDest: Object): any {
        if (isUndefined(objSrc)) return {}
        if (isUndefined(objDest) || isNull(objDest)) objDest = {}
        if (!isObject(objDest)) return objDest

        Object.keys(objSrc).forEach(key => {
            if (isUndefined(objDest[key])) objDest[key] = objSrc[key]
            else objDest[key] = this.def(objSrc[key], objDest[key])
        })

        return objDest
    }

    static auth(obj: Object): any {
        return Pass.def(
            {
                id: "",
                token: ""
            },
            obj
        )
    }

    static module(obj: Object): any {
        return Pass.def(
            {
                name: "",
                online: false,
                auth: false,
                changed: false,
                pins: [],
                detail_rssi: NetworkUtil.MIN_RSSI
            },
            obj
        )
    }

    static io(obj: Object): any {
        return Pass.def(
            {
                pins: [],
                changed: "0"
            },
            obj
        )
    }

    static pin(obj: Object): any {
        return Pass.def(
            {
                input: 0,
                outputType: 0,
                outputPrimary: 0,
                outputSecondary: 0,
                dualToggleCount: 0,
                statusCloud: false,
                status: false
            },
            obj
        )
    }

    static detail(obj: Object): any {
        return Pass.def(
            {
                detail_rssi: NetworkUtil.MIN_RSSI
            },
            obj
        )
    }
}
