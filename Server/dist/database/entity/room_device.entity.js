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
const typeorm_1 = require("typeorm");
const esp_pin_entity_1 = require("./esp_pin.entity");
const esp_entity_1 = require("./esp.entity");
const room_list_entity_1 = require("./room_list.entity");
const device_type_entity_1 = require("./device_type.entity");
let RoomDevice = class RoomDevice {
};
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
    typeorm_1.ManyToOne(type => device_type_entity_1.DeviceType, type => type.type),
    __metadata("design:type", device_type_entity_1.DeviceType)
], RoomDevice.prototype, "type", void 0);
__decorate([
    typeorm_1.OneToOne(type => esp_pin_entity_1.EspPin, pin => pin.id),
    typeorm_1.JoinColumn(),
    __metadata("design:type", esp_pin_entity_1.EspPin)
], RoomDevice.prototype, "pin", void 0);
__decorate([
    typeorm_1.ManyToOne(type => esp_entity_1.Esp, esp => esp.devices),
    __metadata("design:type", esp_entity_1.Esp)
], RoomDevice.prototype, "esp", void 0);
__decorate([
    typeorm_1.ManyToOne(type => room_list_entity_1.RoomList, room => room.devices),
    __metadata("design:type", room_list_entity_1.RoomList)
], RoomDevice.prototype, "room", void 0);
RoomDevice = __decorate([
    typeorm_1.Entity()
], RoomDevice);
exports.RoomDevice = RoomDevice;
//# sourceMappingURL=room_device.entity.js.map