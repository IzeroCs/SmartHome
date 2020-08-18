import { Websocket, AuthenticationData } from "./websocket"
import { Logger } from "../stream/logger"
import { WebsocketPlatform } from "./websocket.platform"
import { blue, red } from "cli-color"
import { Namespace, Socket } from "socket.io"

export class EspPlatform implements WebsocketPlatform {
    public static platform = "platform.esp"
    private static _esp: EspPlatform

    private _socket: Websocket
    private _logger: Logger
    private _nsp: Namespace

    constructor(socket: Websocket) {
        EspPlatform._esp = this

        this._socket = socket
        this._logger = new Logger(EspPlatform)
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

    onAuthentication(socket: Socket, data: AuthenticationData) {
        this._logger.log("onAuthentication:", red(data))
    }

    onSyncIo(socket: Socket, data: any) {
        this._logger.log("onSyncIO", red(data))
    }

    onSyncDetail(socket: Socket, data: any) {
        this._logger.log("onSyncDetail", red(data))
    }
}
