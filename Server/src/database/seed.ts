import { Connection } from "typeorm"
import * as fs from "fs"
import { isUndefined } from "util"
import { RoomTypeSeed } from "./seeds/room_type.seed"
import { RoomListSeed } from "./seeds/room_list.seed"
import { EspSeed } from "./seeds/esp.seed"
import { EspPinSeed } from "./seeds/esp_pin.seed"
import { RoomDeviceSeed } from "./seeds/room_device.seed"
import { DeviceTypeSeed } from "./seeds/device_type.seed"

export class SeedDatabase {
    private connection: Connection
    private seeds: Object = {
        RoomTypeSeed: RoomTypeSeed,
        RoomListSeed: RoomListSeed,
        EspSeed: EspSeed,
        EspPinSeed: EspPinSeed,
        DeviceTypeSeed: DeviceTypeSeed,
        RoomDeviceSeed: RoomDeviceSeed,
    }

    constructor(connection: Connection) {
        this.connection = connection
    }

    async seed() {
        const readdir = fs.readdirSync(__dirname + "/seeds")
        const modules = []

        for (let i in readdir) {
            const file = readdir[i]

            if (file.toLowerCase().endsWith(".seed.js")) {
                const module = await import(__dirname + "/seeds/" + file)
                const keys = Object.keys(module)

                if (keys.length > 0) modules[keys[0]] = module[keys[0]]
            }
        }

        const keys = Object.keys(this.seeds)

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i]

            if (!isUndefined(modules[key])) {
                const seed = new modules[key](this.connection, key)

                if (!isUndefined(seed) && !isUndefined(seed.seed)) {
                    seed.log().log(`Seeder ${key} running...`)
                    await seed.seed()
                    seed.log().log(`Seeder ${key} runned`)
                }
            }
        }
    }
}
