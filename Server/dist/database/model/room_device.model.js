"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomDeviceModel = exports.UpdateDevice = exports.StatusDevice = exports.WidgetDevice = void 0;
const typeorm_1 = require("typeorm");
const room_device_entity_1 = require("../entity/room_device.entity");
const util_1 = require("util");
const entity_util_1 = require("../util/entity.util");
const base_model_1 = require("../base.model");
const validate_util_1 = require("../util/validate.util");
const middleware_model_1 = require("../middleware.model");
const error_model_1 = require("../error.model");
const esp_pin_entity_1 = require("../entity/esp_pin.entity");
var WidgetDevice;
(function (WidgetDevice) {
    WidgetDevice[WidgetDevice["WidgetSmall"] = 0] = "WidgetSmall";
    WidgetDevice[WidgetDevice["WidgetLarge"] = 1] = "WidgetLarge";
})(WidgetDevice = exports.WidgetDevice || (exports.WidgetDevice = {}));
var StatusDevice;
(function (StatusDevice) {
    StatusDevice[StatusDevice["StatusOff"] = 0] = "StatusOff";
    StatusDevice[StatusDevice["StatusOn"] = 1] = "StatusOn";
})(StatusDevice = exports.StatusDevice || (exports.StatusDevice = {}));
var UpdateDevice;
(function (UpdateDevice) {
    UpdateDevice["NameRequired"] = "NAME_REQUIRED";
    UpdateDevice["NameLengthInvalid"] = "NAME_LENGTH_INVALID";
    UpdateDevice["StatusInvalid"] = "STATUS_INVALID";
    UpdateDevice["DeviceNotExists"] = "DEVICE_NOT_EXISTS";
})(UpdateDevice = exports.UpdateDevice || (exports.UpdateDevice = {}));
class RoomDeviceModel extends base_model_1.BaseModel {
    static getList(roomID) {
        return typeorm_1.getRepository(room_device_entity_1.RoomDevice).find({
            relations: ["esp", "pin", "room", "type"],
            where: {
                room: roomID
            }
        });
    }
    static getDevice(deviceId) {
        return new Promise(async (resolve, reject) => {
            const repository = typeorm_1.getRepository(room_device_entity_1.RoomDevice);
            const find = await repository.findOne({ id: deviceId }, { relations: ["esp", "pin", "room", "type"] });
            const mid = new middleware_model_1.MiddlewareModel();
            mid.preProcessed(() => {
                if (util_1.isUndefined(find))
                    return error_model_1.NSP.deviceNotExists;
            })
                .run()
                .response(error => {
                if (error)
                    reject(error);
                else
                    resolve(find);
            });
        });
    }
    static getDeviceList(espId) {
        return new Promise(async (resolve) => {
            const repository = typeorm_1.getRepository(room_device_entity_1.RoomDevice);
            const mid = new middleware_model_1.MiddlewareModel();
            const find = await repository.find({
                relations: ["esp", "pin", "room", "type"],
                where: {
                    esp: espId
                }
            });
            resolve(find);
        });
    }
    static updateDevice(deviceId, object) {
        return new Promise(async (resolve, reject) => {
            const repository = typeorm_1.getRepository(room_device_entity_1.RoomDevice);
            const find = await repository.findOne({ id: deviceId }, { relations: ["esp", "pin"] });
            const res = entity_util_1.EntityUtil.create(room_device_entity_1.RoomDevice, object);
            const mid = new middleware_model_1.MiddlewareModel();
            mid.preProcessed(() => {
                if (util_1.isUndefined(find) || util_1.isUndefined(find.esp))
                    return error_model_1.NSP.deviceNotExists;
                if (!find.esp.online)
                    return error_model_1.NSP.deviceNotOnline;
            });
            mid.validate(validate_util_1.checker("name")
                .isRequired()
                .isNotEmpty()
                .isLength(5, 30), validate_util_1.checker("pin.status")
                .isRequired()
                .isNumber());
            mid.preUpdate(() => {
                if (find.name === res.name && find.pin.status === res.pin.status)
                    return error_model_1.NSP.hasNotChanged;
            });
            mid.update(async () => {
                await repository.update(deviceId, {
                    name: res.name,
                    pin: {
                        status: res.pin.status
                    }
                });
            });
            mid.run(res);
            mid.response(error => {
                if (error)
                    return reject(error);
                else
                    return resolve(res);
            });
        });
    }
    static updateStatusDevice(deviceId, object) {
        return new Promise(async (resolve, reject) => {
            const repository = typeorm_1.getRepository(room_device_entity_1.RoomDevice);
            const find = await repository.findOne({ id: deviceId }, { relations: ["esp", "pin"] });
            const res = entity_util_1.EntityUtil.create(room_device_entity_1.RoomDevice, object);
            const mid = new middleware_model_1.MiddlewareModel();
            mid.preProcessed(() => {
                if (util_1.isUndefined(find) || util_1.isUndefined(find.esp))
                    return error_model_1.NSP.deviceNotExists;
                if (!find.esp.online)
                    return error_model_1.NSP.deviceNotOnline;
            });
            mid.validate(validate_util_1.checker("pin.status")
                .isRequired()
                .isBoolean());
            mid.preUpdate(() => {
                if (find.pin.status === res.pin.status)
                    return error_model_1.NSP.hasNotChanged;
            });
            mid.update(async () => {
                const repositoryEspPin = await typeorm_1.getRepository(esp_pin_entity_1.EspPin);
                await repositoryEspPin.update(find.pin.id, {
                    status: res.pin.status
                });
            });
            mid.run(res);
            mid.response(error => {
                if (error)
                    return reject(error);
                else
                    return resolve(res);
            });
        });
    }
}
exports.RoomDeviceModel = RoomDeviceModel;
//# sourceMappingURL=room_device.model.js.map