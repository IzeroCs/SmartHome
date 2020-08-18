import { Server, persistence, Client, Packet } from "mosca"
import { Logger } from "../stream/logger"
import { EspMQTT } from "./esp"
import { isUndefined, isObject } from "util"
import { blue, red } from "cli-color"
import express, { Application } from "express"
import http from "http"
import path from "path"
import { AppMQTT } from "./app"
import { logger } from "../database/ormconfig"

export type authorizeCallback = (obj: any, authorized: boolean) => void

export class MQTT {
    private static mqtt: MQTT = null
    private server: Server = null
    private logger: Logger = new Logger(this)
    private appMqtt: AppMQTT = new AppMQTT(this)
    private espMqtt: EspMQTT = new EspMQTT(this)
    private app: Application = express()
    private http: http.Server = http.createServer(this.app)

    constructor() {
        MQTT.mqtt = this
    }

    setup() {
        this.server = new Server({
            port: 1883,
            host: "192.168.31.104",
            bundle: true,
            static: "./",
            http: {
                port: 8383
            },
            backend: {
                type: "mongo",
                url: "mongodb://localhost:27017/mqtt",
                pubsubCollection: "ascoltatori",
                mongo: {}
            },
            persistence: {
                factory: persistence.Mongo,
                url: "mongodb://localhost:27017/mqtt"
            }
        })

        const publicDir = path.dirname(require.resolve("mosca")) + "/public"

        this.app.use(express.static(publicDir))
        this.app.use(express.static(path.join(__dirname, "..", "..", "public")))
        this.server.attachHttpServer(this.http)
        this.http.listen(this.server.opts.http.port, this.server.opts.host, () =>
            this.logger.log("Mosca http server listen:", blue(this.server.opts.host + ":" + this.server.opts.http.port))
        )
    }

    run() {
        this.server.authenticate = this.authenticate
        this.server.authorizePublish = this.authorizePublish
        this.server.authorizeSubscribe = this.authroizedSubscribe

        this.server.on("ready", () => {
            this.logger.log("Mosca server listen:", blue(this.server.opts.host + ":" + this.server.opts.port))
            this.appMqtt.ready()
            this.espMqtt.ready()
        })

        this.server.on("clientConnected", (client: Client) => {
            if (AppMQTT.matchID(client.id)) return this.appMqtt.connected(client)
            if (EspMQTT.matchID(client.id)) return this.espMqtt.connected(client)

            this.logger.log("Client connected:", blue(client.id))
        })

        this.server.on("clientDisconnected", (client: Client) => {
            if (AppMQTT.matchID(client.id)) return this.appMqtt.disconnected(client)
            if (EspMQTT.matchID(client.id)) return this.espMqtt.disconnected(client)

            this.logger.log("Client disconnected", blue(client.id))
        })

        this.server.on("published", (packet: Packet, client: Client) => {
            if (!isUndefined(client)) {
                if (packet.payload && packet.payload instanceof Buffer) packet.payload = packet.payload.toString()

                if (AppMQTT.matchID(client.id)) return this.appMqtt.published(packet, client)
                if (EspMQTT.matchID(client.id)) return this.espMqtt.published(packet, client)
            } else if (
                RegExp(/^\$SYS\/.+\/(new|disconnect)+\/(clients|subscribes|unsubscribes)+$/g).test(packet.topic)
            ) {
                return
            }

            this.logger.log("Published", packet)
        })

        this.server.on("subscribed", (topic: string, client: Client) => {
            if (!isUndefined(client)) {
                if (AppMQTT.matchID(client.id)) return this.appMqtt.subscribed(topic, client)
                if (EspMQTT.matchID(client.id)) return this.espMqtt.subscribed(topic, client)
            }

            this.logger.log("Subscribed [" + red(topic) + "]")
        })

        this.server.on("unsubscribed", (topic: string, client: Client) => {
            if (!isUndefined(client)) {
                if (AppMQTT.matchID(client.id)) return this.appMqtt.unsubscribed(topic, client)
                if (EspMQTT.matchID(client.id)) return this.espMqtt.unsubscribed(topic, client)
            }

            this.logger.log("Unsubscribed [" + red(topic) + "]")
        })
    }

    authenticate(client: Client, username: string, password: Buffer | string, callback: authorizeCallback) {
        let token = password instanceof Buffer ? password.toString() : <string>password
        let authorized = false

        if (AppMQTT.matchID(client.id)) authorized = MQTT.mqtt.appMqtt.authenticate(client, username, token)
        else if (EspMQTT.matchID(client.id)) authorized = MQTT.mqtt.espMqtt.authenticate(client, username, token)

        callback(null, authorized)
    }

    authorizePublish(client: Client, topic: string, payload: any, callback: authorizeCallback) {
        let authorized = false

        if (AppMQTT.matchID(client.id)) authorized = MQTT.mqtt.appMqtt.authorizedPublish(client, topic, payload)
        else if (EspMQTT.matchID(client.id)) authorized = MQTT.mqtt.espMqtt.authorizedPublish(client, topic, payload)

        callback(null, authorized)
    }

    authroizedSubscribe(client: Client, topic: string, callback: authorizeCallback) {
        let authorized = false

        if (AppMQTT.matchID(client.id)) authorized = MQTT.mqtt.appMqtt.authroizedSubscribe(client, topic)
        else if (EspMQTT.matchID(client.id)) authorized = MQTT.mqtt.espMqtt.authroizedSubscribe(client, topic)

        callback(null, authorized)
    }

    static published(classes: any, packet: Packet, client: Client): boolean | undefined {
        let propertys = Object.getOwnPropertyNames(classes)

        if (!isUndefined(propertys)) {
            for (let i = 0; i < propertys.length; ++i) {
                propertys[i] = propertys[i].replace("-", "_")
                propertys[i] = propertys[i].toLowerCase()

                if (packet.topic.replace("-", "_").toLowerCase() === propertys[i]) {
                    try {
                        const obj = JSON.parse(packet.payload)
                        if (isObject(obj)) packet.payload = obj
                    } catch (e) {
                        MQTT.mqtt.logger.error(e.message, e.stack)
                    }

                    return classes[propertys[i]](packet, client)
                }
            }
        }

        return false
    }
}
