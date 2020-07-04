"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
var typeorm_1 = require("typeorm");
var BaseModel = /** @class */ (function () {
    function BaseModel() {
        this.connection = typeorm_1.getConnection();
    }
    return BaseModel;
}());
exports.BaseModel = BaseModel;
//# sourceMappingURL=base.model.js.map