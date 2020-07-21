"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCheck = void 0;
const util_1 = require("util");
const chain_validate_1 = require("./chain.validate");
const chain_result_validate_1 = require("./chain.result.validate");
class ValidateCheck {
    constructor(fields, message) {
        this.chains = new Map();
        this.chainCustoms = new Map();
        this.results = new Map();
        this.fields = fields;
        this.message = message;
        if (util_1.isArray(this.fields)) {
            this.fields.map(field => this.results.set(field, new chain_result_validate_1.ValidateChainResult()));
        }
        else {
            this.results.set(this.fields, new chain_result_validate_1.ValidateChainResult());
        }
    }
    run(object) {
        if (util_1.isArray(this.fields)) {
            this.fields.map(field => this.fieldCheck(object, field));
        }
        else {
            this.fieldCheck(object, this.fields);
        }
        return this;
    }
    isRequired() {
        return this.push("isRequired");
    }
    isNotEmpty() {
        return this.push("isNotEmpty");
    }
    isNumber() {
        return this.push("isNumber");
    }
    isBoolean() {
        return this.push("isBoolean");
    }
    isString() {
        return this.push("isString");
    }
    isEmail() {
        return this.push("isEmail");
    }
    isURL() {
        return this.push("isURL");
    }
    isIn(array) {
        return this.push("isIn", { in: array });
    }
    isMin(min) {
        return this.push("isMin", { min: min });
    }
    isMax(max) {
        return this.push("isMax", { max: max });
    }
    isLength(min, max) {
        return this.push("isLength", { min: min, max: max });
    }
    custom(nsp, handle) {
        this.push(nsp);
        this.chainCustoms.set(nsp, handle);
        return this;
    }
    hasCustom(nsp) {
        return this.chainCustoms.has(nsp);
    }
    getCustomHandle(nsp) {
        return this.chainCustoms.get(nsp);
    }
    getFields() {
        return this.fields;
    }
    getChains() {
        return this.chains;
    }
    getResults() {
        return this.results;
    }
    push(key, options) {
        if (!this.chains.has(key))
            this.chains.set(key, options);
        return this;
    }
    fieldCheck(object, field) {
        new chain_validate_1.ValidateChain(object, field, this).run();
    }
}
exports.ValidateCheck = ValidateCheck;
//# sourceMappingURL=check.validate.js.map