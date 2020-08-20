import { getRepository } from "typeorm"
import { Esp } from "../entity/esp.entity"
import { Logger } from "../../stream/logger"
import { isUndefined } from "util"
import { EspModuleType, EspPinType } from "../../socket/esp.const"
import { EspPinModel } from "./esp_pin.model"

export class EspModel {
    private static _logger: Logger = new Logger(EspModel)

    private static async update(espName: string, data: EspModuleType): Promise<any> {
        let repository = getRepository(Esp)
        let esp = await repository.findOne({ name: espName })
        let created = false

        if (isUndefined(esp)) {
            esp = await this.create(espName)
            created = true
        }

        if (!isUndefined(data.name)) esp.name = data.name
        if (!isUndefined(esp.token)) esp.token = data.token
        if (!isUndefined(data.online)) esp.online = data.online
        if (!isUndefined(data.detail_rssi)) esp.detail_rssi = data.detail_rssi
        if (!isUndefined(data.authentication)) esp.authentication = data.authentication

        if (!isUndefined(data.pins)) {
            await EspPinModel.update(esp, data.pins)
        }

        if (!isUndefined(data.authentication)) {
            esp.authentication_at = new Date()
            esp.authentication = data.authentication
        }

        if (created) return await repository.save(esp)
        else return await repository.update(esp.id, esp)
    }

    private static async create(espName: string): Promise<Esp> {
        const esp = new Esp()

        esp.name = espName
        esp.online = false
        esp.authentication = false

        return await getRepository(Esp).save(esp)
    }

    static updateAuthentication(espName: string, authentication: boolean, online: boolean): Promise<any> {
        return new Promise(async (resolve, reject) => {
            this.update(espName, {
                online: online,
                authentication: authentication
            })
        })
    }

    static updatePins(espName: string, pins: Array<EspPinType>): Promise<any> {
        return new Promise(async (resolve, reject) => {
            this.update(espName, {
                pins: pins
            })
        })
    }

    static updateDetail(espName: string, detail_rssi: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            this.update(espName, {
                detail_rssi: detail_rssi
            })
        })
    }
}
