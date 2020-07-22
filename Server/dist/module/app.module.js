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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_gateway_1 = require("../gateway/app.gateway");
const esp_gateway_1 = require("../gateway/esp.gateway");
const seed_1 = require("../database/seed");
const OrmConfig = require("../ormconfig");
const typeorm_2 = require("typeorm");
let AppModule = class AppModule {
    constructor(connection) {
        this.connection = connection;
        const seed = new seed_1.SeedDatabase(connection);
        seed.seed();
    }
};
AppModule = __decorate([
    common_1.Module({
        imports: [typeorm_1.TypeOrmModule.forRoot(OrmConfig)],
        controllers: [],
        providers: [app_gateway_1.AppGateway, esp_gateway_1.EspGateway],
        exports: [typeorm_1.TypeOrmModule]
    }),
    __metadata("design:paramtypes", [typeorm_2.Connection])
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map