"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateChain = void 0;
const util_1 = require("util");
const validator_1 = require("validator");
class ValidateChain {
    constructor(object, field, check) {
        this.object = object;
        this.field = field;
        this.check = check;
        this.find = this.findFieldObject();
        if (typeof this.find === "object")
            this.find = undefined;
    }
    run() {
        const chains = this.check.getChains();
        const chainKeys = chains.keys();
        const chainResult = this.getChainResult();
        for (let chain of Array.from(chainKeys)) {
            let options = chains.get(chain);
            let result = true;
            let verify = true;
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
    }
    isRequired() {
        return !util_1.isUndefined(this.find);
    }
    isNotEmpty() {
        if (!this.isRequired() && !this.isString())
            return false;
        if (this.find === null || this.find.length <= 0)
            return false;
        return true;
    }
    isNumber() {
        if (!this.isRequired())
            return false;
        if (!util_1.isNumber(this.find) && typeof this.find !== "number")
            return false;
        return true;
    }
    isBoolean() {
        if (!this.isRequired())
            return false;
        if (!util_1.isBoolean(this.find) && typeof this.find !== "boolean")
            return false;
        return true;
    }
    isString() {
        if (!this.isRequired())
            return false;
        if (!util_1.isString(this.find) && typeof this.find !== "string")
            return false;
        return true;
    }
    isEmail() {
        if (!this.isString())
            return false;
        if (!validator_1.default.isEmail(this.find))
            return false;
        return true;
    }
    isURL() {
        if (!this.isString())
            return false;
        if (!validator_1.default.isURL(this.find))
            return false;
        return true;
    }
    isIn(array) {
        if (!this.isString())
            return false;
        if (!util_1.isArray(array) && this.find !== array)
            return false;
        if (util_1.isArray(array) && array.indexOf(this.find) === -1)
            return false;
        return true;
    }
    isMin(min) {
        let res = true;
        if (!this.isRequired() && !this.isString())
            res = false;
        if (this.find.length < min)
            res = false;
        if (!res && !util_1.isUndefined(this.getChainResult().isLength))
            this.getChainResult().isLength = false;
        return res;
    }
    isMax(max) {
        let res = true;
        if (!this.isRequired() && !this.isString())
            res = false;
        if (this.find.length > max)
            res = false;
        if (!res && !util_1.isUndefined(this.getChainResult().isLength))
            this.getChainResult().isLength = false;
        return res;
    }
    isLength(min, max) {
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
    }
    custom() { }
    findFieldObject() {
        if (this.field.indexOf(".") !== -1) {
            let fields = this.field.split(".");
            let target = this.object;
            for (let i = 0; i < fields.length; ++i) {
                let f = target[fields[i]];
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
    }
    getChainResult() {
        return this.check.getResults().get(this.field);
    }
}
exports.ValidateChain = ValidateChain;
//# sourceMappingURL=chain.validate.js.map