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
import { Esp } from "../database/entity/esp.entity"
import { EspModel } from "../database/model/esp.model"
import { RoomDevice } from "../database/entity/room_device.entity"
import * as underscore from "underscore"

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

    constructor() {
        EspGateway.instance = this
    }

    afterInit(server: Server) {
        this.logger.log("Socket /platform-esp initialized")
        SocketUtil.removing(this.server)

        setInterval(() => {
            const now = Date.now()
            underscore.each(this.server.connected, (client: Socket) => {
                let intervalID = client["interval_id"] || 0
                let intervalAuth = client["interval_auth"] || 0

                if (!EspGateway.isEspID(client.id)) {
                    if (now - intervalID > 5000) {
                        intervalID = now
                        client.emit("id")
                    }
                } else if (!EspGateway.isClientAuth(client)) {
                    if (now - intervalAuth > 5000) {
                        intervalAuth = now
                        client.emit("auth")
                    }
                }
            })
        }, 1000)
    }

    handleConnection(client: Socket, ...args: any[]) {
        SocketUtil.restoring(this.server, client)
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnect: ${client.id}`)
        this.updateModule(client, false)

        EspModel.updateOnline(client.id, false).then((esp: Esp) => {
            if (!isUndefined(esp)) AppGateway.notifyEspDevices(null, esp.id)
        })

        SocketUtil.removing(this.server)
    }

    @SubscribeMessage("id")
    handleId(client: Socket, payload: any) {
        if (isUndefined(payload.id)) return
        if (!EspGateway.isEspID(payload.id)) return

        client.id = payload.id
        client["interval_id"] = 0

        this.logger.log(`Client id: ${payload.id}`)
        this.initModule(payload.id)
        this.updateModule(client, true, false)
        EspModel.add(payload.id)
    }

    @SubscribeMessage("auth")
    async handleAuth(client: Socket, payload: any) {
        if (isUndefined(payload.token)) return
        if (EspGateway.isClientAuth(client)) return

        this.cert.verify(payload.token, (authorized: boolean) => {
            if (authorized) {
                this.logger.log(`Client authenticate: ${client.id}`)
                EspModel.updateAuth(client.id, true, true).then(_ => {
                    client["auth"] = true
                    client["interval_auth"] = 0

                    client.emit("auth", "authorized")
                    this.updateModule(client, true, true)
                })
            }
        })
    }

    @SubscribeMessage("sync-io")
    handleSyncIO(client: Socket, payload: any) {
        if (!EspGateway.isClientAuth(client)) return

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
        if (!EspGateway.isClientAuth(client)) return

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

    private initModule(id: string) {
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
    }

    private getModule(id: string): EspModule {
        this.initModule(id)
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
