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
exports.Esp = void 0;
const typeorm_1 = require("typeorm");
const esp_pin_entity_1 = require("./esp_pin.entity");
const room_device_entity_1 = require("./room_device.entity");
let Esp = class Esp {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Esp.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Esp.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Esp.prototype, "online", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Esp.prototype, "auth", void 0);
__decorate([
    typeorm_1.Column({ default: -100 }),
    __metadata("design:type", String)
], Esp.prototype, "detail_rssi", void 0);
__decorate([
    typeorm_1.OneToMany(type => room_device_entity_1.RoomDevice, device => device.esp),
    __metadata("design:type", Array)
], Esp.prototype, "devices", void 0);
__decorate([
    typeorm_1.OneToMany(type => esp_pin_entity_1.EspPin, pin => pin.esp),
    __metadata("design:type", Array)
], Esp.prototype, "pins", void 0);
Esp = __decorate([
    typeorm_1.Entity()
], Esp);
exports.Esp = Esp;
//# sourceMappingURL=esp.entity.js.map