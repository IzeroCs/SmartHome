"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checker = exports.Validate = void 0;
const util_1 = require("util");
const check_validate_1 = require("./validate/check.validate");
const error_validate_1 = require("./validate/error.validate");
class Validate {
    constructor(checks) {
        this.list = [];
        if (checks)
            checks.map(check => this.list.push(check));
    }
    add(check) {
        this.list.push(check);
        return check;
    }
    addAll(checks) {
        if (util_1.isArray(checks))
            checks.map(check => this.add(check));
    }
    check(fields, message) {
        const check = new check_validate_1.ValidateCheck(fields, message);
        this.list.push(check);
        return check;
    }
    execute(object) {
        const errors = new Map();
        for (let i = 0; i < this.list.length; ++i) {
            let check = this.list[i].run(object);
            let fields = check.getFields();
            let results = check.getResults();
            if (util_1.isArray(fields)) {
                for (let f = 0; f < fields.length; ++f) {
                    let field = fields[f];
                    let result = results.get(field);
                    this.resultToError(field, result, errors);
                }
            }
            else {
                this.resultToError(fields, results.get(fields), errors);
            }
        }
        return Array.from(errors.values());
    }
    resultToError(field, result, errors) {
        let resultKeys = Object.keys(result);
        let errorValidate = null;
        if (errors.has(field))
            errorValidate = errors.get(field);
        else
            errorValidate = new error_validate_1.ValidateError(field);
        for (let i = 0; i < resultKeys.length; ++i) {
            let key = resultKeys[i];
            let value = result[key];
            if (typeof value !== "boolean" || value === false)
                errorValidate.push(key);
        }
        if (errorValidate.getChains().length > 0)
            errors.set(field, errorValidate);
    }
}
exports.Validate = Validate;
function checker(fields, message) {
    return new check_validate_1.ValidateCheck(fields, message);
}
exports.checker = checker;
//# sourceMappingURL=validate.util.js.map