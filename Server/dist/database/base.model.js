"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
var util_1 = require("util");
var class_validator_1 = require("class-validator");
var BaseModel = /** @class */ (function () {
    function BaseModel() {
    }
    BaseModel.validate = function (object) {
        return new Promise(function (resolve, reject) {
            class_validator_1.validate(object).then(function (errors) {
                if (errors.length > 0)
                    return reject(errors);
                else
                    return resolve(object);
            });
        });
    };
    BaseModel.response = function (params) {
        if (util_1.isUndefined(params.data))
            params.data = {};
        if (!util_1.isArray(params.code) && !util_1.isObject(params.code))
            params.code = [params.code];
        return {
            data: params.data,
            code: params.code,
        };
    };
    return BaseModel;
}());
exports.BaseModel = BaseModel;
//# sourceMappingURL=base.model.js.map