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
exports.RoomDevice = void 0;
var typeorm_1 = require("typeorm");
var esp_pin_entity_1 = require("./esp_pin.entity");
var esp_entity_1 = require("./esp.entity");
var room_list_entity_1 = require("./room_list.entity");
var device_type_entity_1 = require("./device_type.entity");
var RoomDevice = (function () {
    function RoomDevice() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], RoomDevice.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], RoomDevice.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column({ default: "", nullable: true }),
        __metadata("design:type", String)
    ], RoomDevice.prototype, "descriptor", void 0);
    __decorate([
        typeorm_1.Column("tinyint", { default: 0 }),
        __metadata("design:type", Number)
    ], RoomDevice.prototype, "widget", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return device_type_entity_1.DeviceType; }, function (type) { return type.type; }),
        __metadata("design:type", device_type_entity_1.DeviceType)
    ], RoomDevice.prototype, "type", void 0);
    __decorate([
        typeorm_1.OneToOne(function (type) { return esp_pin_entity_1.EspPin; }, function (pin) { return pin.id; }),
        typeorm_1.JoinColumn(),
        __metadata("design:type", esp_pin_entity_1.EspPin)
    ], RoomDevice.prototype, "pin", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return esp_entity_1.Esp; }, function (esp) { return esp.devices; }),
        __metadata("design:type", esp_entity_1.Esp)
    ], RoomDevice.prototype, "esp", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return room_list_entity_1.RoomList; }, function (room) { return room.devices; }),
        __metadata("design:type", room_list_entity_1.RoomList)
    ], RoomDevice.prototype, "room", void 0);
    RoomDevice = __decorate([
        typeorm_1.Entity()
    ], RoomDevice);
    return RoomDevice;
}());
exports.RoomDevice = RoomDevice;
//# sourceMappingURL=room_device.entity.js.map