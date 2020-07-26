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
var AppGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = exports.EVENTS = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_util_1 = require("../util/socket.util");
const util_1 = require("util");
const esp_gateway_1 = require("./esp.gateway");
const cert_security_1 = require("../security/cert.security");
const room_type_model_1 = require("../database/model/room_type.model");
const room_list_model_1 = require("../database/model/room_list.model");
const room_device_model_1 = require("../database/model/room_device.model");
const room_device_entity_1 = require("../database/entity/room_device.entity");
const esp_model_1 = require("../database/model/esp.model");
const entity_util_1 = require("../database/util/entity.util");
const Wildcard = require("socketio-wildcard");
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
let AppGateway = AppGateway_1 = class AppGateway {
    constructor() {
        this.logger = new common_1.Logger("AppGateway");
        this.cert = new cert_security_1.CertSecurity("app");
        this.devices = new Map();
        this.middleware = Wildcard();
        AppGateway_1.instance = this;
    }
    afterInit(server) {
        this.logger.log("Socket /platform-app initialized");
        this.server.use(this.middleware);
        socket_util_1.SocketUtil.removing(this.server, this.logger);
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connection: ${client.id}`);
        socket_util_1.SocketUtil.restoring(this.server, client);
        setTimeout(() => Notify.unAuthorized(client), 5000);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnect: ${client.id}`);
        this.removeDevice(client);
        socket_util_1.SocketUtil.removing(this.server);
    }
    handle(client, packet) { }
    handleAuth(client, payload) {
        payload = Pass.auth(payload);
        if (AppGateway_1.isClientAuth(client))
            return this.logger.log(`Authenticate already`);
        if (!AppGateway_1.isAppID(payload.id))
            return Notify.unAuthorized(client);
        client.id = payload.id;
        this.devices[client.id] = {};
        this.cert.verify(payload.token, (authorized) => {
            if (authorized) {
                this.logger.log(`Authenticate socket ${client.id}`);
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
    }
    handleRoomType(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.roomTypes(client);
    }
    handleRoomList(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.roomList(client);
    }
    handleRoomDevice(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.roomDevice(client, payload);
    }
    handleRoomDeviceItem(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.roomDeviceItem(client, payload);
    }
    handleEspList(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.espModules(client);
    }
    handleEspDevices(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
    }
    handleQueryRoomDevice(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.queryRoomDevice(client, payload);
    }
    handleCommitRoomDevice(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.commitRoomDevice(client, payload);
    }
    handleCommitStatusRoomDevice(client, payload) {
        if (!AppGateway_1.isClientAuth(client))
            return Notify.unAuthorized(client);
        Notify.commitStatusRoomDevice(client, payload);
    }
    removeDevice(client) {
        if (!util_1.isUndefined(client.id))
            delete this.devices[client.id];
    }
    static getInstance() {
        return AppGateway_1.instance;
    }
    static getLogger() {
        return AppGateway_1.getInstance().logger;
    }
    static notifyEspModules(client) {
        Notify.espModules(client);
    }
    static notifyEspDevices(client, listOrId) {
        Notify.espDevices(client, listOrId);
    }
    static isClientAuth(client) {
        return client["auth"] === true;
    }
    static isAppID(id) {
        return !util_1.isUndefined(id) && id.startsWith("APP");
    }
};
AppGateway.instance = null;
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", Object)
], AppGateway.prototype, "server", void 0);
__decorate([
    websockets_1.SubscribeMessage("*"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handle", null);
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
        pingTimeout: 10000,
        pingInterval: 1000
    }),
    __metadata("design:paramtypes", [])
], AppGateway);
exports.AppGateway = AppGateway;
class Notify {
    static unAuthorized(client) {
        if (AppGateway.isClientAuth(client))
            return;
        AppGateway.getLogger().log(`Disconnect socket unauthorized: ${client.id}`);
        client.emit(exports.EVENTS.AUTH, "unauthorized");
        client.disconnect();
    }
    static espModules(client) {
        if (client) {
            if (AppGateway.isClientAuth(client))
                client.emit(exports.EVENTS.ESP_LIST, esp_gateway_1.EspGateway.getModules());
        }
        else {
            AppGateway.getInstance().server.emit(exports.EVENTS.ESP_LIST, esp_gateway_1.EspGateway.getModules());
        }
    }
    static espDevices(client, listOrId) {
        if (util_1.isNumber(listOrId) || util_1.isString(listOrId)) {
            esp_model_1.EspModel.getEspDevice(listOrId).then((list) => {
                Notify.espDevices(client, list);
            });
            return;
        }
        if (client)
            client.emit(exports.EVENTS.ESP_DEVICES, listOrId);
        else
            AppGateway.getInstance().server.emit(exports.EVENTS.ESP_DEVICES, listOrId);
    }
    static roomTypes(client) {
        room_type_model_1.RoomTypeModel.getAll()
            .then((list) => {
            if (list.length <= 0)
                return client.emit(exports.EVENTS.ROOM_TYPE, []);
            else
                client.emit(exports.EVENTS.ROOM_TYPE, list);
        })
            .catch(err => client.emit(exports.EVENTS.ROOM_TYPE, []));
    }
    static roomList(client) {
        room_list_model_1.RoomListModel.getAll()
            .then((list) => {
            if (list.length <= 0)
                return client.emit(exports.EVENTS.ROOM_LIST, []);
            else
                client.emit(exports.EVENTS.ROOM_LIST, list);
        })
            .catch(err => client.emit(exports.EVENTS.ROOM_LIST, []));
    }
    static roomDevice(client, payload) {
        payload = Pass.roomDevice(payload);
        room_device_model_1.RoomDeviceModel.getList(payload.id)
            .then((list) => {
            if (list.length <= 0)
                return client.emit(exports.EVENTS.ROOM_DEVICE, []);
            else
                return client.emit(exports.EVENTS.ROOM_DEVICE, list);
        })
            .catch(err => client.emit(exports.EVENTS.ROOM_DEVICE, []));
    }
    static roomDeviceItem(client, payload) {
        if (client && payload) {
            if (AppGateway.isClientAuth(client))
                client.emit(exports.EVENTS.ROOM_DEVICE_ITEM, esp_gateway_1.EspGateway.getModules());
        }
        else if (payload) {
            AppGateway.getInstance().server.emit(exports.EVENTS.ROOM_DEVICE_ITEM, esp_gateway_1.EspGateway.getModules());
        }
    }
    static queryRoomDevice(client, payload) {
        room_device_model_1.RoomDeviceModel.getDevice(Pass.roomDevice(payload).id)
            .then((entity) => client.emit(exports.EVENTS.QUERY_ROOM_DEVICE, entity))
            .catch((error) => client.emit(exports.EVENTS.QUERY_ROOM_DEVICE, error));
    }
    static commitRoomDevice(client, payload) {
        payload = Pass.roomDevice(payload);
        room_device_model_1.RoomDeviceModel.updateDevice(payload.id, payload)
            .then((entity) => client.emit(exports.EVENTS.COMMIT_ROOM_DEVICE, entity))
            .catch((error) => client.emit(exports.EVENTS.COMMIT_ROOM_DEVICE, error));
    }
    static commitStatusRoomDevice(client, payload) {
        payload = Pass.roomDevice(payload);
        if (!util_1.isUndefined(payload.esp)) {
            esp_gateway_1.EspGateway.notifyStatusCloud(payload.esp.name, entity_util_1.EntityUtil.create(room_device_entity_1.RoomDevice, payload));
        }
    }
}
class Pass {
    static def(objSrc, objDest) {
        if (util_1.isUndefined(objSrc))
            return {};
        if (util_1.isUndefined(objDest) || util_1.isNull(objDest))
            objDest = {};
        Object.keys(objSrc).forEach(key => {
            if (util_1.isUndefined(objDest[key]))
                objDest[key] = objSrc[key];
            else
                objDest[key] = this.def(objSrc[key], objDest[key]);
        });
        return objDest;
    }
    static auth(obj) {
        return Pass.def({
            id: "",
            token: ""
        }, obj);
    }
    static roomDevice(obj) {
        return Pass.def({
            id: ""
        }, obj);
    }
}
//# sourceMappingURL=app.gateway.js.map