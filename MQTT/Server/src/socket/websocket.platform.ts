import { Socket, Namespace } from "socket.io"
import { AuthenticationData } from "./websocket.const"
import { Logger } from "../stream/logger"

export interface WebsocketPlatform {
    ready(nsp: Namespace)
    onConnection(socket: Socket)
    onDisconnection(socket: Socket)
    onAuthentication(socket: Socket, data: AuthenticationData, authorized: boolean)
    getLogger(): Logger
    getPlatformName(): string
    isPlatformId(id: string)
}
