"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateChain = void 0;
var util_1 = require("util");
var validator_1 = require("validator");
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
exports.ValidateChain = ValidateChain;
//# sourceMappingURL=chain.validate.js.map