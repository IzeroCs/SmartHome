import { Socket, Namespace } from "socket.io"

export interface WebsocketPlatform {
    ready(nsp: Namespace)
    onConnection(socket: Socket)
    onDisconnection(socket: Socket)
}
