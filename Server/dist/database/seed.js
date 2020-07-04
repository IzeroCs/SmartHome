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
exports.SeedDatabase = void 0;
var fs = require("fs");
var util_1 = require("util");
var room_type_seed_1 = require("./seeds/room_type.seed");
var room_list_seed_1 = require("./seeds/room_list.seed");
var esp_seed_1 = require("./seeds/esp.seed");
var esp_pin_seed_1 = require("./seeds/esp_pin.seed");
var room_device_seed_1 = require("./seeds/room_device.seed");
var device_type_seed_1 = require("./seeds/device_type.seed");
var SeedDatabase = /** @class */ (function () {
    function SeedDatabase(connection) {
        this.seeds = {
            RoomTypeSeed: room_type_seed_1.RoomTypeSeed,
            RoomListSeed: room_list_seed_1.RoomListSeed,
            EspSeed: esp_seed_1.EspSeed,
            EspPinSeed: esp_pin_seed_1.EspPinSeed,
            DeviceTypeSeed: device_type_seed_1.DeviceTypeSeed,
            RoomDeviceSeed: room_device_seed_1.RoomDeviceSeed,
        };
        this.connection = connection;
    }
    SeedDatabase.prototype.seed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var readdir, modules, _a, _b, _i, i, file, module_1, keys_1, keys, i, key, seed;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        readdir = fs.readdirSync(__dirname + "/seeds");
                        modules = [];
                        _a = [];
                        for (_b in readdir)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        i = _a[_i];
                        file = readdir[i];
                        if (!file.toLowerCase().endsWith(".seed.js")) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require(__dirname + "/seeds/" + file); })];
                    case 2:
                        module_1 = _c.sent();
                        keys_1 = Object.keys(module_1);
                        if (keys_1.length > 0)
                            modules[keys_1[0]] = module_1[keys_1[0]];
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        keys = Object.keys(this.seeds);
                        i = 0;
                        _c.label = 5;
                    case 5:
                        if (!(i < keys.length)) return [3 /*break*/, 8];
                        key = keys[i];
                        if (!!util_1.isUndefined(modules[key])) return [3 /*break*/, 7];
                        seed = new modules[key](this.connection, key);
                        if (!(!util_1.isUndefined(seed) && !util_1.isUndefined(seed.seed))) return [3 /*break*/, 7];
                        seed.log().log("Seeder " + key + " running...");
                        return [4 /*yield*/, seed.seed()];
                    case 6:
                        _c.sent();
                        seed.log().log("Seeder " + key + " runned");
                        _c.label = 7;
                    case 7:
                        ++i;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return SeedDatabase;
}());
exports.SeedDatabase = SeedDatabase;
//# sourceMappingURL=seed.js.map