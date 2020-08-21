import express from "express"
import http from "http"
import socketio from "socket.io"
import wildcard from "socketio-wildcard"
import underscore from "underscore"
import { blue, red } from "cli-color"
import { Logger } from "../stream/logger"
import { AppPlatform } from "./app.platform"
import { EspPlatform } from "./esp.platform"
import { WebsocketPlatform } from "./websocket.platform"
import { Namespace, Socket, Server } from "socket.io"
import { isUndefined, isString, isArray, isObject } from "util"
import { AuthenticationData, SocketIdData } from "./websocket.const"
import { Cert } from "../security/cert"

export const EVENT_CONNECTION = "connection"
export const EVENT_DISCONNECT = "disconnect"
export const EVENT_SOCKET_ID = "socket.id"
export const EVENT_AUTHENTICATION = "authentication"

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
            pingInterval: 5000,
            pingTimeout: 5000,
            cookie: false,
            transports: ["websocket", "polling"]
        })

        this._appPlatform = new AppPlatform(this)
        this._espPlatform = new EspPlatform(this)
    }

    listen() {
        this.listenEvent()
        this.listenInterval()
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

    private listenInterval() {
        setInterval(() => {
            this.onInterval(this._nspApp, this._appPlatform)
            this.onInterval(this._nspEsp, this._espPlatform)
        }, 1000)
    }

    static isSocketAuthentication(socket: Socket): boolean {
        return !isUndefined(socket["authentication"]) && socket["authentication"] === true
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
                    if (isUndefined(packet)) return
                    if (isUndefined(packet.data)) return
                    if (!Websocket.isSocketAuthentication(socket)) return
                    if (!platform.isPlatformId(socket.id)) return
                    if (packet.data[0].toLowerCase() == EVENT_AUTHENTICATION) return

                    let event: string = packet.data[0]
                    let data: any = packet.data[1]

                    if (isString(data)) {
                        try {
                            let json = JSON.parse(data)
                            if (isArray(json) || isObject(json)) data = json
                        } catch (e) {}
                    }

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
                .on(EVENT_SOCKET_ID, (data: SocketIdData) => {
                    if (platform.isPlatformId(data.id)) socket.id = data.id
                })
                .on(EVENT_AUTHENTICATION, (data: AuthenticationData) => {
                    if (!Websocket.isSocketAuthentication(socket)) {
                        if (!platform.isPlatformId(data.id) || !isString(data.token)) {
                            platform.onAuthentication(socket, data, false)
                        }

                        new Cert(platform.getPlatformName()).verify(data.token, (authorized: boolean, err: Error) => {
                            if (authorized) {
                                socket.id = data.id
                                platform.getLogger().log("Client authorized:", blue(socket.id))
                            } else {
                                platform.getLogger().log("Client unauthorized:", red(socket.id))
                                platform.getLogger().error(err.message, err.stack)
                            }

                            Websocket.setSocketAuthentication(socket, authorized)
                            platform.onAuthentication(socket, data, authorized)

                            if (authorized) {
                                socket.emit(EVENT_AUTHENTICATION, "authorized")
                            }
                        })
                    } else {
                        platform.getLogger().log("Authentication ready:", blue(data.id))
                    }
                })
        })
    }

    private onInterval(nsp: Namespace, platform: WebsocketPlatform) {
        const now = Date.now()

        underscore.each(nsp.connected, (socket: Socket) => {
            let intervalSocketId = socket["interval_socketid"] || 0
            let intervalAuthentication = socket["interval_authentication"] || 0

            if (!platform.isPlatformId(socket.id)) {
                if (now - intervalSocketId > 5000) {
                    socket["interval_socketid"] = now
                    socket.emit(EVENT_SOCKET_ID)
                }
            } else if (!Websocket.isSocketAuthentication(socket)) {
                if (now - intervalAuthentication > 5000) {
                    socket["interval_authentication"] = now
                    socket.emit(EVENT_AUTHENTICATION)
                }
            }
        })
    }
}
