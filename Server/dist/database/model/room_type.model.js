"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomTypeModel = void 0;
var typeorm_1 = require("typeorm");
var room_type_entity_1 = require("../entity/room_type.entity");
var RoomTypeModel = (function () {
    function RoomTypeModel() {
    }
    RoomTypeModel.getAll = function () {
        return typeorm_1.getRepository(room_type_entity_1.RoomType).find({ enable: true });
    };
    return RoomTypeModel;
}());
exports.RoomTypeModel = RoomTypeModel;
//# sourceMappingURL=room_type.model.js.map