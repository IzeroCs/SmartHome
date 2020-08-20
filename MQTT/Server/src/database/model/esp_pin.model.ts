import { getRepository } from "typeorm"
import { isString, isUndefined } from "util"
import { EspPinType } from "../../socket/esp.const"
import { Esp } from "../entity/esp.entity"
import { EspPin } from "../entity/esp_pin.entity"

export class EspPinModel {
    static update(espID: string | Esp, pins: Array<EspPinType>): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let esp: Esp
            let espPins: EspPin[]
            let repositoryEsp = getRepository(Esp)
            let repositoryEspPin = getRepository(EspPin)

            if (isString(espID)) esp = await repositoryEsp.findOne({ name: espID })
            else if (espID instanceof Esp) esp = espID
            else return reject("Esp undefined")

            espPins = await repositoryEspPin.find({ esp: esp })

            if (espPins.length != pins.length) {
                await repositoryEspPin.remove(espPins)
            }

            for (let i = 0; i < pins.length; ++i) {
                let pin: EspPinType = pins[i]
                let espPin: EspPin = espPins.find(espPin => espPin.input == pin.input)
                let pinCreated: boolean = false

                if (isUndefined(espPin)) {
                    espPin = new EspPin()
                    pinCreated = true
                }

                espPin.esp = <Esp>espID
                espPin.name = pin.input.toString()
                espPin.input = pin.input
                espPin.outputType = pin.outputType
                espPin.outputPrimary = pin.outputPrimary
                espPin.ouputSecondary = pin.outputSecondary
                espPin.dualToggleCount = pin.dualToggleCount
                espPin.dualToggleTime = pin.dualToggleTime
                espPin.statusCloud = pin.statusCloud
                espPin.statusClient = pin.statusClient

                if (pinCreated) await repositoryEspPin.save(espPin)
                else await repositoryEspPin.update(espPin.id, espPin)
            }

            resolve()
        })
    }
}
