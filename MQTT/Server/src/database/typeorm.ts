import { createConnection } from "typeorm"
import { Logger } from "../stream/logger"

export class TypeOrm {
    private logger: Logger = new Logger("TypeOrm")

    async connection() {
        await createConnection(require("./ormconfig"))
            .then(_ => this.logger.log("TypeOrm connection"))
            .catch(error => this.logger.error(error))
    }
}
