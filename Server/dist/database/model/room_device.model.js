"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomDeviceModel = exports.UpdateDevice = exports.StatusDevice = exports.WidgetDevice = void 0;
var typeorm_1 = require("typeorm");
var room_device_entity_1 = require("../entity/room_device.entity");
var util_1 = require("util");
var entity_util_1 = require("../util/entity.util");
var base_model_1 = require("../base.model");
var validate_util_1 = require("../util/validate.util");
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
var RoomDeviceModel = (function (_super) {
    __extends(RoomDeviceModel, _super);
    function RoomDeviceModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RoomDeviceModel.getList = function (roomID) {
        return typeorm_1.getRepository(room_device_entity_1.RoomDevice).find({
            relations: ["esp", "room", "type"],
            where: {
                room: roomID
            }
        });
    };
    RoomDeviceModel.updateDevice = function (deviceId, object) {
        return __awaiter(this, void 0, void 0, function () {
            var repository, find, res, validate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = typeorm_1.getRepository(room_device_entity_1.RoomDevice);
                        return [4, repository.findOne({ id: deviceId })];
                    case 1:
                        find = _a.sent();
                        res = entity_util_1.EntityUtil.create(room_device_entity_1.RoomDevice, object);
                        if (util_1.isUndefined(find))
                            return [2, this.response({ code: UpdateDevice.DeviceNotExists })];
                        validate = new validate_util_1.Validate([
                            validate_util_1.checker(["name", "type.type"])
                                .isRequired()
                                .isNotEmpty()
                                .custom("nameInvalid", function (field, value) {
                                if (field == "name")
                                    return true;
                            })
                                .isLength(4, 30)
                                .isMin(5)
                                .isMax(3)
                                .isNumber(),
                            validate_util_1.checker("value")
                                .isRequired()
                                .isNotEmpty()
                                .isEmail(),
                            validate_util_1.checker(["type", "type.v"])
                                .isRequired()
                                .isNotEmpty()
                                .isURL()
                                .isIn(["google", "google.co", "google.com"])
                        ]);
                        validate.execute({
                            name: "Test",
                            value: "izerocs.gmail.com",
                            type: {
                                id: 1,
                                type: 2,
                                v: "google.com"
                            }
                        });
                        return [2];
                }
            });
        });
    };
    return RoomDeviceModel;
}(base_model_1.BaseModel));
exports.RoomDeviceModel = RoomDeviceModel;
//# sourceMappingURL=room_device.model.js.map