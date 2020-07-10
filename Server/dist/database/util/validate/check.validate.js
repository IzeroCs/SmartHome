"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCheck = void 0;
var util_1 = require("util");
var chain_validate_1 = require("./chain.validate");
var chain_result_validate_1 = require("./chain.result.validate");
var ValidateCheck = (function () {
    function ValidateCheck(fields, message) {
        var _this = this;
        this.chains = new Map();
        this.chainCustoms = new Map();
        this.results = new Map();
        this.fields = fields;
        this.message = message;
        if (util_1.isArray(this.fields)) {
            this.fields.map(function (field) { return _this.results.set(field, new chain_result_validate_1.ValidateChainResult()); });
        }
        else {
            this.results.set(this.fields, new chain_result_validate_1.ValidateChainResult());
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
    ValidateCheck.prototype.isBoolean = function () {
        return this.push("isBoolean");
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
        new chain_validate_1.ValidateChain(object, field, this).run();
    };
    return ValidateCheck;
}());
exports.ValidateCheck = ValidateCheck;
//# sourceMappingURL=check.validate.js.map