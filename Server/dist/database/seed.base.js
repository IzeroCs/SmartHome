"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedBase = void 0;
var common_1 = require("@nestjs/common");
var SeedBase = /** @class */ (function () {
    function SeedBase(connection, context) {
        this.connection = connection;
        this.logger = new common_1.Logger(context);
    }
    return SeedBase;
}());
exports.SeedBase = SeedBase;
//# sourceMappingURL=seed.base.js.map