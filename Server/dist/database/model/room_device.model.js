"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomDeviceModel = void 0;
var typeorm_1 = require("typeorm");
var room_device_entity_1 = require("../entity/room_device.entity");
var RoomDeviceModel = /** @class */ (function () {
    function RoomDeviceModel() {
    }
    RoomDeviceModel.getList = function (roomID) {
        return typeorm_1.getRepository(room_device_entity_1.RoomDevice).find({
            relations: ["esp", "room", "type"],
            where: {
                room: roomID,
            },
        });
    };
    return RoomDeviceModel;
}());
exports.RoomDeviceModel = RoomDeviceModel;
//# sourceMappingURL=room_device.model.js.map