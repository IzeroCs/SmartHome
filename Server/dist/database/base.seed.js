"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSeed = void 0;
const common_1 = require("@nestjs/common");
class BaseSeed {
    constructor(connection, context) {
        this.context = context;
        this.connection = connection;
        this.logger = new common_1.Logger(context);
    }
    log() {
        return this.logger;
    }
    logSeedRunning() {
        this.logger.log(`Seeder ${this.context} running...`);
    }
    logSeedRunned() {
        this.logger.log(`Seeder ${this.context} runned`);
    }
}
exports.BaseSeed = BaseSeed;
//# sourceMappingURL=base.seed.js.map