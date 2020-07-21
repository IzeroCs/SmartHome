"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedDatabase = void 0;
const fs = require("fs");
const util_1 = require("util");
const room_type_seed_1 = require("./seeds/room_type.seed");
const room_list_seed_1 = require("./seeds/room_list.seed");
const esp_seed_1 = require("./seeds/esp.seed");
const esp_pin_seed_1 = require("./seeds/esp_pin.seed");
const room_device_seed_1 = require("./seeds/room_device.seed");
const device_type_seed_1 = require("./seeds/device_type.seed");
class SeedDatabase {
    constructor(connection) {
        this.seeds = {
            RoomTypeSeed: room_type_seed_1.RoomTypeSeed,
            RoomListSeed: room_list_seed_1.RoomListSeed,
            EspSeed: esp_seed_1.EspSeed,
            EspPinSeed: esp_pin_seed_1.EspPinSeed,
            DeviceTypeSeed: device_type_seed_1.DeviceTypeSeed,
            RoomDeviceSeed: room_device_seed_1.RoomDeviceSeed
        };
        this.connection = connection;
    }
    async seed() {
        const readdir = fs.readdirSync(__dirname + "/seeds");
        const modules = [];
        for (let i in readdir) {
            const file = readdir[i];
            if (file.toLowerCase().endsWith(".seed.js")) {
                const module = await Promise.resolve().then(() => require(__dirname + "/seeds/" + file));
                const keys = Object.keys(module);
                if (keys.length > 0)
                    modules[keys[0]] = module[keys[0]];
            }
        }
        const keys = Object.keys(this.seeds);
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            if (!util_1.isUndefined(modules[key])) {
                const seed = new modules[key](this.connection, key);
                if (!util_1.isUndefined(seed) && !util_1.isUndefined(seed.seed))
                    await seed.seed();
            }
        }
    }
}
exports.SeedDatabase = SeedDatabase;
//# sourceMappingURL=seed.js.map