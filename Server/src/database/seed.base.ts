import { Connection } from "typeorm"
import { Logger } from "@nestjs/common"

export abstract class SeedBase {
    protected logger: Logger
    protected connection: Connection

    constructor(connection: Connection, context: string) {
        this.connection = connection
        this.logger = new Logger(context)
    }

    abstract async seed()
}
