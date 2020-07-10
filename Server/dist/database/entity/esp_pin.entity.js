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
exports.EspPin = void 0;
var typeorm_1 = require("typeorm");
var esp_entity_1 = require("./esp.entity");
var room_device_entity_1 = require("./room_device.entity");
var esp_gateway_1 = require("../../gateway/esp.gateway");
var EspPin = (function () {
    function EspPin() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        typeorm_1.OneToOne(function (type) { return room_device_entity_1.RoomDevice; }, function (device) { return device.pin; }),
        __metadata("design:type", Number)
    ], EspPin.prototype, "id", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return esp_entity_1.Esp; }, function (esp) { return esp.pins; }),
        __metadata("design:type", esp_entity_1.Esp)
    ], EspPin.prototype, "esp", void 0);
    __decorate([
        typeorm_1.Column("tinyint", { nullable: true }),
        __metadata("design:type", String)
    ], EspPin.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column("tinyint"),
        __metadata("design:type", Number)
    ], EspPin.prototype, "input", void 0);
    __decorate([
        typeorm_1.Column("tinyint"),
        __metadata("design:type", Number)
    ], EspPin.prototype, "outputType", void 0);
    __decorate([
        typeorm_1.Column("tinyint"),
        __metadata("design:type", Number)
    ], EspPin.prototype, "outputPrimary", void 0);
    __decorate([
        typeorm_1.Column("tinyint"),
        __metadata("design:type", Number)
    ], EspPin.prototype, "ouputSecondary", void 0);
    __decorate([
        typeorm_1.Column("tinyint", { nullable: true, default: 0 }),
        __metadata("design:type", Number)
    ], EspPin.prototype, "dualToggleCount", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true, default: 1 }),
        __metadata("design:type", Number)
    ], EspPin.prototype, "statusCloud", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true, default: false }),
        __metadata("design:type", Boolean)
    ], EspPin.prototype, "status", void 0);
    EspPin = __decorate([
        typeorm_1.Entity()
    ], EspPin);
    return EspPin;
}());
exports.EspPin = EspPin;
//# sourceMappingURL=esp_pin.entity.js.map