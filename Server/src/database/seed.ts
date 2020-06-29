import { Connection } from "typeorm"
import * as fs from "fs"
import { SeedBase } from "./seed.base"
import { isUndefined } from "util"

export class SeedDatabase {
    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    async seed() {
        const readdir = fs.readdirSync(__dirname + "/seeds")

        for (let i in readdir) {
            const file = readdir[i]

            if (file.toLowerCase().endsWith(".seed.js")) {
                const modules = await import(__dirname + "/seeds/" + file)
                const keys = Object.keys(modules)

                if (keys.length > 0) {
                    const seed = new modules[keys[0]](this.connection, keys[0])

                    if (!isUndefined(seed) && !isUndefined(seed.seed))
                        seed.seed()
                }
            }
        }
    }
}
