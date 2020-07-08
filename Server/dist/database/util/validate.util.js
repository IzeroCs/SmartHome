"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checker = exports.Validate = void 0;
var util_1 = require("util");
var check_validate_1 = require("./validate/check.validate");
var error_validate_1 = require("./validate/error.validate");
var Validate = (function () {
    function Validate(checks) {
        var _this = this;
        this.list = [];
        if (checks)
            checks.map(function (check) { return _this.list.push(check); });
    }
    Validate.prototype.add = function (check) {
        this.list.push(check);
        return check;
    };
    Validate.prototype.addAll = function (checks) {
        var _this = this;
        if (util_1.isArray(checks))
            checks.map(function (check) { return _this.add(check); });
    };
    Validate.prototype.check = function (fields, message) {
        var check = new check_validate_1.ValidateCheck(fields, message);
        this.list.push(check);
        return check;
    };
    Validate.prototype.execute = function (object) {
        var errors = new Map();
        for (var i = 0; i < this.list.length; ++i) {
            var check = this.list[i].run(object);
            var fields = check.getFields();
            var results = check.getResults();
            if (util_1.isArray(fields)) {
                for (var f = 0; f < fields.length; ++f) {
                    var field = fields[f];
                    var result = results.get(field);
                    this.resultToError(field, result, errors);
                }
            }
            else {
                this.resultToError(fields, results.get(fields), errors);
            }
        }
        return Array.from(errors.values());
    };
    Validate.prototype.resultToError = function (field, result, errors) {
        var resultKeys = Object.keys(result);
        var errorValidate = null;
        if (errors.has(field))
            errorValidate = errors.get(field);
        else
            errorValidate = new error_validate_1.ValidateError(field);
        for (var i = 0; i < resultKeys.length; ++i) {
            var key = resultKeys[i];
            var value = result[key];
            if (typeof value !== "boolean" || value === false)
                errorValidate.push(key);
        }
        if (errorValidate.getChains().length > 0)
            errors.set(field, errorValidate);
    };
    return Validate;
}());
exports.Validate = Validate;
function checker(fields, message) {
    return new check_validate_1.ValidateCheck(fields, message);
}
exports.checker = checker;
//# sourceMappingURL=validate.util.js.map