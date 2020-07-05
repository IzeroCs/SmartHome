import { BaseSeed } from "../base.seed"
import { Esp } from "../entity/esp.entity"

export class EspSeed extends BaseSeed {
    async seed() {
        const repository = this.connection.getRepository(Esp)
        const count = await repository.count({
            name: "ESP1N403E91636RSC185G2K",
        })

        if (count <= 0) {
            this.logSeedRunning()

            const esp = new Esp()
            esp.name = "ESP1N403E91636RSC185G2K"
            esp.online = false
            esp.auth = true

            await repository.save(esp)
            this.logger.debug(`Esp ${esp.name} has been saved`)
            this.logSeedRunned()
        }
    }
}
