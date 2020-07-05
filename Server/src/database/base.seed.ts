import { Connection } from "typeorm"
import { Logger } from "@nestjs/common"

export abstract class BaseSeed {
    protected context: string
    protected logger: Logger
    protected connection: Connection

    constructor(connection: Connection, context: string) {
        this.context = context
        this.connection = connection
        this.logger = new Logger(context)
    }

    log(): Logger {
        return this.logger
    }

    protected logSeedRunning() {
        this.logger.log(`Seeder ${this.context} running...`)
    }

    protected logSeedRunned() {
        this.logger.log(`Seeder ${this.context} runned`)
    }

    abstract async seed()
}
