"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSeed = void 0;
var common_1 = require("@nestjs/common");
var BaseSeed = /** @class */ (function () {
    function BaseSeed(connection, context) {
        this.context = context;
        this.connection = connection;
        this.logger = new common_1.Logger(context);
    }
    BaseSeed.prototype.log = function () {
        return this.logger;
    };
    BaseSeed.prototype.logSeedRunning = function () {
        this.logger.log("Seeder " + this.context + " running...");
    };
    BaseSeed.prototype.logSeedRunned = function () {
        this.logger.log("Seeder " + this.context + " runned");
    };
    return BaseSeed;
}());
exports.BaseSeed = BaseSeed;
//# sourceMappingURL=base.seed.js.map