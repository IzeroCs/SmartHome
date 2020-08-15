import { Client, Packet } from "mosca"
import { Cert } from "../security/cert"
import { Logger } from "../stream/logger"
import { isUndefined } from "util"
import { MQTT, authorizeCallback } from "./mqtt"
import { red, blue, green } from "cli-color"

export class AppMQTT {
    private mqtt: MQTT = null
    private cert: Cert = new Cert("APP")
    private logger: Logger = new Logger(this)

    constructor(mqtt: MQTT) {
        this.mqtt = mqtt
    }

    static matchID(id: string): boolean {
        return id.startsWith("APP-")
    }

    ready() {
        this.logger.log('Platform "app" mqtt started')
    }

    connected(client: Client) {
        this.logger.log("Connected:", blue(client.id))
    }

    disconnected(client: Client) {
        this.logger.log("Disconnected:", blue(client.id))
    }

    published(packet: Packet, client: Client) {
        packet.topic = this.prefixPublish(client.id, packet.topic)

        if (MQTT.published(AppEvent, packet, client) === false) {
            this.logger.log("Published", packet)
        }
    }

    subscribed(topic: string, client: Client) {
        topic = this.prefixSubscribe(client.id, topic)
        this.logger.log("Subscribed " + red("[" + topic + "]") + ":", blue(client.id))
    }

    unsubscribed(topic: string, client: Client) {
        topic = this.prefixSubscribe(client.id, topic)
        this.logger.log("Unsubscribed " + red("[" + topic + "]") + ":", blue(client.id))
    }

    authenticate(client: Client, username: string, password: string): boolean {
        if (username === "APP" && this.cert.verifySync(password)) {
            this.logger.log("Authentication:", blue(client.id), green("(authorized)"))
            return true
        } else {
            this.logger.log("Authentication:", blue(client.id), red("(unauthorized)"))
            return false
        }
    }

    prefixPublish(id: string, topic: string): string {
        return topic.substring(("server/app/" + id + "/").length)
    }

    authorizedPublish(client: Client, topic: string, payload: any): boolean {
        const prefix = "server/app/" + client.id + "/"

        if (!AppMQTT.matchID(client.id)) return false
        if (!topic.startsWith(prefix)) return false

        return true
    }

    prefixSubscribe(id: string, topic: string): string {
        return topic.substring(("client/app/" + id + "/").length)
    }

    authroizedSubscribe(client: Client, topic: string): boolean {
        const prefix = "client/app/" + client.id + "/"

        if (!AppMQTT.matchID(client.id)) return false
        if (!topic.startsWith(prefix)) return false

        return true
    }
}

class AppEvent {
    private static logger: Logger = new Logger(AppEvent)
}
