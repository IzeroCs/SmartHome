import { Client, Packet } from "mosca"
import { Cert } from "../security/cert"
import { Logger } from "../stream/logger"
import { isUndefined } from "util"
import { MQTT, authorizeCallback } from "./mqtt"
import { red, blue, green } from "cli-color"
import { IOPin, StatusCloud } from "./esp.enum"
import { logger } from "../database/ormconfig"

export class EspMQTT {
    private mqtt: MQTT = null
    private cert: Cert = new Cert("ESP")
    private logger: Logger = new Logger(this)

    constructor(mqtt: MQTT) {
        this.mqtt = mqtt
    }

    static matchID(id: string): boolean {
        return id.startsWith("ESP-")
    }

    ready() {
        this.logger.log('Platform "esp" mqtt started')
    }

    connected(client: Client) {
        this.logger.log("Connected:", blue(client.id))
    }

    disconnected(client: Client) {
        this.logger.log("Disconnected:", blue(client.id))
    }

    published(packet: Packet, client: Client) {
        packet.topic = this.prefixPublish(client.id, packet.topic)

        if (MQTT.published(EspEvent, packet, client) === false) {
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
        if (username === "ESP" && this.cert.verifySync(password)) {
            this.logger.log("Authentication:", blue(client.id), green("(authorized)"))
            return true
        } else {
            this.logger.log("Authentication:", blue(client.id), red("(unauthorized)"))
            return false
        }
    }

    prefixPublish(id: string, topic: string): string {
        return topic.substring(("server/esp/" + id + "/").length)
    }

    authorizedPublish(client: Client, topic: string, payload: any): boolean {
        const prefix = "server/esp/" + client.id + "/"

        if (!EspMQTT.matchID(client.id)) return false
        if (!topic.startsWith(prefix)) return false

        return true
    }

    prefixSubscribe(id: string, topic: string): string {
        return topic.substring(("client/esp/" + id + "/").length)
    }

    authroizedSubscribe(client: Client, topic: string): boolean {
        const prefix = "client/esp/" + client.id + "/"

        if (!EspMQTT.matchID(client.id)) return false
        if (!topic.startsWith(prefix)) return false

        return true
    }
}

class EspEvent {
    private static logger: Logger = new Logger(EspEvent)

    static sync_io(packet: Packet, client: Client) {
        this.logger.log("SyncIO:", packet)
    }

    static sync_detail(packet: Packet, client: Client) {
        this.logger.log("SyncDetail:", packet)
    }
}
