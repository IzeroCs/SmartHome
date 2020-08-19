import { Websocket } from "./websocket"
import { Logger } from "../stream/logger"
import { WebsocketPlatform } from "./websocket.platform"
import { Namespace, Socket } from "socket.io"
import { blue, red } from "cli-color"
import { isString } from "util"
import { AuthenticationData } from "./websocket.const"

export class AppPlatform implements WebsocketPlatform {
    public static platform = "platform.app"
    private static _app: AppPlatform

    private _socket: Websocket
    private _logger: Logger
    private _nsp: Namespace

    constructor(socket: Websocket) {
        AppPlatform._app = this

        this._socket = socket
        this._logger = new Logger(AppPlatform)
    }

    getLogger(): Logger {
        return this._logger
    }

    getPlatformName(): string {
        return AppPlatform.platform
    }

    isPlatformId(id: string) {
        return isString(id) && id.startsWith("APP")
    }

    ready(nsp: Namespace) {
        this._logger.log("Platform APP is ready")
        this._nsp = nsp
    }

    onConnection(socket: Socket) {
        this._logger.log("Client APP connect:", blue(socket.id))
    }

    onDisconnection(socket: Socket) {
        this._logger.log("Client APP disconnect:", blue(socket.id))
    }

    onAuthentication(socket: Socket, data: AuthenticationData, authorized: boolean) {
        this._logger.log("onAuthentication:", red(data))
    }

    onSync(socket: Socket, data: any) {
        this._logger.log(socket.id, data)
    }
}
