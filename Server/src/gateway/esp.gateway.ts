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
import { isUndefined, isNull, isObject } from "util"
import { AppGateway } from "./app.gateway"

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
        this.logger.log("Init socket platform esp")
        SocketUtil.removing(this.server, this.logger)
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connection: ${client.id}`)
        SocketUtil.restoring(this.server, client, this.logger)
        setTimeout(() => {
            Notify.unAuthorized(client)
        }, 1000)
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnect: ${client.id}`)
        this.updateModule(client, false)
        SocketUtil.removing(this.server, this.logger)
    }

    @SubscribeMessage("auth")
    handleAuth(client: Socket, payload: any) {
        if (EspGateway.isClientAuth(client))
            return this.logger.log(`Authenticate already`)

        payload = Pass.auth(payload)

        if (!EspGateway.isEspID(payload.id)) return Notify.unAuthorized(client)

        client.id = payload.id
        this.updateModule(client, true)

        this.cert.verify(payload.token, (err, authorized) => {
            if (!err && authorized) {
                this.logger.log(`Authenticate socket ${client.id}`)
                client["auth"] = true
                client.emit("auth", "authorized")
            } else {
                Notify.unAuthorized(client)
            }
        })
    }

    @SubscribeMessage("sync-io")
    handleSyncIO(client: Socket, payload: any) {
        if (!EspGateway.isClientAuth(client)) return

        const espIO = Pass.io(payload)["io"]
        const ioData = espIO.data
        const ioChaged = espIO.changed === 1

        let pinData = null
        let pinObj = null
        let pinList = []

        for (let i = 0; i < ioData.length; ++i) {
            pinData = ioData[i].replace(/\=/g, ":")
            pinData = pinData.replace(/([a-z0-9]+):([0-9]+)/gi, '"$1":$2')
            pinData = "{" + pinData + "}"

            try {
                pinObj = JSON.parse(pinData)
                pinList.push(pinObj)
            } catch (e) {}
        }

        if (isObject(this.modules[client.id])) {
            this.modules[client.id].pins.data = pinList
            this.modules[client.id].pins.changed = ioChaged

            AppGateway.notifyEspModules()
        }
    }

    @SubscribeMessage("sync-detail")
    handleSyncDetail(client: Socket, payload: any) {
        if (!EspGateway.isClientAuth(client)) return

        const oldDetail = Pass.detail(this.modules[client.id])
        const newDetail = Pass.detail(payload)

        const oldSignal = NetworkUtil.calculateSignalLevel(
            oldDetail["detail"]["data"]["rssi"],
        )
        const newSignal = NetworkUtil.calculateSignalLevel(
            newDetail["detail"]["data"]["rssi"],
        )

        if (oldSignal !== newSignal) {
            this.modules[client.id].detail = newDetail["detail"]
            AppGateway.notifyEspModules()
        }
    }

    private updateModule(client: Socket, online: boolean) {
        this.modules[client.id] = Pass.module(this.modules[client.id])
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
        client.emit("auth", "unauthorized")
        client.disconnect(true)
    }
}

class Pass {
    static def(objSrc: Object, objDest: Object): Object {
        if (isUndefined(objSrc)) return {}

        if (isUndefined(objDest) || isNull(objDest)) objDest = {}

        Object.keys(objSrc).forEach(key => {
            if (isUndefined(objDest[key])) objDest[key] = objSrc[key]
            else objDest[key] = this.def(objSrc[key], objDest[key])
        })

        return objDest
    }

    static auth(obj: Object): Object {
        return Pass.def(
            {
                id: "",
                token: "",
            },
            obj,
        )
    }

    static module(obj: Object): Object {
        return Pass.def(
            {
                online: true,
                pins: { data: [], changed: false },
                detail: { data: {} },
            },
            obj,
        )
    }

    static io(obj: Object): Object {
        return Pass.def(
            {
                io: {
                    data: [],
                    changed: false,
                },
            },
            obj,
        )
    }

    static detail(obj: Object): Object {
        return Pass.def(
            {
                detail: {
                    data: { rssi: NetworkUtil.MIN_RSSI },
                },
            },
            obj,
        )
    }
}
