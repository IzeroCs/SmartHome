"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EspPinSeed = void 0;
const base_seed_1 = require("../base.seed");
const esp_pin_entity_1 = require("../entity/esp_pin.entity");
const esp_entity_1 = require("../entity/esp.entity");
const util_1 = require("util");
class EspPinSeed extends base_seed_1.BaseSeed {
    constructor() {
        super(...arguments);
        this.esps = {
            ESP1N403E91636RSC185G2K: [
                {
                    input: 0,
                    outputType: 0,
                    outputPrimary: 0,
                    outputSecondary: 1
                },
                {
                    input: 1,
                    outputType: 3,
                    outputPrimary: 1,
                    outputSecondary: 1
                },
                {
                    input: 2,
                    outputType: 1,
                    outputPrimary: 2,
                    outputSecondary: 3
                },
                {
                    input: 3,
                    outputType: 1,
                    outputPrimary: 3,
                    outputSecondary: 3
                },
                {
                    input: 4,
                    outputType: 2,
                    outputPrimary: 4,
                    outputSecondary: 5
                },
                {
                    input: 5,
                    outputType: 3,
                    outputPrimary: 5,
                    outputSecondary: 5
                },
                {
                    input: 6,
                    outputType: 1,
                    outputPrimary: 6,
                    outputSecondary: 6
                },
                {
                    input: 7,
                    outputType: 1,
                    outputPrimary: 7,
                    outputSecondary: 7
                }
            ]
        };
    }
    async seed() {
        const repository = this.connection.getRepository(esp_pin_entity_1.EspPin);
        const repositoryEsp = this.connection.getRepository(esp_entity_1.Esp);
        const keys = Object.keys(this.esps);
        for (let i = 0; i < keys.length; ++i) {
            const espName = keys[i];
            const pins = this.esps[espName];
            const espFind = await repositoryEsp.findOne({ name: espName });
            if (!util_1.isNull(espFind)) {
                const pinCount = await repository.count({ esp: espFind });
                if (pinCount >= pins.length)
                    return;
                else
                    this.logSeedRunning();
                for (let p = 0; p < pins.length; ++p) {
                    const pin = pins[p];
                    const pinRecord = new esp_pin_entity_1.EspPin();
                    pinRecord.esp = espFind;
                    pinRecord.input = pin.input;
                    pinRecord.outputType = pin.outputType;
                    pinRecord.outputPrimary = pin.outputPrimary;
                    pinRecord.ouputSecondary = pin.outputSecondary;
                    await repository.save(pinRecord);
                    this.logger.debug(`Pin ${pin.input} added for ${espFind.name}`);
                }
                this.logger.debug(`Esp ${espFind.name} add pin successfully`);
                this.logSeedRunned();
            }
        }
    }
}
exports.EspPinSeed = EspPinSeed;
//# sourceMappingURL=esp_pin.seed.js.map