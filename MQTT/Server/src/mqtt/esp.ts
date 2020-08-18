import { Client, Packet } from "mosca"
import { Cert } from "../security/cert"
import { Logger } from "../stream/logger"
import { MQTT } from "./mqtt"
import { red, blue, green } from "cli-color"
import { IOPin, StatusCloud, DetailType, EspModule, EspPin, EspPinCast } from "./esp.def"
import { Network } from "../util/network"
import { isUndefined } from "util"
import { valueOf } from "cli-color/beep"

export class EspMQTT {
    private mqtt: MQTT = null
    private static esp: Esp = null
    private static espMQTT: EspMQTT = null
    private cert: Cert = new Cert("ESP")
    private logger: Logger = new Logger(this)

    constructor(mqtt: MQTT) {
        this.mqtt = mqtt

        EspMQTT.esp = new Esp()
        EspMQTT.espMQTT = this
    }

    static matchID(id: string): boolean {
        return id.startsWith("ESP-")
    }

    static getEsp(): Esp {
        return this.esp
    }
    static getEspMQTT(): EspMQTT {
        return this.espMQTT
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

class Esp {
    private modules: Map<String, EspModule> = new Map()
    private logger: Logger = new Logger(Esp)

    initModule(id: string) {
        if (!this.modules.has(id)) {
            this.modules.set(id, {
                name: id,
                online: false,
                auth: false,
                changed: false,
                pins: [],
                detail_rssi: Network.MIN_RSSI
            })
        }
    }

    getModule(id: string): EspModule {
        this.initModule(id)
        return this.modules.get(id)
    }

    updateModule(id: string, online: boolean, auth?: boolean) {
        const module = this.getModule(id)

        module.name = id
        module.online = online

        if (auth) module.auth = auth
    }

    updatePins(id: string, pins: Array<EspPin>, changed?: boolean) {
        const module = this.getModule(id)

        if (!isUndefined(changed)) {
            module.changed = changed
        }

        module.pins = pins
    }

    updateDetail(id: string, detail: DetailType) {
        const module = this.getModule(id)

        if (detail.detail_rssi) module.detail_rssi = detail.detail_rssi
    }
}

class EspEvent {
    private static logger: Logger = new Logger(EspEvent)

    static sync_io(packet: Packet, client: Client) {
        if (isUndefined(packet.payload.pins)) return
        if (isUndefined(packet.payload.changed)) return

        const pins: Array<any> = packet.payload.pins
        const changed: boolean = packet.payload.changed

        for (let i = 0; i < pins.length; ++i) {
            const pin: Array<any> = pins[i]
            const espPin: EspPin = {}

            for (let k = 0; k < pin.length; ++k) {
                espPin[EspPinCast[k]] = pin[k]
            }

            pins[i] = espPin
        }

        EspMQTT.getEsp().updatePins(client.id, pins, changed)

        process.stdout.clearLine(0)
        process.stdout.cursorTo(0)
        process.stdout.write(client.id + "[ ")

        for (let i = 0; i < pins.length; ++i) {
            const pin: EspPin = pins[i]

            if (i > 0) process.stdout.write(", ")

            if (pin.statusClient) process.stdout.write(i + ":" + green("high"))
            else process.stdout.write(i + ":" + red("low"))
        }

        process.stdout.write("]")
    }

    static sync_detail(packet: Packet, client: Client) {
        const detail: DetailType = <DetailType>packet.payload

        if (detail.detail_rssi) {
            const esp = EspMQTT.getEsp()
            const module = esp.getModule(client.id)

            const signalModule = Network.calculateSignalLevel(module.detail_rssi)
            const signalClient = Network.calculateSignalLevel(detail.detail_rssi)

            if (signalModule != signalClient) {
                esp.updateDetail(client.id, detail)
            }
        }
    }
}
