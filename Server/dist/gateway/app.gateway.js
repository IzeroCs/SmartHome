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
exports.AppGateway = exports.EVENTS = void 0;
var websockets_1 = require("@nestjs/websockets");
var common_1 = require("@nestjs/common");
var socket_util_1 = require("../util/socket.util");
var util_1 = require("util");
var esp_gateway_1 = require("./esp.gateway");
var cert_security_1 = require("../security/cert.security");
var ormconfig_1 = require("../ormconfig");
var room_type_model_1 = require("../database/model/room_type.model");
var room_type_entity_1 = require("../database/entity/room_type.entity");
var room_list_model_1 = require("../database/model/room_list.model");
var room_list_entity_1 = require("../database/entity/room_list.entity");
var room_device_model_1 = require("../database/model/room_device.model");
var room_device_entity_1 = require("../database/entity/room_device.entity");
exports.EVENTS = {
    AUTH: "auth",
    ROOM_TYPE: "room-type",
    ROOM_LIST: "room-list",
    ROOM_DEVICE: "room-device",
    ESP_LIST: "esp-list",
    COMMIT_ROOM_DEVICE: "commit-room-device"
};
var AppGateway = (function () {
    function AppGateway() {
        this.logger = new common_1.Logger("AppGateway");
        this.cert = new cert_security_1.CertSecurity("app");
        this.devices = {};
        AppGateway_1.instance = this;
    }
    AppGateway_1 = AppGateway;
    AppGateway.prototype.afterInit = function (server) {
        this.logger.log("Socket /platform-app initialized");
        socket_util_1.SocketUtil.removing(this.server, this.logger);
    };
    AppGateway.prototype.handleConnection = function (client) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.logger.log("Client connection: " + client.id);
        socket_util_1.SocketUtil.restoring(this.server, client);
        setTimeout(function () {
            Notify.unAuthorized(client);
        }, 5000);
    };
    AppGateway.prototype.handleDisconnect = function (client) {
        this.logger.log("Client disconnect: " + client.id);
        this.removeDevice(client);
        socket_util_1.SocketUtil.removing(this.server);
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
    AppGateway.prototype.handleRoomType = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.roomTypes(client);
    };
    AppGateway.prototype.handleRoomList = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.roomList(client);
    };
    AppGateway.prototype.handleRoomDevice = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.roomDevice(client, payload);
    };
    AppGateway.prototype.handleEspList = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.espModules(client);
    };
    AppGateway.prototype.handleCommitRoomDevice = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.commitRoomDevice(client, payload);
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
        return !util_1.isUndefined(id) && id.startsWith("APP");
    };
    var AppGateway_1;
    AppGateway.instance = null;
    __decorate([
        websockets_1.WebSocketServer(),
        __metadata("design:type", Object)
    ], AppGateway.prototype, "server", void 0);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.AUTH),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleAuth", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.ROOM_TYPE),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleRoomType", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.ROOM_LIST),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleRoomList", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.ROOM_DEVICE),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleRoomDevice", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.ESP_LIST),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleEspList", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.COMMIT_ROOM_DEVICE),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleCommitRoomDevice", null);
    AppGateway = AppGateway_1 = __decorate([
        websockets_1.WebSocketGateway({
            namespace: "/platform-app",
            pingTimeout: 5000,
            pingInterval: 100
        }),
        __metadata("design:paramtypes", [])
    ], AppGateway);
    return AppGateway;
}());
exports.AppGateway = AppGateway;
var Notify = (function () {
    function Notify() {
    }
    Notify.unAuthorized = function (client) {
        if (esp_gateway_1.EspGateway.isClientAuth(client))
            return;
        AppGateway.getLogger().log("Disconnect socket unauthorized: " + client.id);
        client.emit(exports.EVENTS.AUTH, "unauthorized");
        client.disconnect(false);
    };
    Notify.espModules = function (client) {
        if (client) {
            if (AppGateway.isClientAuth(client))
                client.emit(exports.EVENTS.ESP_LIST, esp_gateway_1.EspGateway.getModules());
        }
        else {
            AppGateway.getInstance().server.emit(exports.EVENTS.ESP_LIST, esp_gateway_1.EspGateway.getModules());
        }
    };
    Notify.roomTypes = function (client) {
        room_type_model_1.RoomTypeModel.getAll()
            .then(function (list) {
            if (list.length <= 0)
                return client.emit(exports.EVENTS.ROOM_TYPE, []);
            else
                client.emit(exports.EVENTS.ROOM_TYPE, list);
        })
            .catch(function (err) { return client.emit(exports.EVENTS.ROOM_TYPE, []); });
    };
    Notify.roomList = function (client) {
        room_list_model_1.RoomListModel.getAll()
            .then(function (list) {
            if (list.length <= 0)
                return client.emit(exports.EVENTS.ROOM_LIST, []);
            else
                client.emit(exports.EVENTS.ROOM_LIST, list);
        })
            .catch(function (err) { return client.emit(exports.EVENTS.ROOM_LIST, []); });
    };
    Notify.roomDevice = function (client, payload) {
        payload = Pass.roomDevice(payload);
        room_device_model_1.RoomDeviceModel.getList(payload.id)
            .then(function (list) {
            if (list.length <= 0)
                return client.emit(exports.EVENTS.ROOM_DEVICE, []);
            else
                return client.emit(exports.EVENTS.ROOM_DEVICE, list);
        })
            .catch(function (err) { return client.emit(exports.EVENTS.ROOM_DEVICE, []); });
    };
    Notify.commitRoomDevice = function (client, payload) {
        payload = Pass.roomDevice(payload);
        room_device_model_1.RoomDeviceModel.updateDevice(payload.id, payload)
            .then(function (entity) { return client.emit(exports.EVENTS.COMMIT_ROOM_DEVICE, entity); })
            .catch(function (error) { return client.emit(exports.EVENTS.COMMIT_ROOM_DEVICE, error); });
    };
    return Notify;
}());
var Pass = (function () {
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
            token: ""
        }, obj);
    };
    Pass.roomDevice = function (obj) {
        return Pass.def({
            id: ""
        }, obj);
    };
    return Pass;
}());
//# sourceMappingURL=app.gateway.js.map