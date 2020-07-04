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
exports.RoomDeviceSeed = void 0;
var base_seed_1 = require("../base.seed");
var room_device_entity_1 = require("../entity/room_device.entity");
var room_list_entity_1 = require("../entity/room_list.entity");
var esp_entity_1 = require("../entity/esp.entity");
var util_1 = require("util");
var device_type_entity_1 = require("../entity/device_type.entity");
var RoomDeviceSeed = /** @class */ (function (_super) {
    __extends(RoomDeviceSeed, _super);
    function RoomDeviceSeed() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RoomDeviceSeed.prototype.seed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var repository, repositoryRoom, repositoryEsp, repositoryDeviceType, roomFind, deviceTypeLight, deviceTypeFan, deviceTypeHeater, espFind, deviceCount, devices, i, device, deviceRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = this.connection.getRepository(room_device_entity_1.RoomDevice);
                        repositoryRoom = this.connection.getRepository(room_list_entity_1.RoomList);
                        repositoryEsp = this.connection.getRepository(esp_entity_1.Esp);
                        repositoryDeviceType = this.connection.getRepository(device_type_entity_1.DeviceType);
                        return [4 /*yield*/, repositoryRoom.findOne({ name: "Phòng khách" })];
                    case 1:
                        roomFind = _a.sent();
                        return [4 /*yield*/, repositoryDeviceType.findOne({ type: 1 })];
                    case 2:
                        deviceTypeLight = _a.sent();
                        return [4 /*yield*/, repositoryDeviceType.findOne({ type: 2 })];
                    case 3:
                        deviceTypeFan = _a.sent();
                        return [4 /*yield*/, repositoryDeviceType.findOne({ type: 3 })];
                    case 4:
                        deviceTypeHeater = _a.sent();
                        return [4 /*yield*/, repositoryEsp.findOne({ name: "ESP1N403E91636RSC185G2K" }, { relations: ["pins"] })];
                    case 5:
                        espFind = _a.sent();
                        if (util_1.isNull(roomFind) || util_1.isNull(espFind))
                            return [2 /*return*/];
                        return [4 /*yield*/, repository.count({ esp: espFind })];
                    case 6:
                        deviceCount = _a.sent();
                        if (deviceCount > 0)
                            return [2 /*return*/];
                        this.logger.debug("Insert first data room device");
                        devices = [
                            {
                                name: "Đèn tuýp",
                                des: "Trái",
                                pin: espFind.pins[0],
                                type: deviceTypeLight,
                                widget: 0,
                            },
                            {
                                name: "Đèn tuýp",
                                des: "Phải",
                                pin: espFind.pins[1],
                                type: deviceTypeLight,
                                widget: 0,
                            },
                            {
                                name: "Đèn ngủ",
                                des: "",
                                pin: espFind.pins[2],
                                type: deviceTypeLight,
                                widget: 1,
                            },
                            {
                                name: "Quạt trần",
                                des: "",
                                pin: espFind.pins[3],
                                type: deviceTypeFan,
                                widget: 0,
                            },
                            {
                                name: "Quạt đứng",
                                des: "",
                                pin: espFind.pins[4],
                                type: deviceTypeFan,
                                widget: 0,
                            },
                            {
                                name: "Bình nóng lạnh",
                                des: "",
                                pin: espFind.pins[5],
                                type: deviceTypeHeater,
                                widget: 1,
                            },
                        ];
                        i = 0;
                        _a.label = 7;
                    case 7:
                        if (!(i < devices.length)) return [3 /*break*/, 10];
                        device = devices[i];
                        deviceRecord = new room_device_entity_1.RoomDevice();
                        deviceRecord.name = device.name;
                        deviceRecord.descriptor = device.des;
                        deviceRecord.pin = device.pin;
                        deviceRecord.esp = espFind;
                        deviceRecord.room = roomFind;
                        deviceRecord.type = device.type;
                        deviceRecord.widget = device.widget;
                        return [4 /*yield*/, repository.save(deviceRecord)];
                    case 8:
                        _a.sent();
                        this.logger.debug("Room device " + device.name + " added for " + roomFind.name);
                        _a.label = 9;
                    case 9:
                        ++i;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    return RoomDeviceSeed;
}(base_seed_1.BaseSeed));
exports.RoomDeviceSeed = RoomDeviceSeed;
//# sourceMappingURL=room_device.seed.js.map