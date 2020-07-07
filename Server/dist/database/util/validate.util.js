"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checker = exports.Validate = void 0;
var util_1 = require("util");
var validator_1 = require("validator");
var Validate = (function () {
    function Validate(checks) {
        var _this = this;
        this.list = [];
        if (checks)
            checks.map(function (check) { return _this.list.push(check); });
    }
    Validate.prototype.check = function (fields, message) {
        var check = new ValidateCheck(fields, message);
        this.list.push(check);
        return check;
    };
    Validate.prototype.execute = function (object) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var errors = new Map();
            for (var i = 0; i < _this.list.length; ++i) {
                var check = _this.list[i].run(object);
                var fields = check.getFields();
                var results = check.getResults();
                if (util_1.isArray(fields)) {
                    for (var f = 0; f < fields.length; ++f) {
                        var field = fields[f];
                        var result = results.get(field);
                        _this.resultToError(field, result, errors);
                    }
                }
                else {
                    _this.resultToError(fields, results.get(fields), errors);
                }
            }
            if (errors.size > 0)
                return reject(Array.from(errors.values()));
            else
                return resolve();
        });
    };
    Validate.prototype.resultToError = function (field, result, errors) {
        var resultKeys = Object.keys(result);
        var errorValidate = null;
        if (errors.has(field)) {
            errorValidate = errors.get(field);
        }
        else {
            errorValidate = new ValidateError(field);
            errors.set(field, errorValidate);
        }
        for (var i = 0; i < resultKeys.length; ++i) {
            var key = resultKeys[i];
            var value = result[key];
            if (typeof value !== "boolean" || value === false)
                errorValidate.push(key);
        }
    };
    return Validate;
}());
exports.Validate = Validate;
var ChainResult = (function () {
    function ChainResult() {
    }
    return ChainResult;
}());
var ValidateError = (function () {
    function ValidateError(field) {
        this.field = "";
        this.chains = [];
        this.field = field;
    }
    ValidateError.prototype.push = function (chain) {
        if (this.chains.indexOf(chain) === -1)
            this.chains.push(chain);
    };
    return ValidateError;
}());
var ValidateChain = (function () {
    function ValidateChain(object, field, check) {
        this.object = object;
        this.field = field;
        this.check = check;
        this.find = this.findFieldObject();
        if (typeof this.find === "object")
            this.find = undefined;
    }
    ValidateChain.prototype.run = function () {
        var chains = this.check.getChains();
        var chainKeys = chains.keys();
        var chainResult = this.getChainResult();
        for (var _i = 0, _a = Array.from(chainKeys); _i < _a.length; _i++) {
            var chain = _a[_i];
            var options = chains.get(chain);
            var result = true;
            var verify = true;
            if (!util_1.isUndefined(this[chain])) {
                if (!util_1.isUndefined(options) && this[chain] instanceof Function) {
                    result = this[chain].apply(this, Object.values(options));
                }
                else {
                    result = this[chain](options);
                }
            }
            else if (this.check.hasCustom(chain)) {
                result = this.check.getCustomHandle(chain)(this.field, this.find);
                if (util_1.isUndefined(result))
                    continue;
            }
            else {
                verify = false;
            }
            if (verify)
                chainResult[chain] = result;
            if (!result)
                break;
        }
    };
    ValidateChain.prototype.isRequired = function () {
        return !util_1.isUndefined(this.find);
    };
    ValidateChain.prototype.isNotEmpty = function () {
        if (!this.isRequired() && !this.isString())
            return false;
        if (this.find === null || this.find.length <= 0)
            return false;
        return true;
    };
    ValidateChain.prototype.isNumber = function () {
        if (!this.isRequired())
            return false;
        if (!util_1.isNumber(this.find) && typeof this.find !== "number")
            return false;
        return true;
    };
    ValidateChain.prototype.isString = function () {
        if (!this.isRequired())
            return false;
        if (!util_1.isString(this.find) && typeof this.find !== "string")
            return false;
        return true;
    };
    ValidateChain.prototype.isEmail = function () {
        if (!this.isString())
            return false;
        if (!validator_1.default.isEmail(this.find))
            return false;
        return true;
    };
    ValidateChain.prototype.isURL = function () {
        if (!this.isString())
            return false;
        if (!validator_1.default.isURL(this.find))
            return false;
        return true;
    };
    ValidateChain.prototype.isIn = function (array) {
        if (!this.isString())
            return false;
        if (!util_1.isArray(array) && this.find !== array)
            return false;
        if (util_1.isArray(array) && array.indexOf(this.find) === -1)
            return false;
        return true;
    };
    ValidateChain.prototype.isMin = function (min) {
        var res = true;
        if (!this.isRequired() && !this.isString())
            res = false;
        if (this.find.length < min)
            res = false;
        if (!res && !util_1.isUndefined(this.getChainResult().isLength))
            this.getChainResult().isLength = false;
        return res;
    };
    ValidateChain.prototype.isMax = function (max) {
        var res = true;
        if (!this.isRequired() && !this.isString())
            res = false;
        if (this.find.length > max)
            res = false;
        if (!res && !util_1.isUndefined(this.getChainResult().isLength))
            this.getChainResult().isLength = false;
        return res;
    };
    ValidateChain.prototype.isLength = function (min, max) {
        if (!this.isRequired() && !this.isString())
            return false;
        if (this.find.length < min) {
            if (!util_1.isUndefined(this.getChainResult().isMin))
                this.getChainResult().isMin = false;
            return false;
        }
        if (this.find.length > max) {
            if (!util_1.isUndefined(this.getChainResult().isMax))
                this.getChainResult().isMax = false;
            return false;
        }
        return true;
    };
    ValidateChain.prototype.custom = function () { };
    ValidateChain.prototype.findFieldObject = function () {
        if (this.field.indexOf(".") !== -1) {
            var fields = this.field.split(".");
            var target = this.object;
            for (var i = 0; i < fields.length; ++i) {
                var f = target[fields[i]];
                if (util_1.isUndefined(f))
                    return undefined;
                else
                    target = f;
            }
            return target;
        }
        if (util_1.isUndefined(this.object[this.field]))
            return undefined;
        else
            return this.object[this.field];
    };
    ValidateChain.prototype.getChainResult = function () {
        return this.check.getResults().get(this.field);
    };
    return ValidateChain;
}());
var ValidateCheck = (function () {
    function ValidateCheck(fields, message) {
        var _this = this;
        this.chains = new Map();
        this.chainCustoms = new Map();
        this.results = new Map();
        this.fields = fields;
        this.message = message;
        if (util_1.isArray(this.fields)) {
            this.fields.map(function (field) { return _this.results.set(field, new ChainResult()); });
        }
        else {
            this.results.set(this.fields, new ChainResult());
        }
    }
    ValidateCheck.prototype.run = function (object) {
        var _this = this;
        if (util_1.isArray(this.fields)) {
            this.fields.map(function (field) { return _this.fieldCheck(object, field); });
        }
        else {
            this.fieldCheck(object, this.fields);
        }
        return this;
    };
    ValidateCheck.prototype.isRequired = function () {
        return this.push("isRequired");
    };
    ValidateCheck.prototype.isNotEmpty = function () {
        return this.push("isNotEmpty");
    };
    ValidateCheck.prototype.isNumber = function () {
        return this.push("isNumber");
    };
    ValidateCheck.prototype.isString = function () {
        return this.push("isString");
    };
    ValidateCheck.prototype.isEmail = function () {
        return this.push("isEmail");
    };
    ValidateCheck.prototype.isURL = function () {
        return this.push("isURL");
    };
    ValidateCheck.prototype.isIn = function (array) {
        return this.push("isIn", { in: array });
    };
    ValidateCheck.prototype.isMin = function (min) {
        return this.push("isMin", { min: min });
    };
    ValidateCheck.prototype.isMax = function (max) {
        return this.push("isMax", { max: max });
    };
    ValidateCheck.prototype.isLength = function (min, max) {
        return this.push("isLength", { min: min, max: max });
    };
    ValidateCheck.prototype.custom = function (nsp, handle) {
        this.push(nsp);
        this.chainCustoms.set(nsp, handle);
        return this;
    };
    ValidateCheck.prototype.hasCustom = function (nsp) {
        return this.chainCustoms.has(nsp);
    };
    ValidateCheck.prototype.getCustomHandle = function (nsp) {
        return this.chainCustoms.get(nsp);
    };
    ValidateCheck.prototype.getFields = function () {
        return this.fields;
    };
    ValidateCheck.prototype.getChains = function () {
        return this.chains;
    };
    ValidateCheck.prototype.getResults = function () {
        return this.results;
    };
    ValidateCheck.prototype.push = function (key, options) {
        if (!this.chains.has(key))
            this.chains.set(key, options);
        return this;
    };
    ValidateCheck.prototype.fieldCheck = function (object, field) {
        new ValidateChain(object, field, this).run();
    };
    return ValidateCheck;
}());
function checker(fields, message) {
    return new ValidateCheck(fields, message);
}
exports.checker = checker;
//# sourceMappingURL=validate.util.js.map