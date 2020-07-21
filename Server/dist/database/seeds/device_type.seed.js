"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceTypeSeed = void 0;
const base_seed_1 = require("../base.seed");
const typeorm_1 = require("typeorm");
const device_type_entity_1 = require("../entity/device_type.entity");
class DeviceTypeSeed extends base_seed_1.BaseSeed {
    constructor() {
        super(...arguments);
        this.def = [
            {
                name: "Đèn",
                nsp: "light",
                type: 1
            },
            {
                name: "Quạt",
                nsp: "fan",
                type: 2
            },
            {
                name: "Bình nóng lạnh",
                nsp: "heater",
                type: 3
            }
        ];
    }
    async seed() {
        const repository = typeorm_1.getRepository(device_type_entity_1.DeviceType);
        const count = await repository.count();
        if (count <= 0) {
            this.logSeedRunning();
            for (let i = 0; i < this.def.length; ++i) {
                const type = this.def[i];
                const record = new device_type_entity_1.DeviceType();
                record.name = type.name;
                record.nsp = type.nsp;
                record.type = type.type;
                await repository.save(record);
                this.logger.debug(`Added device type ${type.name}`);
            }
            this.logSeedRunned();
        }
    }
}
exports.DeviceTypeSeed = DeviceTypeSeed;
//# sourceMappingURL=device_type.seed.js.map