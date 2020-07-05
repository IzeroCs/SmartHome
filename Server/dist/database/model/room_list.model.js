"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomListModel = void 0;
var typeorm_1 = require("typeorm");
var room_list_entity_1 = require("../entity/room_list.entity");
var RoomListModel = /** @class */ (function () {
    function RoomListModel() {
    }
    RoomListModel.getAll = function () {
        return typeorm_1.getRepository(room_list_entity_1.RoomList).find({
            relations: ["type", "devices"],
            where: {
                enable: true,
            },
        });
    };
    return RoomListModel;
}());
exports.RoomListModel = RoomListModel;
//# sourceMappingURL=room_list.model.js.map