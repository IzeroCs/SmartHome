import * as underscore from 'underscore'
import { Server, Socket, Namespace } from 'socket.io'
import { Logger } from '@nestjs/common'

export class SocketUtil {
    static removing(io: Namespace, logger: Logger) {
        underscore.each(io.server.nsps, (nsp: Namespace) => {
            if (io.name != nsp.name)
                return

            nsp.on('connect', (client: Socket) => {
                if (!client['auth'])
                    delete nsp.connected[client.id]

                if (logger)
                    logger.log(`Removing socket ${nsp.name}`)
            })
        })
    }

    static restoring(io: Namespace, client: Socket, logger: Logger) {
        underscore.each(io.server.nsps, (nsp: Namespace) => {
            if (io.name != nsp.name)
                return

            if (underscore.findWhere(nsp.sockets, { id: client.id })) {
                if (logger)
                    logger.log(`Restoring socket to ${nsp.name}`)

                nsp.connected[client.id] = client
            }
        })
    }
}
