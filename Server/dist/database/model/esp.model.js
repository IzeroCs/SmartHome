"use strict";
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
exports.EspModel = void 0;
var typeorm_1 = require("typeorm");
var esp_entity_1 = require("../entity/esp.entity");
var common_1 = require("@nestjs/common");
var util_1 = require("util");
var esp_pin_entity_1 = require("../entity/esp_pin.entity");
var room_device_model_1 = require("./room_device.model");
var EspModel = (function () {
    function EspModel() {
    }
    EspModel.add = function (espName) {
        return __awaiter(this, void 0, void 0, function () {
            var repository, count, esp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = typeorm_1.getRepository(esp_entity_1.Esp);
                        return [4, repository.count({ name: espName })];
                    case 1:
                        count = _a.sent();
                        if (!(count <= 0)) return [3, 3];
                        esp = new esp_entity_1.Esp();
                        esp.name = espName;
                        esp.auth = false;
                        esp.online = false;
                        return [4, repository.save(esp)];
                    case 2:
                        _a.sent();
                        this.logger.log("Added esp " + espName);
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    EspModel.getEsp = function (espIdOrName) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var repository, espFind;
            return __generator(this, function (_a) {
                repository = typeorm_1.getRepository(esp_entity_1.Esp);
                espFind = null;
                if (util_1.isNumber(espIdOrName))
                    espFind = repository.findOne({ id: espIdOrName });
                else
                    espFind = repository.findOne({ name: espIdOrName });
                resolve(espFind);
                return [2];
            });
        }); });
    };
    EspModel.getEspDevice = function (espIdOrName) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var repository, espFind, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        repository = typeorm_1.getRepository(esp_entity_1.Esp);
                        espFind = null;
                        if (!util_1.isNumber(espIdOrName)) return [3, 2];
                        return [4, repository.findOne({ id: espIdOrName })];
                    case 1:
                        espFind = _b.sent();
                        return [3, 4];
                    case 2: return [4, repository.findOne({ name: espIdOrName })];
                    case 3:
                        espFind = _b.sent();
                        _b.label = 4;
                    case 4:
                        if (!!util_1.isUndefined(espFind)) return [3, 6];
                        _a = resolve;
                        return [4, room_device_model_1.RoomDeviceModel.getDeviceList(espFind.id)];
                    case 5:
                        _a.apply(void 0, [_b.sent()]);
                        return [3, 7];
                    case 6:
                        resolve();
                        _b.label = 7;
                    case 7: return [2];
                }
            });
        }); });
    };
    EspModel.updateOnline = function (espName, online) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var repository, espFind;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = typeorm_1.getRepository(esp_entity_1.Esp);
                        return [4, repository.findOne({ name: espName })];
                    case 1:
                        espFind = _a.sent();
                        if (!!util_1.isUndefined(espFind)) return [3, 3];
                        espFind.online = online;
                        return [4, repository.save(espFind)];
                    case 2:
                        _a.sent();
                        resolve(espFind);
                        return [3, 4];
                    case 3:
                        resolve();
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        }); });
    };
    EspModel.updateAuth = function (espName, auth, online) {
        return __awaiter(this, void 0, void 0, function () {
            var repository, espFind;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = typeorm_1.getRepository(esp_entity_1.Esp);
                        return [4, repository.findOne({ name: espName })];
                    case 1:
                        espFind = _a.sent();
                        if (!!util_1.isUndefined(espFind)) return [3, 3];
                        espFind.auth = auth;
                        espFind.online = online;
                        return [4, repository.update(espFind.id, espFind)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    EspModel.updatePin = function (espName, pins) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var repository, repositoryEspPin, espFind, espPinFind, _loop_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = typeorm_1.getRepository(esp_entity_1.Esp);
                        repositoryEspPin = typeorm_1.getRepository(esp_pin_entity_1.EspPin);
                        return [4, repository.findOne({ name: espName })];
                    case 1:
                        espFind = _a.sent();
                        if (!(!util_1.isUndefined(espFind) && util_1.isObject(pins) && pins.length > 0)) return [3, 9];
                        return [4, repositoryEspPin.find({ esp: espFind })];
                    case 2:
                        espPinFind = _a.sent();
                        if (!(espPinFind.length != pins.length)) return [3, 4];
                        return [4, repositoryEspPin.remove(espPinFind)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _loop_1 = function (i) {
                            var pin, pinFind;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        pin = pins[i];
                                        pinFind = espPinFind.find(function (espPin) { return espPin.input == pin.input; });
                                        if (!!util_1.isUndefined(pinFind)) return [3, 2];
                                        pinFind.status = Boolean(pin.status);
                                        pinFind.outputType = pin.outputType;
                                        pinFind.outputPrimary = pin.outputPrimary;
                                        pinFind.ouputSecondary = pin.outputSecondary;
                                        pinFind.dualToggleCount = pin.dualToggleCount;
                                        return [4, repositoryEspPin.update(pinFind.id, pinFind)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < pins.length)) return [3, 8];
                        return [5, _loop_1(i)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        ++i;
                        return [3, 5];
                    case 8:
                        resolve(espFind);
                        _a.label = 9;
                    case 9: return [2];
                }
            });
        }); });
    };
    EspModel.updateDetail = function (espName, details) {
        return __awaiter(this, void 0, void 0, function () {
            var repository, espFind;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = typeorm_1.getRepository(esp_entity_1.Esp);
                        return [4, repository.findOne({ name: espName })];
                    case 1:
                        espFind = _a.sent();
                        if (!!util_1.isUndefined(espFind)) return [3, 3];
                        espFind.detail_rssi = details.rssi;
                        return [4, repository.update(espFind.id, espFind)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    EspModel.logger = new common_1.Logger("EspModel");
    return EspModel;
}());
exports.EspModel = EspModel;
//# sourceMappingURL=esp.model.js.map