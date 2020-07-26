"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EspSeed = void 0;
const base_seed_1 = require("../base.seed");
const esp_entity_1 = require("../entity/esp.entity");
class EspSeed extends base_seed_1.BaseSeed {
    async seed() {
        const repository = this.connection.getRepository(esp_entity_1.Esp);
        const count = await repository.count({
            name: "ESP2Z4R1U8L2U0ZSC1T5K3M"
        });
        if (count <= 0) {
            this.logSeedRunning();
            const esp = new esp_entity_1.Esp();
            esp.name = "ESP2Z4R1U8L2U0ZSC1T5K3M";
            esp.online = false;
            esp.auth = true;
            await repository.save(esp);
            this.logger.debug(`Esp ${esp.name} has been saved`);
            this.logSeedRunned();
        }
    }
}
exports.EspSeed = EspSeed;
//# sourceMappingURL=esp.seed.js.map