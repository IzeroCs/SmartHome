import { BaseSeed } from "../base.seed"
import { Esp } from "../entity/esp.entity"

export class EspSeed extends BaseSeed {
    async seed() {
        const repository = this.connection.getRepository(Esp)
        const count = await repository.count({
            name: "ESP2Z4R1U8L2U0ZSC1T5K3M"
        })

        if (count <= 0) {
            this.logSeedRunning()

            const esp = new Esp()
            esp.name = "ESP2Z4R1U8L2U0ZSC1T5K3M"
            esp.online = false
            esp.auth = true

            await repository.save(esp)
            this.logger.debug(`Esp ${esp.name} has been saved`)
            this.logSeedRunned()
        }
    }
}
