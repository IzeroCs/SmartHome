import * as underscore from "underscore"
import { Server, Socket, Namespace } from "socket.io"
import { Logger } from "@nestjs/common"

export class SocketUtil {
    static removing(io: Namespace, logger?: Logger) {
        const nsp = io.server.nsps[io.name]
        const connect = (client: Socket) => {
            if (!client["auth"]) {
                delete nsp.connected[client.id]
                nsp.removeListener("connect", connect)
            }

            if (logger) logger.log(`Removing socket ${client.id}`)
        }

        nsp.on("connect", connect)
    }

    static restoring(io: Namespace, client: Socket, logger?: Logger) {
        const nsp = io.server.nsps[io.name]

        if (underscore.findWhere(nsp.sockets, { id: client.id })) {
            if (logger) logger.log(`Restoring socket to ${client.id}`)
            nsp.connected[client.id] = client
        }
    }
}
