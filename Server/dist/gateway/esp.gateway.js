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
exports.EspGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var common_1 = require("@nestjs/common");
var socket_util_1 = require("../util/socket.util");
var cert_security_1 = require("../security/cert.security");
var network_util_1 = require("../util/network.util");
var util_1 = require("util");
var app_gateway_1 = require("./app.gateway");
var esp_entity_1 = require("../database/entity/esp.entity");
var esp_model_1 = require("../database/model/esp.model");
var ormconfig_1 = require("../ormconfig");
var EspGateway = /** @class */ (function () {
    function EspGateway() {
        this.logger = new common_1.Logger("EspGateway");
        this.cert = new cert_security_1.CertSecurity("esp");
        this.modules = {};
        EspGateway_1.instance = this;
    }
    EspGateway_1 = EspGateway;
    EspGateway.prototype.afterInit = function (server) {
        this.logger.log("Socket /platform-esp initialized");
        socket_util_1.SocketUtil.removing(this.server, this.logger);
    };
    EspGateway.prototype.handleConnection = function (client) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.logger.log("Client connection: " + client.id);
        socket_util_1.SocketUtil.restoring(this.server, client, this.logger);
        setTimeout(function () {
            Notify.unAuthorized(client);
        }, 5000);
    };
    EspGateway.prototype.handleDisconnect = function (client) {
        this.logger.log("Client disconnect: " + client.id);
        this.updateModule(client, false);
        esp_model_1.EspModel.updateOnline(client.id, false);
        socket_util_1.SocketUtil.removing(this.server, this.logger);
    };
    EspGateway.prototype.handleAuth = function (client, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (EspGateway_1.isClientAuth(client))
                    return [2 /*return*/, this.logger.log("Authenticate already")];
                payload = Pass.auth(payload);
                if (!EspGateway_1.isEspID(payload.id))
                    return [2 /*return*/, Notify.unAuthorized(client)];
                client.id = payload.id;
                esp_model_1.EspModel.add(client.id);
                this.updateModule(client, true);
                this.cert.verify(payload.token, function (err, authorized) {
                    if (!err && authorized) {
                        _this.logger.log("Authenticate socket " + client.id);
                        esp_model_1.EspModel.updateAuth(client.id, true, true);
                        client["auth"] = true;
                        client.emit("auth", "authorized");
                    }
                    else {
                        Notify.unAuthorized(client);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    EspGateway.prototype.handleSyncIO = function (client, payload) {
        if (!EspGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        var espIO = Pass.io(payload);
        var pinData = espIO.pins;
        var pinChanged = espIO.changed;
        if (util_1.isArray(pinData)) {
            for (var i = 0; i < pinData.length; ++i)
                pinData[i] = Pass.pin(pinData[i]);
        }
        if (!util_1.isUndefined(this.modules[client.id])) {
            this.modules[client.id].pins = pinData;
            this.modules[client.id].changed = pinChanged;
            if (pinChanged) {
                esp_model_1.EspModel.updatePin(client.id, pinData);
                app_gateway_1.AppGateway.notifyEspModules();
            }
        }
    };
    EspGateway.prototype.handleSyncDetail = function (client, payload) {
        if (!EspGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        var oldDetail = Pass.detail(this.modules[client.id]);
        var newDetail = Pass.detail(payload);
        var oldSignal = network_util_1.NetworkUtil.calculateSignalLevel(oldDetail.detail_rssi);
        var newSignal = network_util_1.NetworkUtil.calculateSignalLevel(newDetail.detail_rssi);
        if (oldSignal !== newSignal) {
            this.modules[client.id].detail_rssi = newDetail.detail_rssi;
            esp_model_1.EspModel.updateDetail(client.id, {
                rssi: newDetail.detail_rssi,
            });
            app_gateway_1.AppGateway.notifyEspModules();
        }
    };
    EspGateway.prototype.updateModule = function (client, online) {
        this.modules[client.id] = Pass.module(this.modules[client.id]);
        this.modules[client.id].name = client.id;
        this.modules[client.id].online = online;
    };
    EspGateway.getInstance = function () {
        return EspGateway_1.instance;
    };
    EspGateway.getLogger = function () {
        return EspGateway_1.getInstance().logger;
    };
    EspGateway.getModules = function () {
        return EspGateway_1.getInstance().modules;
    };
    EspGateway.isClientAuth = function (client) {
        return client["auth"] === true;
    };
    EspGateway.isEspID = function (id) {
        return !util_1.isUndefined(id) && id.startsWith("ESP");
    };
    var EspGateway_1;
    EspGateway.instance = null;
    __decorate([
        websockets_1.WebSocketServer(),
        __metadata("design:type", Object)
    ], EspGateway.prototype, "server", void 0);
    __decorate([
        websockets_1.SubscribeMessage("auth"),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], EspGateway.prototype, "handleAuth", null);
    __decorate([
        websockets_1.SubscribeMessage("sync-io"),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], EspGateway.prototype, "handleSyncIO", null);
    __decorate([
        websockets_1.SubscribeMessage("sync-detail"),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], EspGateway.prototype, "handleSyncDetail", null);
    EspGateway = EspGateway_1 = __decorate([
        websockets_1.WebSocketGateway({
            namespace: "/platform-esp",
            pingTimeout: 5000,
            pingInterval: 1000,
        }),
        __metadata("design:paramtypes", [])
    ], EspGateway);
    return EspGateway;
}());
exports.EspGateway = EspGateway;
var Notify = /** @class */ (function () {
    function Notify() {
    }
    Notify.unAuthorized = function (client) {
        if (EspGateway.isClientAuth(client))
            return;
        EspGateway.getLogger().log("Disconnect socket unauthorized: " + client.id);
        esp_model_1.EspModel.updateAuth(client.id, false, false);
        client.emit("auth", "unauthorized");
        client.disconnect(true);
    };
    return Notify;
}());
var Pass = /** @class */ (function () {
    function Pass() {
    }
    Pass.def = function (objSrc, objDest) {
        var _this = this;
        if (util_1.isUndefined(objSrc))
            return {};
        if (util_1.isUndefined(objDest) || util_1.isNull(objDest))
            objDest = {};
        if (!util_1.isObject(objDest))
            return objDest;
        Object.keys(objSrc).forEach(function (key) {
            if (util_1.isUndefined(objDest[key]))
                objDest[key] = objSrc[key];
            else
                objDest[key] = _this.def(objSrc[key], objDest[key]);
        });
        return objDest;
    };
    Pass.auth = function (obj) {
        return Pass.def({
            id: "",
            token: "",
        }, obj);
    };
    Pass.module = function (obj) {
        return Pass.def({
            name: "",
            online: false,
            auth: false,
            changed: false,
            pins: [],
            detail_rssi: network_util_1.NetworkUtil.MIN_RSSI,
        }, obj);
    };
    Pass.io = function (obj) {
        return Pass.def({
            pins: [],
            changed: "0",
        }, obj);
    };
    Pass.pin = function (obj) {
        return Pass.def({
            input: 0,
            outputType: 0,
            outputPrimary: 0,
            outputSecondary: 0,
            dualToggleCount: 0,
            status: 0,
        }, obj);
    };
    Pass.detail = function (obj) {
        return Pass.def({
            detail_rssi: network_util_1.NetworkUtil.MIN_RSSI,
        }, obj);
    };
    return Pass;
}());
//# sourceMappingURL=esp.gateway.js.map