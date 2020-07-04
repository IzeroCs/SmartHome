"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedBase = void 0;
var common_1 = require("@nestjs/common");
var SeedBase = /** @class */ (function () {
    function SeedBase(connection, context) {
        this.context = context;
        this.connection = connection;
        this.logger = new common_1.Logger(context);
    }
    SeedBase.prototype.log = function () {
        return this.logger;
    };
    return SeedBase;
}());
exports.SeedBase = SeedBase;
//# sourceMappingURL=seed.base.js.map