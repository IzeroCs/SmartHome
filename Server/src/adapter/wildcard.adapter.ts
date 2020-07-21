import { IoAdapter } from "@nestjs/platform-socket.io"
import { Server } from "socket.io"

export class WildcardAdapter extends IoAdapter {
    createIOServer(port: number, options?: any): any {
        const server: Server = super.createIOServer(port, options)
        return server
    }
}
