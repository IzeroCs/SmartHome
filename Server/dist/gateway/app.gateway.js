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
var esp_model_1 = require("../database/model/esp.model");
var entity_util_1 = require("../database/util/entity.util");
exports.EVENTS = {
    AUTH: "auth",
    ESP_LIST: "esp-list",
    ESP_DEVICES: "esp-devices",
    ROOM_TYPE: "room-type",
    ROOM_LIST: "room-list",
    ROOM_DEVICE: "room-device",
    ROOM_DEVICE_ITEM: "room-device-item",
    STATUS_CLOUD: "status-cloud",
    QUERY_ROOM_DEVICE: "query-room-device",
    COMMIT_ROOM_DEVICE: "commit-room-device",
    COMMIT_STATUS_ROOM_DEVICE: "commit-status-room-device"
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
        setTimeout(function () { return Notify.unAuthorized(client); }, 5000);
    };
    AppGateway.prototype.handleDisconnect = function (client) {
        this.logger.log("Client disconnect: " + client.id);
        this.removeDevice(client);
        socket_util_1.SocketUtil.removing(this.server);
    };
    AppGateway.prototype.handleAuth = function (client, payload) {
        var _this = this;
        payload = Pass.auth(payload);
        if (AppGateway_1.isClientAuth(client))
            return this.logger.log("Authenticate already");
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
    AppGateway.prototype.handleRoomDeviceItem = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.roomDeviceItem(client, payload);
    };
    AppGateway.prototype.handleEspList = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.espModules(client);
    };
    AppGateway.prototype.handleEspDevices = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
    };
    AppGateway.prototype.handleQueryRoomDevice = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.queryRoomDevice(client, payload);
    };
    AppGateway.prototype.handleCommitRoomDevice = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.commitRoomDevice(client, payload);
    };
    AppGateway.prototype.handleCommitStatusRoomDevice = function (client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.commitStatusRoomDevice(client, payload);
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
    AppGateway.notifyEspDevices = function (client, listOrId) {
        Notify.espDevices(client, listOrId);
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
        websockets_1.SubscribeMessage(exports.EVENTS.ROOM_DEVICE_ITEM),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleRoomDeviceItem", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.ESP_LIST),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleEspList", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.ESP_DEVICES),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleEspDevices", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.QUERY_ROOM_DEVICE),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleQueryRoomDevice", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.COMMIT_ROOM_DEVICE),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleCommitRoomDevice", null);
    __decorate([
        websockets_1.SubscribeMessage(exports.EVENTS.COMMIT_STATUS_ROOM_DEVICE),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], AppGateway.prototype, "handleCommitStatusRoomDevice", null);
    AppGateway = AppGateway_1 = __decorate([
        websockets_1.WebSocketGateway({
            namespace: "/platform-app",
            pingTimeout: 5000,
            pingInterval: 500
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
        if (AppGateway.isClientAuth(client))
            return;
        AppGateway.getLogger().log("Disconnect socket unauthorized: " + client.id);
        client.emit(exports.EVENTS.AUTH, "unauthorized");
        client.disconnect();
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
    Notify.espDevices = function (client, listOrId) {
        if (util_1.isNumber(listOrId) || util_1.isString(listOrId)) {
            esp_model_1.EspModel.getEspDevice(listOrId).then(function (list) {
                Notify.espDevices(client, list);
            });
            return;
        }
        if (client)
            client.emit(exports.EVENTS.ESP_DEVICES, listOrId);
        else
            AppGateway.getInstance().server.emit(exports.EVENTS.ESP_DEVICES, listOrId);
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
    Notify.roomDeviceItem = function (client, payload) {
        if (client && payload) {
            if (AppGateway.isClientAuth(client))
                client.emit(exports.EVENTS.ROOM_DEVICE_ITEM, esp_gateway_1.EspGateway.getModules());
        }
        else if (payload) {
            AppGateway.getInstance().server.emit(exports.EVENTS.ROOM_DEVICE_ITEM, esp_gateway_1.EspGateway.getModules());
        }
    };
    Notify.queryRoomDevice = function (client, payload) {
        room_device_model_1.RoomDeviceModel.getDevice(Pass.roomDevice(payload).id)
            .then(function (entity) { return client.emit(exports.EVENTS.QUERY_ROOM_DEVICE, entity); })
            .catch(function (error) { return client.emit(exports.EVENTS.QUERY_ROOM_DEVICE, error); });
    };
    Notify.commitRoomDevice = function (client, payload) {
        payload = Pass.roomDevice(payload);
        room_device_model_1.RoomDeviceModel.updateDevice(payload.id, payload)
            .then(function (entity) { return client.emit(exports.EVENTS.COMMIT_ROOM_DEVICE, entity); })
            .catch(function (error) { return client.emit(exports.EVENTS.COMMIT_ROOM_DEVICE, error); });
    };
    Notify.commitStatusRoomDevice = function (client, payload) {
        payload = Pass.roomDevice(payload);
        if (!util_1.isUndefined(payload.esp)) {
            esp_gateway_1.EspGateway.notifyStatusCloud(payload.esp.name, entity_util_1.EntityUtil.create(room_device_entity_1.RoomDevice, payload));
        }
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