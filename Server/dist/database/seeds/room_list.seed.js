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
exports.RoomListSeed = void 0;
var base_seed_1 = require("../base.seed");
var room_list_entity_1 = require("../entity/room_list.entity");
var room_type_entity_1 = require("../entity/room_type.entity");
var util_1 = require("util");
var RoomListSeed = /** @class */ (function (_super) {
    __extends(RoomListSeed, _super);
    function RoomListSeed() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.datas = [
            { name: "Phòng khách", type: 1 },
            { name: "Phòng ngủ", type: 2 },
            { name: "Phòng bếp", type: 3 },
            { name: "Phòng tắm", type: 4 },
            { name: "Ban công", type: 5 },
            { name: "Cầu thang", type: 6 },
            { name: "Sân nhà", type: 7 },
            { name: "Gác lửng", type: 8 },
            { name: "Gác mái", type: 9 },
        ];
        return _this;
    }
    RoomListSeed.prototype.seed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var repository, repositoryRoomType, i, data, name_1, type, roomType, room;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repository = this.connection.getRepository(room_list_entity_1.RoomList);
                        repositoryRoomType = this.connection.getRepository(room_type_entity_1.RoomType);
                        return [4 /*yield*/, repository.count()];
                    case 1:
                        if (!((_a.sent()) <= 0)) return [3 /*break*/, 7];
                        this.logSeedRunning();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < this.datas.length)) return [3 /*break*/, 6];
                        data = this.datas[i];
                        name_1 = data["name"];
                        type = parseInt(data["type"]);
                        return [4 /*yield*/, repositoryRoomType.findOne({
                                type: type,
                            })];
                    case 3:
                        roomType = _a.sent();
                        if (!!util_1.isNull(roomType)) return [3 /*break*/, 5];
                        room = new room_list_entity_1.RoomList();
                        room.name = name_1;
                        room.type = roomType;
                        room.enable = true;
                        return [4 /*yield*/, repository.save(room)];
                    case 4:
                        _a.sent();
                        this.logger.debug("Room list " + name_1 + " has been saved");
                        _a.label = 5;
                    case 5:
                        ++i;
                        return [3 /*break*/, 2];
                    case 6:
                        this.logSeedRunned();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return RoomListSeed;
}(base_seed_1.BaseSeed));
exports.RoomListSeed = RoomListSeed;
//# sourceMappingURL=room_list.seed.js.map