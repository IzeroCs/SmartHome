"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomDeviceSeed = void 0;
const base_seed_1 = require("../base.seed");
const room_device_entity_1 = require("../entity/room_device.entity");
const room_list_entity_1 = require("../entity/room_list.entity");
const esp_entity_1 = require("../entity/esp.entity");
const util_1 = require("util");
const device_type_entity_1 = require("../entity/device_type.entity");
class RoomDeviceSeed extends base_seed_1.BaseSeed {
    async seed() {
        const repository = this.connection.getRepository(room_device_entity_1.RoomDevice);
        const repositoryRoom = this.connection.getRepository(room_list_entity_1.RoomList);
        const repositoryEsp = this.connection.getRepository(esp_entity_1.Esp);
        const repositoryDeviceType = this.connection.getRepository(device_type_entity_1.DeviceType);
        const roomFind = await repositoryRoom.findOne({ name: "Phòng khách" });
        const deviceTypeLight = await repositoryDeviceType.findOne({ type: 1 });
        const deviceTypeFan = await repositoryDeviceType.findOne({ type: 2 });
        const deviceTypeHeater = await repositoryDeviceType.findOne({ type: 3 });
        const espFind = await repositoryEsp.findOne({ name: "ESP2Z4R1U8L2U0ZSC1T5K3M" }, { relations: ["pins"] });
        if (util_1.isNull(roomFind) || util_1.isNull(espFind))
            return;
        const deviceCount = await repository.count({ esp: espFind });
        if (deviceCount > 0)
            return;
        this.logSeedRunning();
        const devices = [
            {
                name: "Đèn",
                des: "Trái",
                pin: espFind.pins[0],
                type: deviceTypeLight,
                widget: 0
            },
            {
                name: "Đèn",
                des: "Phải",
                pin: espFind.pins[2],
                type: deviceTypeLight,
                widget: 0
            },
            {
                name: "Quạt trần",
                des: "",
                pin: espFind.pins[4],
                type: deviceTypeLight,
                widget: 1
            },
            {
                name: "Quạt đứng",
                des: "",
                pin: espFind.pins[5],
                type: deviceTypeFan,
                widget: 0
            },
            {
                name: "Quạt bàn",
                des: "",
                pin: espFind.pins[6],
                type: deviceTypeFan,
                widget: 0
            },
            {
                name: "Bình nóng lạnh",
                des: "",
                pin: espFind.pins[7],
                type: deviceTypeHeater,
                widget: 0
            },
            {
                name: "Bình nóng lạnh",
                des: "",
                pin: espFind.pins[7],
                type: deviceTypeHeater,
                widget: 0
            }
        ];
        for (let i = 0; i < devices.length; ++i) {
            const device = devices[i];
            const deviceRecord = new room_device_entity_1.RoomDevice();
            deviceRecord.name = device.name;
            deviceRecord.descriptor = device.des;
            deviceRecord.pin = device.pin;
            deviceRecord.esp = espFind;
            deviceRecord.room = roomFind;
            deviceRecord.type = device.type;
            deviceRecord.widget = device.widget;
            await repository.save(deviceRecord);
            this.logger.debug(`Room device ${device.name} added for ${roomFind.name}`);
        }
        this.logSeedRunned();
    }
}
exports.RoomDeviceSeed = RoomDeviceSeed;
//# sourceMappingURL=room_device.seed.js.map