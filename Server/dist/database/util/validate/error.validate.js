"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateError = void 0;
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
    ValidateError.prototype.getChains = function () {
        return this.chains;
    };
    return ValidateError;
}());
exports.ValidateError = ValidateError;
//# sourceMappingURL=error.validate.js.map