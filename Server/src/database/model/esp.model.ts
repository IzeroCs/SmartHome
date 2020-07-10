import { getRepository } from "typeorm"
import { Esp } from "../entity/esp.entity"
import { Logger } from "@nestjs/common"
import { isObject, isUndefined, isNumber } from "util"
import { EspPin } from "../entity/esp_pin.entity"
import { RoomDeviceModel } from "./room_device.model"

export class EspModel {
    private static logger: Logger = new Logger("EspModel")

    static async add(espName: string) {
        const repository = getRepository(Esp)
        const count = await repository.count({ name: espName })

        if (count <= 0) {
            const esp = new Esp()

            esp.name = espName
            esp.auth = false
            esp.online = false

            await repository.save(esp)
            this.logger.log(`Added esp ${espName}`)
        }
    }

    static getEsp(espIdOrName: number | string): Promise<any> {
        return new Promise(async resolve => {
            let repository = getRepository(Esp)
            let espFind = null

            if (isNumber(espIdOrName)) espFind = repository.findOne({ id: espIdOrName })
            else espFind = repository.findOne({ name: espIdOrName })

            resolve(espFind)
        })
    }

    static getEspDevice(espIdOrName: number | string): Promise<any> {
        return new Promise(async resolve => {
            let repository = getRepository(Esp)
            let espFind = null

            if (isNumber(espIdOrName)) espFind = await repository.findOne({ id: espIdOrName })
            else espFind = await repository.findOne({ name: espIdOrName })

            if (!isUndefined(espFind)) resolve(await RoomDeviceModel.getDeviceList(espFind.id))
            else resolve()
        })
    }

    static updateOnline(espName: string, online: boolean): Promise<any> {
        return new Promise(async resolve => {
            const repository = getRepository(Esp)
            const espFind = await repository.findOne({ name: espName })

            if (!isUndefined(espFind)) {
                espFind.online = online
                await repository.save(espFind)
                resolve(espFind)
            } else {
                resolve()
            }
        })
    }

    static async updateAuth(espName: string, auth: boolean, online: boolean) {
        const repository = getRepository(Esp)
        const espFind = await repository.findOne({ name: espName })

        if (!isUndefined(espFind)) {
            espFind.auth = auth
            espFind.online = online

            await repository.update(espFind.id, espFind)
        }
    }

    static updatePin(espName: string, pins: any): Promise<any> {
        return new Promise(async resolve => {
            const repository = getRepository(Esp)
            const repositoryEspPin = getRepository(EspPin)
            const espFind = await repository.findOne({ name: espName })

            if (!isUndefined(espFind) && isObject(pins) && pins.length > 0) {
                const espPinFind = await repositoryEspPin.find({ esp: espFind })

                if (espPinFind.length != pins.length) await repositoryEspPin.remove(espPinFind)

                for (let i = 0; i < pins.length; ++i) {
                    const pin = pins[i]
                    const pinFind = espPinFind.find(espPin => espPin.input == pin.input)

                    if (!isUndefined(pinFind)) {
                        pinFind.status = Boolean(pin.status)
                        pinFind.outputType = pin.outputType
                        pinFind.outputPrimary = pin.outputPrimary
                        pinFind.ouputSecondary = pin.outputSecondary
                        pinFind.dualToggleCount = pin.dualToggleCount

                        await repositoryEspPin.update(pinFind.id, pinFind)
                    }
                }

                resolve(espFind)
            }
        })
    }

    static async updateDetail(espName, details: { rssi?: string }) {
        const repository = getRepository(Esp)
        const espFind = await repository.findOne({ name: espName })

        if (!isUndefined(espFind)) {
            espFind.detail_rssi = details.rssi

            await repository.update(espFind.id, espFind)
        }
    }
}
