import { BaseSeed } from "../base.seed"
import { EspPin } from "../entity/esp_pin.entity"
import { Esp } from "../entity/esp.entity"
import { isNull } from "util"

export class EspPinSeed extends BaseSeed {
    private esps = {
        ESP1N403E91636RSC185G2K: [
            {
                input: 0,
                outputType: 0,
                outputPrimary: 0,
                outputSecondary: 1,
            },
            {
                input: 1,
                outputType: 3,
                outputPrimary: 1,
                outputSecondary: 1,
            },
            {
                input: 2,
                outputType: 2,
                outputPrimary: 2,
                outputSecondary: 3,
            },
            {
                input: 3,
                outputType: 3,
                outputPrimary: 3,
                outputSecondary: 3,
            },
            {
                input: 4,
                outputType: 2,
                outputPrimary: 4,
                outputSecondary: 5,
            },
            {
                input: 5,
                outputType: 3,
                outputPrimary: 5,
                outputSecondary: 5,
            },
            {
                input: 6,
                outputType: 1,
                outputPrimary: 6,
                outputSecondary: 6,
            },
            {
                input: 7,
                outputType: 1,
                outputPrimary: 7,
                outputSecondary: 7,
            },
        ],
    }

    async seed() {
        const repository = this.connection.getRepository(EspPin)
        const repositoryEsp = this.connection.getRepository(Esp)
        const keys = Object.keys(this.esps)

        for (let i = 0; i < keys.length; ++i) {
            const espName = keys[i]
            const pins = this.esps[espName]
            const espFind = await repositoryEsp.findOne({ name: espName })

            if (!isNull(espFind)) {
                const pinCount = await repository.count({ esp: espFind })

                if (pinCount >= pins.length) return

                for (let p = 0; p < pins.length; ++p) {
                    const pin = pins[p]
                    const pinRecord = new EspPin()

                    pinRecord.esp = espFind
                    pinRecord.input = pin.input
                    pinRecord.outputType = pin.outputType
                    pinRecord.outputPrimary = pin.outputPrimary
                    pinRecord.ouputSecondary = pin.outputSecondary

                    await repository.save(pinRecord)
                    this.logger.debug(
                        `Pin ${pin.input} added for ${espFind.name}`,
                    )
                }
            }

            this.logger.debug(`Esp ${espFind.name} add pin successfully`)
        }
    }
}
