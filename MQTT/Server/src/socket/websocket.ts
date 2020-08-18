import express from "express"
import http from "http"
import socketio from "socket.io"
import wildcard from "socketio-wildcard"
import { blue } from "cli-color"
import { Logger } from "../stream/logger"
import { AppPlatform } from "./app.platform"
import { EspPlatform } from "./esp.platform"
import { WebsocketPlatform } from "./websocket.platform"
import { Namespace, Socket, Server } from "socket.io"
import { isUndefined } from "util"

export const EVENT_CONNECTION = "connection"
export const EVENT_DISCONNECT = "disconnect"
export const EVENT_AUTHENTICATION = "authentication"

export type AuthenticationData = {
    id: string
    token: string
}

export class Websocket {
    private static _socket: Websocket

    private _port: number = 3000
    private _host: string = "192.168.31.104"

    private _app: express.Application
    private _http: http.Server
    private _logger: Logger

    private _wildcard: any
    private _io: Server
    private _nspApp: Namespace
    private _nspEsp: Namespace

    private _appPlatform: AppPlatform
    private _espPlatform: EspPlatform

    setup() {
        Websocket._socket = this

        this._logger = new Logger(Websocket)
        this._app = express()
        this._http = http.createServer(this._app)
        this._wildcard = wildcard()
        this._io = socketio(this._http, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            transports: ["websocket", "polling"]
        })

        this._appPlatform = new AppPlatform(this)
        this._espPlatform = new EspPlatform(this)
    }

    listen() {
        this.listenEvent()
        this._app.use(express.static("../../public"))
        this._http.listen(3000, "192.168.31.104", () =>
            this._logger.log("Socket listen:", blue(this._host + ":" + this._port))
        )
    }

    private listenEvent() {
        this._nspApp = this._io.of("/" + AppPlatform.platform)
        this._nspEsp = this._io.of("/" + EspPlatform.platform)

        this.onEvent(this._nspApp, this._appPlatform)
        this.onEvent(this._nspEsp, this._espPlatform)

        this._appPlatform.ready(this._nspApp)
        this._espPlatform.ready(this._nspEsp)
    }

    static isSocketAuthentication(socket: Socket): boolean {
        return !isUndefined(socket["authentication"]) && socket["authetication"] === true
    }

    static setSocketAuthentication(socket: Socket, authorized: boolean) {
        socket["authentication"] = authorized
    }

    private onEvent(nsp: Namespace, platform: WebsocketPlatform) {
        nsp.use(this._wildcard)
        nsp.on(EVENT_CONNECTION, (socket: Socket) => {
            platform.onConnection(socket)

            socket
                .on("*", (packet: any) => {
                    if (!Websocket.isSocketAuthentication(socket)) return

                    if (isUndefined(packet)) return
                    if (isUndefined(packet.data)) return

                    let event: string = packet.data[0]
                    let data: any = packet.data[1]

                    event = event.toLowerCase()
                    event = event.replace(/[\-\.]+/g, " ")
                    event = event.replace(/(^|\s)([a-z]{1})/g, (match: string, ...args: any[]): string => {
                        return args[1].toUpperCase()
                    })
                    event = "on" + event

                    if (!isUndefined(platform[event])) {
                        platform[event](socket, data)
                    }
                })
                .on(EVENT_DISCONNECT, () => platform.onDisconnection(socket))
                .on(EVENT_AUTHENTICATION, (data: AuthenticationData) => platform.onAuthentication(socket, data))
                .emit(EVENT_AUTHENTICATION)
        })
    }
}