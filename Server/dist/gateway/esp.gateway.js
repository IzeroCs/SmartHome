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
var EspGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EspGateway = exports.StatusCloud = exports.IOPin = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_util_1 = require("../util/socket.util");
const cert_security_1 = require("../security/cert.security");
const network_util_1 = require("../util/network.util");
const util_1 = require("util");
const app_gateway_1 = require("./app.gateway");
const esp_entity_1 = require("../database/entity/esp.entity");
const esp_model_1 = require("../database/model/esp.model");
const room_device_entity_1 = require("../database/entity/room_device.entity");
const underscore = require("underscore");
var IOPin;
(function (IOPin) {
    IOPin[IOPin["IOPin_0"] = 0] = "IOPin_0";
    IOPin[IOPin["IOPin_1"] = 1] = "IOPin_1";
    IOPin[IOPin["IOPin_2"] = 2] = "IOPin_2";
    IOPin[IOPin["IOPin_3"] = 3] = "IOPin_3";
    IOPin[IOPin["IOPin_4"] = 4] = "IOPin_4";
    IOPin[IOPin["IOPin_5"] = 5] = "IOPin_5";
    IOPin[IOPin["IOPin_6"] = 6] = "IOPin_6";
    IOPin[IOPin["IOPin_7"] = 7] = "IOPin_7";
    IOPin[IOPin["IOPin_NUll"] = 8] = "IOPin_NUll";
})(IOPin = exports.IOPin || (exports.IOPin = {}));
var StatusCloud;
(function (StatusCloud) {
    StatusCloud[StatusCloud["StatusCloud_IDLE"] = 1] = "StatusCloud_IDLE";
    StatusCloud[StatusCloud["StatusCloud_ON"] = 2] = "StatusCloud_ON";
    StatusCloud[StatusCloud["StatusCloud_OFF"] = 3] = "StatusCloud_OFF";
})(StatusCloud = exports.StatusCloud || (exports.StatusCloud = {}));
let EspGateway = EspGateway_1 = class EspGateway {
    constructor() {
        this.logger = new common_1.Logger("EspGateway");
        this.cert = new cert_security_1.CertSecurity("esp");
        this.modules = new Map();
        EspGateway_1.instance = this;
    }
    afterInit(server) {
        this.logger.log("Socket /platform-esp initialized");
        socket_util_1.SocketUtil.removing(this.server);
        setInterval(() => {
            const now = Date.now();
            underscore.each(this.server.connected, (client) => {
                let intervalID = client["interval_id"] || 0;
                let intervalAuth = client["interval_auth"] || 0;
                if (!EspGateway_1.isEspID(client.id)) {
                    if (now - intervalID > 5000) {
                        intervalID = now;
                        client.emit("id");
                    }
                }
                else if (!EspGateway_1.isClientAuth(client)) {
                    if (now - intervalAuth > 5000) {
                        intervalAuth = now;
                        client.emit("auth");
                    }
                }
            });
        }, 1000);
    }
    handleConnection(client, ...args) {
        socket_util_1.SocketUtil.restoring(this.server, client);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnect: ${client.id}`);
        this.updateModule(client, false);
        esp_model_1.EspModel.updateOnline(client.id, false).then((esp) => {
            if (!util_1.isUndefined(esp))
                app_gateway_1.AppGateway.notifyEspDevices(null, esp.id);
        });
        socket_util_1.SocketUtil.removing(this.server);
    }
    handleId(client, payload) {
        if (util_1.isUndefined(payload.id))
            return;
        if (!EspGateway_1.isEspID(payload.id))
            return;
        client.id = payload.id;
        client["interval_id"] = 0;
        this.logger.log(`Client id: ${payload.id}`);
        this.initModule(payload.id);
        this.updateModule(client, true, false);
        esp_model_1.EspModel.add(payload.id);
    }
    async handleAuth(client, payload) {
        if (util_1.isUndefined(payload.token))
            return;
        if (EspGateway_1.isClientAuth(client))
            return;
        this.cert.verify(payload.token, (authorized) => {
            if (authorized) {
                this.logger.log(`Client authenticate: ${client.id}`);
                esp_model_1.EspModel.updateAuth(client.id, true, true).then(_ => {
                    client["auth"] = true;
                    client["interval_auth"] = 0;
                    client.emit("auth", "authorized");
                    this.updateModule(client, true, true);
                });
            }
        });
    }
    handleSyncIO(client, payload) {
        if (!EspGateway_1.isClientAuth(client))
            return;
        const espIO = Pass.io(payload);
        const pinData = espIO.pins;
        const pinChanged = espIO.changed;
        const module = this.getModule(client.id);
        if (util_1.isArray(pinData)) {
            for (let i = 0; i < pinData.length; ++i)
                pinData[i] = Pass.pin(pinData[i]);
            module.pins = pinData;
            module.changed = pinChanged;
            if (pinChanged) {
                esp_model_1.EspModel.updatePin(client.id, pinData).then((esp) => {
                    if (!util_1.isUndefined(esp)) {
                        esp_model_1.EspModel.getEspDevice(esp.id).then((list) => {
                            app_gateway_1.AppGateway.notifyEspDevices(null, list);
                        });
                    }
                });
                app_gateway_1.AppGateway.notifyEspModules();
            }
        }
    }
    handleSyncDetail(client, payload) {
        if (!EspGateway_1.isClientAuth(client))
            return;
        const module = this.getModule(client.id);
        const newDetail = Pass.detail(payload);
        const oldSignal = network_util_1.NetworkUtil.calculateSignalLevel(module.detail_rssi);
        const newSignal = network_util_1.NetworkUtil.calculateSignalLevel(newDetail.detail_rssi);
        if (oldSignal !== newSignal) {
            module.detail_rssi = newDetail.detail_rssi;
            esp_model_1.EspModel.updateDetail(client.id, {
                rssi: newDetail.detail_rssi
            });
            app_gateway_1.AppGateway.notifyEspModules();
        }
    }
    initModule(id) {
        if (!this.modules.has(id)) {
            this.modules.set(id, {
                name: id,
                online: false,
                auth: false,
                changed: false,
                pins: [],
                detail_rssi: network_util_1.NetworkUtil.MIN_RSSI
            });
        }
    }
    getModule(id) {
        this.initModule(id);
        return this.modules.get(id);
    }
    updateModule(client, online, auth) {
        const module = this.getModule(client.id);
        module.name = client.id;
        module.online = online;
        if (auth)
            module.auth = auth;
    }
    static getInstance() {
        return EspGateway_1.instance;
    }
    static getLogger() {
        return EspGateway_1.getInstance().logger;
    }
    static getModules() {
        return EspGateway_1.getInstance().modules;
    }
    static notifyUnauthorized(client) {
        if (EspGateway_1.isClientAuth(client))
            return;
        EspGateway_1.getLogger().log(`Disconnect socket unauthorized: ${client.id}`);
        esp_model_1.EspModel.updateAuth(client.id, false, false);
        client.emit("auth", "unauthorized");
        client.disconnect(true);
    }
    static notifyStatusCloud(espName, device) {
        return new Promise(async (resolve) => {
            let sockets = EspGateway_1.getInstance().server.sockets;
            let client = null;
            let module = null;
            underscore.each(sockets, (socket) => {
                if (socket.id === espName) {
                    client = socket;
                    module = this.getModules().get(espName);
                }
            });
            if (!util_1.isUndefined(client) && !util_1.isUndefined(module) && device instanceof room_device_entity_1.RoomDevice) {
                let pin = device.pin.input;
                let status = device.pin.statusCloud;
                client.emit(app_gateway_1.EVENTS.STATUS_CLOUD, `pin=${pin},status=${status}`);
            }
        });
    }
    static isClientAuth(client) {
        return client["auth"] === true && EspGateway_1.getInstance().modules.has(client.id);
    }
    static isEspID(id) {
        return !util_1.isUndefined(id) && id.startsWith("ESP");
    }
};
EspGateway.instance = null;
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", Object)
], EspGateway.prototype, "server", void 0);
__decorate([
    websockets_1.SubscribeMessage("id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EspGateway.prototype, "handleId", null);
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
        pingInterval: 1000
    }),
    __metadata("design:paramtypes", [])
], EspGateway);
exports.EspGateway = EspGateway;
class Pass {
    static def(objSrc, objDest) {
        if (util_1.isUndefined(objSrc))
            return {};
        if (util_1.isUndefined(objDest) || util_1.isNull(objDest))
            objDest = {};
        if (!util_1.isObject(objDest))
            return objDest;
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
    static module(obj) {
        return Pass.def({
            name: "",
            online: false,
            auth: false,
            changed: false,
            pins: [],
            detail_rssi: network_util_1.NetworkUtil.MIN_RSSI
        }, obj);
    }
    static io(obj) {
        return Pass.def({
            pins: [],
            changed: "0"
        }, obj);
    }
    static pin(obj) {
        return Pass.def({
            input: 0,
            outputType: 0,
            outputPrimary: 0,
            outputSecondary: 0,
            dualToggleCount: 0,
            statusCloud: false,
            status: false
        }, obj);
    }
    static detail(obj) {
        return Pass.def({
            detail_rssi: network_util_1.NetworkUtil.MIN_RSSI
        }, obj);
    }
}
//# sourceMappingURL=esp.gateway.js.map