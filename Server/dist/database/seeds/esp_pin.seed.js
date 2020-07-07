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
exports.EspPinSeed = void 0;
var base_seed_1 = require("../base.seed");
var esp_pin_entity_1 = require("../entity/esp_pin.entity");
var esp_entity_1 = require("../entity/esp.entity");
var util_1 = require("util");
var EspPinSeed = (function (_super) {
    __extends(EspPinSeed, _super);
    function EspPinSeed() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.esps = {
            ESP1N403E91636RSC185G2K: [
                {
                    input: 0,
                    outputType: 0,
                    outputPrimary: 0,
                    outputSecondary: 1
                },
                {
                    input: 1,
                    outputType: 3,
                    outputPrimary: 1,
                    outputSecondary: 1
                },
                {
                    input: 2,
                    outputType: 2,
                    outputPrimary: 2,
                    outputSecondary: 3
                },
                {
                    input: 3,
                    outputType: 3,
                    outputPrimary: 3,
                    outputSecondary: 3
                },
                {
                    input: 4,
                    outputType: 2,
                    outputPrimary: 4,
                    outputSecondary: 5
                },
                {
                    input: 5,
                    outputType: 3,
                    outputPrimary: 5,
                    outputSecondary: 5
                },
                {
                    input: 6,
                    outputType: 1,
                    outputPrimary: 6,
                    outputSecondary: 6
                },
                {
                    input: 7,
                    outputType: 1,
                    outputPrimary: 7,
                    outputSecondary: 7
                }
            ]
        };
        return _this;
    }
    EspPinSeed.prototype.seed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var repository, repositoryEsp, keys, i, espName, pins, espFind, pinCount, p, pin, pinRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = this.connection.getRepository(esp_pin_entity_1.EspPin);
                        repositoryEsp = this.connection.getRepository(esp_entity_1.Esp);
                        keys = Object.keys(this.esps);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < keys.length)) return [3, 9];
                        espName = keys[i];
                        pins = this.esps[espName];
                        return [4, repositoryEsp.findOne({ name: espName })];
                    case 2:
                        espFind = _a.sent();
                        if (!!util_1.isNull(espFind)) return [3, 8];
                        return [4, repository.count({ esp: espFind })];
                    case 3:
                        pinCount = _a.sent();
                        if (pinCount >= pins.length)
                            return [2];
                        else
                            this.logSeedRunning();
                        p = 0;
                        _a.label = 4;
                    case 4:
                        if (!(p < pins.length)) return [3, 7];
                        pin = pins[p];
                        pinRecord = new esp_pin_entity_1.EspPin();
                        pinRecord.esp = espFind;
                        pinRecord.input = pin.input;
                        pinRecord.outputType = pin.outputType;
                        pinRecord.outputPrimary = pin.outputPrimary;
                        pinRecord.ouputSecondary = pin.outputSecondary;
                        return [4, repository.save(pinRecord)];
                    case 5:
                        _a.sent();
                        this.logger.debug("Pin " + pin.input + " added for " + espFind.name);
                        _a.label = 6;
                    case 6:
                        ++p;
                        return [3, 4];
                    case 7:
                        this.logger.debug("Esp " + espFind.name + " add pin successfully");
                        this.logSeedRunned();
                        _a.label = 8;
                    case 8:
                        ++i;
                        return [3, 1];
                    case 9: return [2];
                }
            });
        });
    };
    return EspPinSeed;
}(base_seed_1.BaseSeed));
exports.EspPinSeed = EspPinSeed;
//# sourceMappingURL=esp_pin.seed.js.map