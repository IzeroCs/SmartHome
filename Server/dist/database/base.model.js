"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const util_1 = require("util");
class BaseModel {
    static response(params) {
        if (util_1.isUndefined(params.data))
            params.data = {};
        if (!util_1.isArray(params.code) && !util_1.isObject(params.code))
            params.code = [params.code];
        return {
            data: params.data,
            code: params.code
        };
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=base.model.js.map