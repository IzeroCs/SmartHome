"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomTypeSeed = void 0;
const base_seed_1 = require("../base.seed");
const room_type_entity_1 = require("../entity/room_type.entity");
class RoomTypeSeed extends base_seed_1.BaseSeed {
    constructor() {
        super(...arguments);
        this.datas = {
            1: "living_room",
            2: "bed_room",
            3: "kitchen_room",
            4: "bath_room",
            5: "balcony_room",
            6: "stairs_room",
            7: "stairs_room",
            8: "mezzanine_room",
            9: "roof_room"
        };
    }
    async seed() {
        const repository = this.connection.getRepository(room_type_entity_1.RoomType);
        const keys = Object.keys(this.datas);
        if ((await repository.count()) <= 0) {
            this.logSeedRunning();
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const name = this.datas[key];
                const room = new room_type_entity_1.RoomType();
                room.name = name;
                room.type = parseInt(key);
                room.enable = true;
                await repository.save(room);
                this.logger.debug(`Room type ${name} has been saved`);
            }
            this.logSeedRunned();
        }
    }
}
exports.RoomTypeSeed = RoomTypeSeed;
//# sourceMappingURL=room_type.seed.js.map