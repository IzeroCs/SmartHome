"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomList = void 0;
var typeorm_1 = require("typeorm");
var room_type_entity_1 = require("./room_type.entity");
var room_device_entity_1 = require("./room_device.entity");
var RoomList = /** @class */ (function () {
    function RoomList() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], RoomList.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], RoomList.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Boolean)
    ], RoomList.prototype, "enable", void 0);
    __decorate([
        typeorm_1.OneToOne(function (type) { return room_type_entity_1.RoomType; }, function (type) { return type.lists; }),
        __metadata("design:type", room_type_entity_1.RoomType)
    ], RoomList.prototype, "type", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return room_device_entity_1.RoomDevice; }, function (device) { return device.room; }),
        __metadata("design:type", Array)
    ], RoomList.prototype, "devices", void 0);
    RoomList = __decorate([
        typeorm_1.Entity()
    ], RoomList);
    return RoomList;
}());
exports.RoomList = RoomList;
//# sourceMappingURL=room_list.entity.js.map