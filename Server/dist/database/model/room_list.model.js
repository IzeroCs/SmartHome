"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomListModel = void 0;
const typeorm_1 = require("typeorm");
const room_list_entity_1 = require("../entity/room_list.entity");
class RoomListModel {
    static getAll() {
        return typeorm_1.getRepository(room_list_entity_1.RoomList).find({
            relations: ["type", "devices"],
            where: {
                enable: true
            }
        });
    }
}
exports.RoomListModel = RoomListModel;
//# sourceMappingURL=room_list.model.js.map