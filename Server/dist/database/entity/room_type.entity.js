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
exports.RoomType = void 0;
const typeorm_1 = require("typeorm");
const room_list_entity_1 = require("./room_list.entity");
let RoomType = class RoomType {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], RoomType.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], RoomType.prototype, "name", void 0);
__decorate([
    typeorm_1.Column("tinyint"),
    __metadata("design:type", Number)
], RoomType.prototype, "type", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], RoomType.prototype, "enable", void 0);
__decorate([
    typeorm_1.OneToMany(type => room_list_entity_1.RoomList, room => room.type),
    __metadata("design:type", Array)
], RoomType.prototype, "lists", void 0);
RoomType = __decorate([
    typeorm_1.Entity()
], RoomType);
exports.RoomType = RoomType;
//# sourceMappingURL=room_type.entity.js.map