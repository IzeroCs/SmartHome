"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateError = void 0;
class ValidateError {
    constructor(field) {
        this.field = "";
        this.chains = [];
        this.field = field;
    }
    push(chain) {
        if (this.chains.indexOf(chain) === -1)
            this.chains.push(chain);
    }
    getChains() {
        return this.chains;
    }
}
exports.ValidateError = ValidateError;
//# sourceMappingURL=error.validate.js.map