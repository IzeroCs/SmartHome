import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets"
import { Logger } from "@nestjs/common"
import { Socket, Server, Namespace } from "socket.io"
import { SocketUtil } from "../util/socket.util"
import { isUndefined, isNull } from "util"
import { EspGateway } from "./esp.gateway"
import { CertSecurity } from "../security/cert.security"
import { logger, cli } from "src/ormconfig"
import { RoomTypeModel } from "src/database/model/room_type.model"
import { RoomType } from "src/database/entity/room_type.entity"
import { RoomListModel } from "src/database/model/room_list.model"
import { RoomList } from "src/database/entity/room_list.entity"
import { RoomDeviceModel } from "src/database/model/room_device.model"
import { RoomDevice } from "src/database/entity/room_device.entity"
import { ErrorModel } from "../database/error.model"

export const EVENTS = {
    AUTH: "auth",
    ROOM_TYPE: "room-type",
    ROOM_LIST: "room-list",
    ROOM_DEVICE: "room-device",
    ESP_LIST: "esp-list",

    COMMIT_ROOM_DEVICE: "commit-room-device"
}

@WebSocketGateway({
    namespace: "/platform-app",
    pingTimeout: 5000,
    pingInterval: 100
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Namespace

    private static instance: AppGateway = null
    private logger: Logger = new Logger("AppGateway")
    private cert: CertSecurity = new CertSecurity("app")
    private devices: Object = {}

    constructor() {
        AppGateway.instance = this
    }

    afterInit(server: Server) {
        this.logger.log("Socket /platform-app initialized")
        SocketUtil.removing(this.server, this.logger)
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connection: ${client.id}`)
        SocketUtil.restoring(this.server, client)

        setTimeout(() => {
            Notify.unAuthorized(client)
        }, 5000)
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnect: ${client.id}`)
        this.removeDevice(client)
        SocketUtil.removing(this.server)
    }

    @SubscribeMessage(EVENTS.AUTH)
    handleAuth(client: Socket, payload: any) {
        if (AppGateway.isClientAuth(client)) return this.logger.log(`Authenticate already`)

        payload = Pass.auth(payload)

        if (!AppGateway.isAppID(payload.id)) return Notify.unAuthorized(client)

        client.id = payload.id
        this.devices[client.id] = {}

        this.cert.verify(payload.token, (err, authorized) => {
            if (!err && authorized) {
                this.logger.log(`Authenticate socket ${client.id}`)
                client["auth"] = true
                client.emit("auth", "authorized")

                Notify.espModules(client)
                Notify.roomTypes(client)
                Notify.roomList(client)
            } else {
                Notify.unAuthorized(client)
            }
        })
    }

    @SubscribeMessage(EVENTS.ROOM_TYPE)
    handleRoomType(client: Socket, payload: any) {
        if (!AppGateway.isClientAuth(client)) return Notify.unAuthorized(client)
        Notify.roomTypes(client)
    }

    @SubscribeMessage(EVENTS.ROOM_LIST)
    handleRoomList(client: Socket, payload: any) {
        if (!AppGateway.isClientAuth(client)) return Notify.unAuthorized(client)
        Notify.roomList(client)
    }

    @SubscribeMessage(EVENTS.ROOM_DEVICE)
    handleRoomDevice(client: Socket, payload: any) {
        if (!AppGateway.isClientAuth(client)) return Notify.unAuthorized(client)
        Notify.roomDevice(client, payload)
    }

    @SubscribeMessage(EVENTS.ESP_LIST)
    handleEspList(client: Socket, payload: any) {
        if (!AppGateway.isClientAuth(client)) return Notify.unAuthorized(client)
        Notify.espModules(client)
    }

    @SubscribeMessage(EVENTS.COMMIT_ROOM_DEVICE)
    handleCommitRoomDevice(client: Socket, payload: any) {
        if (!AppGateway.isClientAuth(client)) return Notify.unAuthorized(client)
        Notify.commitRoomDevice(client, payload)
    }

    private removeDevice(client: Socket) {
        if (!isUndefined(client.id)) delete this.devices[client.id]
    }

    static getInstance(): AppGateway {
        return AppGateway.instance
    }

    static getLogger(): Logger {
        return AppGateway.getInstance().logger
    }

    static notifyEspModules(client?: Socket) {
        Notify.espModules(client)
    }

    static isClientAuth(client: Socket): boolean {
        return client["auth"] === true
    }

    static isAppID(id: string): boolean {
        return !isUndefined(id) && id.startsWith("APP")
    }
}

class Notify {
    static unAuthorized(client: Socket) {
        if (EspGateway.isClientAuth(client)) return

        AppGateway.getLogger().log(`Disconnect socket unauthorized: ${client.id}`)
        client.emit(EVENTS.AUTH, "unauthorized")
        client.disconnect(false)
    }

    static espModules(client?: Socket) {
        if (client) {
            if (AppGateway.isClientAuth(client)) client.emit(EVENTS.ESP_LIST, EspGateway.getModules())
        } else {
            AppGateway.getInstance().server.emit(EVENTS.ESP_LIST, EspGateway.getModules())
        }
    }

    static roomTypes(client: Socket) {
        RoomTypeModel.getAll()
            .then((list: Array<RoomType>) => {
                if (list.length <= 0) return client.emit(EVENTS.ROOM_TYPE, [])
                else client.emit(EVENTS.ROOM_TYPE, list)
            })
            .catch(err => client.emit(EVENTS.ROOM_TYPE, []))
    }

    static roomList(client: Socket) {
        RoomListModel.getAll()
            .then((list: Array<RoomList>) => {
                if (list.length <= 0) return client.emit(EVENTS.ROOM_LIST, [])
                else client.emit(EVENTS.ROOM_LIST, list)
            })
            .catch(err => client.emit(EVENTS.ROOM_LIST, []))
    }

    static roomDevice(client: Socket, payload: any) {
        payload = Pass.roomDevice(payload)

        RoomDeviceModel.getList(payload.id)
            .then((list: Array<RoomDevice>) => {
                if (list.length <= 0) return client.emit(EVENTS.ROOM_DEVICE, [])
                else return client.emit(EVENTS.ROOM_DEVICE, list)
            })
            .catch(err => client.emit(EVENTS.ROOM_DEVICE, []))
    }

    static commitRoomDevice(client: Socket, payload: any) {
        payload = Pass.roomDevice(payload)
        RoomDeviceModel.updateDevice(payload.id, payload)
            .then((entity: RoomDevice) => client.emit(EVENTS.COMMIT_ROOM_DEVICE, entity))
            .catch((error: ErrorModel) => client.emit(EVENTS.COMMIT_ROOM_DEVICE, error))
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
                token: ""
            },
            obj
        )
    }

    static roomDevice(obj: Object): Object {
        return Pass.def(
            {
                id: ""
            },
            obj
        )
    }
}
