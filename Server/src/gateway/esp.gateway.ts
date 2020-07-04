import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from "@nestjs/websockets"
import { Logger } from "@nestjs/common"
import { Socket, Server, Namespace } from "socket.io"
import { SocketUtil } from "../util/socket.util"
import { CertSecurity } from "../security/cert.security"
import { NetworkUtil } from "../util/network.util"
import { isUndefined, isNull, isObject, isArray } from "util"
import { AppGateway } from "./app.gateway"
import { TypeOrmModule } from "@nestjs/typeorm"
import { getRepository } from "typeorm"
import { Esp } from "src/database/entity/esp.entity"
import { EspModel } from "src/database/model/esp.model"
import { cli, logger } from "src/ormconfig"
import clc = require("cli-color")

@WebSocketGateway({
    namespace: "/platform-esp",
    pingTimeout: 5000,
    pingInterval: 1000,
})
export class EspGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Namespace

    private static instance: EspGateway = null
    private logger: Logger = new Logger("EspGateway")
    private cert: CertSecurity = new CertSecurity("esp")
    private modules: Object = {}

    constructor() {
        EspGateway.instance = this
    }

    afterInit(server: Server) {
        this.logger.log("Socket /platform-esp initialized")
        SocketUtil.removing(this.server, this.logger)
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connection: ${client.id}`)
        SocketUtil.restoring(this.server, client, this.logger)

        setTimeout(() => {
            Notify.unAuthorized(client)
        }, 5000)
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnect: ${client.id}`)
        this.updateModule(client, false)
        EspModel.updateOnline(client.id, false)
        SocketUtil.removing(this.server, this.logger)
    }

    @SubscribeMessage("auth")
    async handleAuth(client: Socket, payload: any) {
        if (EspGateway.isClientAuth(client))
            return this.logger.log(`Authenticate already`)

        payload = Pass.auth(payload)

        if (!EspGateway.isEspID(payload.id)) return Notify.unAuthorized(client)

        client.id = payload.id
        EspModel.add(client.id)
        this.updateModule(client, true)
        this.cert.verify(payload.token, (err, authorized) => {
            if (!err && authorized) {
                this.logger.log(`Authenticate socket ${client.id}`)
                EspModel.updateAuth(client.id, true, true)

                client["auth"] = true
                client.emit("auth", "authorized")
            } else {
                Notify.unAuthorized(client)
            }
        })
    }

    @SubscribeMessage("sync-io")
    handleSyncIO(client: Socket, payload: any) {
        if (!EspGateway.isClientAuth(client)) return Notify.unAuthorized(client)

        const espIO = Pass.io(payload)
        const pinData = espIO.pins
        const pinChanged = espIO.changed

        if (isArray(pinData)) {
            for (let i = 0; i < pinData.length; ++i)
                pinData[i] = Pass.pin(pinData[i])
        }

        if (!isUndefined(this.modules[client.id])) {
            this.modules[client.id].pins = pinData
            this.modules[client.id].changed = pinChanged

            if (pinChanged) {
                EspModel.updatePin(client.id, pinData)
                AppGateway.notifyEspModules()
            }
        }
    }

    @SubscribeMessage("sync-detail")
    handleSyncDetail(client: Socket, payload: any) {
        if (!EspGateway.isClientAuth(client)) return Notify.unAuthorized(client)

        const oldDetail = Pass.detail(this.modules[client.id])
        const newDetail = Pass.detail(payload)

        const oldSignal = NetworkUtil.calculateSignalLevel(
            oldDetail.detail_rssi,
        )
        const newSignal = NetworkUtil.calculateSignalLevel(
            newDetail.detail_rssi,
        )

        if (oldSignal !== newSignal) {
            this.modules[client.id].detail_rssi = newDetail.detail_rssi

            EspModel.updateDetail(client.id, {
                rssi: newDetail.detail_rssi,
            })
            AppGateway.notifyEspModules()
        }
    }

    private updateModule(client: Socket, online: boolean) {
        this.modules[client.id] = Pass.module(this.modules[client.id])
        this.modules[client.id].name = client.id
        this.modules[client.id].online = online
    }

    static getInstance(): EspGateway {
        return EspGateway.instance
    }

    static getLogger(): Logger {
        return EspGateway.getInstance().logger
    }

    static getModules(): Object {
        return EspGateway.getInstance().modules
    }

    static isClientAuth(client: Socket): boolean {
        return client["auth"] === true
    }

    static isEspID(id: string): boolean {
        return !isUndefined(id) && id.startsWith("ESP")
    }
}

class Notify {
    static unAuthorized(client: Socket) {
        if (EspGateway.isClientAuth(client)) return

        EspGateway.getLogger().log(
            `Disconnect socket unauthorized: ${client.id}`,
        )
        EspModel.updateAuth(client.id, false, false)
        client.emit("auth", "unauthorized")
        client.disconnect(true)
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
                token: "",
            },
            obj,
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
                detail_rssi: NetworkUtil.MIN_RSSI,
            },
            obj,
        )
    }

    static io(obj: Object): any {
        return Pass.def(
            {
                pins: [],
                changed: "0",
            },
            obj,
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
                status: 0,
            },
            obj,
        )
    }

    static detail(obj: Object): any {
        return Pass.def(
            {
                detail_rssi: NetworkUtil.MIN_RSSI,
            },
            obj,
        )
    }
}
