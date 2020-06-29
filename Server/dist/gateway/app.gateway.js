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
exports.AppGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var common_1 = require("@nestjs/common");
var socket_util_1 = require("../util/socket.util");
var util_1 = require("util");
var esp_gateway_1 = require("./esp.gateway");
var cert_security_1 = require("../security/cert.security");
var AppGateway = /** @class */ (function () {
    function AppGateway() {
        this.logger = new common_1.Logger("AppGateway");
        this.cert = new cert_security_1.CertSecurity("app");
        this.devices = {};
        AppGateway_1.instance = this;
    }
    AppGateway_1 = AppGateway;
    AppGateway.prototype.afterInit = function (server) {
        this.logger.log("Init socket platform app");
        socket_util_1.SocketUtil.removing(this.server, this.logger);
    };
    AppGateway.prototype.handleConnection = function (client) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.logger.log("Client connection: " + client.id);
        socket_util_1.SocketUtil.restoring(this.server, client, this.logger);
        setTimeout(function () {
            Notify.unAuthorized(client);
        }, 1000);
    };
    AppGateway.prototype.handleDisconnect = function (client) {
        this.logger.log("Client disconnect: " + client.id);
        this.removeDevice(client);
    };
    AppGateway.prototype.handleAuth = function (client, payload) {
        var _this = this;
        if (AppGateway_1.isClientAuth(client))
            return this.logger.log("Authenticate already");
        payload = Pass.auth(payload);
        if (!AppGateway_1.isAppID(payload.id))
            return Notify.unAuthorized(client);
        client.id = payload.id;
        this.devices[client.id] = {};
        this.cert.verify(payload.token, function (err, authorized) {
            if (!err && authorized) {
                _this.logger.log("Authenticate socket " + client.id);
                client["auth"] = true;
                client.emit("auth", "authorized");
                Notify.espModules(client);
                Notify.roomTypes(client);
                Notify.roomList(client);
            }
            else {
                Notify.unAuthorized(client);
            }
        });
    };
    AppGateway.prototype.removeDevice = function (client) {
        if (!util_1.isUndefined(client.id))
            delete this.devices[client.id];
    };
    AppGateway.getInstance = function () {
        return AppGateway_1.instance;
    };
    AppGateway.getLogger = function () {
        return AppGateway_1.getInstance().logger;
    };
    AppGateway.notifyEspModules = function (client) {
        Notify.espModules(client);
    };
    AppGateway.isClientAuth = function (client) {
        return client["auth"] === true;
    };
    AppGateway.isAppID = function (id) {
        return !util_1.isUndefined(id) && id.startsWith("ESP");
    };
    var AppGateway_1;
    AppGateway.instance = null;
    __decorate([
        websockets_1.WebSocketServer(),
        __metadata("design:type", Object)
    ], AppGateway.prototype, "server", void 0);
    __decorate([
        websockets_1.SubscribeMessage("auth"),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleAuth", null);
    AppGateway = AppGateway_1 = __decorate([
        websockets_1.WebSocketGateway({
            namespace: "/platform-app",
            pingTimeout: 5000,
            pingInterval: 1000,
        }),
        __metadata("design:paramtypes", [])
    ], AppGateway);
    return AppGateway;
}());
exports.AppGateway = AppGateway;
var Notify = /** @class */ (function () {
    function Notify() {
    }
    Notify.unAuthorized = function (client) {
        if (esp_gateway_1.EspGateway.isClientAuth(client))
            return;
        AppGateway.getLogger().log("Disconnect socket unauthorized: " + client.id);
        client.emit("auth", "unauthorized");
        client.disconnect(true);
    };
    Notify.espModules = function (client) {
        if (client) {
            if (AppGateway.isClientAuth(client))
                client.emit("esp-list", esp_gateway_1.EspGateway.getModules());
        }
        else {
            AppGateway.getInstance().server.emit("esp-list", esp_gateway_1.EspGateway.getModules());
        }
    };
    Notify.roomTypes = function (client) { };
    Notify.roomList = function (client) { };
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
    return Pass;
}());
//# sourceMappingURL=app.gateway.js.map