"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomTypeModel = void 0;
const typeorm_1 = require("typeorm");
const room_type_entity_1 = require("../entity/room_type.entity");
class RoomTypeModel {
    static getAll() {
        return typeorm_1.getRepository(room_type_entity_1.RoomType).find({ enable: true });
    }
}
exports.RoomTypeModel = RoomTypeModel;
//# sourceMappingURL=room_type.model.js.map