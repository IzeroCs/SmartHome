import { Socket, Namespace } from "socket.io"
import { AuthenticationData } from "./websocket"

export interface WebsocketPlatform {
    ready(nsp: Namespace)
    onConnection(socket: Socket)
    onDisconnection(socket: Socket)
    onAuthentication(socket: Socket, data: AuthenticationData)
}
