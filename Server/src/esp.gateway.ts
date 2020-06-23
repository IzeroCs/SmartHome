import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Socket, Server } from 'socket.io'

@WebSocketGateway({ namespace: "/platform-esp" })
export class EspGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private logger: Logger = new Logger('EspGateway')

  afterInit(server: Server) {
    this.logger.log('Init socket platform esp')
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    this.server.emit('message', payload)
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connection: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnect: ${client.id}`)
  }

}
