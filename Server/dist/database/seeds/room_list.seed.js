"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomListSeed = void 0;
const base_seed_1 = require("../base.seed");
const room_list_entity_1 = require("../entity/room_list.entity");
const room_type_entity_1 = require("../entity/room_type.entity");
const util_1 = require("util");
class RoomListSeed extends base_seed_1.BaseSeed {
    constructor() {
        super(...arguments);
        this.datas = [
            { name: "Phòng khách", type: 1 },
            { name: "Phòng ngủ", type: 2 },
            { name: "Phòng bếp", type: 3 },
            { name: "Phòng tắm", type: 4 },
            { name: "Ban công", type: 5 },
            { name: "Cầu thang", type: 6 },
            { name: "Sân nhà", type: 7 },
            { name: "Gác lửng", type: 8 },
            { name: "Gác mái", type: 9 }
        ];
    }
    async seed() {
        const repository = this.connection.getRepository(room_list_entity_1.RoomList);
        const repositoryRoomType = this.connection.getRepository(room_type_entity_1.RoomType);
        if ((await repository.count()) <= 0) {
            this.logSeedRunning();
            for (let i = 0; i < this.datas.length; ++i) {
                const data = this.datas[i];
                const name = data["name"];
                const type = parseInt(data["type"]);
                const roomType = await repositoryRoomType.findOne({
                    type: type
                });
                if (!util_1.isNull(roomType)) {
                    const room = new room_list_entity_1.RoomList();
                    room.name = name;
                    room.type = roomType;
                    room.enable = true;
                    await repository.save(room);
                    this.logger.debug(`Room list ${name} has been saved`);
                }
            }
            this.logSeedRunned();
        }
    }
}
exports.RoomListSeed = RoomListSeed;
//# sourceMappingURL=room_list.seed.js.map