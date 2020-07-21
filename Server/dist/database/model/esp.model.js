"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EspModel = void 0;
const typeorm_1 = require("typeorm");
const esp_entity_1 = require("../entity/esp.entity");
const common_1 = require("@nestjs/common");
const util_1 = require("util");
const esp_pin_entity_1 = require("../entity/esp_pin.entity");
const room_device_model_1 = require("./room_device.model");
const esp_gateway_1 = require("../../gateway/esp.gateway");
class EspModel {
    static async add(espName) {
        const repository = typeorm_1.getRepository(esp_entity_1.Esp);
        const count = await repository.count({ name: espName });
        if (count <= 0) {
            const esp = new esp_entity_1.Esp();
            esp.name = espName;
            esp.auth = false;
            esp.online = false;
            await repository.save(esp);
            this.logger.log(`Added esp ${espName}`);
        }
    }
    static getEsp(espIdOrName) {
        return new Promise(async (resolve) => {
            let repository = typeorm_1.getRepository(esp_entity_1.Esp);
            let espFind = null;
            if (util_1.isNumber(espIdOrName))
                espFind = repository.findOne({ id: espIdOrName });
            else
                espFind = repository.findOne({ name: espIdOrName });
            resolve(espFind);
        });
    }
    static getEspDevice(espIdOrName) {
        return new Promise(async (resolve) => {
            let repository = typeorm_1.getRepository(esp_entity_1.Esp);
            let espFind = null;
            if (util_1.isNumber(espIdOrName))
                espFind = await repository.findOne({ id: espIdOrName });
            else
                espFind = await repository.findOne({ name: espIdOrName });
            if (!util_1.isUndefined(espFind))
                resolve(await room_device_model_1.RoomDeviceModel.getDeviceList(espFind.id));
            else
                resolve();
        });
    }
    static updateOnline(espName, online) {
        return new Promise(async (resolve) => {
            const repository = typeorm_1.getRepository(esp_entity_1.Esp);
            const espFind = await repository.findOne({ name: espName });
            if (!util_1.isUndefined(espFind)) {
                espFind.online = online;
                await repository.save(espFind);
                resolve(espFind);
            }
            else {
                resolve();
            }
        });
    }
    static updateAuth(espName, auth, online) {
        return new Promise(async (resolve, reject) => {
            const repository = typeorm_1.getRepository(esp_entity_1.Esp);
            const espFind = await repository.findOne({ name: espName });
            if (!util_1.isUndefined(espFind)) {
                espFind.auth = auth;
                espFind.online = online;
                repository
                    .update(espFind.id, espFind)
                    .then(_ => resolve())
                    .catch(err => reject(err));
            }
        });
    }
    static updatePin(espName, pins) {
        return new Promise(async (resolve) => {
            const repository = typeorm_1.getRepository(esp_entity_1.Esp);
            const repositoryEspPin = typeorm_1.getRepository(esp_pin_entity_1.EspPin);
            const espFind = await repository.findOne({ name: espName });
            if (!util_1.isUndefined(espFind) && util_1.isArray(pins) && pins.length > 0) {
                const espPinFind = await repositoryEspPin.find({ esp: espFind });
                if (espPinFind.length != pins.length)
                    await repositoryEspPin.remove(espPinFind);
                for (let i = 0; i < pins.length; ++i) {
                    const pin = pins[i];
                    const pinFind = espPinFind.find(espPin => espPin.input == pin.input);
                    if (!util_1.isUndefined(pinFind)) {
                        pinFind.status = Boolean(pin.status);
                        pinFind.statusCloud = pin.statusCloud;
                        pinFind.outputType = pin.outputType;
                        pinFind.outputPrimary = pin.outputPrimary;
                        pinFind.ouputSecondary = pin.outputSecondary;
                        pinFind.dualToggleCount = pin.dualToggleCount;
                        await repositoryEspPin.update(pinFind.id, pinFind);
                    }
                }
                resolve(espFind);
            }
        });
    }
    static async updateDetail(espName, details) {
        const repository = typeorm_1.getRepository(esp_entity_1.Esp);
        const espFind = await repository.findOne({ name: espName });
        if (!util_1.isUndefined(espFind)) {
            espFind.detail_rssi = details.rssi;
            await repository.update(espFind.id, espFind);
        }
    }
}
exports.EspModel = EspModel;
EspModel.logger = new common_1.Logger("EspModel");
//# sourceMappingURL=esp.model.js.map