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
exports.EspGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var common_1 = require("@nestjs/common");
var socket_util_1 = require("../util/socket.util");
var cert_security_1 = require("../security/cert.security");
var network_util_1 = require("../util/network.util");
var util_1 = require("util");
var app_gateway_1 = require("./app.gateway");
var EspGateway = /** @class */ (function () {
    function EspGateway() {
        this.logger = new common_1.Logger('EspGateway');
        this.cert = new cert_security_1.CertSecurity('esp');
        this.modules = {};
        EspGateway_1.instance = this;
    }
    EspGateway_1 = EspGateway;
    EspGateway.prototype.afterInit = function (server) {
        this.logger.log('Init socket platform esp');
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
        }, 1000);
    };
    EspGateway.prototype.handleDisconnect = function (client) {
        this.logger.log("Client disconnect: " + client.id);
        this.updateModule(client, false);
        socket_util_1.SocketUtil.removing(this.server, this.logger);
    };
    EspGateway.prototype.handleAuth = function (client, payload) {
        var _this = this;
        if (EspGateway_1.isClientAuth(client))
            return this.logger.log("Authenticate already");
        payload = Pass.auth(payload);
        if (!EspGateway_1.isEspID(payload.id))
            return Notify.unAuthorized(client);
        client.id = payload.id;
        this.updateModule(client, true);
        this.cert.verify(payload.token, function (err, authorized) {
            if (!err && authorized) {
                _this.logger.log("Authenticate socket " + client.id);
                client['auth'] = true;
                client.emit('auth', 'authorized');
            }
            else {
                Notify.unAuthorized(client);
            }
        });
    };
    EspGateway.prototype.handleSyncIO = function (client, payload) {
        if (!EspGateway_1.isClientAuth(client))
            return;
        var espIO = Pass.io(payload)['io'];
        var ioData = espIO.data;
        var ioChaged = espIO.changed === 1;
        var pinData = null;
        var pinObj = null;
        var pinList = [];
        for (var i = 0; i < ioData.length; ++i) {
            pinData = ioData[i].replace(/\=/g, ':');
            pinData = pinData.replace(/([a-z0-9]+):([0-9]+)/gi, '"$1":$2');
            pinData = '{' + pinData + '}';
            try {
                pinObj = JSON.parse(pinData);
                pinList.push(pinObj);
            }
            catch (e) { }
        }
        if (util_1.isObject(this.modules[client.id])) {
            this.modules[client.id].pins.data = pinList;
            this.modules[client.id].pins.changed = ioChaged;
            app_gateway_1.AppGateway.notifyEspModules();
        }
    };
    EspGateway.prototype.handleSyncDetail = function (client, payload) {
        if (!EspGateway_1.isClientAuth(client))
            return;
        var oldDetail = Pass.detail(this.modules[client.id]);
        var newDetail = Pass.detail(payload);
        var oldSignal = network_util_1.NetworkUtil.calculateSignalLevel(oldDetail['detail']['data']['rssi']);
        var newSignal = network_util_1.NetworkUtil.calculateSignalLevel(newDetail['detail']['data']['rssi']);
        if (oldSignal !== newSignal) {
            this.modules[client.id].detail = newDetail['detail'];
            app_gateway_1.AppGateway.notifyEspModules();
        }
    };
    EspGateway.prototype.updateModule = function (client, online) {
        this.modules[client.id] = Pass.module(this.modules[client.id]);
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
        return client['auth'] === true;
    };
    EspGateway.isEspID = function (id) {
        return !util_1.isUndefined(id) && id.startsWith('ESP');
    };
    var EspGateway_1;
    EspGateway.instance = null;
    __decorate([
        websockets_1.WebSocketServer(),
        __metadata("design:type", Object)
    ], EspGateway.prototype, "server", void 0);
    __decorate([
        websockets_1.SubscribeMessage('auth'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], EspGateway.prototype, "handleAuth", null);
    __decorate([
        websockets_1.SubscribeMessage('sync-io'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], EspGateway.prototype, "handleSyncIO", null);
    __decorate([
        websockets_1.SubscribeMessage('sync-detail'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], EspGateway.prototype, "handleSyncDetail", null);
    EspGateway = EspGateway_1 = __decorate([
        websockets_1.WebSocketGateway({
            namespace: '/platform-esp',
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
        client.emit('auth', 'unauthorized');
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
            id: '',
            token: '',
        }, obj);
    };
    Pass.module = function (obj) {
        return Pass.def({
            online: true,
            pins: { data: [], changed: false },
            detail: { data: {} },
        }, obj);
    };
    Pass.io = function (obj) {
        return Pass.def({
            io: {
                data: [],
                changed: false,
            },
        }, obj);
    };
    Pass.detail = function (obj) {
        return Pass.def({
            detail: {
                data: { rssi: network_util_1.NetworkUtil.MIN_RSSI },
            },
        }, obj);
    };
    return Pass;
}());
//# sourceMappingURL=esp.gateway.js.map